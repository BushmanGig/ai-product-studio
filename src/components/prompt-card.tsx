"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface PromptData {
  id: string;
  title: string;
  category: string;
  stage: string;
  body: string;
  tags: string;
}

export function PromptCard({ prompt }: { prompt: PromptData }) {
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
          <Badge variant="outline">{prompt.stage}</Badge>
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
      </CardContent>
    </Card>
  );
}
