"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/lib/actions";
import { STAGES, PRIORITIES } from "@/lib/constants";

export function NewProjectDialog({
  triggerVariant = "default",
  triggerLabel = "New project",
}: {
  triggerVariant?: "default" | "outline" | "secondary";
  triggerLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await createProject(formData);
    setPending(false);
    if (result?.ok) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result?.error ?? "Something went wrong.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm">
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
          <DialogDescription>
            Start a fresh idea and drop it into the studio workflow.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project name</Label>
            <Input id="name" name="name" placeholder="e.g. Habit Tracker" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">One-line summary</Label>
            <Textarea
              id="summary"
              name="summary"
              placeholder="What is this product, in a sentence?"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <NativeSelect
                id="stage"
                name="stage"
                defaultValue="Idea"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <NativeSelect
                id="priority"
                name="priority"
                defaultValue="Medium"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nextAction">Next best action</Label>
            <Input
              id="nextAction"
              name="nextAction"
              placeholder="e.g. Draft the concept brief"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
