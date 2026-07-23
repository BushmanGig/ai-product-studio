import Link from "next/link";
import {
  FolderKanban,
  ListChecks,
  Rocket,
  Target,
  ArrowRight,
  Activity as ActivityIcon,
  Sparkles,
  ShieldCheck,
  Wand2,
  Gauge,
  Clock3,
  FileText,
  Palette,
  Package,
  Library,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { priorityRank } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { PageShell, PageHeader, SectionHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
    <Card className="studio-panel hover-lift border-border/70">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        <span className="ml-auto hidden text-xs text-muted-foreground sm:block">{hint}</span>
      </CardContent>
    </Card>
  );
}

function launchReadinessScore(input: {
  progress: number;
  qaTotal: number;
  qaDone: number;
  launchTotal: number;
  launchDone: number;
  hasBlueprint: boolean;
  hasBuildPack: boolean;
}) {
  const qaRatio = input.qaTotal === 0 ? 0.35 : input.qaDone / input.qaTotal;
  const launchRatio =
    input.launchTotal === 0 ? 0.25 : input.launchDone / input.launchTotal;
  const artifactBoost = (input.hasBlueprint ? 0.1 : 0) + (input.hasBuildPack ? 0.1 : 0);
  const score =
    input.progress * 0.45 + qaRatio * 100 * 0.25 + launchRatio * 100 * 0.2 + artifactBoost * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export default async function DashboardPage() {
  const [projects, activities, buildTasks, qaItems, launchItems] = await Promise.all([
    prisma.project.findMany({
      where: { archivedAt: null },
      orderBy: { updatedAt: "desc" },
      include: {
        blueprint: { select: { updatedAt: true, vision: true } },
        buildPack: { select: { updatedAt: true, recommendedStack: true } },
        designDna: { select: { updatedAt: true } },
        _count: {
          select: {
            buildTasks: { where: { archivedAt: null } },
            qaItems: { where: { archivedAt: null } },
            prompts: { where: { archivedAt: null } },
            launchItems: { where: { archivedAt: null } },
          },
        },
      },
    }),
    prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { project: true },
    }),
    prisma.buildTask.findMany({
      where: { archivedAt: null, project: { archivedAt: null } },
      orderBy: { createdAt: "asc" },
      include: { project: true },
    }),
    prisma.qaItem.findMany({
      where: { archivedAt: null, project: { archivedAt: null } },
      select: { checked: true, projectId: true },
    }),
    prisma.launchItem.findMany({
      where: { archivedAt: null, project: { archivedAt: null } },
      select: { status: true, projectId: true },
    }),
  ]);

  const openBuildTasks = buildTasks.filter((task) => task.status !== "Done");
  const qaOpen = qaItems.filter((item) => !item.checked).length;
  const qaDone = qaItems.filter((item) => item.checked).length;
  const launchDone = launchItems.filter((item) => item.status === "Done").length;
  const launching = projects.filter((p) => ["Launch", "Growth"].includes(p.stage)).length;

  const buildDone = buildTasks.filter((task) => task.status === "Done").length;
  const buildProgress =
    buildTasks.length === 0 ? 0 : Math.round((buildDone / buildTasks.length) * 100);
  const qaProgress = qaItems.length === 0 ? 0 : Math.round((qaDone / qaItems.length) * 100);

  const readiness = launchReadinessScore({
    progress:
      projects.length === 0
        ? 0
        : Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length),
    qaTotal: qaItems.length,
    qaDone,
    launchTotal: launchItems.length,
    launchDone,
    hasBlueprint: projects.some((project) => Boolean(project.blueprint?.vision)),
    hasBuildPack: projects.some((project) => Boolean(project.buildPack?.recommendedStack)),
  });

  const prioritised = [...projects].sort(
    (a, b) =>
      priorityRank(b.priority) - priorityRank(a.priority) || a.progress - b.progress
  );
  const today = prioritised.slice(0, 5);
  const recentAi = activities
    .filter((activity) =>
      ["prd", "design", "build", "discovery", "prompt"].includes(activity.type)
    )
    .slice(0, 5);

  const healthBuckets = {
    early: projects.filter((p) => p.progress < 35).length,
    mid: projects.filter((p) => p.progress >= 35 && p.progress < 70).length,
    late: projects.filter((p) => p.progress >= 70).length,
  };

  return (
    <PageShell>
      <section className="studio-panel relative overflow-hidden border-border/70 p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.12),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <PageHeader
            eyebrow="Command center"
            title="Studio dashboard"
            description="Your operating system for moving product ideas from intake to launch — with clear priorities, AI artifacts, and delivery health."
            className="flex-1"
          />
          <div className="flex flex-wrap gap-2">
            <NewProjectDialog />
            <Button variant="outline" asChild>
              <Link href="/blueprint">
                <FileText className="h-4 w-4" /> Generate blueprint
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/build-pack">
                <Package className="h-4 w-4" /> Open build packs
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/projects/new", label: "Start intake", icon: Sparkles },
            { href: "/design-dna", label: "Shape Design DNA", icon: Palette },
            { href: "/prompt-library", label: "Browse prompts", icon: Library },
            { href: "/qa-checklist", label: "Clear QA", icon: ShieldCheck },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 px-3 py-3 text-sm font-medium transition-all hover:border-primary/30 hover:bg-accent/50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                {action.label}
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active projects" value={projects.length} icon={FolderKanban} hint="in the studio" />
        <StatCard label="Build tasks open" value={openBuildTasks.length} icon={ListChecks} hint="in the queue" />
        <StatCard label="QA items open" value={qaOpen} icon={Target} hint="to verify" />
        <StatCard label="Nearing launch" value={launching} icon={Rocket} hint="Launch / Growth" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="studio-panel border-border/70">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Gauge className="h-4 w-4 text-primary" />
            <CardTitle>Project health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-secondary/70 p-3">
                <p className="text-lg font-semibold tabular-nums">{healthBuckets.early}</p>
                <p className="text-[11px] text-muted-foreground">Early</p>
              </div>
              <div className="rounded-xl bg-secondary/70 p-3">
                <p className="text-lg font-semibold tabular-nums">{healthBuckets.mid}</p>
                <p className="text-[11px] text-muted-foreground">Mid</p>
              </div>
              <div className="rounded-xl bg-secondary/70 p-3">
                <p className="text-lg font-semibold tabular-nums">{healthBuckets.late}</p>
                <p className="text-[11px] text-muted-foreground">Late</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Health buckets are based on workflow progress across active projects.
            </p>
          </CardContent>
        </Card>

        <Card className="studio-panel border-border/70">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <ListChecks className="h-4 w-4 text-primary" />
            <CardTitle>Build & QA progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Build completion</span>
                <span className="font-medium tabular-nums">{buildProgress}%</span>
              </div>
              <Progress value={buildProgress} className="h-1.5" />
              <p className="text-[11px] text-muted-foreground">
                {buildDone}/{buildTasks.length} tasks done
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">QA completion</span>
                <span className="font-medium tabular-nums">{qaProgress}%</span>
              </div>
              <Progress value={qaProgress} className="h-1.5" />
              <p className="text-[11px] text-muted-foreground">
                {qaDone}/{qaItems.length} checks complete
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="studio-panel border-border/70">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Rocket className="h-4 w-4 text-primary" />
            <CardTitle>Launch readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <p className="text-4xl font-semibold tracking-tight tabular-nums">{readiness}</p>
              <span className="mb-1 text-sm text-muted-foreground">/ 100</span>
            </div>
            <Progress value={readiness} className="h-2" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Combines average project progress, QA coverage, launch item completion, and AI artifact presence.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SectionHeader
            title="Recently edited projects"
            description="Pick up where the studio left off."
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link href="/projects">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />

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
          <Card className="studio-panel border-border/70">
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle>Today&apos;s priorities</CardTitle>
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
                    className="block rounded-xl border border-border/70 p-3 transition-all hover:border-primary/30 hover:bg-accent/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{p.name}</span>
                      <PriorityBadge priority={p.priority} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{p.nextAction}</p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="studio-panel border-border/70">
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <Wand2 className="h-4 w-4 text-primary" />
              <CardTitle>Recent AI generations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAi.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Generate a blueprint, Design DNA, or build pack to see activity here.
                </p>
              ) : (
                recentAi.map((a) => (
                  <div key={a.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="text-sm leading-snug">{a.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.project?.name ?? "Studio"} · {timeAgo(a.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="studio-panel border-border/70">
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
            {openBuildTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">The build queue is clear.</p>
            ) : (
              <div className="divide-y divide-border/80">
                {openBuildTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: task.project.color }}
                    />
                    <span className="min-w-0 truncate text-sm font-medium">{task.title}</span>
                    <Badge variant="outline" className="ml-1 hidden sm:inline-flex">
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

        <Card className="studio-panel border-border/70">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <ActivityIcon className="h-4 w-4 text-primary" />
            <CardTitle>Studio pulse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              activities.slice(0, 6).map((a) => (
                <div key={a.id} className="flex gap-3">
                  <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Clock3 className="h-3 w-3 text-muted-foreground" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{a.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.project?.name ?? "Studio"} · {timeAgo(a.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
