import type { ReactNode } from "react";
import { GlassCard } from "./GlassCard";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <GlassCard className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && (
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-aurora-violet/20 to-aurora-cyan/20 text-foreground ring-1 ring-white/10">
          {icon}
        </div>
      )}
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </GlassCard>
  );
}