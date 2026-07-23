# Migrating from SQLite to Supabase / PostgreSQL

AI Product Studio keeps the Prisma schema PostgreSQL-compatible. Local development
still defaults to SQLite for zero-config onboarding. Follow these steps when you are
ready to move persistence to Supabase or another Postgres host.

## Exact migration steps

1. **Provision a database**
   - Create a Supabase project (or any Postgres instance).
   - Copy the connection string. Prefer the pooled URI for the app runtime and the
     direct URI if you later introduce Prisma Migrate.

2. **Update environment variables**
   - Copy `.env.example` to `.env` if needed.
   - Set:
     ```bash
     DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
     ```
   - Optional AI vars remain unchanged:
     ```bash
     AI_MOCK_MODE="true"
     OPENAI_API_KEY=""
     OPENAI_BASE_URL="https://api.openai.com/v1"
     OPENAI_MODEL="gpt-4o-mini"
     OPENAI_TEMPERATURE="0.4"
     ```

3. **Switch the Prisma datasource provider**
   - In `prisma/schema.prisma`, change:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Do not introduce SQLite-only types or raw SQL. Current models use portable scalar
     types (`String`, `Int`, `Boolean`, `DateTime`, `Float`).

4. **Push schema and seed**
   ```bash
   npm install
   npm run db:setup
   ```
   - `db:setup` runs `prisma db push` then `tsx prisma/seed.ts`.
   - For a wipe/reseed in non-production environments: `npm run db:reset`.

5. **Verify**
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   npm run test:e2e
   ```

## Notes

- Application code talks only to Prisma (`src/lib/prisma.ts`). No SQL dialect checks
  live in the UI or server actions.
- API keys are never stored in the database. Only non-secret AI preferences are saved
  in `StudioSettings`; `OPENAI_API_KEY` stays in server environment variables.
- When you adopt Prisma Migrate later, generate the first migration after switching
  the provider so the history starts from PostgreSQL.
