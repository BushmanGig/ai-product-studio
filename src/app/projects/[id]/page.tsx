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
import { PRIORITIES, PROJECT_STATUSES, STAGES } from "@/lib/constants";
import { PageShell } from "@/components/page-header";
import { Pipeline } from "@/components/pipeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "@/components/ui/status";
import { AdvanceStageButton } from "@/components/advance-stage-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { archiveProject, deleteProject, updateProject } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await prisma.project.findUnique({
    where: { slug: params.id },
    include: {
      intake: true,
      blueprint: true,
      designDna: true,
      buildPack: true,
      buildTasks: { where: { archivedAt: null }, orderBy: { createdAt: "asc" } },
      qaItems: { where: { archivedAt: null }, orderBy: { createdAt: "asc" } },
      launchItems: { where: { archivedAt: null }, orderBy: { createdAt: "asc" } },
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
          <StatusBadge status={project.status} />
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

      {project.intake && (
        <Card>
          <CardHeader>
            <CardTitle>AI intake answers</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              ["Concept", project.intake.concept],
              ["Target user", project.intake.targetUser],
              ["Problem", project.intake.problem],
              ["Platform", project.intake.platform],
              ["Business model", project.intake.businessModel],
              ["Must-have features", project.intake.mustHaveFeatures],
              ["Visual inspirations", project.intake.visualInspirations],
              ["Technical preferences", project.intake.technicalPreferences],
              ["Constraints", project.intake.constraints],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-sm">{value || "—"}</p>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/blueprint">Open blueprint</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/design-dna">Open Design DNA</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/build-pack">Open build pack</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Project management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form action={updateProject} className="grid gap-4 lg:grid-cols-2">
            <input type="hidden" name="projectId" value={project.id} />
            <div className="space-y-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input id="project-name" name="name" defaultValue={project.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-next-action">Next best action</Label>
              <Input
                id="project-next-action"
                name="nextAction"
                defaultValue={project.nextAction}
                required
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="project-summary">Description</Label>
              <Textarea
                id="project-summary"
                name="summary"
                defaultValue={project.summary}
                rows={3}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
              <div className="space-y-2">
                <Label htmlFor="project-priority">Priority</Label>
                <NativeSelect id="project-priority" name="priority" defaultValue={project.priority}>
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-status">Status</Label>
                <NativeSelect id="project-status" name="status" defaultValue={project.status}>
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-stage">Stage</Label>
                <NativeSelect id="project-stage" name="stage" defaultValue={project.stage}>
                  {STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:col-span-2">
              <Button type="submit">Save project</Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <form action={archiveProject}>
              <input type="hidden" name="projectId" value={project.id} />
              <Button type="submit" variant="outline">
                Archive project
              </Button>
            </form>
            <form action={deleteProject}>
              <input type="hidden" name="projectId" value={project.id} />
              <Button type="submit" variant="destructive">
                Delete project
              </Button>
            </form>
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
