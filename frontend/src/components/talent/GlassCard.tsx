import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function GlassCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border hairline surface-1 p-6 elev-1 backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-200",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GradientBorderCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-[1px]",
        "bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-aurora-violet)_50%,transparent),color-mix(in_oklab,var(--color-aurora-cyan)_40%,transparent))]",
        className,
      )}
      {...props}
    >
      <div className="rounded-[15px] bg-background/80 p-6 backdrop-blur-md">
        {children}
      </div>
    </div>
  );
}