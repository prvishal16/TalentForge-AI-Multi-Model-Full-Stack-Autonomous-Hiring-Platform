import { cn } from "@/lib/utils";

export function MatchScoreBar({ score, className }: { score: number; className?: string }) {
  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Match
        </span>
        <span className="font-mono text-xs text-aurora-cyan">{score}%</span>
      </div>
      <div className="h-1 w-24 overflow-hidden rounded-full surface-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-aurora-violet to-aurora-cyan shadow-[0_0_10px_var(--color-aurora-cyan)]"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreRing({
  score,
  size = 96,
  label,
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth="4" stroke="rgba(255,255,255,0.08)" fill="transparent" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth="4"
          stroke={`url(#ring-${size})`}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xl font-medium tabular-nums text-foreground">{score}</span>
        {label && <span className="mt-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}