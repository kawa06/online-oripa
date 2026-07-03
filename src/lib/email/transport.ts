import "server-only";

import nodemailer from "nodemailer";
import { getShopName } from "@/lib/brand";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

const SEND_TIMEOUT_MS = 3500;

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

function withTimeout<T>(promise: Promise<T>, label: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timeout`)), SEND_TIMEOUT_MS);
    }),
  ]);
}

async function sendViaGmail(payload: EmailPayload) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !pass) return { sent: false as const };

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
    connectionTimeout: SEND_TIMEOUT_MS,
    greetingTimeout: SEND_TIMEOUT_MS,
    socketTimeout: SEND_TIMEOUT_MS,
  });

  await transporter.sendMail({
    from: getResolvedFromAddress(),
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });

  return { sent: true as const, via: "gmail" as const };
}

async function sendViaResend(payload: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false as const };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);

  try {
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
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`メール送信失敗: ${text}`);
    }

    return { sent: true as const, via: "resend" as const };
  } finally {
    clearTimeout(timer);
  }
}

export async function sendEmail(payload: EmailPayload) {
  try {
    const gmail = await withTimeout(sendViaGmail(payload), "Gmail");
    if (gmail.sent) return gmail;
  } catch {
    // fall through to Resend
  }

  try {
    const resend = await withTimeout(sendViaResend(payload), "Resend");
    if (resend.sent) return resend;
  } catch {
    // fall through
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[email:skipped]", payload.subject, "→", payload.to);
  }
  return { sent: false as const };
}
