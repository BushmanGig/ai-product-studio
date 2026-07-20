"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { advanceStage } from "@/lib/actions";

export function AdvanceStageButton({ projectId }: { projectId: string }) {
  const [pending, setPending] = React.useState(false);
  const router = useRouter();

  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await advanceStage(projectId);
        setPending(false);
        router.refresh();
      }}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowRight className="h-4 w-4" />
      )}
      Advance stage
    </Button>
  );
}
