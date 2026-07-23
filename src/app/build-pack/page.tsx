import { Package, Save } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { generateBuildPack, saveBuildPack } from "@/lib/actions";
import { PageShell, PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GeneratePanel } from "@/components/generate-panel";
import { CopyButton } from "@/components/copy-button";

export const dynamic = "force-dynamic";

const BUILD_PACK_FIELDS = [
  {
    name: "recommendedStack",
    title: "Recommended stack",
    prompt: "Frameworks, hosting, and tooling for the MVP.",
  },
  {
    name: "architectureSummary",
    title: "Architecture summary",
    prompt: "How the system is shaped and where responsibilities live.",
  },
  {
    name: "databaseEntities",
    title: "Database entities",
    prompt: "Core records and relationships to model first.",
  },
  {
    name: "pagesRoutes",
    title: "Pages / routes",
    prompt: "Primary screens and navigation structure.",
  },
  {
    name: "milestonePlan",
    title: "Milestone plan",
    prompt: "Sequenced delivery checkpoints from intake to launch.",
  },
  {
    name: "codingAgentPrompt",
    title: "Coding-agent master prompt",
    prompt: "Copyable brief for a coding agent to implement the MVP.",
    copyable: true,
  },
  {
    name: "acceptanceCriteria",
    title: "Acceptance criteria",
    prompt: "Definition of done for the first shippable slice.",
  },
  {
    name: "qaChecklist",
    title: "QA checklist",
    prompt: "Checks that must pass before release.",
  },
] as const;

export default async function BuildPackPage() {
  const [projects, prompts] = await Promise.all([
    prisma.project.findMany({
      where: { archivedAt: null },
      orderBy: { updatedAt: "desc" },
      include: { buildPack: true },
    }),
    prisma.prompt.findMany({
      where: {
        archivedAt: null,
        category: { in: ["Build Pack", "QA", "Launch"] },
      },
      orderBy: { title: "asc" },
      select: { id: true, title: true, category: true, projectId: true },
    }),
  ]);

  return (
    <PageShell>
      <PageHeader
        title="Build Pack"
        eyebrow="AI workspace"
        description="Generate a stack, architecture, milestone plan, and coding-agent brief — then edit or copy what you need."
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No build packs yet"
          description="Create a project and generate a build pack from its intake and blueprint."
        />
      ) : (
        <Tabs defaultValue={projects[0].slug}>
          <TabsList className="flex-wrap">
            {projects.map((project) => (
              <TabsTrigger key={project.slug} value={project.slug}>
                {project.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {projects.map((project) => {
            const projectPrompts = prompts.filter(
              (prompt) => !prompt.projectId || prompt.projectId === project.id
            );
            const pack = project.buildPack;

            return (
              <TabsContent key={project.slug} value={project.slug} className="space-y-4">
                <Card>
                  <CardContent className="flex flex-wrap items-center gap-3 p-5">
                    <Badge variant="outline">{project.stage}</Badge>
                    <span className="text-sm text-muted-foreground">{project.summary}</span>
                  </CardContent>
                </Card>

                <GeneratePanel
                  projectId={project.id}
                  prompts={projectPrompts}
                  action={generateBuildPack}
                  buttonLabel="Generate Build Pack"
                />

                <form
                  key={pack?.updatedAt?.toISOString() ?? "pack-empty"}
                  action={saveBuildPack}
                  className="space-y-4"
                >
                  <input type="hidden" name="projectId" value={project.id} />
                  <div className="grid gap-4 md:grid-cols-2">
                    {BUILD_PACK_FIELDS.map((field) => {
                      const value =
                        pack?.[field.name as keyof NonNullable<typeof pack>]?.toString() ?? "";
                      return (
                        <Card key={field.name} className={field.name === "codingAgentPrompt" ? "md:col-span-2" : ""}>
                          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                            <div>
                              <CardTitle>{field.title}</CardTitle>
                              <p className="mt-1 text-sm text-muted-foreground">{field.prompt}</p>
                            </div>
                            {"copyable" in field && field.copyable && value && (
                              <CopyButton value={value} label="Copy Prompt" />
                            )}
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <Label htmlFor={`${project.slug}-${field.name}`}>{field.title}</Label>
                            <Textarea
                              id={`${project.slug}-${field.name}`}
                              name={field.name}
                              defaultValue={value}
                              rows={field.name === "codingAgentPrompt" ? 8 : 5}
                            />
                            {value && field.name !== "codingAgentPrompt" && (
                              <CopyButton value={value} label="Copy section" />
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  <Button type="submit">
                    <Save className="h-4 w-4" />
                    Save build pack
                  </Button>
                </form>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </PageShell>
  );
}
