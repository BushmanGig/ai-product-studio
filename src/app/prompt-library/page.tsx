import { Library } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { PageShell, PageHeader } from "@/components/page-header";
import { PromptCard } from "@/components/prompt-card";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function PromptLibraryPage() {
  const prompts = await prisma.prompt.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <PageShell>
      <PageHeader
        title="Prompt Library"
        description="Reusable, battle-tested AI prompts for every stage of the workflow. Copy, tweak, ship."
      />

      {prompts.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No prompts yet"
          description="Seed the library or add your own prompts to speed up every stage."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
