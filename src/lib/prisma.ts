import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaBootstrapPromise: Promise<void> | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

function usesSqlite() {
  return process.env.DATABASE_URL?.startsWith("file:") ?? false;
}

function isMissingSqliteSchemaError(error: unknown) {
  if (!usesSqlite() || typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: string; message?: string };
  return (
    candidate.code === "P2021" ||
    candidate.message?.includes("does not exist in the current database") ||
    candidate.message?.includes("no such table")
  );
}

async function bootstrapSqliteSchema(client: PrismaClient) {
  // Vercel previews can boot with an empty SQLite file because prisma/dev.db is
  // git-ignored. Create the schema lazily so read-only pages render safely.
  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Project" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "summary" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'Active',
      "stage" TEXT NOT NULL DEFAULT 'Idea',
      "priority" TEXT NOT NULL DEFAULT 'Medium',
      "progress" INTEGER NOT NULL DEFAULT 0,
      "nextAction" TEXT NOT NULL DEFAULT '',
      "color" TEXT NOT NULL DEFAULT '#6366f1',
      "archivedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await client.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Project_slug_key" ON "Project"("slug")`
  );
  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Activity" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "projectId" TEXT,
      "type" TEXT NOT NULL DEFAULT 'update',
      "message" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);
  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Blueprint" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "projectId" TEXT NOT NULL,
      "vision" TEXT NOT NULL DEFAULT '',
      "targetUsers" TEXT NOT NULL DEFAULT '',
      "problemStatement" TEXT NOT NULL DEFAULT '',
      "successMetrics" TEXT NOT NULL DEFAULT '',
      "userStories" TEXT NOT NULL DEFAULT '',
      "featureScope" TEXT NOT NULL DEFAULT '',
      "risksAssumptions" TEXT NOT NULL DEFAULT '',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Blueprint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await client.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Blueprint_projectId_key" ON "Blueprint"("projectId")`
  );
  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "BuildTask" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "projectId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'Backlog',
      "priority" TEXT NOT NULL DEFAULT 'Medium',
      "estimate" TEXT NOT NULL DEFAULT '',
      "archivedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "BuildTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "QaItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "projectId" TEXT NOT NULL,
      "category" TEXT NOT NULL DEFAULT 'General',
      "label" TEXT NOT NULL,
      "checked" BOOLEAN NOT NULL DEFAULT false,
      "archivedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "QaItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LaunchItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "projectId" TEXT NOT NULL,
      "channel" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'Planned',
      "dueLabel" TEXT NOT NULL DEFAULT '',
      "archivedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "LaunchItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Review" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "projectId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "kind" TEXT NOT NULL DEFAULT 'Design',
      "status" TEXT NOT NULL DEFAULT 'Awaiting review',
      "reviewer" TEXT NOT NULL DEFAULT '',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Review_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await client.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Prompt" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "projectId" TEXT,
      "title" TEXT NOT NULL,
      "category" TEXT NOT NULL DEFAULT 'Discovery',
      "body" TEXT NOT NULL,
      "tags" TEXT NOT NULL DEFAULT '',
      "archivedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Prompt_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);
}

async function ensureSqliteSchema(client: PrismaClient) {
  globalForPrisma.prismaBootstrapPromise ??= bootstrapSqliteSchema(client);
  await globalForPrisma.prismaBootstrapPromise;
}

prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error) {
    if (!isMissingSqliteSchemaError(error)) {
      throw error;
    }

    await ensureSqliteSchema(prisma);
    return next(params);
  }
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
