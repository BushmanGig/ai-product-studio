import { Sparkles } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageShell, PageHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";
import { NewProjectDialog } from "@/components/new-project-dialog";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, archivedProjects] = await Promise.all([
    prisma.project.findMany({
      where: { archivedAt: null },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({
      where: { archivedAt: { not: null } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <PageShell>
      <PageHeader
        title="Projects"
        description="Every product idea in motion, from raw concept to active growth."
        actions={<NewProjectDialog />}
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No active projects"
          description="Kick off your first idea and it will appear here with its stage and next action."
          action={<NewProjectDialog />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {archivedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Archived projects</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {archivedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
