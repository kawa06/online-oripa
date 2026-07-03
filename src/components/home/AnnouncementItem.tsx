"use client";

type Props = {
  title: string;
  body: string;
};

export function AnnouncementItem({ title, body }: Props) {
  return (
    <details className="card-surface group open:border-gold/30 p-4">
      <summary className="cursor-pointer list-none font-semibold [&::-webkit-details-marker]:hidden">
        <span className="flex items-start justify-between gap-3">
          <span>{title}</span>
          <span className="shrink-0 text-xs text-gold group-open:hidden">開く</span>
          <span className="hidden shrink-0 text-xs text-muted group-open:inline">閉じる</span>
        </span>
      </summary>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm text-muted">{body}</p>
    </details>
  );
}
