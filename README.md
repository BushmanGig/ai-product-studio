# AI Product Studio

A clean, premium internal web app for taking app ideas from **concept to launch** using a
repeatable workflow:

> Idea → Discovery → PRD → Design DNA → Build Pack → Engineering → QA → Launch → Growth

Built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn-style UI components,
Lucide icons, and Prisma with SQLite for zero-config local development.

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

## Getting started

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Create the SQLite database and load seed data
npm run db:setup

# 3. Start the dev server
npm run dev
```

Then open <http://localhost:3000>.

## Scripts

| Script              | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the Next.js dev server                  |
| `npm run build`     | Generate Prisma client + production build     |
| `npm run start`     | Start the production server                   |
| `npm run lint`      | Run ESLint                                     |
| `npm run typecheck` | Run the TypeScript compiler (no emit)         |
| `npm run db:push`   | Push the Prisma schema to the database        |
| `npm run db:seed`   | Seed the database with example data           |
| `npm run db:setup`  | Push schema **and** seed in one step          |
| `npm run db:reset`  | Reset the database and re-seed                 |

## Data layer

Local development uses **SQLite** (`prisma/dev.db`) via Prisma for a zero-config setup.

To move to **Supabase / Postgres** later:

1. Change the datasource `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`.
2. Set `DATABASE_URL` in `.env` to your Postgres/Supabase connection string
   (see `.env.example`).
3. Run `npm run db:push` (and optionally `npm run db:seed`).

No application code changes are required — all data access goes through Prisma.

## Tech stack

- **Next.js 14** (App Router, Server Components, Server Actions)
- **TypeScript**
- **Tailwind CSS** with CSS-variable design tokens (light + dark ready)
- **shadcn-style** UI primitives built on Radix UI
- **Lucide** icons
- **Prisma** ORM with **SQLite** (Postgres-ready)
