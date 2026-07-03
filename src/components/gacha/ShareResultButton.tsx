"use client";

import { useState } from "react";

type Props = {
  title: string;
  shareText: string;
  url: string;
  ogImageUrl?: string;
};

export function ShareResultButton({ title, shareText, url, ogImageUrl }: Props) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const shareUrl = ogImageUrl ? `${url}\n${ogImageUrl}` : url;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function downloadImage() {
    if (!ogImageUrl) return;
    window.open(ogImageUrl, "_blank");
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button type="button" className="btn-secondary text-center" onClick={share}>
        {copied ? "リンクをコピーしました" : "結果をシェア"}
      </button>
      {ogImageUrl && (
        <button type="button" className="btn-secondary text-center" onClick={downloadImage}>
          当選画像を見る
        </button>
      )}
    </div>
  );
}
