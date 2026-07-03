# Render デプロイ手順

## 1. GitHub に最新コードがあること

https://github.com/kawa06/online-oripa

## 2. Render でデプロイ

**`RENDER_DEPLOY.bat`** をダブルクリック  
または [Render Blueprint を開く](https://dashboard.render.com/blueprint/new?repo=https://github.com/kawa06/online-oripa)

1. GitHub アカウントを連携（初回のみ）
2. リポジトリ `kawa06/online-oripa` を選択
3. 環境変数を入力（`.env.local` と同じ値）

| 変数 | 値の例 |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rrzugscjdsqreesbgazu.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key |
| `DATABASE_URL` | Transaction pooler (6543) |
| `DIRECT_URL` | Session pooler (5432) |
| `ADMIN_EMAIL` | `oripakawa@gmail.com` |
| Stripe / Resend | 任意（空でも可） |

`NEXT_PUBLIC_APP_URL` は Render が自動設定します。

4. **Apply** → デプロイ開始（5〜10分）

## 3. Supabase Auth 設定

デプロイ後の URL（例: `https://online-oripa.onrender.com`）を Supabase に追加:

[Auth URL Configuration](https://supabase.com/dashboard/project/rrzugscjdsqreesbgazu/auth/url-configuration)

```
https://online-oripa.onrender.com/auth/callback
```

## 4. 確認

- サイト: `https://online-oripa.onrender.com`
- 管理: `https://online-oripa.onrender.com/admin`

## 注意

- **Free プラン**は15分アクセスがないとスリープ（初回表示が遅い）
- 環境変数に `.env.local` のパスワードをそのままコピー
