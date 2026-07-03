import type { AuthError } from "@supabase/supabase-js";

const CODE_MESSAGES: Record<string, string> = {
  over_email_send_rate_limit:
    "メール送信の上限に達しました。1時間ほど待ってから再度お試しください。",
  hook_timeout:
    "確認メールの送信がタイムアウトしました。Supabase の Send Email Hook を削除してください。",
  unexpected_failure:
    "確認メールの送信に失敗しました。Supabase の Send Email Hook を削除し、Custom SMTP を使ってください。",
  email_address_invalid: "メールアドレスの形式が正しくありません。",
  user_already_exists: "このメールアドレスは既に登録されています。",
  weak_password: "パスワードが弱すぎます。8文字以上で設定してください。",
};

const HOOK_FAILURE_HINT =
  "Send Email Hook が有効なためメール送信に失敗しています。Supabase → Authentication → Hooks で Send Email を Delete してください。";

function normalizeMessage(message: string | undefined) {
  let msg = message?.trim() ?? "";

  if (msg.startsWith("{")) {
    try {
      const parsed = JSON.parse(msg) as { message?: string; error?: string };
      if (typeof parsed.message === "string") msg = parsed.message.trim();
      else if (typeof parsed.error === "string") msg = parsed.error.trim();
      else msg = "";
    } catch {
      // keep original message
    }
  }

  if (!msg || msg === "{}" || msg === "[object Object]") return "";
  return msg;
}

export function formatAuthError(error: AuthError, fallback = "処理に失敗しました。しばらくしてから再度お試しください。") {
  if (error.code && CODE_MESSAGES[error.code]) {
    return CODE_MESSAGES[error.code];
  }

  const msg = normalizeMessage(error.message);
  if (msg) return msg;

  if (error.message?.includes("{}") || error.code === "unexpected_failure") {
    return HOOK_FAILURE_HINT;
  }

  return fallback;
}
