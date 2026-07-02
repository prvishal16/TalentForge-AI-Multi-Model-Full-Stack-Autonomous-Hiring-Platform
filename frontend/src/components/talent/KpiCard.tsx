import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  sparkline?: number[];
  accent?: boolean;
  index?: number;
}

export function KpiCard({
  label,
  value,
  unit,
  delta,
  trend = "flat",
  sparkline,
  accent = false,
  index = 0,
}: KpiCardProps) {
  const max = sparkline ? Math.max(...sparkline, 1) : 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard
        className={cn(
          "overflow-hidden",
          accent && "bg-gradient-to-br from-aurora-violet/10 via-transparent to-aurora-cyan/5",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono text-xs",
                trend === "up" && "text-aurora-emerald",
                trend === "down" && "text-rose-400",
                trend === "flat" && "text-muted-foreground",
              )}
            >
              {trend === "up" && <TrendingUp className="size-3" />}
              {trend === "down" && <TrendingDown className="size-3" />}
              {delta}
            </span>
          )}
        </div>
        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-3xl font-medium tracking-tight text-foreground tabular-nums">
            {value}
          </span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {sparkline && (
          <div className="mt-4 flex h-8 items-end gap-1">
            {sparkline.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-aurora-cyan/40"
                style={{ height: `${(v / max) * 100}%`, minHeight: 2 }}
              />
            ))}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}