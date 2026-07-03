import { getContactEmail, getShopName } from "@/lib/brand";

type BrandedEmailParams = {
  email: string;
  recipient?: string;
  headline: string;
  bodyLines: string[];
  actionLabel: string;
  actionUrl: string;
  shopName?: string;
  contactEmail?: string;
};

export function buildBrandedEmailHtml(params: BrandedEmailParams) {
  const shopName = params.shopName ?? getShopName();
  const contactEmail = params.contactEmail ?? getContactEmail();
  const recipient = params.recipient ?? params.email;
  const body = params.bodyLines.map((line) => `<p style="margin: 0 0 16px;">${line}</p>`).join("");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${params.headline}</title>
</head>
<body style="margin: 0; padding: 0; background: #f4f4f5; font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; color: #18181b; line-height: 1.7;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f4f4f5; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 28px 24px 8px;">
              <p style="margin: 0 0 24px; font-size: 18px; font-weight: 700;">${params.headline}</p>
              <p style="margin: 0 0 16px;">${recipient} 様</p>
              ${body}
              <p style="margin: 24px 0 8px; font-weight: 600;">${params.actionLabel}:</p>
              <p style="margin: 0 0 24px; word-break: break-all;">
                <a href="${params.actionUrl}" style="color: #2563eb; text-decoration: underline;">${params.actionUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 24px; background: #fafafa; border-top: 1px solid #e4e4e7; font-size: 13px; color: #71717a;">
              <p style="margin: 0 0 8px; font-weight: 700; color: #18181b;">${shopName}</p>
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

export function buildRegistrationConfirmEmail(params: { email: string; confirmationUrl: string }) {
  const shopName = getShopName();
  return {
    subject: `${shopName} へのご登録ありがとうございます`,
    html: buildBrandedEmailHtml({
      email: params.email,
      headline: `${shopName} へのご登録ありがとうございます`,
      bodyLines: [
        `${shopName} の会員登録が完了しました。オンラインオリパの抽選にご参加いただけます。`,
      ],
      actionLabel: "次の画面へ進む",
      actionUrl: params.confirmationUrl,
      shopName,
    }),
  };
}

export function buildPasswordResetEmail(params: { email: string; resetUrl: string }) {
  const shopName = getShopName();
  return {
    subject: `${shopName} パスワード再設定のご案内`,
    html: buildBrandedEmailHtml({
      email: params.email,
      headline: `${shopName} パスワード再設定のご案内`,
      bodyLines: [
        `${shopName} パスワード再設定のリクエストを受け付けました。`,
        "下記リンクから新しいパスワードを設定してください。",
      ],
      actionLabel: "パスワードを再設定する",
      actionUrl: params.resetUrl,
      shopName,
    }),
  };
}

export function buildRegistrationCompleteEmail(params: { email: string; nextUrl: string }) {
  const shopName = getShopName();
  return {
    subject: `${shopName} へのご登録ありがとうございます`,
    html: buildBrandedEmailHtml({
      email: params.email,
      headline: `${shopName} へのご登録ありがとうございます`,
      bodyLines: [
        `${shopName} の会員登録が完了しました。オンラインオリパの抽選にご参加いただけます。`,
      ],
      actionLabel: "次の画面へ進む",
      actionUrl: params.nextUrl,
      shopName,
    }),
  };
}
