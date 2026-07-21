# AGENTS.md

## Cursor Cloud specific instructions

AI Product Studio is a single Next.js 14 (App Router) web app — TypeScript, Tailwind,
Prisma + SQLite. There is one service. Standard scripts live in `package.json` and are
documented in `README.md`; prefer those instead of re-deriving commands.

### Non-obvious startup caveat (important)

The local SQLite database (`prisma/dev.db`) is **git-ignored and not present on a fresh
clone**. The `npm install` step only generates the Prisma client (via `postinstall`); it
does **not** create or seed the database. Before running or building the app for the first
time in a session, you MUST create and seed the DB:

```bash
npm run db:setup   # prisma db push + seed (idempotent; safe to re-run)
```

Skipping this makes every page throw at runtime because the tables do not exist. If you
change `prisma/schema.prisma`, re-run `npm run db:push` (or `npm run db:reset` to wipe and
re-seed). The seed script (`prisma/seed.ts`) deletes existing rows first, so it is safe to
run repeatedly.

### Running / verifying

- Dev server: `npm run dev` → http://localhost:3000 (start it in a tmux session).
- Checks: `npm run lint`, `npm run typecheck`, `npm run build` all pass from a clean tree.
- End-to-end tests: `npm run test:e2e` runs Playwright; run `npm run db:setup` first so
  SQLite has the latest schema and seed data. The Playwright config starts `npm run dev`
  automatically.
- `npm run build` runs `prisma generate` first, but still needs the DB seeded for the app
  to actually serve data.

### Notes

- The app intentionally does **not** use `next/font/google`; it uses a system font stack so
  builds do not require network access to Google Fonts.
- Data source is SQLite for local dev but is Postgres/Supabase-ready: switch the Prisma
  datasource `provider` to `postgresql` and update `DATABASE_URL` (see `.env.example`). No
  application code changes are needed — all data access goes through `src/lib/prisma.ts`.
- SQLite-backed preview deployments lazily create an empty schema if `prisma/dev.db` is
  absent, which prevents Vercel server-side crashes. Use Postgres/Supabase for durable
  deployed data.
- Mutations use Next.js Server Actions in `src/lib/actions.ts` (project, blueprint,
  prompt, build queue, QA, and launch management) with `revalidatePath`, so changes appear
  after the action resolves.
- GitHub Actions CI is defined in `.github/workflows/ci.yml` and runs install, database
  setup, typecheck, lint, build, and Playwright tests on pull requests.
