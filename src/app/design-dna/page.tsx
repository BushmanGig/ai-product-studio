import {
  Accessibility,
  Box,
  Columns3,
  Move,
  Palette,
  Ruler,
  Save,
  Trash2,
  Type,
  ExternalLink,
  ImageIcon,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { DESIGN_INSPIRATION_CATEGORIES } from "@/lib/constants";
import {
  createDesignInspiration,
  deleteDesignInspiration,
  generateDesignDna,
  saveDesignDna,
} from "@/lib/actions";
import { PageShell, PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { GeneratePanel } from "@/components/generate-panel";

export const dynamic = "force-dynamic";

const DNA_FIELDS = [
  {
    name: "designPrinciples",
    title: "Design principles",
    prompt: "The non-negotiable rules that guide every UI decision.",
    icon: Columns3,
    span: "md:col-span-2",
  },
  {
    name: "typography",
    title: "Typography",
    prompt: "Type families, scale, and hierarchy notes.",
    icon: Type,
  },
  {
    name: "colourDirection",
    title: "Colour direction",
    prompt: "Palette intent, accent usage, and mood.",
    icon: Palette,
  },
  {
    name: "spacing",
    title: "Spacing",
    prompt: "Spacing rhythm and density guidance.",
    icon: Ruler,
  },
  {
    name: "componentStyle",
    title: "Component style",
    prompt: "Radii, borders, elevation, and control language.",
    icon: Box,
  },
  {
    name: "motionStyle",
    title: "Motion style",
    prompt: "How motion should reinforce hierarchy without noise.",
    icon: Move,
  },
  {
    name: "accessibilityRequirements",
    title: "Accessibility requirements",
    prompt: "Contrast, keyboard, focus, and inclusive UX needs.",
    icon: Accessibility,
    span: "md:col-span-2",
  },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  layout: "Layout",
  typography: "Typography",
  colour: "Colour",
  components: "Components",
  motion: "Motion",
  branding: "Branding",
};

export default async function DesignDnaPage() {
  const [projects, prompts] = await Promise.all([
    prisma.project.findMany({
      where: { archivedAt: null },
      orderBy: { updatedAt: "desc" },
      include: {
        designDna: true,
        inspirations: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.prompt.findMany({
      where: { archivedAt: null, category: "Design DNA" },
      orderBy: { title: "asc" },
      select: { id: true, title: true, category: true, projectId: true },
    }),
  ]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Visual system"
        title="Design DNA"
        description="Project-specific visual language — principles, tokens, motion, accessibility, and inspirations."
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="No Design DNA yet"
          description="Create a project to start shaping its visual system."
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
            return (
              <TabsContent key={project.slug} value={project.slug} className="space-y-5">
                <Card className="studio-panel border-border/70">
                  <CardContent className="flex flex-wrap items-center gap-3 p-5">
                    <span
                      className="h-8 w-8 rounded-xl border border-border shadow-sm"
                      style={{ backgroundColor: project.color }}
                    />
                    <Badge variant="outline">{project.stage}</Badge>
                    <span className="text-sm text-muted-foreground">{project.summary}</span>
                  </CardContent>
                </Card>

                <GeneratePanel
                  projectId={project.id}
                  prompts={projectPrompts}
                  action={generateDesignDna}
                  buttonLabel="Generate Design DNA"
                />

                <form
                  key={project.designDna?.updatedAt?.toISOString() ?? "dna-empty"}
                  action={saveDesignDna}
                  className="space-y-4"
                >
                  <input type="hidden" name="projectId" value={project.id} />
                  <div className="grid gap-4 md:grid-cols-2">
                    {DNA_FIELDS.map((field) => {
                      const Icon = field.icon;
                      return (
                        <Card
                          key={field.name}
                          className={`studio-panel border-border/70 ${"span" in field ? field.span : ""}`}
                        >
                          <CardHeader className="flex-row items-start gap-3 space-y-0">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" />
                            </span>
                            <div>
                              <CardTitle>{field.title}</CardTitle>
                              <p className="mt-1 text-sm text-muted-foreground">{field.prompt}</p>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <Label htmlFor={`${project.slug}-${field.name}`}>{field.title}</Label>
                            <Textarea
                              id={`${project.slug}-${field.name}`}
                              name={field.name}
                              defaultValue={
                                project.designDna?.[
                                  field.name as keyof NonNullable<typeof project.designDna>
                                ]?.toString() ?? ""
                              }
                              rows={5}
                              className="min-h-[8rem]"
                            />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  <Button type="submit">
                    <Save className="h-4 w-4" />
                    Save Design DNA
                  </Button>
                </form>

                <Card className="studio-panel border-border/70">
                  <CardHeader>
                    <CardTitle>Design inspirations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <form
                      action={createDesignInspiration}
                      className="grid gap-4 rounded-2xl border border-border/70 bg-secondary/30 p-4 md:grid-cols-2"
                    >
                      <input type="hidden" name="projectId" value={project.id} />
                      <div className="space-y-2">
                        <Label htmlFor={`${project.slug}-sourceUrl`}>Source URL</Label>
                        <Input
                          id={`${project.slug}-sourceUrl`}
                          name="sourceUrl"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${project.slug}-imageRef`}>
                          Image / screenshot reference
                        </Label>
                        <Input
                          id={`${project.slug}-imageRef`}
                          name="imageRef"
                          placeholder="Optional path, filename, or URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${project.slug}-category`}>Category</Label>
                        <NativeSelect
                          id={`${project.slug}-category`}
                          name="category"
                          defaultValue="layout"
                        >
                          {DESIGN_INSPIRATION_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {CATEGORY_LABELS[category] ?? category}
                            </option>
                          ))}
                        </NativeSelect>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${project.slug}-likes`}>What you like about it</Label>
                        <Input
                          id={`${project.slug}-likes`}
                          name="likes"
                          placeholder="Hierarchy, colour restraint, motion..."
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`${project.slug}-notes`}>Notes</Label>
                        <Textarea
                          id={`${project.slug}-notes`}
                          name="notes"
                          rows={2}
                          placeholder="How this should influence the product."
                        />
                      </div>
                      <div>
                        <Button type="submit">Add inspiration</Button>
                      </div>
                    </form>

                    <div className="grid gap-3 md:grid-cols-2">
                      {project.inspirations.length === 0 ? (
                        <p className="text-sm text-muted-foreground md:col-span-2">
                          No inspirations yet. Add references to lock the visual direction.
                        </p>
                      ) : (
                        project.inspirations.map((inspiration) => (
                          <div
                            key={inspiration.id}
                            className="hover-lift flex h-full flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <Badge variant="secondary">
                                {CATEGORY_LABELS[inspiration.category] ?? inspiration.category}
                              </Badge>
                              <form action={deleteDesignInspiration}>
                                <input type="hidden" name="inspirationId" value={inspiration.id} />
                                <Button type="submit" variant="ghost" size="sm">
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Remove
                                </Button>
                              </form>
                            </div>
                            <p className="text-sm font-semibold tracking-tight">{inspiration.likes}</p>
                            {inspiration.sourceUrl && (
                              <a
                                href={inspiration.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                {inspiration.sourceUrl}
                              </a>
                            )}
                            {inspiration.imageRef && (
                              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <ImageIcon className="h-3.5 w-3.5" />
                                {inspiration.imageRef}
                              </p>
                            )}
                            {inspiration.notes && (
                              <div className="mt-auto rounded-xl bg-secondary/60 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
                                {inspiration.notes}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </PageShell>
  );
}
