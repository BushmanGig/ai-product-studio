import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function GenerationSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-border/80 bg-card/70 p-4" aria-live="polite">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="h-2 w-2 animate-pulse-soft rounded-full bg-primary" />
        Generating…
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 animate-progress-indeterminate rounded-full bg-primary/70" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16 sm:col-span-2" />
      </div>
    </div>
  );
}
