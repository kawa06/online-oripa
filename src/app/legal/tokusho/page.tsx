import Link from "next/link";

export default function TokushoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">特定商取引法に基づく表記</h1>

      <div className="card-surface mt-8 p-6">
        <dl className="space-y-4 text-sm">
          <div className="grid gap-1 border-b border-border pb-4 sm:grid-cols-3">
            <dt className="font-bold text-muted">販売事業者</dt>
            <dd className="sm:col-span-2">ORIPA VAULT 運営事務局</dd>
          </div>
          <div className="grid gap-1 border-b border-border pb-4 sm:grid-cols-3">
            <dt className="font-bold text-muted">運営責任者</dt>
            <dd className="sm:col-span-2">代表者名（請求があった場合に遅滞なく開示）</dd>
          </div>
          <div className="grid gap-1 border-b border-border pb-4 sm:grid-cols-3">
            <dt className="font-bold text-muted">所在地</dt>
            <dd className="sm:col-span-2">請求があった場合に遅滞なく開示</dd>
          </div>
          <div className="grid gap-1 border-b border-border pb-4 sm:grid-cols-3">
            <dt className="font-bold text-muted">電話番号</dt>
            <dd className="sm:col-span-2">請求があった場合に遅滞なく開示</dd>
          </div>
          <div className="grid gap-1 border-b border-border pb-4 sm:grid-cols-3">
            <dt className="font-bold text-muted">メールアドレス</dt>
            <dd className="sm:col-span-2">
              <Link href="/contact" className="text-gold underline">
                お問い合わせフォーム
              </Link>
              よりご連絡ください
            </dd>
          </div>
          <div className="grid gap-1 border-b border-border pb-4 sm:grid-cols-3">
            <dt className="font-bold text-muted">販売価格</dt>
            <dd className="sm:col-span-2">各ガチャページおよびポイント購入ページに表示（1ポイント=1円）</dd>
          </div>
          <div className="grid gap-1 border-b border-border pb-4 sm:grid-cols-3">
            <dt className="font-bold text-muted">商品代金以外の必要料金</dt>
            <dd className="sm:col-span-2">インターネット接続料金、通信料金（お客様負担）</dd>
          </div>
          <div className="grid gap-1 border-b border-border pb-4 sm:grid-cols-3">
            <dt className="font-bold text-muted">支払方法</dt>
            <dd className="sm:col-span-2">クレジットカード（Stripe）</dd>
          </div>
          <div className="grid gap-1 border-b border-border pb-4 sm:grid-cols-3">
            <dt className="font-bold text-muted">支払時期</dt>
            <dd className="sm:col-span-2">ポイント購入時に即時決済。ガチャ利用時にポイント消費。</dd>
          </div>
          <div className="grid gap-1 border-b border-border pb-4 sm:grid-cols-3">
            <dt className="font-bold text-muted">商品の引渡時期</dt>
            <dd className="sm:col-span-2">発送依頼後、通常5〜10営業日以内に発送（在庫状況により変動）</dd>
          </div>
          <div className="grid gap-1 border-b border-border pb-4 sm:grid-cols-3">
            <dt className="font-bold text-muted">返品・キャンセル</dt>
            <dd className="sm:col-span-2">
              デジタルコンテンツ（ガチャ結果）の性質上、原則として返品・返金はお受けできません。景品はポイント変換または発送依頼が可能です。
            </dd>
          </div>
          <div className="grid gap-1 sm:grid-cols-3">
            <dt className="font-bold text-muted">動作環境</dt>
            <dd className="sm:col-span-2">最新版のChrome、Safari、Edge等のWebブラウザ</dd>
          </div>
        </dl>
      </div>

      <Link href="/" className="mt-8 inline-block text-sm text-gold">
        ← トップページ
      </Link>
    </div>
  );
}
