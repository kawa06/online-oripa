"use client";

import { useState } from "react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
};

export function ImageUploadField({ value, onChange, folder = "misc", label = "画像" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error ?? "アップロード失敗");
      return;
    }
    onChange(data.url);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm text-muted">{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="input-field flex-1"
          placeholder="画像URL またはアップロード"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <label className="btn-secondary cursor-pointer text-center text-sm">
          {uploading ? "UP中..." : "画像UP"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-20 w-20 rounded-lg object-cover" />
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
