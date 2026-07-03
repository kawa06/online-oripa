import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { sendEmail } from "@/lib/email";
import {
  buildPasswordResetEmail,
  buildRegistrationConfirmEmail,
} from "@/lib/email/templates";

type EmailData = {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
};

type HookPayload = {
  user: { email: string };
  email_data: EmailData;
};

function normalizeRedirectTo(redirectTo: string | undefined, siteUrl: string) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? siteUrl).replace(/\/$/, "");
  const target = redirectTo?.replace(/\/$/, "") ?? "";
  if (!target || target === appUrl) {
    return `${appUrl}/auth/callback?next=/mypage`;
  }
  return redirectTo!;
}

function buildConfirmationUrl(emailData: EmailData) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");

  const redirectTo = normalizeRedirectTo(emailData.redirect_to, emailData.site_url);
  const params = new URLSearchParams({
    token: emailData.token_hash,
    type: emailData.email_action_type,
    redirect_to: redirectTo,
  });

  return `${supabaseUrl}/auth/v1/verify?${params.toString()}`;
}

export async function POST(request: Request) {
  const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET;
  if (!hookSecret) {
    return NextResponse.json({ error: "Hook not configured" }, { status: 503 });
  }

  const payloadText = await request.text();
  const headers = Object.fromEntries(request.headers);

  let payload: HookPayload;
  try {
    const secret = hookSecret.replace(/^v1,whsec_/, "");
    const wh = new Webhook(secret);
    payload = wh.verify(payloadText, headers) as HookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { user, email_data: emailData } = payload;
  const confirmationUrl = buildConfirmationUrl(emailData);

  let mail: { subject: string; html: string };
  switch (emailData.email_action_type) {
    case "signup":
      mail = buildRegistrationConfirmEmail({
        email: user.email,
        confirmationUrl,
      });
      break;
    case "recovery":
      mail = buildPasswordResetEmail({
        email: user.email,
        resetUrl: confirmationUrl,
      });
      break;
    default:
      mail = buildRegistrationConfirmEmail({
        email: user.email,
        confirmationUrl,
      });
      break;
  }

  try {
    const result = await sendEmail({ to: user.email, subject: mail.subject, html: mail.html });
    if (!result.sent) {
      return NextResponse.json({ error: "Email transport not configured" }, { status: 500 });
    }
    return NextResponse.json({});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email send failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
