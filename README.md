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
3. **AI Project Intake** — guided capture of concept, audience, problem, platform, model,
   must-haves, inspirations, technical preferences, and constraints.
4. **Product Blueprint / PRD** — generate and edit vision, problem, users, metrics,
   stories, MVP/future scope, and risks.
5. **Design DNA** — project-specific principles, tokens, motion, accessibility, and
   inspiration entries.
6. **Build Pack** — stack, architecture, entities, routes, milestones, coding-agent
   prompt, acceptance criteria, and QA checklist.
7. **Prompt Library** — reusable AI prompts for each workflow stage (copy with feedback).
8. **Build Queue** — a kanban board of build tasks across projects.
9. **Review Centre** — design, content and engineering reviews awaiting sign-off.
10. **QA Checklist** — interactive, per-project checklists that save instantly.
11. **Launch Plan** — go-to-market timeline per project.
12. **Settings** — AI provider prefs (mock mode, endpoint, model, temperature) and data source.

## Sprint 3 AI workspace

- Guided intake creates the project and persists every answer on `ProjectIntake`.
- Server-only AI provider abstraction with a mock/demo provider by default and optional
  OpenAI-compatible env configuration (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`,
  `OPENAI_TEMPERATURE`, `AI_MOCK_MODE`). Keys never enter SQLite or client bundles.
- Generate Blueprint / Design DNA / Build Pack actions accept a Prompt Library selection,
  save generated content per project, and keep every section editable/copyable.
- Design inspirations support source URL, optional image reference, notes, likes, and
  category (`layout`, `typography`, `colour`, `components`, `motion`, `branding`).
- Settings shows API key status (`configured` / `missing`) without exposing the key.
- Postgres/Supabase migration steps live in `docs/POSTGRES.md`.

## Sprint 3.5 premium UI polish

- Dashboard command center with health, AI activity, readiness, and quick actions
- Grouped sidebar navigation, stronger page rhythm, and mobile nav drawer
- Richer project cards with counts, status, and last-updated metadata
- Polished AI generation panels, Design DNA inspiration cards, Build Queue kanban,
  and Prompt Library search/favourites
- Subtle motion, focus states, and responsive spacing refinements

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

Optional: set `OPENAI_API_KEY` and disable mock mode in Settings (or `AI_MOCK_MODE=false`)
to call an OpenAI-compatible endpoint. Without a key, generation stays in mock mode.

## Scripts

| Script              | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the Next.js dev server                  |
| `npm run build`     | Generate Prisma client + production build     |
| `npm run start`     | Start the production server                   |
| `npm run lint`      | Run ESLint                                     |
| `npm run typecheck` | Run the TypeScript compiler (no emit)         |
| `npm run test:e2e`  | Run Playwright end-to-end tests               |
| `npm run db:push`   | Push the Prisma schema to the database        |
| `npm run db:seed`   | Seed the database with example data           |
| `npm run db:setup`  | Push schema **and** seed in one step          |
| `npm run db:reset`  | Reset the database and re-seed                 |

## Data layer

Local development uses **SQLite** (`prisma/dev.db`) via Prisma for a zero-config setup.

To move to **Supabase / Postgres**, follow `docs/POSTGRES.md`:

1. Change the datasource `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`.
2. Set `DATABASE_URL` in `.env` to your Postgres/Supabase connection string
   (see `.env.example`).
3. Run `npm run db:setup`.

No application code changes are required — all data access goes through Prisma.

## Testing and CI

Playwright tests live in `tests/e2e` and start the Next.js dev server automatically.
Run `npm run db:setup` before local E2E runs so SQLite has the latest schema and seed
data. Install Chromium once if needed:

```bash
npx playwright install chromium
npm run db:setup
npm run test:e2e
```

GitHub Actions runs on pull requests and executes `npm install`, Playwright browser
install, `npm run db:setup`, `npm run typecheck`, `npm run lint`, `npm run build`, and
Playwright tests.

## Tech stack

- **Next.js 14** (App Router, Server Components, Server Actions)
- **TypeScript**
- **Tailwind CSS** with CSS-variable design tokens (light + dark ready)
- **shadcn-style** UI primitives built on Radix UI
- **Lucide** icons
- **Prisma** ORM with **SQLite** (Postgres-ready)
- **Server-only AI provider layer** (mock + OpenAI-compatible)
