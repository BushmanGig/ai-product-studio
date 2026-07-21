import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-header";
import { ProjectIntakeForm } from "@/components/project-intake-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function NewProjectIntakePage() {
  return (
    <PageShell>
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/projects">
          <ArrowLeft className="h-4 w-4" /> All projects
        </Link>
      </Button>

      <PageHeader
        title="AI project intake"
        description="Capture the concept, audience, constraints, and must-haves. The studio saves every answer onto the new project."
      />

      <Card>
        <CardContent className="p-6">
          <ProjectIntakeForm />
        </CardContent>
      </Card>
    </PageShell>
  );
}
