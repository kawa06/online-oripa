# ORIPA VAULT — セットアップ（1から順番に）

> **わからないときは → `手順を開く.bat` をダブルクリック**  
> ブラウザでリンク付き手順が開きます。

フォルダ: `c:\Users\user1\projects\online-oripa`

---

## 1. Supabase アカウントを作る

- 未登録 → [Supabase 無料登録](https://supabase.com/dashboard/sign-up)
- ログイン済み → [Supabase ダッシュボード](https://supabase.com/dashboard)

---

## 2. Supabase でプロジェクトを新規作成

1. [新規プロジェクト作成](https://supabase.com/dashboard/new/new-project) を開く
2. **Name**: 好きな名前（例: `oripa-vault`）
3. **Database Password**: 必ずメモ（後で使う）
4. **Region**: **Tokyo (Northeast Asia)** を選ぶ
5. **Create new project** → 1〜2分待つ

---

## 3. PC で初回セットアップを実行

エクスプローラーで `online-oripa` フォルダを開き、  
**`初回セットアップ.bat`** をダブルクリック。

- 黒い画面で `npm install` が走る → 終わるまで待つ
- この時点で DB エラーが出ても **OK**（次のステップで直る）

---

## 4. Supabase の値を `.env.local` に貼る

### 4-1. 設定ページとメモ帳を開く

**`設定リンクを開く.bat`** をダブルクリック

→ Supabase の設定ページがブラウザで開く  
→ メモ帳で `.env.local` が開く

（メモ帳だけ開きたい場合 → **`env.localを開く.bat`**）

### 4-2. コピーして貼り付け

| メモ帳の行 | Supabase でコピーする場所 |
|------------|---------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | [API Keys](https://supabase.com/dashboard) → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 同上 → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | 同上 → service_role |
| `DATABASE_URL` | [Database](https://supabase.com/dashboard) → URI → **Transaction pooler (6543)** |
| `DIRECT_URL` | 同上 → **Session pooler または Direct (5432)** |
| `ADMIN_EMAIL` | 管理者にしたい **自分のメール** |

> `[YOUR-PASSWORD]` はステップ2でメモした Database Password に置き換える

### 4-3. 保存

メモ帳で **Ctrl+S** → 閉じる

---

## 5. ログイン設定（Supabase で1回だけ）

### 5-1. Email ログインを ON

1. [Auth → Providers](https://supabase.com/dashboard) を開く（プロジェクトを選択）
2. **Email** を ON → Save

### 5-2. リダイレクト URL を追加

1. [Auth → URL Configuration](https://supabase.com/dashboard) を開く
2. **Redirect URLs** に次を1行追加 → Save:

```
http://localhost:3000/auth/callback
```

---

## 6. もう一度「初回セットアップ.bat」を実行

`.env.local` を保存したあと、**`初回セットアップ.bat`** をもう一度ダブルクリック。

→ DB 作成（db:push）+ サンプルデータ（seed）が入る

---

## 7. アプリを起動

**`起動.bat`** をダブルクリック

| ページ | リンク |
|--------|--------|
| トップ | http://localhost:3000 |
| 会員登録 | http://localhost:3000/register |
| 管理画面 | http://localhost:3000/admin |
| ガチャ一覧 | http://localhost:3000/gacha |

---

## 8. 管理者として登録

1. [会員登録](http://localhost:3000/register) を開く
2. **`ADMIN_EMAIL` と同じメール**で登録
3. [管理画面](http://localhost:3000/admin) にアクセス

---

## バッチファイル一覧

| ファイル | いつ使う |
|----------|----------|
| **`手順を開く.bat`** | 迷ったら最初にこれ |
| **`初回セットアップ.bat`** | ステップ3・6 |
| **`設定リンクを開く.bat`** | ステップ4 |
| **`env.localを開く.bat`** | メモ帳だけ開きたいとき |
| **`起動.bat`** | ステップ7 |

---

## 困ったとき

| 症状 | 対処 |
|------|------|
| ログインできない | [Auth Providers](https://supabase.com/dashboard) で Email ON + Redirect URL 確認 |
| ガチャが空 | `初回セットアップ.bat` を再実行 |
| DB エラー | `.env.local` の `DATABASE_URL` / `DIRECT_URL` を確認 |

---

## 任意（後からでOK）

- [Stripe Test API Keys](https://dashboard.stripe.com/test/apikeys) — ポイント購入
- [Resend API Keys](https://resend.com/api-keys) — メール送信
- [Vercel New Project](https://vercel.com/new) — 本番公開
