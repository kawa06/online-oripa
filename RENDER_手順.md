# Render デプロイ手順

## 1. GitHub に最新コードがあること

https://github.com/kawa06/online-oripa

## 2. Render でデプロイ

**`RENDER_ENVを開く.bat`** をダブルクリック  
→ Render の画面 + コピペ用メモ帳が開きます

または [Render Blueprint を開く](https://dashboard.render.com/blueprint/new?repo=https://github.com/kawa06/online-oripa)

1. GitHub アカウントを連携（初回のみ）
2. リポジトリ `kawa06/online-oripa` を選択
3. **`RENDER_ENV_コピペ用.txt`** から Key / Value を1つずつコピー

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
