import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NewProjectDialog({
  triggerVariant = "default",
  triggerLabel = "New project",
}: {
  triggerVariant?: "default" | "outline" | "secondary";
  triggerLabel?: string;
}) {
  return (
    <Button variant={triggerVariant} size="sm" asChild>
      <Link href="/projects/new">
        <Plus className="h-4 w-4" />
        {triggerLabel}
      </Link>
    </Button>
  );
}
