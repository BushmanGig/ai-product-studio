import { Library } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageShell, PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { PROMPT_CATEGORIES } from "@/lib/constants";
import { createPrompt } from "@/lib/actions";
import { PromptLibraryBrowser } from "@/components/prompt-library-browser";

export const dynamic = "force-dynamic";

export default async function PromptLibraryPage() {
  const [prompts, projects] = await Promise.all([
    prisma.prompt.findMany({
      where: { archivedAt: null },
      orderBy: [{ category: "asc" }, { createdAt: "asc" }],
      include: { project: { select: { id: true, name: true } } },
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
        eyebrow="AI workspace"
        title="Prompt Library"
        description="Reusable, battle-tested AI prompts for every stage of the workflow. Search, favourite, copy, ship."
      />

      <Card className="studio-panel border-border/70">
        <CardHeader>
          <CardTitle>Create prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPrompt} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prompt-title">Title</Label>
              <Input id="prompt-title" name="title" placeholder="e.g. Launch risk reviewer" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prompt-category">Category</Label>
                <NativeSelect id="prompt-category" name="category" defaultValue="Discovery">
                  {PROMPT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt-project">Project scope</Label>
                <NativeSelect id="prompt-project" name="projectId" defaultValue="global">
                  <option value="global">Global</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="prompt-body">Prompt body</Label>
              <Textarea
                id="prompt-body"
                name="body"
                placeholder="Write the reusable prompt..."
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt-tags">Tags</Label>
              <Input id="prompt-tags" name="tags" placeholder="prd,review,launch" />
            </div>
            <div className="flex items-end">
              <Button type="submit">Create prompt</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {prompts.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No prompts yet"
          description="Seed the library or add your own prompts to speed up every stage."
        />
      ) : (
        <PromptLibraryBrowser prompts={prompts} projects={projects} />
      )}
    </PageShell>
  );
}
