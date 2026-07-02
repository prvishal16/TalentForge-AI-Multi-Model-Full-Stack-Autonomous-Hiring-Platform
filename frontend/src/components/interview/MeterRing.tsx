import { motion } from "motion/react";

export function MeterRing({
  value,
  size = 56,
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  label?: string;
  sublabel?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const offset = c - (c * clamped) / 100;
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={3} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#meter-gradient)"
          strokeWidth={3} fill="none" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <defs>
          <linearGradient id="meter-gradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-aurora-violet)" />
            <stop offset="100%" stopColor="var(--color-aurora-cyan)" />
          </linearGradient>
        </defs>
      </svg>
      {(label || sublabel) && (
        <div className="min-w-0">
          {label && <p className="truncate text-xs font-medium text-foreground">{label}</p>}
          {sublabel && <p className="truncate font-mono text-[10px] text-muted-foreground">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}