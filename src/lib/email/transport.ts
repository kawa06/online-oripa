import "server-only";

import nodemailer from "nodemailer";
import { getShopName } from "@/lib/brand";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

function getResolvedFromAddress() {
  const shopName = getShopName();
  const configured = process.env.EMAIL_FROM ?? "";
  if (configured && !configured.includes("yourdomain.com") && !configured.includes("example.com")) {
    return configured;
  }
  const gmailUser = process.env.GMAIL_USER;
  if (gmailUser) return `${shopName} <${gmailUser}>`;
  return `${shopName} <onboarding@resend.dev>`;
}

async function sendViaGmail(payload: EmailPayload) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass) return { sent: false as const };

  const from = getResolvedFromAddress();
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });

  return { sent: true as const, via: "gmail" as const };
}

async function sendViaResend(payload: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false as const };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getResolvedFromAddress(),
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`メール送信失敗: ${text}`);
  }

  return { sent: true as const, via: "resend" as const };
}

export async function sendEmail(payload: EmailPayload) {
  const gmail = await sendViaGmail(payload).catch((error) => {
    throw error instanceof Error ? error : new Error("Gmail送信失敗");
  });
  if (gmail.sent) return gmail;

  const resend = await sendViaResend(payload);
  if (resend.sent) return resend;

  if (process.env.NODE_ENV === "development") {
    console.log("[email:skipped]", payload.subject, "→", payload.to);
  }
  return { sent: false as const };
}
