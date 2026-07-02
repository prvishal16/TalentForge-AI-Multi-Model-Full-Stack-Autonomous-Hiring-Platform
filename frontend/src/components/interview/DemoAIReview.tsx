import { motion } from "motion/react";
import { Sparkles, TrendingUp, TriangleAlert } from "lucide-react";
import { GlassCard } from "@/components/talent/GlassCard";
import { scoreOverall } from "@/lib/interview/scoring";
import type { Question } from "@/lib/interview/questions";
import type { Analysis, RecordingResult } from "@/lib/interview/types";

export function DemoAIReview({
  recordings, questions, analysis,
}: {
  recordings: RecordingResult[];
  questions: Question[];
  analysis: Analysis;
}) {
  const review = scoreOverall(recordings, questions, analysis);
  const size = 220;
  const cx = size / 2;
  const points = review.subScores.map((s, i) => {
    const angle = (Math.PI * 2 * i) / review.subScores.length - Math.PI / 2;
    const r = ((s.score / 100) * (size / 2 - 24));
    return { x: cx + Math.cos(angle) * r, y: cx + Math.sin(angle) * r, label: s.label, angle, score: s.score };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
  const grid = [0.25, 0.5, 0.75, 1];

  return (
    <div className="space-y-4">
      <GlassCard className="bg-gradient-to-br from-aurora-violet/10 via-transparent to-aurora-cyan/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-amber-200">
              <Sparkles className="size-3" /> Demo AI Review · mock analysis
            </span>
            <h3 className="mt-3 text-2xl font-medium tracking-tight text-foreground">Interview Readiness</h3>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              Derived from your real captured metrics — face attention, posture, transcript, and skill alignment. No cloud AI involved.
            </p>
          </div>
          <ReadinessRing score={review.overall} />
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <GlassCard>
          <h4 className="text-sm font-medium text-foreground">Skill radar</h4>
          <div className="mt-2 flex justify-center">
            <svg width={size} height={size} className="text-foreground">
              {grid.map((g) => (
                <polygon
                  key={g}
                  points={review.subScores.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / review.subScores.length - Math.PI / 2;
                    const r = g * (size / 2 - 24);
                    return `${cx + Math.cos(angle) * r},${cx + Math.sin(angle) * r}`;
                  }).join(" ")}
                  fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1}
                />
              ))}
              <motion.path
                d={path}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
                fill="url(#radar-fill)" stroke="var(--color-aurora-cyan)" strokeWidth={1.5}
              />
              <defs>
                <linearGradient id="radar-fill" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-aurora-violet)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-aurora-cyan)" stopOpacity={0.25} />
                </linearGradient>
              </defs>
              {points.map((p) => (
                <g key={p.label}>
                  <circle cx={p.x} cy={p.y} r={3} fill="var(--color-aurora-cyan)" />
                  <text
                    x={cx + Math.cos(p.angle) * (size / 2 - 6)}
                    y={cx + Math.sin(p.angle) * (size / 2 - 6)}
                    fontSize={9} textAnchor="middle" dominantBaseline="middle"
                    className="fill-muted-foreground font-mono uppercase tracking-widest"
                  >
                    {p.label.split(" ")[0]}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </GlassCard>

        <GlassCard>
          <h4 className="text-sm font-medium text-foreground">Sub-scores</h4>
          <div className="mt-3 space-y-2.5">
            {review.subScores.map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{s.label}</span>
                  <span className="font-mono text-muted-foreground">{s.score}/100</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full surface-3">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-aurora-violet to-aurora-cyan"
                    initial={{ width: 0 }} animate={{ width: `${s.score}%` }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">{s.note}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <h4 className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <TrendingUp className="size-4 text-aurora-emerald" /> Strengths
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-foreground/90">
            {review.strengths.map((s) => <li key={s} className="rounded-lg border hairline surface-1 p-3">{s}</li>)}
          </ul>
        </GlassCard>
        <GlassCard>
          <h4 className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <TriangleAlert className="size-4 text-amber-300" /> Focus areas
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-foreground/90">
            {review.improvements.map((s) => <li key={s} className="rounded-lg border hairline surface-1 p-3">{s}</li>)}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

function ReadinessRing({ score }: { score: number }) {
  const size = 120;
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={6} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#ready-grad)" strokeWidth={6} strokeLinecap="round" fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * score) / 100 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
        <defs>
          <linearGradient id="ready-grad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-aurora-violet)" />
            <stop offset="100%" stopColor="var(--color-aurora-cyan)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute grid place-items-center">
        <span className="text-3xl font-medium tabular-nums text-foreground">{score}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Overall</span>
      </div>
    </div>
  );
}