import { cn } from "@/lib/utils";
import type { Stage } from "@/mocks/data";

const stageStyles: Record<Stage, string> = {
  Applied: "surface-1 text-zinc-300 hairline",
  Screening: "bg-aurora-cyan/10 text-aurora-cyan border-aurora-cyan/20",
  Interview: "bg-aurora-indigo/10 text-aurora-indigo border-aurora-indigo/20",
  Technical: "bg-aurora-violet/10 text-aurora-violet border-aurora-violet/20",
  Offer: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Hired: "bg-aurora-emerald/10 text-aurora-emerald border-aurora-emerald/20",
  Rejected: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        stageStyles[stage],
        className,
      )}
    >
      {stage}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: "P0" | "P1" | "P2" }) {
  const map = {
    P0: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    P1: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    P2: "surface-1 text-zinc-400 hairline",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px]",
        map[priority],
      )}
    >
      {priority}
    </span>
  );
}