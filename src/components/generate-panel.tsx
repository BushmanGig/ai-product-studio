"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

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
    <form action={onSubmit} className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor={`prompt-${projectId}-${buttonLabel}`}>Prompt from library</Label>
          <NativeSelect id={`prompt-${projectId}-${buttonLabel}`} name="promptId" defaultValue="">
            <option value="">{emptyPromptLabel}</option>
            {prompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.title} · {prompt.category}
              </option>
            ))}
          </NativeSelect>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {buttonLabel}
        </Button>
      </div>
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
