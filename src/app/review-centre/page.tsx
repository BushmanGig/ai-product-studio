import { MessagesSquare } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageShell, PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function ReviewCentrePage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { project: true },
  });

  return (
    <PageShell>
      <PageHeader
        title="Review Centre"
        description="Every design, content and engineering review in one queue — nothing ships without a check."
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No reviews yet"
          description="Reviews raised on your projects will collect here for sign-off."
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <span
                  className="h-8 w-8 shrink-0 rounded-lg"
                  style={{ backgroundColor: r.project.color }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.project.name} · Reviewer: {r.reviewer || "Unassigned"}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline">{r.kind}</Badge>
                  <StatusBadge status={r.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
