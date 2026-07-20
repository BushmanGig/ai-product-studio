import { Palette, Type, Ruler, Sparkles } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageShell, PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const PALETTE = [
  { name: "Primary", value: "#6366f1" },
  { name: "Accent", value: "#0ea5e9" },
  { name: "Success", value: "#10b981" },
  { name: "Warning", value: "#f59e0b" },
  { name: "Danger", value: "#f43f5e" },
  { name: "Ink", value: "#1e1b2e" },
];

const TYPE_SCALE = [
  { label: "Display", size: "text-4xl", sample: "Ship polished products" },
  { label: "Heading", size: "text-2xl", sample: "Concept to launch" },
  { label: "Title", size: "text-lg", sample: "Design DNA" },
  { label: "Body", size: "text-sm", sample: "Clean, calm, and consistent." },
];

const SPACING = ["4", "8", "12", "16", "24", "32"];

export default async function DesignDnaPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <PageShell>
      <PageHeader
        title="Design DNA"
        description="The shared visual language — colour, type and spacing — that keeps every product feeling premium."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Palette className="h-4 w-4 text-primary" />
            <CardTitle>Colour palette</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            {PALETTE.map((c) => (
              <div key={c.name} className="space-y-1.5">
                <div
                  className="h-16 w-full rounded-lg border border-border shadow-sm"
                  style={{ backgroundColor: c.value }}
                />
                <p className="text-xs font-medium">{c.name}</p>
                <p className="text-xs uppercase text-muted-foreground">
                  {c.value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Type className="h-4 w-4 text-primary" />
            <CardTitle>Type scale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {TYPE_SCALE.map((t) => (
              <div key={t.label} className="flex items-baseline justify-between gap-4">
                <span className={`${t.size} font-semibold tracking-tight`}>
                  {t.sample}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {t.label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Ruler className="h-4 w-4 text-primary" />
            <CardTitle>Spacing system</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-4">
            {SPACING.map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div
                  className="rounded bg-primary/20"
                  style={{ width: `${s}px`, height: `${s}px` }}
                />
                <span className="text-xs text-muted-foreground">{s}px</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle>Brand direction per project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
              >
                <span
                  className="h-6 w-6 rounded-md"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-sm font-medium">{p.name}</span>
                <span className="ml-auto text-xs uppercase text-muted-foreground">
                  {p.color}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
