import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  ListChecks,
  Library,
  ShieldCheck,
  Rocket,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge, StatusBadge } from "@/components/ui/status";
import { timeAgo } from "@/lib/utils";

export interface ProjectCardData {
  id: string;
  name: string;
  slug: string;
  summary: string;
  stage: string;
  status?: string;
  priority: string;
  progress: number;
  nextAction: string;
  color: string;
  updatedAt?: Date | string;
  _count?: {
    buildTasks?: number;
    qaItems?: number;
    prompts?: number;
    launchItems?: number;
  };
}

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const counts = [
    {
      icon: ListChecks,
      label: "Build",
      value: project._count?.buildTasks,
    },
    {
      icon: ShieldCheck,
      label: "QA",
      value: project._count?.qaItems,
    },
    {
      icon: Library,
      label: "Prompts",
      value: project._count?.prompts,
    },
    {
      icon: Rocket,
      label: "Launch",
      value: project._count?.launchItems,
    },
  ].filter((item) => typeof item.value === "number");

  return (
    <Link href={`/projects/${project.slug}`} className="group block h-full">
      <Card className="studio-panel hover-lift h-full border-border/70 shadow-soft">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: project.color }}
              >
                {project.name.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold tracking-tight transition-colors group-hover:text-primary">
                  {project.name}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline">{project.stage}</Badge>
                  {project.status && <StatusBadge status={project.status} />}
                </div>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {project.summary}
          </p>

          <div className="mt-auto space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium tabular-nums">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-1.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={project.priority} />
              {project.updatedAt && (
                <span className="text-[11px] text-muted-foreground">
                  Updated {timeAgo(new Date(project.updatedAt))}
                </span>
              )}
            </div>

            {counts.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {counts.map((count) => {
                  const Icon = count.icon;
                  return (
                    <div
                      key={count.label}
                      className="flex items-center gap-1.5 rounded-lg bg-secondary/70 px-2 py-1.5 text-[11px] text-muted-foreground"
                    >
                      <Icon className="h-3 w-3 text-primary/80" />
                      <span className="font-medium text-foreground">{count.value}</span>
                      <span>{count.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-start gap-1.5 rounded-xl border border-border/60 bg-secondary/50 px-3 py-2.5 text-xs">
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">Next:</span>{" "}
                {project.nextAction}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
