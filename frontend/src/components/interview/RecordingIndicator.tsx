import { motion } from "motion/react";

export function RecordingIndicator({ elapsedMs, paused }: { elapsedMs: number; paused?: boolean }) {
  const secs = Math.floor(elapsedMs / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 backdrop-blur-md">
      <motion.span
        className="size-2 rounded-full bg-rose-500"
        animate={paused ? { opacity: 0.4 } : { opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <span className="font-mono text-[11px] text-rose-100">{paused ? "PAUSED" : "REC"}</span>
      <span className="font-mono text-[11px] text-rose-100/70">{mm}:{ss}</span>
    </div>
  );
}