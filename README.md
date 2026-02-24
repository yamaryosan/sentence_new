# sentence_database

Local development setup for Next.js + PostgreSQL (Docker).

## PostgreSQLを起動 (Docker)

1. 環境変数ファイルを作成

```bash
cp .env.example .env
```

2. PostgreSQLコンテナを起動

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
- Port: `5432`
- Database: `sentence_db`
- User: `postgres`
- Password: `postgres`
- URL: `postgresql://postgres:postgres@localhost:5432/sentence_db`

## Next.jsのローカルサーバを起動

```bash
npm run dev
```

ブラウザで`http://localhost:3000`を開く。
