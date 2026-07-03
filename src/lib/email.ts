import "server-only";

import { getShopName } from "@/lib/brand";
import { buildBrandedEmailHtml } from "@/lib/email/templates";
import { sendEmail as sendEmailTransport } from "@/lib/email/transport";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload) {
  return sendEmailTransport(payload);
}

export async function sendShippingStatusEmail(params: {
  to: string;
  recipientName: string;
  status: string;
  trackingNumber?: string | null;
}) {
  const shopName = getShopName();
  const statusLabel: Record<string, string> = {
    PACKING: "梱包中",
    READY: "発送準備完了",
    SHIPPED: "発送済み",
    CONTACTED: "連絡済み",
  };
  const label = statusLabel[params.status] ?? params.status;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const trackingLine = params.trackingNumber
    ? `追跡番号: ${params.trackingNumber}`
    : "配送状況はマイページからご確認いただけます。";

  return sendEmail({
    to: params.to,
    subject: `【${shopName}】発送状況の更新: ${label}`,
    html: buildBrandedEmailHtml({
      email: params.to,
      recipient: params.recipientName,
      headline: `【${shopName}】発送状況の更新`,
      bodyLines: [
        `発送依頼のステータスが「${label}」に更新されました。`,
        trackingLine,
      ],
      actionLabel: "配送履歴を確認する",
      actionUrl: `${appUrl}/shipping/history`,
    }),
  });
}

export async function sendInquiryStatusEmail(params: {
  to: string;
  name: string;
  subject: string;
  status: string;
  adminReply?: string;
}) {
  const shopName = getShopName();
  const labels: Record<string, string> = {
    OPEN: "受付済み",
    IN_PROGRESS: "対応中",
    CLOSED: "完了",
  };
  const label = labels[params.status] ?? params.status;
  const replyLine = params.adminReply
    ? `返信: ${params.adminReply.replace(/\n/g, " ")}`
    : "内容を確認のうえ、順次ご返信いたします。";

  return sendEmail({
    to: params.to,
    subject: `【${shopName}】お問い合わせ更新: ${label}`,
    html: buildBrandedEmailHtml({
      email: params.to,
      recipient: params.name,
      headline: `【${shopName}】お問い合わせ更新`,
      bodyLines: [
        `お問い合わせ「${params.subject}」のステータスが「${label}」に更新されました。`,
        replyLine,
      ],
      actionLabel: "お問い合わせページへ",
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/contact`,
    }),
  });
}
