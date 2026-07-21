"use client";

import * as React from "react";
import { Archive, Check, Copy, Save, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { PROMPT_CATEGORIES } from "@/lib/constants";
import { archivePrompt, deletePrompt, updatePrompt } from "@/lib/actions";

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
}: {
  prompt: PromptData;
  projects: PromptProjectOption[];
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; ignore.
    }
  }

  const tags = prompt.tags.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{prompt.title}</CardTitle>
          <Badge variant="outline">
            {prompt.project?.name ?? "Global"}
          </Badge>
        </div>
        <Badge variant="secondary" className="w-fit">
          {prompt.category}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <pre className="flex-1 whitespace-pre-wrap rounded-lg bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground scrollbar-thin">
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
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <details className="rounded-lg border border-border bg-background/60 p-3">
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
              <Textarea id={`${prompt.id}-body`} name="body" defaultValue={prompt.body} rows={6} required />
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
