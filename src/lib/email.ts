import "server-only";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "ORIPA VAULT <noreply@example.com>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log("[email:skipped]", payload.subject, "→", payload.to);
    }
    return { sent: false as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: payload.to, subject: payload.subject, html: payload.html }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`メール送信失敗: ${text}`);
  }

  return { sent: true as const };
}

export async function sendShippingStatusEmail(params: {
  to: string;
  recipientName: string;
  status: string;
  trackingNumber?: string | null;
}) {
  const statusLabel: Record<string, string> = {
    PACKING: "梱包中",
    READY: "発送準備完了",
    SHIPPED: "発送済み",
    CONTACTED: "連絡済み",
  };
  const label = statusLabel[params.status] ?? params.status;
  const tracking = params.trackingNumber
    ? `<p>追跡番号: <strong>${params.trackingNumber}</strong></p>`
    : "";

  return sendEmail({
    to: params.to,
    subject: `【ORIPA VAULT】発送状況の更新: ${label}`,
    html: `
      <p>${params.recipientName} 様</p>
      <p>発送依頼のステータスが「${label}」に更新されました。</p>
      ${tracking}
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/shipping/history">配送履歴を確認</a></p>
    `,
  });
}

export async function sendInquiryStatusEmail(params: {
  to: string;
  name: string;
  subject: string;
  status: string;
  adminReply?: string;
}) {
  const labels: Record<string, string> = {
    OPEN: "受付済み",
    IN_PROGRESS: "対応中",
    CLOSED: "完了",
  };
  const label = labels[params.status] ?? params.status;
  const reply = params.adminReply
    ? `<p><strong>返信:</strong></p><p>${params.adminReply.replace(/\n/g, "<br>")}</p>`
    : "<p>内容を確認のうえ、順次ご返信いたします。</p>";

  return sendEmail({
    to: params.to,
    subject: `【ORIPA VAULT】お問い合わせ更新: ${label}`,
    html: `
      <p>${params.name} 様</p>
      <p>お問い合わせ「${params.subject}」のステータスが「${label}」に更新されました。</p>
      ${reply}
    `,
  });
}
