# AI Product Studio

A clean, premium internal web app for taking app ideas from **concept to launch** using a
repeatable workflow:

> Idea → Discovery → PRD → Design DNA → Build Pack → Engineering → QA → Launch → Growth

Built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn-style UI components,
Lucide icons, and Prisma with PostgreSQL (Supabase / Neon / Prisma Postgres ready).

## Sections

1. **Dashboard** — project cards, a Today panel (next action across all projects), recent
   activity, and a build queue preview.
2. **Projects** — every idea in motion, with stage, progress, priority and next action.
3. **Product Blueprint / PRD** — a living PRD scaffold per project.
4. **Design DNA** — colour palette, type scale, spacing system and per-project brand.
5. **Prompt Library** — reusable AI prompts for each workflow stage (copy to clipboard).
6. **Build Queue** — a kanban board of build tasks across projects.
7. **Review Centre** — design, content and engineering reviews awaiting sign-off.
8. **QA Checklist** — interactive, per-project checklists that save instantly.
9. **Launch Plan** — go-to-market timeline per project.
10. **Settings** — studio preferences, workflow config and data source.

## Sprint 2 management flows

- Projects can be created, edited, advanced, archived, or deleted. Edits cover name,
  description, priority, status, stage, and next best action, with activity logged.
- Product Blueprint stores editable, project-specific PRD sections for vision, target
  users, problem statement, success metrics, user stories, feature scope, and risks.
- Prompt Library supports global or project-attached prompts across Discovery, PRD,
  Design DNA, Build Pack, QA, and Launch categories.
- Build Queue tasks can be created, edited, moved from Backlog through Done, prioritized,
  archived, and connected to projects.
- QA and Launch items can be created, edited, and archived; QA toggles still save
  immediately.

## Getting started

You need a PostgreSQL database. The quickest option is the bundled docker-compose
service (or point `DATABASE_URL` at any Supabase / Neon / Prisma Postgres database).

```bash
# 1. Start a local Postgres (matches the default DATABASE_URL in .env)
docker compose up -d

# 2. Install dependencies (also generates the Prisma client)
npm install

# 3. Copy env defaults (edit DATABASE_URL if not using docker-compose)
cp .env.example .env

# 4. Apply migrations and load seed data
npm run db:setup

# 5. Start the dev server
npm run dev
```

Then open <http://localhost:3000>.

> No Docker? Set `DATABASE_URL` in `.env` to any Postgres connection string
> (local install or a free Supabase/Neon database) and run `npm run db:setup`.

## Scripts

| Script              | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the Next.js dev server                  |
| `npm run build`     | Generate Prisma client + production build     |
| `npm run start`     | Start the production server                   |
| `npm run lint`      | Run ESLint                                     |
| `npm run typecheck` | Run the TypeScript compiler (no emit)         |
| `npm run test:e2e`  | Run Playwright end-to-end tests               |
| `npm run db:migrate`| Apply migrations to the database (`prisma migrate deploy`) |
| `npm run db:push`   | Push the Prisma schema without a migration     |
| `npm run db:seed`   | Seed the database with example data           |
| `npm run db:setup`  | Apply migrations **and** seed in one step     |
| `npm run db:reset`  | Reset the database, re-migrate and re-seed     |

## Data layer

The app uses **PostgreSQL** via Prisma for both local development and production. A
single provider is used everywhere so the app runs correctly on serverless platforms
like Vercel — **SQLite does not work on Vercel** because its filesystem is read-only
and ephemeral.

- `DATABASE_URL` (see `.env.example`) accepts any Postgres string: the bundled
  docker-compose service, a local Postgres, or a hosted Supabase / Neon / Prisma
  Postgres database.
- Schema changes are tracked as SQL migrations in `prisma/migrations/`. Apply them
  with `npm run db:migrate` (locally) or `prisma migrate deploy` (production).
- Optional AI features read `AI_PROVIDER_MODE` and `OPENAI_*` from the environment
  (never from the database). Defaults to `mock`, so no keys are required.

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full Vercel setup and environment
variables.

## Testing and CI

Playwright tests live in `tests/e2e` and start the Next.js dev server automatically.
Run `npm run db:setup` before local E2E runs so Postgres has the latest schema and
seed data.

```bash
npm run db:setup
npm run test:e2e
```

GitHub Actions runs on pull requests and executes `npm install`, `npm run db:setup`,
`npm run typecheck`, `npm run lint`, `npm run build`, and Playwright tests.

## Tech stack

- **Next.js 14** (App Router, Server Components, Server Actions)
- **TypeScript**
- **Tailwind CSS** with CSS-variable design tokens (light + dark ready)
- **shadcn-style** UI primitives built on Radix UI
- **Lucide** icons
- **Prisma** ORM with **PostgreSQL** (Supabase / Neon / Prisma Postgres ready)
