"use client";

import * as React from "react";
import { Search, Star } from "lucide-react";

import { PromptCard, type PromptData, type PromptProjectOption } from "@/components/prompt-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PROMPT_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FAV_KEY = "aps-favourite-prompts";
const RECENT_KEY = "aps-recent-prompts";

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: string[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function PromptLibraryBrowser({
  prompts,
  projects,
}: {
  prompts: PromptData[];
  projects: PromptProjectOption[];
}) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");
  const [favourites, setFavourites] = React.useState<string[]>([]);
  const [recent, setRecent] = React.useState<string[]>([]);
  const [onlyFavourites, setOnlyFavourites] = React.useState(false);

  React.useEffect(() => {
    setFavourites(readList(FAV_KEY));
    setRecent(readList(RECENT_KEY));
  }, []);

  function toggleFavourite(id: string) {
    setFavourites((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [id, ...current];
      writeList(FAV_KEY, next);
      return next;
    });
  }

  function markRecent(id: string) {
    setRecent((current) => {
      const next = [id, ...current.filter((item) => item !== id)].slice(0, 8);
      writeList(RECENT_KEY, next);
      return next;
    });
  }

  const filtered = prompts.filter((prompt) => {
    const matchesCategory = category === "All" || prompt.category === category;
    const haystack = `${prompt.title} ${prompt.body} ${prompt.tags} ${prompt.category}`.toLowerCase();
    const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
    const matchesFavourite = !onlyFavourites || favourites.includes(prompt.id);
    return matchesCategory && matchesQuery && matchesFavourite;
  });

  const recentPrompts = recent
    .map((id) => prompts.find((prompt) => prompt.id === id))
    .filter(Boolean) as PromptData[];

  return (
    <div className="space-y-6">
      <div className="studio-panel space-y-4 border-border/70 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles, tags, or prompt body…"
            className="pl-9"
            aria-label="Search prompts"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={category === "All" ? "default" : "outline"}
            onClick={() => setCategory("All")}
          >
            All
          </Button>
          {PROMPT_CATEGORIES.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={category === item ? "default" : "outline"}
              onClick={() => setCategory(item)}
            >
              {item}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant={onlyFavourites ? "secondary" : "outline"}
            onClick={() => setOnlyFavourites((value) => !value)}
            className={cn(onlyFavourites && "text-amber-700")}
          >
            <Star className="h-3.5 w-3.5" />
            Favourites
          </Button>
        </div>
      </div>

      {recentPrompts.length > 0 && !query && category === "All" && !onlyFavourites && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent</h2>
            <span className="text-xs text-muted-foreground">{recentPrompts.length} prompts</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentPrompts.map((prompt) => (
              <PromptCard
                key={`recent-${prompt.id}`}
                prompt={prompt}
                projects={projects}
                favourite={favourites.includes(prompt.id)}
                onToggleFavourite={() => toggleFavourite(prompt.id)}
                onCopied={() => markRecent(prompt.id)}
              />
            ))}
          </div>
        </section>
      )}

      {PROMPT_CATEGORIES.map((item) => {
        const categoryPrompts = filtered.filter((prompt) => prompt.category === item);
        if (categoryPrompts.length === 0) return null;
        return (
          <section key={item} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">{item}</h2>
              <span className="text-xs text-muted-foreground">
                {categoryPrompts.length} prompts
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categoryPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  projects={projects}
                  favourite={favourites.includes(prompt.id)}
                  onToggleFavourite={() => toggleFavourite(prompt.id)}
                  onCopied={() => markRecent(prompt.id)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border/80 px-4 py-10 text-center text-sm text-muted-foreground">
          No prompts match this search.
        </p>
      )}
    </div>
  );
}
