# ORIPA VAULT セットアップ

**→ 作業手順は [SETUP_手順.md](./SETUP_手順.md)（リンク付き）を見てください。**

---

## 最短 4 ステップ

| # | やること | ショートカット |
|---|----------|----------------|
| 1 | 初回セットアップ | `初回セットアップ.bat` |
| 2 | `.env.local` に Supabase の値を貼る | `env.localを開く.bat` + `設定リンクを開く.bat` |
| 3 | Supabase Auth（Email）を ON | `設定リンクを開く.bat` |
| 4 | 再セットアップ → 起動 | `初回セットアップ.bat` → `起動.bat` |

---

## npm コマンド

```powershell
cd c:\Users\user1\projects\online-oripa
npm run setup          # 環境ファイル + DB + Storage
npm run setup:env      # .env.local だけ作成
npm run setup:storage  # Storage バケットだけ作成
npm run dev            # 開発サーバー
```

---

## ローカル URL

- トップ: http://localhost:3000
- 登録: http://localhost:3000/register
- 管理: http://localhost:3000/admin

---

## 外部リンク（新規 Supabase プロジェクト）

- [Supabase ダッシュボード](https://supabase.com/dashboard)
- [新規プロジェクト作成](https://supabase.com/dashboard/new/new-project)
- [Stripe Test Keys（任意）](https://dashboard.stripe.com/test/apikeys)
- [Resend（任意）](https://resend.com/api-keys)
- [Vercel デプロイ（任意）](https://vercel.com/new)
