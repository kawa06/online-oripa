"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

const emptyForm = {
  label: "自宅",
  postalCode: "",
  prefecture: "",
  city: "",
  addressLine: "",
  building: "",
  phone: "",
  recipientName: "",
  isDefault: false,
};

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadAddresses() {
    const res = await fetch("/api/address");
    if (res.ok) {
      const data = await res.json();
      setAddresses(data.addresses ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  async function lookupZipcode() {
    const zip = form.postalCode.replace(/-/g, "");
    if (!/^\d{7}$/.test(zip)) return;
    setZipLoading(true);
    const res = await fetch(`/api/address/zipcode?zip=${zip}`);
    const data = await res.json();
    setZipLoading(false);
    if (res.ok && data.prefecture) {
      setForm((f) => ({ ...f, prefecture: data.prefecture, city: data.city ?? f.city }));
    }
  }

  function startEdit(addr: Address) {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      postalCode: addr.postalCode,
      prefecture: addr.prefecture,
      city: addr.city,
      addressLine: addr.addressLine,
      building: addr.building ?? "",
      phone: addr.phone,
      recipientName: addr.recipientName,
      isDefault: addr.isDefault,
    });
    setError("");
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const url = editingId ? `/api/address/${editingId}` : "/api/address";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "保存に失敗しました");
      return;
    }

    setMessage(editingId ? "住所を更新しました" : "住所を登録しました");
    setEditingId(null);
    setForm(emptyForm);
    await loadAddresses();
  }

  async function handleDelete(id: string) {
    if (!confirm("この住所を削除しますか？")) return;
    const res = await fetch(`/api/address/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "削除に失敗しました");
      return;
    }
    await loadAddresses();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">配送先住所</h1>
      <p className="mt-2 text-muted">発送先の住所を登録・編集できます。</p>

      {error && <p className="mt-4 rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>}
      {message && <p className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success">{message}</p>}

      <form onSubmit={handleSubmit} className="card-surface mt-8 space-y-4 p-6">
        <h2 className="font-bold">{editingId ? "住所を編集" : "新しい住所"}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-muted">ラベル</label>
            <input
              className="input-field"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="自宅"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">受取人</label>
            <input
              className="input-field"
              required
              value={form.recipientName}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-muted">郵便番号</label>
            <div className="flex gap-2">
              <input
                className="input-field"
                required
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                onBlur={lookupZipcode}
                placeholder="1234567"
              />
              <button
                type="button"
                onClick={lookupZipcode}
                disabled={zipLoading}
                className="btn-secondary shrink-0 text-xs"
              >
                {zipLoading ? "..." : "検索"}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">電話番号</label>
            <input
              className="input-field"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-muted">都道府県</label>
            <input
              className="input-field"
              required
              value={form.prefecture}
              onChange={(e) => setForm({ ...form, prefecture: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">市区町村</label>
            <input
              className="input-field"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">番地</label>
          <input
            className="input-field"
            required
            value={form.addressLine}
            onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">建物名・部屋番号（任意）</label>
          <input
            className="input-field"
            value={form.building}
            onChange={(e) => setForm({ ...form, building: e.target.value })}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          />
          デフォルトの配送先にする
        </label>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "保存中..." : editingId ? "更新する" : "登録する"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="btn-secondary">
              キャンセル
            </button>
          )}
        </div>
      </form>

      <section className="mt-10">
        <h2 className="font-bold">登録済み住所</h2>
        {loading ? (
          <div className="card-surface mt-4 p-6 text-center text-muted">読み込み中...</div>
        ) : addresses.length === 0 ? (
          <div className="card-surface mt-4 p-6 text-center text-muted">住所が登録されていません。</div>
        ) : (
          <div className="mt-4 space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="card-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold">
                      {addr.label}
                      {addr.isDefault && <span className="ml-2 text-xs text-gold">デフォルト</span>}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      〒{addr.postalCode} {addr.prefecture}{addr.city}{addr.addressLine}
                      {addr.building && ` ${addr.building}`}
                    </p>
                    <p className="text-sm text-muted">{addr.recipientName} · {addr.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEdit(addr)} className="btn-secondary text-xs">
                      編集
                    </button>
                    <button type="button" onClick={() => handleDelete(addr.id)} className="btn-secondary text-xs">
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link href="/mypage" className="mt-8 inline-block text-sm text-gold">
        ← マイページ
      </Link>
    </div>
  );
}
