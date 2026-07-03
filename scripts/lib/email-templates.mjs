/** Supabase Auth メールテンプレート（Go template 変数） */

export function getShopNameFromEnv() {
  return process.env.SHOP_NAME ?? "ORIPA VAULT";
}

export function getContactEmailFromEnv() {
  const from = process.env.EMAIL_FROM ?? "";
  const match = from.match(/<([^>]+)>/);
  return process.env.CONTACT_EMAIL ?? match?.[1] ?? "support@example.com";
}

function supabaseBrandedHtml({ headline, bodyHtml, actionLabel, shopNameLabel }) {
  const shopName = shopNameLabel ?? "ORIPA VAULT";
  const contactEmail = getContactEmailFromEnv();

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin: 0; padding: 0; background: #f4f4f5; font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; color: #18181b; line-height: 1.7;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f4f4f5; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 28px 24px 8px;">
              <p style="margin: 0 0 24px; font-size: 18px; font-weight: 700;">${headline}</p>
              <p style="margin: 0 0 16px;">{{ .Email }} 様</p>
              ${bodyHtml}
              <p style="margin: 24px 0 8px; font-weight: 600;">${actionLabel}:</p>
              <p style="margin: 0 0 24px; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #2563eb; text-decoration: underline;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 24px; background: #fafafa; border-top: 1px solid #e4e4e7; font-size: 13px; color: #71717a;">
              <p style="margin: 0 0 8px; font-weight: 700; color: #18181b;">ORIPA VAULT</p>
              <p style="margin: 0;">本メールは配信専用です。返信は <a href="mailto:${contactEmail}" style="color: #2563eb;">${contactEmail}</a> へお送りください。</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function getSupabaseEmailTemplates() {
  const shopName = getShopNameFromEnv();

  return {
    mailer_subjects_confirmation: `${shopName} へのご登録ありがとうございます`,
    mailer_templates_confirmation_content: supabaseBrandedHtml({
      headline: `${shopName} へのご登録ありがとうございます`,
      bodyHtml: `<p style="margin: 0 0 16px;">${shopName} の会員登録が完了しました。オンラインオリパの抽選にご参加いただけます。</p>`,
      actionLabel: "次の画面へ進む",
      shopNameLabel: shopName,
    }),
    mailer_subjects_recovery: `${shopName} パスワード再設定のご案内`,
    mailer_templates_recovery_content: supabaseBrandedHtml({
      headline: "{{ .SiteName }} パスワード再設定のご案内",
      bodyHtml: `<p style="margin: 0 0 16px;">{{ .SiteName }} パスワード再設定のリクエストを受け付けました。</p><p style="margin: 0 0 16px;">下記リンクから新しいパスワードを設定してください。</p>`,
      actionLabel: "パスワードを再設定する",
    }),
    mailer_subjects_magic_link: `${shopName} ログインリンク`,
    mailer_templates_magic_link_content: supabaseBrandedHtml({
      headline: "{{ .SiteName }} ログインリンク",
      bodyHtml: `<p style="margin: 0 0 16px;">{{ .SiteName }} へのログインリンクです。下記からログインしてください。</p>`,
      actionLabel: "ログインする",
    }),
  };
}
