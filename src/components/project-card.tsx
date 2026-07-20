import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/ui/status";

export interface ProjectCardData {
  id: string;
  name: string;
  slug: string;
  summary: string;
  stage: string;
  priority: string;
  progress: number;
  nextAction: string;
  color: string;
}

export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: project.color }}
              >
                {project.name.slice(0, 1)}
              </span>
              <div>
                <p className="font-semibold leading-tight group-hover:text-primary">
                  {project.name}
                </p>
                <Badge variant="outline" className="mt-1">
                  {project.stage}
                </Badge>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {project.summary}
          </p>

          <div className="mt-auto space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} />
            </div>

            <div className="flex items-center justify-between">
              <PriorityBadge priority={project.priority} />
            </div>

            <div className="flex items-start gap-1.5 rounded-lg bg-secondary/60 px-3 py-2 text-xs">
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
