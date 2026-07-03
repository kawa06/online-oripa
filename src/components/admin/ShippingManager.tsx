"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SHIPPING_STATUSES } from "@/lib/constants";
import { BarcodeScanner } from "@/components/admin/BarcodeScanner";
import type { ShippingRequest, Profile, ShippingRequestItem, UserWin } from "@prisma/client";

type ItemRow = ShippingRequestItem & {
  userWin: Pick<UserWin, "name" | "rank">;
};

type Row = ShippingRequest & {
  user: Pick<Profile, "email" | "displayName">;
  items: ItemRow[];
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "保留",
  UNCONFIRMED: "未確認",
  PACKING: "梱包中",
  READY: "発送準備",
  SHIPPED: "発送済",
  CONTACTED: "連絡済",
};

export function ShippingManager({ requests }: { requests: Row[] }) {
  const router = useRouter();
  const [scanCode, setScanCode] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [filter, setFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { trackingNumber: string; adminMemo: string }>>({});

  const filtered =
    filter === "ALL" ? requests : requests.filter((r) => r.status === filter);

  function getDraft(id: string, r: Row) {
    return drafts[id] ?? { trackingNumber: r.trackingNumber ?? "", adminMemo: r.adminMemo ?? "" };
  }

  async function updateStatus(id: string, status: string) {
    setLoadingId(id);
    const draft = getDraft(id, requests.find((r) => r.id === id)!);
    await fetch("/api/admin/shipping/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        trackingNumber: draft.trackingNumber || undefined,
        adminMemo: draft.adminMemo || undefined,
      }),
    });
    setLoadingId(null);
    router.refresh();
  }

  async function lookupCode(code: string) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    const res = await fetch("/api/admin/shipping/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: normalized }),
    });
    const data = await res.json();
    if (!data.found) {
      setScanMessage("該当する依頼が見つかりません");
      return;
    }
    setFilter(data.request.status);
    setExpandedId(data.request.id);
    setScanMessage(
      data.mismatch
        ? "警告: バーコードの組み合わせに不一致があります"
        : `一致: ${data.matchType === "shipping" ? "発送BC" : data.matchType === "box" ? "箱BC" : "商品BC"}`
    );
  }

  function handleScan(e: React.FormEvent) {
    e.preventDefault();
    lookupCode(scanCode);
    setScanCode("");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleScan} className="card-surface flex flex-col gap-3 p-4 sm:flex-row">
        <input
          className="input-field flex-1 font-mono"
          placeholder="バーコードスキャン (発送/箱/商品)"
          value={scanCode}
          onChange={(e) => setScanCode(e.target.value)}
        />
        <button type="submit" className="btn-secondary shrink-0">
          検索
        </button>
      </form>

      <BarcodeScanner onScan={lookupCode} />

      {scanMessage && (
        <p className={`text-sm ${scanMessage.startsWith("警告") ? "text-danger" : "text-muted"}`}>
          {scanMessage}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-lg px-3 py-1 text-sm ${filter === "ALL" ? "bg-gold/20 text-gold" : "bg-bg-elevated"}`}
          onClick={() => setFilter("ALL")}
        >
          すべて
        </button>
        {SHIPPING_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={`rounded-lg px-3 py-1 text-sm ${filter === s ? "bg-gold/20 text-gold" : "bg-bg-elevated"}`}
            onClick={() => setFilter(s)}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card-surface p-8 text-center text-muted">該当する発送依頼がありません</div>
        ) : (
          filtered.map((r) => {
            const draft = getDraft(r.id, r);
            const expanded = expandedId === r.id;
            return (
              <div key={r.id} className="card-surface overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 p-4 text-left"
                  onClick={() => setExpandedId(expanded ? null : r.id)}
                >
                  <div>
                    <p className="font-bold">{r.recipientName}</p>
                    <p className="text-xs text-muted">{r.user.email}</p>
                    <p className="mt-1 text-xs text-muted">
                      〒{r.postalCode} {r.prefecture}{r.city}{r.addressLine}
                    </p>
                  </div>
                  <span className="rounded bg-bg-elevated px-2 py-0.5 text-xs">
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      <p><span className="text-muted">箱BC:</span> <span className="font-mono">{r.boxBarcode ?? "—"}</span></p>
                      <p><span className="text-muted">発送BC:</span> <span className="font-mono">{r.shippingBarcode ?? "—"}</span></p>
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-bold">同梱景品 ({r.items.length})</p>
                      <ul className="space-y-1 text-sm">
                        {r.items.map((item) => (
                          <li key={item.id} className="flex justify-between gap-2 rounded bg-bg-elevated px-3 py-2">
                            <span>{item.userWin.name}</span>
                            <span className="font-mono text-xs text-muted">{item.barcode}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        className="input-field text-sm"
                        placeholder="追跡番号"
                        value={draft.trackingNumber}
                        onChange={(e) =>
                          setDrafts({ ...drafts, [r.id]: { ...draft, trackingNumber: e.target.value } })
                        }
                      />
                      <input
                        className="input-field text-sm"
                        placeholder="管理メモ"
                        value={draft.adminMemo}
                        onChange={(e) =>
                          setDrafts({ ...drafts, [r.id]: { ...draft, adminMemo: e.target.value } })
                        }
                      />
                    </div>

                    <select
                      className="input-field text-sm"
                      value={r.status}
                      disabled={loadingId === r.id}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                    >
                      {SHIPPING_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
