# Deploying AI Product Studio to Vercel

The app uses **Prisma + PostgreSQL**. It cannot run on SQLite in production because
Vercel's serverless filesystem is read-only and ephemeral — SQLite would fail at
runtime with `PrismaClientInitializationError: Unable to open the database file`
(surfaced in the browser as _"Application error: a server-side exception has
occurred"_).

Use any hosted Postgres: **Supabase**, **Neon**, **Prisma Postgres**, Railway, etc.

## 1. Create a Postgres database

Pick one provider and copy its connection string:

- **Supabase** — Project → Settings → Database. For serverless use the
  **Connection pooling** string (port `6543`) and append `?pgbouncer=true`. If you
  run migrations from Vercel, also set a non-pooled `DIRECT_URL` (port `5432`).
- **Neon** — Dashboard → Connection Details. Use the pooled connection string and
  keep `?sslmode=require`.
- **Prisma Postgres** — use the provided `postgres://...` connection string.

## 2. Set environment variables in Vercel

Project → **Settings → Environment Variables** (Production + Preview):

| Variable            | Required | Example / Notes                                                        |
| ------------------- | -------- | --------------------------------------------------------------------- |
| `DATABASE_URL`      | Yes      | Postgres connection string from step 1                                |
| `AI_PROVIDER_MODE`  | Yes      | `mock` (default, no external calls) or `openai`                       |
| `OPENAI_API_KEY`    | Optional | Only when `AI_PROVIDER_MODE=openai`. Never stored in the database     |
| `OPENAI_BASE_URL`   | Optional | Override for OpenAI-compatible endpoints (Azure, OpenRouter, …)       |
| `OPENAI_MODEL`      | Optional | e.g. `gpt-4o-mini`                                                    |

Do **not** commit secrets to the repo — set them in the Vercel dashboard only.

## 3. Build command

The default `npm run build` already runs the required steps:

```
prisma generate && next build
```

Prisma's client is also generated on install via `postinstall`, and the schema
declares `binaryTargets = ["native", "rhel-openssl-3.0.x"]` so the query engine is
bundled for Vercel's runtime. No custom build command is needed.

## 4. Run the database migration (one time per environment)

Vercel's build does **not** run migrations. Apply the schema to your hosted
database once (and again whenever the schema changes). From your machine:

```bash
DATABASE_URL="<your production connection string>" npx prisma migrate deploy
```

Optionally seed example data:

```bash
DATABASE_URL="<your production connection string>" npm run db:seed
```

> Tip: use the non-pooled/`DIRECT_URL` connection string when running migrations.

## 5. Deploy

Push to the branch connected to Vercel (or click **Redeploy**). After the migration
has been applied, the deployment loads without the server-side exception.

## Troubleshooting

- **"Unable to open the database file"** → `DATABASE_URL` still points at SQLite
  (`file:...`). Set a Postgres URL.
- **`P2021` "table does not exist"** → migration not applied. Run
  `prisma migrate deploy` against the production database (step 4).
- **`P1001` "Can't reach database server"** → wrong host/credentials, or the
  provider requires `sslmode=require` / pooling params.
