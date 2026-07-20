"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toggleQaItem } from "@/lib/actions";

export interface QaItemData {
  id: string;
  label: string;
  category: string;
  checked: boolean;
}

export interface QaGroup {
  projectId: string;
  projectName: string;
  color: string;
  items: QaItemData[];
}

function ChecklistRow({ item }: { item: QaItemData }) {
  const [checked, setChecked] = React.useState(item.checked);
  const [pending, startTransition] = React.useTransition();

  function toggle() {
    const next = !checked;
    setChecked(next);
    startTransition(async () => {
      await toggleQaItem(item.id, next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary/60 disabled:opacity-60"
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border"
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      <span
        className={cn(
          "text-sm",
          checked && "text-muted-foreground line-through"
        )}
      >
        {item.label}
      </span>
      <Badge variant="outline" className="ml-auto">
        {item.category}
      </Badge>
    </button>
  );
}

export function QaChecklistClient({ groups }: { groups: QaGroup[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {groups.map((group) => {
        const done = group.items.filter((i) => i.checked).length;
        const pct = group.items.length
          ? Math.round((done / group.items.length) * 100)
          : 0;
        return (
          <Card key={group.projectId}>
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-6 w-6 rounded-md"
                  style={{ backgroundColor: group.color }}
                />
                <CardTitle>{group.projectName}</CardTitle>
                <span className="ml-auto text-xs text-muted-foreground">
                  {done}/{group.items.length}
                </span>
              </div>
              <Progress value={pct} />
            </CardHeader>
            <CardContent className="space-y-1">
              {group.items.map((item) => (
                <ChecklistRow key={item.id} item={item} />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
