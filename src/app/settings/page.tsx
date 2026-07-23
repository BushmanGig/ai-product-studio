import { Bot, Database, Palette, User, Workflow } from "lucide-react";

import { getAiProviderStatus, getStudioSettings } from "@/lib/ai";
import { saveAiSettings } from "@/lib/actions";
import { PageShell, PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, aiStatus] = await Promise.all([
    getStudioSettings(),
    getAiProviderStatus(),
  ]);

  const databaseProvider = process.env.DATABASE_URL?.startsWith("file:")
    ? "SQLite"
    : "PostgreSQL";

  return (
    <PageShell>
      <PageHeader
        title="Settings"
        eyebrow="Studio"
        description="Studio preferences, AI provider configuration, workflow stages, and data source."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Bot className="h-4 w-4 text-primary" />
            <CardTitle>AI provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant={aiStatus.activeProvider === "mock" ? "secondary" : "outline"}>
                Active: {aiStatus.activeProvider}
              </Badge>
              <Badge variant={aiStatus.apiKeyStatus === "configured" ? "success" : "outline"}>
                API key: {aiStatus.apiKeyStatus}
              </Badge>
              <Badge variant="outline">Model: {aiStatus.modelName}</Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              API keys are read only from server environment variables
              (<code className="text-foreground">OPENAI_API_KEY</code>). They are never stored in
              SQLite or sent to the browser. Mock mode keeps every generate action working without a key.
            </p>

            <form action={saveAiSettings} className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-3 text-sm md:col-span-2">
                <input
                  type="checkbox"
                  name="mockMode"
                  defaultChecked={settings.mockMode}
                  className="h-4 w-4 rounded border-border"
                />
                <span>
                  <span className="font-medium">Mock AI mode</span>
                  <span className="mt-0.5 block text-muted-foreground">
                    Use the built-in demo provider. Disable only when an OpenAI-compatible key is configured.
                  </span>
                </span>
              </label>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="baseUrl">OpenAI-compatible endpoint</Label>
                <Input
                  id="baseUrl"
                  name="baseUrl"
                  defaultValue={settings.baseUrl}
                  placeholder="https://api.openai.com/v1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelName">Model name</Label>
                <Input
                  id="modelName"
                  name="modelName"
                  defaultValue={settings.modelName}
                  placeholder="gpt-4o-mini"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Generation temperature</Label>
                <Input
                  id="temperature"
                  name="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  defaultValue={String(settings.temperature)}
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit">Save AI settings</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <User className="h-4 w-4 text-primary" />
            <CardTitle>Studio profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studio">Studio name</Label>
              <Input id="studio" defaultValue="AI Product Studio" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Input id="owner" defaultValue="Studio Lead" readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Palette className="h-4 w-4 text-primary" />
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The studio ships with a premium light theme and dark-mode tokens ready in CSS variables.
            </p>
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg border border-border bg-background p-3 text-center text-xs">
                Light
                <div className="mt-2 h-8 rounded bg-secondary" />
              </div>
              <div className="flex-1 rounded-lg border border-border bg-[#14141c] p-3 text-center text-xs text-white">
                Dark
                <div className="mt-2 h-8 rounded bg-white/10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Workflow className="h-4 w-4 text-primary" />
            <CardTitle>Workflow stages</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Database className="h-4 w-4 text-primary" />
            <CardTitle>Data source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span>Local database</span>
              <Badge variant="success">{databaseProvider} · connected</Badge>
            </div>
            <p className="text-muted-foreground">
              Local development runs on SQLite via Prisma. Follow{" "}
              <code className="text-foreground">docs/POSTGRES.md</code> to switch the datasource
              provider to <code className="text-foreground">postgresql</code> and update{" "}
              <code className="text-foreground">DATABASE_URL</code> for Supabase/Postgres. Application
              code stays the same.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
