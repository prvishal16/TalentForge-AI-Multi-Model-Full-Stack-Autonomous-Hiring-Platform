import { cn } from "@/lib/utils";

export function Logo({
  showWordmark = true,
  size = 32,
  className,
}: {
  showWordmark?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative grid place-items-center rounded-lg bg-gradient-to-br from-aurora-violet via-aurora-indigo to-aurora-cyan shadow-[0_6px_20px_-6px_var(--color-aurora-violet)]"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="text-background">
          <path d="M4 6h16M4 12h10M4 18h6" />
          <circle cx="19" cy="17" r="3" />
        </svg>
      </div>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          TalentForge <span className="aurora-text">AI</span>
        </span>
      )}
    </div>
  );
}