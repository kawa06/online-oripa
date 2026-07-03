"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { rankLabel } from "@/lib/gacha-utils";
import type { PrizeRank } from "@prisma/client";

type Address = {
  id: string;
  label: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
  building: string | null;
  phone: string;
  recipientName: string;
  isDefault: boolean;
};

type Win = {
  id: string;
  name: string;
  rank: PrizeRank;
  imageUrl: string | null;
};

export default function ShippingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselected = searchParams.get("winIds")?.split(",").filter(Boolean) ?? [];

  const [wins, setWins] = useState<Win[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState<string[]>(preselected);
  const [addressId, setAddressId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const [winsRes, addrRes] = await Promise.all([
        fetch("/api/wins?status=HELD"),
        fetch("/api/address"),
      ]);
      if (winsRes.ok) {
        const data = await winsRes.json();
        setWins(data.wins ?? []);
      }
      if (addrRes.ok) {
        const data = await addrRes.json();
        const list: Address[] = data.addresses ?? [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) setAddressId(def.id);
      }
      setLoading(false);
    }
    load();
  }, []);

  function toggleWin(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected.length) {
      setError("発送する景品を選択してください");
      return;
    }
    if (!addressId) {
      setError("配送先を選択してください");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winIds: selected, addressId }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "発送依頼に失敗しました");
      return;
    }
    router.push("/shipping/history");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="card-surface p-8 text-center text-muted">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">発送依頼</h1>
      <p className="mt-2 text-muted">保有中の景品を選択して発送を依頼します。</p>

      {error && <p className="mt-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <section>
          <h2 className="font-bold">発送する景品</h2>
          {wins.length === 0 ? (
            <div className="card-surface mt-3 p-6 text-center text-muted">
              発送可能な景品がありません。
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {wins.map((win) => (
                <label
                  key={win.id}
                  className="card-surface flex cursor-pointer items-center gap-3 p-3"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(win.id)}
                    onChange={() => toggleWin(win.id)}
                  />
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-bg-elevated text-xs">
                    {win.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={win.imageUrl} alt="" className="h-full w-full rounded object-cover" />
                    ) : (
                      rankLabel(win.rank)
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gold">{rankLabel(win.rank)}</p>
                    <p className="font-semibold">{win.name}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">配送先</h2>
            <Link href="/address" className="text-sm text-gold">
              住所を管理 →
            </Link>
          </div>
          {addresses.length === 0 ? (
            <div className="card-surface mt-3 p-6 text-center text-muted">
              配送先が登録されていません。
              <Link href="/address" className="mt-2 block text-gold">
                住所を登録する
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className="card-surface flex cursor-pointer items-start gap-3 p-4"
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={addressId === addr.id}
                    onChange={() => setAddressId(addr.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold">
                      {addr.label}{" "}
                      {addr.isDefault && <span className="text-xs text-gold">（デフォルト）</span>}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      〒{addr.postalCode} {addr.prefecture}
                      {addr.city}
                      {addr.addressLine}
                      {addr.building && ` ${addr.building}`}
                    </p>
                    <p className="text-sm text-muted">
                      {addr.recipientName} · {addr.phone}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </section>

        <button
          type="submit"
          disabled={submitting || !wins.length || !addresses.length}
          className="btn-primary w-full sm:w-auto"
        >
          {submitting ? "送信中..." : "発送を依頼する"}
        </button>
      </form>

      <Link href="/mypage" className="mt-8 inline-block text-sm text-gold">
        ← マイページ
      </Link>
    </div>
  );
}
