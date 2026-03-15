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
