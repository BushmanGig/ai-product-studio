import { Archive, Rocket, Save } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageShell, PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { LAUNCH_STATUSES } from "@/lib/constants";
import { archiveLaunchItem, createLaunchItem, updateLaunchItem } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function LaunchPlanPage() {
  const projects = await prisma.project.findMany({
    where: { archivedAt: null },
    orderBy: { updatedAt: "desc" },
    include: { launchItems: { where: { archivedAt: null }, orderBy: { createdAt: "asc" } } },
  });

  return (
    <PageShell>
      <PageHeader
        title="Launch Plan"
        description="Go-to-market steps across channels, so every launch is coordinated and on time."
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No launch plans yet"
          description="Add launch items to a project to build its go-to-market plan."
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create launch item</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createLaunchItem} className="grid gap-4 lg:grid-cols-5">
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="launch-title">Launch item</Label>
                  <Input id="launch-title" name="title" placeholder="e.g. Publish changelog" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="launch-project">Project</Label>
                  <NativeSelect id="launch-project" name="projectId">
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="launch-channel">Channel</Label>
                  <Input id="launch-channel" name="channel" defaultValue="Internal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="launch-status">Status</Label>
                  <NativeSelect id="launch-status" name="status" defaultValue="Planned">
                    {LAUNCH_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="launch-due">Due</Label>
                  <Input id="launch-due" name="dueLabel" placeholder="This week" />
                </div>
                <div className="flex items-end lg:col-span-4">
                  <Button type="submit">Create launch item</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {projects.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex-row items-center gap-2 space-y-0">
                <span
                  className="h-6 w-6 rounded-md"
                  style={{ backgroundColor: p.color }}
                />
                <CardTitle>{p.name}</CardTitle>
                <Badge variant="outline" className="ml-auto">
                  {p.stage}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-4 border-l border-border pl-6">
                  {p.launchItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No launch items yet.</p>
                  ) : (
                    p.launchItems.map((l) => (
                      <div key={l.id} className="relative">
                        <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                        <div className="space-y-3 rounded-lg border border-border p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">{l.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {l.channel} · {l.dueLabel || "No due date"}
                              </p>
                            </div>
                            <StatusBadge status={l.status} />
                          </div>
                          <details>
                            <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                              Edit item
                            </summary>
                            <form action={updateLaunchItem} className="mt-3 grid gap-3 lg:grid-cols-5">
                              <input type="hidden" name="itemId" value={l.id} />
                              <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor={`${l.id}-title`}>Launch item</Label>
                                <Input id={`${l.id}-title`} name="title" defaultValue={l.title} required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`${l.id}-project`}>Project</Label>
                                <NativeSelect id={`${l.id}-project`} name="projectId" defaultValue={l.projectId}>
                                  {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                      {project.name}
                                    </option>
                                  ))}
                                </NativeSelect>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`${l.id}-channel`}>Channel</Label>
                                <Input id={`${l.id}-channel`} name="channel" defaultValue={l.channel} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`${l.id}-status`}>Status</Label>
                                <NativeSelect id={`${l.id}-status`} name="status" defaultValue={l.status}>
                                  {LAUNCH_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </NativeSelect>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`${l.id}-due`}>Due</Label>
                                <Input id={`${l.id}-due`} name="dueLabel" defaultValue={l.dueLabel} />
                              </div>
                              <div className="flex flex-wrap gap-2 lg:col-span-4">
                                <Button type="submit" size="sm">
                                  <Save className="h-3.5 w-3.5" />
                                  Save
                                </Button>
                              </div>
                            </form>
                            <form action={archiveLaunchItem} className="mt-2">
                              <input type="hidden" name="itemId" value={l.id} />
                              <Button type="submit" variant="outline" size="sm">
                                <Archive className="h-3.5 w-3.5" />
                                Archive
                              </Button>
                            </form>
                          </details>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
