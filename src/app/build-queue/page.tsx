import { Archive, ListChecks, Save } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageShell, PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/ui/status";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Progress } from "@/components/ui/progress";
import { BUILD_TASK_STATUSES, PRIORITIES } from "@/lib/constants";
import { archiveBuildTask, createBuildTask, updateBuildTask } from "@/lib/actions";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const COLUMN_ACCENTS: Record<string, string> = {
  Backlog: "bg-slate-400",
  Ready: "bg-sky-500",
  "In Progress": "bg-amber-500",
  Review: "bg-violet-500",
  Done: "bg-emerald-500",
};

export default async function BuildQueuePage() {
  const [tasks, projects] = await Promise.all([
    prisma.buildTask.findMany({
      where: { archivedAt: null, project: { archivedAt: null } },
      orderBy: { createdAt: "asc" },
      include: { project: true },
    }),
    prisma.project.findMany({
      where: { archivedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const doneCount = tasks.filter((task) => task.status === "Done").length;
  const boardProgress = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Delivery"
        title="Build Queue"
        description="Kanban across every project. Move work from backlog to done with clear priority and estimate metadata."
      />

      <Card className="studio-panel border-border/70">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Board progress</p>
            <p className="text-xs text-muted-foreground">
              {doneCount} of {tasks.length} tasks complete
            </p>
          </div>
          <div className="w-full max-w-sm space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Done</span>
              <span className="font-medium tabular-nums">{boardProgress}%</span>
            </div>
            <Progress value={boardProgress} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      {projects.length > 0 && (
        <Card className="studio-panel border-border/70">
          <CardHeader>
            <CardTitle>Create build task</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createBuildTask} className="grid gap-4 lg:grid-cols-5">
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="task-title">Task title</Label>
                <Input id="task-title" name="title" placeholder="e.g. Wire edit project action" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-project">Project</Label>
                <NativeSelect id="task-project" name="projectId">
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-status">Status</Label>
                <NativeSelect id="task-status" name="status" defaultValue="Backlog">
                  {BUILD_TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <NativeSelect id="task-priority" name="priority" defaultValue="Medium">
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-estimate">Estimate</Label>
                <Input id="task-estimate" name="estimate" placeholder="S, M, L" />
              </div>
              <div className="flex items-end lg:col-span-4">
                <Button type="submit">Create task</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Nothing in the queue"
          description="Add build tasks to a project and they will show up on this board."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {BUILD_TASK_STATUSES.map((col) => {
            const items = tasks.filter((t) => t.status === col);
            return (
              <div key={col} className="space-y-3 rounded-2xl border border-border/60 bg-card/40 p-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${COLUMN_ACCENTS[col]}`} />
                    <h2 className="text-sm font-semibold">{col}</h2>
                  </div>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <div className="min-h-[8rem] space-y-3">
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/80 px-4 py-10 text-center text-xs text-muted-foreground">
                      Drop work here when it is {col.toLowerCase()}.
                    </div>
                  ) : (
                    items.map((t) => (
                      <Card key={t.id} className="hover-lift border-border/70 shadow-soft">
                        <CardContent className="space-y-3 p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-snug">{t.title}</p>
                            <p className="text-[11px] text-muted-foreground">
                              Updated {timeAgo(t.updatedAt)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: t.project.color }}
                              />
                              <span className="truncate text-xs text-muted-foreground">
                                {t.project.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {t.estimate && (
                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                  {t.estimate}
                                </span>
                              )}
                              <PriorityBadge priority={t.priority} />
                            </div>
                          </div>
                          <details className="rounded-xl border border-border/70 bg-background/70 p-3">
                            <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                              Edit task
                            </summary>
                            <form action={updateBuildTask} className="mt-3 space-y-3">
                              <input type="hidden" name="taskId" value={t.id} />
                              <div className="space-y-2">
                                <Label htmlFor={`${t.id}-title`}>Title</Label>
                                <Input id={`${t.id}-title`} name="title" defaultValue={t.title} required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`${t.id}-project`}>Project</Label>
                                <NativeSelect
                                  id={`${t.id}-project`}
                                  name="projectId"
                                  defaultValue={t.projectId}
                                >
                                  {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                      {project.name}
                                    </option>
                                  ))}
                                </NativeSelect>
                              </div>
                              <div className="grid gap-3">
                                <div className="space-y-2">
                                  <Label htmlFor={`${t.id}-status`}>Status</Label>
                                  <NativeSelect
                                    id={`${t.id}-status`}
                                    name="status"
                                    defaultValue={t.status}
                                  >
                                    {BUILD_TASK_STATUSES.map((status) => (
                                      <option key={status} value={status}>
                                        {status}
                                      </option>
                                    ))}
                                  </NativeSelect>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${t.id}-priority`}>Priority</Label>
                                  <NativeSelect
                                    id={`${t.id}-priority`}
                                    name="priority"
                                    defaultValue={t.priority}
                                  >
                                    {PRIORITIES.map((priority) => (
                                      <option key={priority} value={priority}>
                                        {priority}
                                      </option>
                                    ))}
                                  </NativeSelect>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${t.id}-estimate`}>Estimate</Label>
                                  <Input
                                    id={`${t.id}-estimate`}
                                    name="estimate"
                                    defaultValue={t.estimate}
                                  />
                                </div>
                              </div>
                              <Button type="submit" size="sm">
                                <Save className="h-3.5 w-3.5" />
                                Save
                              </Button>
                            </form>
                            <form action={archiveBuildTask} className="mt-2">
                              <input type="hidden" name="taskId" value={t.id} />
                              <Button type="submit" variant="outline" size="sm">
                                <Archive className="h-3.5 w-3.5" />
                                Archive
                              </Button>
                            </form>
                          </details>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
