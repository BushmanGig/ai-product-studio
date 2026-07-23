import {
  FileText,
  Target,
  Users,
  LineChart,
  ListTodo,
  AlertTriangle,
  Telescope,
  Save,
  Layers,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageShell, PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GeneratePanel } from "@/components/generate-panel";
import { generateBlueprint, saveBlueprint } from "@/lib/actions";

export const dynamic = "force-dynamic";

const PRD_SECTIONS = [
  {
    icon: Telescope,
    title: "Vision",
    name: "vision",
    prompt: "What future does this product create for the customer and the studio?",
  },
  {
    icon: Target,
    title: "Problem statement",
    name: "problemStatement",
    prompt: "What painful problem does this solve, and why is now the right time?",
  },
  {
    icon: Users,
    title: "Target users",
    name: "targetUsers",
    prompt: "Who is this for, and what job are they hiring the product to do?",
  },
  {
    icon: LineChart,
    title: "Success metrics",
    name: "successMetrics",
    prompt: "The signals that tell you this is working.",
  },
  {
    icon: Users,
    title: "User stories",
    name: "userStories",
    prompt: "The core user stories that define the first usable version.",
  },
  {
    icon: ListTodo,
    title: "MVP scope",
    name: "mvpScope",
    prompt: "What must ship in the first usable release?",
  },
  {
    icon: Layers,
    title: "Future scope",
    name: "futureScope",
    prompt: "What is intentionally deferred after MVP?",
  },
  {
    icon: AlertTriangle,
    title: "Risks / assumptions",
    name: "risksAssumptions",
    prompt: "The riskiest assumptions, dependencies, and validation checks.",
  },
] as const;

export default async function BlueprintPage() {
  const [projects, prompts] = await Promise.all([
    prisma.project.findMany({
      where: { archivedAt: null },
      orderBy: { updatedAt: "desc" },
      include: { blueprint: true, intake: true },
    }),
    prisma.prompt.findMany({
      where: {
        archivedAt: null,
        category: { in: ["Discovery", "PRD"] },
      },
      orderBy: { title: "asc" },
      select: { id: true, title: true, category: true, projectId: true },
    }),
  ]);

  return (
    <PageShell>
      <PageHeader
        title="Product Blueprint"
        eyebrow="AI workspace"
        description="Generate a living PRD from intake, then edit every section until it is ready to build."
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No blueprints yet"
          description="Create a project through intake and its PRD scaffold will appear here."
        />
      ) : (
        <Tabs defaultValue={projects[0].slug}>
          <TabsList className="flex-wrap">
            {projects.map((p) => (
              <TabsTrigger key={p.slug} value={p.slug}>
                {p.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {projects.map((p) => {
            const projectPrompts = prompts.filter(
              (prompt) => !prompt.projectId || prompt.projectId === p.id
            );
            return (
              <TabsContent key={p.slug} value={p.slug} className="space-y-4">
                <Card>
                  <CardContent className="flex flex-wrap items-center gap-3 p-5">
                    <Badge variant="outline">{p.stage}</Badge>
                    <span className="text-sm text-muted-foreground">{p.summary}</span>
                  </CardContent>
                </Card>

                <GeneratePanel
                  projectId={p.id}
                  prompts={projectPrompts}
                  action={generateBlueprint}
                  buttonLabel="Generate Blueprint"
                />

                <form
                  key={p.blueprint?.updatedAt?.toISOString() ?? "blueprint-empty"}
                  action={saveBlueprint}
                  className="space-y-4"
                >
                  <input type="hidden" name="projectId" value={p.id} />
                  <div className="grid gap-4 md:grid-cols-2">
                    {PRD_SECTIONS.map((section) => {
                      const Icon = section.icon;
                      const value =
                        p.blueprint?.[section.name as keyof NonNullable<typeof p.blueprint>] ?? "";
                      return (
                        <Card key={section.title}>
                          <CardHeader className="flex-row items-center gap-2 space-y-0">
                            <Icon className="h-4 w-4 text-primary" />
                            <CardTitle>{section.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">{section.prompt}</p>
                            <div className="space-y-2">
                              <Label htmlFor={`${p.slug}-${section.name}`}>{section.title}</Label>
                              <Textarea
                                id={`${p.slug}-${section.name}`}
                                name={section.name}
                                defaultValue={String(value)}
                                rows={5}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  <Button type="submit">
                    <Save className="h-4 w-4" />
                    Save blueprint
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
