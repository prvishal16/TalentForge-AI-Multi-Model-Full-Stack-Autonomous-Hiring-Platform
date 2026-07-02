import { useEffect, useState } from "react";
import { motion } from "motion/react";

export function Countdown({ seconds, running, keyRef }: { seconds: number; running: boolean; keyRef: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { setElapsed(0); }, [keyRef]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running, keyRef]);
  const pct = Math.min(1, elapsed / seconds);
  const size = 44;
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  const remaining = Math.max(0, seconds - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(1, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return (
    <div className="relative grid place-items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={3} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={pct > 0.9 ? "rgb(244,63,94)" : "var(--color-aurora-cyan)"}
          strokeWidth={3} fill="none" strokeLinecap="round"
          strokeDasharray={c}
          animate={{ strokeDashoffset: c - c * pct }}
          transition={{ duration: 0.4 }}
        />
      </svg>
      <span className="absolute font-mono text-[10px] text-foreground">{mm}:{ss}</span>
    </div>
  );
}