"use client";

import { useState } from "react";
import { updateInquiryStatus } from "@/app/admin/_actions";
import type { ContactInquiry, InquiryStatus } from "@prisma/client";

export function InquiriesManager({ inquiries }: { inquiries: ContactInquiry[] }) {
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleStatusChange(inq: ContactInquiry, status: InquiryStatus) {
    setLoadingId(inq.id);
    await updateInquiryStatus(inq.id, status, replies[inq.id]);
    setLoadingId(null);
  }

  return (
    <div className="space-y-4">
      {inquiries.length === 0 ? (
        <div className="card-surface p-8 text-center text-muted">お問い合わせがありません</div>
      ) : (
        inquiries.map((inq) => (
          <div key={inq.id} className="card-surface p-5">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold">{inq.subject}</p>
                <p className="text-sm text-muted">
                  {inq.name} &lt;{inq.email}&gt; · {inq.createdAt.toLocaleString("ja-JP")}
                </p>
              </div>
              <select
                className="input-field w-auto text-sm"
                value={inq.status}
                disabled={loadingId === inq.id}
                onChange={(e) => handleStatusChange(inq, e.target.value as InquiryStatus)}
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
            <p className="whitespace-pre-wrap text-sm">{inq.body}</p>
            {inq.adminReply && (
              <p className="mt-3 rounded-lg bg-bg-elevated p-3 text-sm">
                <span className="font-semibold text-gold">返信済み:</span> {inq.adminReply}
              </p>
            )}
            <textarea
              className="input-field mt-3 text-sm"
              rows={2}
              placeholder="返信メッセージ（ステータス変更時にメール送信）"
              value={replies[inq.id] ?? inq.adminReply ?? ""}
              onChange={(e) => setReplies({ ...replies, [inq.id]: e.target.value })}
            />
          </div>
        ))
      )}
    </div>
  );
}
