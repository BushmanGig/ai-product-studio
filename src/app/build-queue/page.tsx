import { ListChecks } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageShell, PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/ui/status";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

const COLUMNS = ["Queued", "In Progress", "Done"] as const;

export default async function BuildQueuePage() {
  const tasks = await prisma.buildTask.findMany({
    orderBy: { createdAt: "asc" },
    include: { project: true },
  });

  return (
    <PageShell>
      <PageHeader
        title="Build Queue"
        description="The active sprint across every project. Move work from queued to done."
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Nothing in the queue"
          description="Add build tasks to a project and they will show up on this board."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((col) => {
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
                          <p className="text-sm font-medium leading-snug">
                            {t.title}
                          </p>
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
