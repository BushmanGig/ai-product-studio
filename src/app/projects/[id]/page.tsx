import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ListChecks,
  ShieldCheck,
  Rocket,
  Activity as ActivityIcon,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";
import { PageShell } from "@/components/page-header";
import { Pipeline } from "@/components/pipeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "@/components/ui/status";
import { AdvanceStageButton } from "@/components/advance-stage-button";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await prisma.project.findUnique({
    where: { slug: params.id },
    include: {
      buildTasks: { orderBy: { createdAt: "asc" } },
      qaItems: { orderBy: { createdAt: "asc" } },
      launchItems: { orderBy: { createdAt: "asc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 8 },
    },
  });

  if (!project) notFound();

  const qaDone = project.qaItems.filter((q) => q.checked).length;

  return (
    <PageShell>
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/projects">
          <ArrowLeft className="h-4 w-4" /> All projects
        </Link>
      </Button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-semibold text-white"
            style={{ backgroundColor: project.color }}
          >
            {project.name.slice(0, 1)}
          </span>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {project.name}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {project.summary}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={project.priority} />
          <AdvanceStageButton projectId={project.id} />
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Workflow</p>
            <span className="text-sm text-muted-foreground">
              {project.progress}% complete
            </span>
          </div>
          <Progress value={project.progress} />
          <Pipeline stage={project.stage} />
          <div className="flex items-start gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-sm">
            <span className="font-medium">Next best action:</span>
            <span className="text-muted-foreground">{project.nextAction}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <ListChecks className="h-4 w-4 text-primary" />
            <CardTitle>Build tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.buildTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No build tasks yet.</p>
            ) : (
              project.buildTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                >
                  <span className="text-sm">{t.title}</span>
                  <StatusBadge status={t.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <CardTitle>QA checklist</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">
              {qaDone}/{project.qaItems.length} done
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            {project.qaItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No QA items yet.</p>
            ) : (
              project.qaItems.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className={
                      q.checked
                        ? "h-4 w-4 rounded border border-primary bg-primary"
                        : "h-4 w-4 rounded border border-border"
                    }
                  />
                  <span
                    className={
                      q.checked ? "text-muted-foreground line-through" : ""
                    }
                  >
                    {q.label}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Rocket className="h-4 w-4 text-primary" />
            <CardTitle>Launch plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.launchItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No launch items yet.
              </p>
            ) : (
              project.launchItems.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                >
                  <div>
                    <p className="text-sm">{l.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.channel} · {l.dueLabel}
                    </p>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <ActivityIcon className="h-4 w-4 text-primary" />
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              project.activities.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm leading-snug">{a.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(a.createdAt)}
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
