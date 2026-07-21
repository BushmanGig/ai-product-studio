"use client";

import * as React from "react";
import { Archive, Check, Save } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { archiveQaItem, createQaItem, toggleQaItem, updateQaItem } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

export interface QaItemData {
  id: string;
  projectId: string;
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

export interface QaProjectOption {
  id: string;
  name: string;
}

function ChecklistRow({
  item,
  projects,
}: {
  item: QaItemData;
  projects: QaProjectOption[];
}) {
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
    <div className="rounded-lg border border-transparent hover:border-border hover:bg-secondary/40">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors disabled:opacity-60"
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
      <details className="px-2 pb-2">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
          Edit item
        </summary>
        <form action={updateQaItem} className="mt-3 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="itemId" value={item.id} />
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`${item.id}-label`}>QA item</Label>
            <Input id={`${item.id}-label`} name="label" defaultValue={item.label} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${item.id}-category`}>Category</Label>
            <Input id={`${item.id}-category`} name="category" defaultValue={item.category} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${item.id}-project`}>Project</Label>
            <NativeSelect id={`${item.id}-project`} name="projectId" defaultValue={item.projectId}>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" name="checked" defaultChecked={checked} />
            Mark complete
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm">
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </form>
        <form action={archiveQaItem} className="mt-2">
          <input type="hidden" name="itemId" value={item.id} />
          <Button type="submit" variant="outline" size="sm">
            <Archive className="h-3.5 w-3.5" />
            Archive
          </Button>
        </form>
      </details>
    </div>
  );
}

export function QaChecklistClient({
  groups,
  projects,
}: {
  groups: QaGroup[];
  projects: QaProjectOption[];
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create QA item</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createQaItem} className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="qa-label">QA item</Label>
              <Input id="qa-label" name="label" placeholder="e.g. Empty states are covered" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qa-category">Category</Label>
              <Input id="qa-category" name="category" defaultValue="General" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qa-project">Project</Label>
              <NativeSelect id="qa-project" name="projectId">
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex items-end">
              <Button type="submit">Create QA item</Button>
            </div>
          </form>
        </CardContent>
      </Card>

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
                {group.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No QA items yet.</p>
                ) : (
                  group.items.map((item) => (
                    <ChecklistRow key={item.id} item={item} projects={projects} />
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
