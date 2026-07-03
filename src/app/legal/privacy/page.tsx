import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">プライバシーポリシー</h1>
      <p className="mt-2 text-sm text-muted">最終更新日: 2026年7月1日</p>

      <div className="card-surface mt-8 space-y-6 p-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 font-bold text-text">1. 収集する情報</h2>
          <p>当サービスは、以下の情報を収集する場合があります。</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>メールアドレス、表示名、電話番号</li>
            <li>配送先住所</li>
            <li>決済に関する情報（Stripe経由で処理、カード番号は当社で保持しません）</li>
            <li>サービス利用履歴（ガチャ、購入、発送等）</li>
            <li>アクセスログ、IPアドレス、Cookie情報</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-text">2. 利用目的</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>サービスの提供・運営</li>
            <li>景品の発送</li>
            <li>お問い合わせへの対応</li>
            <li>不正利用の防止</li>
            <li>サービス改善のための分析</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-text">3. 第三者提供</h2>
          <p>
            当サービスは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。決済処理にはStripeを利用します。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-text">4. 安全管理</h2>
          <p>
            当サービスは、個人情報の漏洩、滅失、毀損を防止するため、適切なセキュリティ対策を講じます。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-text">5. 開示・訂正・削除</h2>
          <p>
            ユーザーは、自己の個人情報について、開示・訂正・削除を求めることができます。お問い合わせフォームよりご連絡ください。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-text">6. お問い合わせ</h2>
          <p>
            個人情報の取り扱いに関するお問い合わせは、
            <Link href="/contact" className="text-gold underline">
              お問い合わせフォーム
            </Link>
            よりご連絡ください。
          </p>
        </section>
      </div>

      <Link href="/" className="mt-8 inline-block text-sm text-gold">
        ← トップページ
      </Link>
    </div>
  );
}
