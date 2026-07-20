import { Check } from "lucide-react";

import { STAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Pipeline({ stage }: { stage: string }) {
  const current = STAGES.indexOf(stage as never);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {STAGES.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                active &&
                  "border-primary bg-primary text-primary-foreground shadow-sm",
                done && "border-primary/30 bg-primary/10 text-primary",
                !done &&
                  !active &&
                  "border-border bg-card text-muted-foreground"
              )}
            >
              {done && <Check className="h-3 w-3" />}
              {s}
            </div>
            {i < STAGES.length - 1 && (
              <span
                className={cn(
                  "hidden h-px w-4 sm:block",
                  i < current ? "bg-primary/40" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
