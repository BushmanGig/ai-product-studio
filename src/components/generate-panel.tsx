"use client";

import * as React from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { GenerationSkeleton } from "@/components/ui/skeleton";

export interface PromptOption {
  id: string;
  title: string;
  category: string;
}

export function GeneratePanel({
  projectId,
  prompts,
  action,
  buttonLabel,
  emptyPromptLabel = "No prompt (use defaults)",
}: {
  projectId: string;
  prompts: PromptOption[];
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string; provider?: string } | void>;
  buttonLabel: string;
  emptyPromptLabel?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const result = await action(formData);
      if (result && "ok" in result && !result.ok) {
        setError(result.error ?? "Generation failed.");
      } else {
        const provider =
          result && "provider" in result && result.provider ? result.provider : "mock";
        setMessage(`Generated with ${provider} provider. You can edit and save below.`);
        router.refresh();
      }
    } catch {
      setError("Generation failed. Check provider settings and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <form
        action={onSubmit}
        className="space-y-3 rounded-2xl border border-border/80 bg-gradient-to-br from-primary/[0.06] via-card to-card p-4 shadow-soft"
      >
        <input type="hidden" name="projectId" value={projectId} />
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium tracking-tight">AI generation</p>
            <p className="text-xs text-muted-foreground">
              Optional prompt guidance · server-side provider
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor={`prompt-${projectId}-${buttonLabel}`}>Prompt from library</Label>
            <NativeSelect
              id={`prompt-${projectId}-${buttonLabel}`}
              name="promptId"
              defaultValue=""
              disabled={pending}
            >
              <option value="">{emptyPromptLabel}</option>
              {prompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.title} · {prompt.category}
                </option>
              ))}
            </NativeSelect>
          </div>
          <Button type="submit" disabled={pending} className="min-w-[11rem]">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {pending ? "Generating…" : buttonLabel}
          </Button>
        </div>
        {message && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
      {pending && <GenerationSkeleton />}
    </div>
  );
}
