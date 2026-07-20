import { ShieldCheck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageShell, PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import {
  QaChecklistClient,
  type QaGroup,
} from "@/components/qa-checklist-client";

export const dynamic = "force-dynamic";

export default async function QaChecklistPage() {
  const projects = await prisma.project.findMany({
    where: { archivedAt: null },
    orderBy: { updatedAt: "desc" },
    include: { qaItems: { where: { archivedAt: null }, orderBy: { createdAt: "asc" } } },
  });

  const groups: QaGroup[] = projects.map((p) => ({
    projectId: p.id,
    projectName: p.name,
    color: p.color,
    items: p.qaItems.map((q) => ({
      id: q.id,
      projectId: p.id,
      label: q.label,
      category: q.category,
      checked: q.checked,
    })),
  }));

  return (
    <PageShell>
      <PageHeader
        title="QA Checklist"
        description="Verify quality before launch. Tick items off — progress saves instantly."
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No QA items yet"
          description="Create a project to build a pre-launch checklist."
        />
      ) : (
        <QaChecklistClient
          groups={groups}
          projects={projects.map((project) => ({ id: project.id, name: project.name }))}
        />
      )}
    </PageShell>
  );
}
