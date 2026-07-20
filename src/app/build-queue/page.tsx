import { Archive, ListChecks, Save } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageShell, PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge, StatusBadge } from "@/components/ui/status";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { BUILD_TASK_STATUSES, PRIORITIES } from "@/lib/constants";
import { archiveBuildTask, createBuildTask, updateBuildTask } from "@/lib/actions";

export const dynamic = "force-dynamic";

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

  return (
    <PageShell>
      <PageHeader
        title="Build Queue"
        description="The active sprint across every project. Move work from backlog to done."
      />

      {projects.length > 0 && (
        <Card>
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
        <div className="grid gap-4 xl:grid-cols-5">
          {BUILD_TASK_STATUSES.map((col) => {
            const items = tasks.filter((t) => t.status === col);
            return (
              <div key={col} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold">{col}</h2>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
                      No tasks
                    </div>
                  ) : (
                    items.map((t) => (
                      <Card key={t.id}>
                        <CardContent className="space-y-3 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-snug">
                              {t.title}
                            </p>
                            <StatusBadge status={t.status} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: t.project.color }}
                              />
                              <span className="text-xs text-muted-foreground">
                                {t.project.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {t.estimate && (
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                  {t.estimate}
                                </span>
                              )}
                              <PriorityBadge priority={t.priority} />
                            </div>
                          </div>
                          <details className="rounded-lg border border-border bg-background/60 p-3">
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
                                <NativeSelect id={`${t.id}-project`} name="projectId" defaultValue={t.projectId}>
                                  {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                      {project.name}
                                    </option>
                                  ))}
                                </NativeSelect>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                                <div className="space-y-2">
                                  <Label htmlFor={`${t.id}-status`}>Status</Label>
                                  <NativeSelect id={`${t.id}-status`} name="status" defaultValue={t.status}>
                                    {BUILD_TASK_STATUSES.map((status) => (
                                      <option key={status} value={status}>
                                        {status}
                                      </option>
                                    ))}
                                  </NativeSelect>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${t.id}-priority`}>Priority</Label>
                                  <NativeSelect id={`${t.id}-priority`} name="priority" defaultValue={t.priority}>
                                    {PRIORITIES.map((priority) => (
                                      <option key={priority} value={priority}>
                                        {priority}
                                      </option>
                                    ))}
                                  </NativeSelect>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${t.id}-estimate`}>Estimate</Label>
                                  <Input id={`${t.id}-estimate`} name="estimate" defaultValue={t.estimate} />
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
