import { FileText, Target, Users, LineChart, ListTodo } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageShell, PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

const PRD_SECTIONS = [
  {
    icon: Target,
    title: "Problem & goals",
    prompt: "What painful problem does this solve, and what does success look like?",
  },
  {
    icon: Users,
    title: "Target users",
    prompt: "Who is this for, and what job are they hiring the product to do?",
  },
  {
    icon: ListTodo,
    title: "Core requirements",
    prompt: "The must-have capabilities for a credible first version.",
  },
  {
    icon: LineChart,
    title: "Success metrics",
    prompt: "The signals that tell you this is working.",
  },
];

export default async function BlueprintPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <PageShell>
      <PageHeader
        title="Product Blueprint"
        description="A living PRD for every project — problem, users, requirements and success metrics in one place."
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No blueprints yet"
          description="Create a project and its PRD scaffold will appear here."
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

          {projects.map((p) => (
            <TabsContent key={p.slug} value={p.slug} className="space-y-4">
              <Card>
                <CardContent className="flex flex-wrap items-center gap-3 p-5">
                  <Badge variant="outline">{p.stage}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {p.summary}
                  </span>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {PRD_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Card key={section.title}>
                      <CardHeader className="flex-row items-center gap-2 space-y-0">
                        <Icon className="h-4 w-4 text-primary" />
                        <CardTitle>{section.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {section.prompt}
                        </p>
                        <div className="mt-3 rounded-lg border border-dashed border-border bg-secondary/40 px-3 py-6 text-center text-xs text-muted-foreground">
                          Draft this section from the Prompt Library
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </PageShell>
  );
}
