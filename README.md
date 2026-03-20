# sentence_database

Local development setup for Next.js + MySQL (Docker).

## MySQLを起動 (Docker)

1. 環境変数ファイルを作成

```bash
cp .env.example .env
```

2. MySQLコンテナを起動

```bash
npm run db:up
```

3. ログを見る

```bash
npm run db:logs
```

4. コンテナを停止

```bash
npm run db:down
```

### 接続設定

- Host: `localhost`
- Port: `3306`
- Database: `sentence_db`
- User: `sentence_user`
- Password: `sentence_password`
- URL: `mysql://sentence_user:sentence_password@localhost:3306/sentence_db`

## Next.jsのローカルサーバを起動

```bash
npm run dev
```

ブラウザで`http://localhost:3000`を開く。

## CIの環境変数

GitHub Actions では `DATABASE_URL` を workflow に直書きせず、`Settings > Secrets and variables > Actions` に `DATABASE_URL` secret として登録する。

## Renderデプロイ

`render.yaml` を追加してあるので、Render では Blueprint からこのリポジトリを読み込めば Web Service を作成できる。

- Service name: `sentence-new`
- Region: `oregon`
- Plan: `free`
- Branch: `main`
- Auto-Deploy: `After CI Checks Pass`
- URL: `https://sentence-new.onrender.com`

Render 側では、少なくとも次の環境変数を登録する。

- `DATABASE_URL`
- `UPLOAD_VERIFY_PASSWORD`
- `ACCESS_PASSWORD`
- `AUTH_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

デプロイ時には `npm run prisma:migrate:deploy` を pre-deploy command として実行する。

## 閲覧用パスワード認証

- `/` は公開
- それ以外のページと API はログイン必須
- 直近15分で5回まで失敗可能（6回目以降は時間経過で順次解除）

必要な環境変数:

- `ACCESS_PASSWORD`: ログイン用パスワード
- `AUTH_SECRET`: 認証クッキー署名用の長いランダム文字列
- `UPSTASH_REDIS_REST_URL`: Upstash Redis の REST URL
- `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis の REST Token
