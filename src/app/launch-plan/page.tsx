import { Rocket } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageShell, PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function LaunchPlanPage() {
  const projects = await prisma.project.findMany({
    where: { launchItems: { some: {} } },
    orderBy: { updatedAt: "desc" },
    include: { launchItems: { orderBy: { createdAt: "asc" } } },
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
                  {p.launchItems.map((l) => (
                    <div key={l.id} className="relative">
                      <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{l.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {l.channel} · {l.dueLabel}
                          </p>
                        </div>
                        <StatusBadge status={l.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
