# AGENTS.md

## Cursor Cloud specific instructions

AI Product Studio is a single Next.js 14 (App Router) web app — TypeScript, Tailwind,
Prisma + **PostgreSQL**. There is one service. Standard scripts live in `package.json` and
are documented in `README.md` / `DEPLOYMENT.md`; prefer those instead of re-deriving
commands.

### Database is PostgreSQL (important — SQLite was removed)

The app uses PostgreSQL for local dev AND production. SQLite was removed because it
crashes on Vercel (read-only serverless filesystem →
`PrismaClientInitializationError: Unable to open the database file`). Prisma's datasource
`provider` is `postgresql` and cannot be switched via env var, so **you need a running
Postgres to run/build-with-data/test the app.**

A Postgres server is **not** provided by the update script (`npm install` only refreshes
deps + generates the Prisma client). Before running or testing, start Postgres and set
`DATABASE_URL`, then apply migrations + seed:

```bash
docker compose up -d          # preferred: local Postgres matching the default DATABASE_URL
# --- or, if Docker is unavailable in the VM, install & run Postgres via apt ---
# sudo apt-get update && sudo apt-get install -y postgresql
# PGBIN=$(ls -d /usr/lib/postgresql/*/bin | head -1)
# sudo mkdir -p /var/lib/pgsql-aps && sudo chown "$(whoami)" /var/lib/pgsql-aps
# "$PGBIN/initdb" -D /var/lib/pgsql-aps -U postgres --auth=trust
# "$PGBIN/pg_ctl" -D /var/lib/pgsql-aps -o "-p 5433 -k /tmp" -l /tmp/pg.log start
# "$PGBIN/psql" -h /tmp -p 5433 -U postgres -c "CREATE DATABASE aps;"
# export DATABASE_URL="postgresql://postgres@127.0.0.1:5433/aps?schema=public"

npm run db:setup   # prisma migrate deploy + seed (idempotent; safe to re-run)
```

`DATABASE_URL` set in the shell overrides the value in `.env` (used above when Postgres
runs on the non-default port 5433). Skipping DB setup makes every page throw at runtime
(`P2021` table does not exist). After schema changes, create a migration with
`npm run db:migrate:dev` and re-seed, or `npm run db:reset` to wipe/re-migrate/re-seed.

### Running / verifying

- Dev server: `npm run dev` → http://localhost:3000 (start it in a tmux session).
- Checks: `npm run lint`, `npm run typecheck`, `npm run build` all pass from a clean tree.
- End-to-end tests: `npm run test:e2e` runs Playwright; run `npm run db:setup` first so
  Postgres has the latest schema and seed data. The Playwright config starts `npm run dev`
  automatically and waits on port 3000 — if a stale dev server holds 3000 it will fall back
  to 3001 and time out, so free port 3000 first (kill the stale tmux session).
- `npm run build` runs `prisma generate` first, but still needs the DB seeded for the app
  to actually serve data.

### Notes

- The app intentionally does **not** use `next/font/google`; it uses a system font stack so
  builds do not require network access to Google Fonts.
- Data access goes through `src/lib/prisma.ts`. The schema declares
  `binaryTargets = ["native", "rhel-openssl-3.0.x"]` so the Prisma query engine is bundled
  for the Vercel/AWS Lambda runtime. Vercel setup + required env vars are in `DEPLOYMENT.md`
  (`DATABASE_URL`, `AI_PROVIDER_MODE`, optional `OPENAI_*`).
- Optional AI config lives in `src/lib/ai-config.ts` and reads env vars only (never the
  database). Default `AI_PROVIDER_MODE=mock` means no API key is required.
- Mutations use Next.js Server Actions in `src/lib/actions.ts` (project, blueprint,
  prompt, build queue, QA, and launch management) with `revalidatePath`, so changes appear
  after the action resolves.
- GitHub Actions CI is defined in `.github/workflows/ci.yml` and runs install, database
  setup, typecheck, lint, build, and Playwright tests on pull requests.
