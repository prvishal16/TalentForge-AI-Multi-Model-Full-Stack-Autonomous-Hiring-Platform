import { cn } from "@/lib/utils";

export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <div className="absolute -left-[10%] -top-[15%] size-[55vw] rounded-full bg-aurora-violet/25 blur-[120px] animate-aurora" />
      <div
        className="absolute -right-[12%] top-[30%] size-[50vw] rounded-full bg-aurora-cyan/20 blur-[130px] animate-aurora"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="absolute left-[20%] bottom-[-20%] size-[45vw] rounded-full bg-aurora-indigo/15 blur-[140px] animate-aurora"
        style={{ animationDelay: "-8s" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,var(--color-background)_75%)]" />
    </div>
  );
}