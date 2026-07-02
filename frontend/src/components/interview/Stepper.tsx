import { Check } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type StepDef = { key: string; label: string };

export function Stepper({ steps, current }: { steps: StepDef[]; current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 rounded-2xl border hairline surface-1 p-3 backdrop-blur-md">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.key} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <motion.span
                layout
                className={cn(
                  "grid size-6 place-items-center rounded-full font-mono text-[10px]",
                  done && "bg-aurora-emerald/20 text-aurora-emerald ring-1 ring-aurora-emerald/30",
                  active && "bg-gradient-to-br from-aurora-violet to-aurora-cyan text-background",
                  !done && !active && "surface-3 text-muted-foreground ring-1 ring-white/10",
                )}
              >
                {done ? <Check className="size-3" /> : i + 1}
              </motion.span>
              <span
                className={cn(
                  "text-xs",
                  active ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span className="mx-1 h-px w-6 bg-white/10" />
            )}
          </li>
        );
      })}
    </ol>
  );
}