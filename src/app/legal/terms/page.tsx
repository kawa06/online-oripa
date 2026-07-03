import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">利用規約</h1>
      <p className="mt-2 text-sm text-muted">最終更新日: 2026年7月1日</p>

      <div className="card-surface mt-8 space-y-6 p-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 font-bold text-text">第1条（適用）</h2>
          <p>
            本規約は、ORIPA VAULT（以下「当サービス」）が提供するオンラインオリパサービスの利用条件を定めるものです。ユーザーは本規約に同意のうえ、当サービスを利用するものとします。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-text">第2条（会員登録）</h2>
          <p>
            ユーザーは、正確な情報を提供して会員登録を行うものとします。虚偽の登録が判明した場合、当サービスはアカウントを停止できるものとします。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-text">第3条（ポイント）</h2>
          <p>
            ポイントは当サービス内でのみ使用でき、現金との換金はできません。ポイントの有効期限、返金条件等は当サービスが別途定めるところによります。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-text">第4条（ガチャ・景品）</h2>
          <p>
            ガチャの結果はランダムに決定されます。排出率・残数等の表示は参考情報であり、当サービスは表示内容の正確性に努めますが、システム上の誤差が生じる場合があります。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-text">第5条（禁止事項）</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>不正アクセス、Bot等による自動操作</li>
            <li>アカウントの譲渡・売買</li>
            <li>当サービスの運営を妨害する行為</li>
            <li>その他、当サービスが不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-text">第6条（免責）</h2>
          <p>
            当サービスは、天災、通信障害、その他不可抗力によるサービス停止について責任を負いません。景品の状態について、当サービスは合理的な範囲で品質を保証します。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-text">第7条（規約の変更）</h2>
          <p>
            当サービスは、必要に応じて本規約を変更できるものとします。変更後の規約は、当サービス上に掲示した時点で効力を生じます。
          </p>
        </section>
      </div>

      <Link href="/" className="mt-8 inline-block text-sm text-gold">
        ← トップページ
      </Link>
    </div>
  );
}
