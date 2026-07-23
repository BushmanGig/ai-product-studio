"use client";

import { Archive, Save, Star, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { PROMPT_CATEGORIES } from "@/lib/constants";
import { archivePrompt, deletePrompt, updatePrompt } from "@/lib/actions";
import { cn } from "@/lib/utils";

export interface PromptData {
  id: string;
  projectId?: string | null;
  project?: { id: string; name: string } | null;
  title: string;
  category: string;
  body: string;
  tags: string;
}

export interface PromptProjectOption {
  id: string;
  name: string;
}

export function PromptCard({
  prompt,
  projects,
  favourite = false,
  onToggleFavourite,
  onCopied,
}: {
  prompt: PromptData;
  projects: PromptProjectOption[];
  favourite?: boolean;
  onToggleFavourite?: () => void;
  onCopied?: () => void;
}) {
  const tags = prompt.tags.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <Card className="hover-lift flex h-full flex-col border-border/70 shadow-soft">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{prompt.title}</CardTitle>
          <div className="flex items-center gap-1">
            {onToggleFavourite && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={favourite ? "Remove favourite" : "Favourite prompt"}
                onClick={onToggleFavourite}
                className="h-8 w-8"
              >
                <Star
                  className={cn(
                    "h-3.5 w-3.5",
                    favourite ? "fill-amber-400 text-amber-500" : "text-muted-foreground"
                  )}
                />
              </Button>
            )}
            <Badge variant="outline">{prompt.project?.name ?? "Global"}</Badge>
          </div>
        </div>
        <Badge variant="secondary" className="w-fit">
          {prompt.category}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <pre className="flex-1 whitespace-pre-wrap rounded-xl bg-secondary/70 p-3 text-xs leading-relaxed text-muted-foreground scrollbar-thin">
          {prompt.body}
        </pre>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                #{t}
              </span>
            ))}
          </div>
          <div
            onClick={() => onCopied?.()}
            onKeyDown={() => undefined}
            role="presentation"
          >
            <CopyButton value={prompt.body} label="Copy Prompt" copiedLabel="Copied to clipboard" />
          </div>
        </div>
        <details className="rounded-xl border border-border/70 bg-background/60 p-3">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
            Edit prompt
          </summary>
          <form action={updatePrompt} className="mt-3 space-y-3">
            <input type="hidden" name="promptId" value={prompt.id} />
            <div className="space-y-2">
              <Label htmlFor={`${prompt.id}-title`}>Title</Label>
              <Input id={`${prompt.id}-title`} name="title" defaultValue={prompt.title} required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${prompt.id}-category`}>Category</Label>
                <NativeSelect
                  id={`${prompt.id}-category`}
                  name="category"
                  defaultValue={prompt.category}
                >
                  {PROMPT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${prompt.id}-project`}>Project scope</Label>
                <NativeSelect
                  id={`${prompt.id}-project`}
                  name="projectId"
                  defaultValue={prompt.projectId ?? "global"}
                >
                  <option value="global">Global</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${prompt.id}-body`}>Prompt body</Label>
              <Textarea
                id={`${prompt.id}-body`}
                name="body"
                defaultValue={prompt.body}
                rows={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${prompt.id}-tags`}>Tags</Label>
              <Input id={`${prompt.id}-tags`} name="tags" defaultValue={prompt.tags} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm">
                <Save className="h-3.5 w-3.5" />
                Save
              </Button>
            </div>
          </form>
          <div className="mt-2 flex flex-wrap gap-2">
            <form action={archivePrompt}>
              <input type="hidden" name="promptId" value={prompt.id} />
              <Button type="submit" variant="outline" size="sm">
                <Archive className="h-3.5 w-3.5" />
                Archive
              </Button>
            </form>
            <form action={deletePrompt}>
              <input type="hidden" name="promptId" value={prompt.id} />
              <Button type="submit" variant="destructive" size="sm">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </form>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
