import Link from "next/link";
import {
  FolderKanban,
  ListChecks,
  Rocket,
  Target,
  ArrowRight,
  Activity as ActivityIcon,
  Sparkles,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { priorityRank } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { PageShell, PageHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge, StatusBadge } from "@/components/ui/status";
import { NewProjectDialog } from "@/components/new-project-dialog";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: typeof Target;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
          {hint}
        </span>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const [projects, activities, buildTasks, qaOpen] = await Promise.all([
    prisma.project.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { project: true },
    }),
    prisma.buildTask.findMany({
      where: { status: { not: "Done" } },
      orderBy: { createdAt: "asc" },
      take: 5,
      include: { project: true },
    }),
    prisma.qaItem.count({ where: { checked: false } }),
  ]);

  const launching = projects.filter((p) =>
    ["Launch", "Growth"].includes(p.stage)
  ).length;

  const prioritised = [...projects].sort(
    (a, b) =>
      priorityRank(b.priority) - priorityRank(a.priority) ||
      a.progress - b.progress
  );
  const today = prioritised.slice(0, 4);

  return (
    <PageShell>
      <PageHeader
        title="Studio dashboard"
        description="Every idea in motion, and the next best action to keep it moving."
        actions={<NewProjectDialog />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active projects"
          value={projects.length}
          icon={FolderKanban}
          hint="in the studio"
        />
        <StatCard
          label="Build tasks open"
          value={buildTasks.length}
          icon={ListChecks}
          hint="in the queue"
        />
        <StatCard
          label="QA items open"
          value={qaOpen}
          icon={Target}
          hint="to verify"
        />
        <StatCard
          label="Nearing launch"
          value={launching}
          icon={Rocket}
          hint="Launch / Growth"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Projects</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No projects yet"
              description="Create your first project to start the concept-to-launch workflow."
              action={<NewProjectDialog />}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.slice(0, 4).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle>Today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {today.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing queued. Create a project to get a next action.
                </p>
              ) : (
                today.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.slug}`}
                    className="block rounded-lg border border-border p-3 transition-colors hover:border-primary/30 hover:bg-accent/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{p.name}</span>
                      <PriorityBadge priority={p.priority} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.nextAction}
                    </p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <ActivityIcon className="h-4 w-4 text-primary" />
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                activities.map((a) => (
                  <div key={a.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="text-sm leading-snug">{a.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.project.name} · {timeAgo(a.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            <CardTitle>Build queue preview</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/build-queue">
              Open queue <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {buildTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              The build queue is clear.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {buildTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: task.project.color }}
                  />
                  <span className="text-sm font-medium">{task.title}</span>
                  <Badge variant="outline" className="ml-1">
                    {task.project.name}
                  </Badge>
                  <div className="ml-auto flex items-center gap-2">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
