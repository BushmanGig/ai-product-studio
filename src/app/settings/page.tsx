import { Database, Palette, User, Workflow } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Settings"
        description="Studio preferences, workflow configuration and data source."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <User className="h-4 w-4 text-primary" />
            <CardTitle>Studio profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studio">Studio name</Label>
              <Input id="studio" defaultValue="AI Product Studio" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Input id="owner" defaultValue="Studio Lead" />
            </div>
            <Button size="sm">Save changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Palette className="h-4 w-4 text-primary" />
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The studio ships with a premium light theme and dark-mode tokens
              ready in CSS variables.
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
              <Badge variant="success">SQLite · connected</Badge>
            </div>
            <p className="text-muted-foreground">
              Local development runs on SQLite via Prisma. Switch the datasource
              provider to <code className="text-foreground">postgresql</code> and
              update <code className="text-foreground">DATABASE_URL</code> to move
              to Supabase/Postgres — no application code changes required.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
