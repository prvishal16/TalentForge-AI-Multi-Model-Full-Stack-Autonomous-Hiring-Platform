import { motion } from "motion/react";
import { Layers, Clock, Target, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";
import type { Analysis } from "@/lib/interview/types";

const CATEGORIES: { label: string; count: number; color: string }[] = [
  { label: "Technical", count: 4, color: "bg-aurora-cyan/15 text-aurora-cyan border-aurora-cyan/30" },
  { label: "Projects", count: 2, color: "bg-aurora-violet/15 text-aurora-violet border-aurora-violet/30" },
  { label: "Behavioral", count: 2, color: "bg-aurora-indigo/15 text-aurora-indigo border-aurora-indigo/30" },
  { label: "Problem Solving", count: 1, color: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { label: "Communication", count: 1, color: "bg-aurora-emerald/15 text-aurora-emerald border-aurora-emerald/30" },
];

export function Blueprint({
  analysis,
  onBack,
  onGenerate,
}: {
  analysis: Analysis;
  onBack: () => void;
  onGenerate: () => void;
}) {
  const difficulty = analysis.level === "Staff" || analysis.level === "Senior" ? "Hard" : analysis.level === "Junior" ? "Easy-Medium" : "Medium";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <GlassCard>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aurora-cyan">Interview Blueprint</p>
            <h3 className="mt-1 text-xl font-medium tracking-tight text-foreground">{analysis.role}</h3>
            <p className="text-sm text-muted-foreground">{analysis.level} · {analysis.years}+ years experience</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat icon={<Target className="size-3.5" />} label="Difficulty" value={difficulty} />
            <Stat icon={<Clock className="size-3.5" />} label="Est. duration" value="25–35 min" />
            <Stat icon={<Layers className="size-3.5" />} label="Questions" value="10" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span key={c.label} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${c.color}`}>
              {c.label} <span className="font-mono opacity-70">×{c.count}</span>
            </span>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border hairline surface-1 p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Detected skills</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {analysis.skills.slice(0, 12).map((s) => (
                <span key={s} className="rounded-md surface-3 px-2 py-0.5 text-[11px] text-foreground">{s}</span>
              ))}
              {!analysis.skills.length && <span className="text-xs text-muted-foreground">No skills matched — using generic bank.</span>}
            </div>
          </div>
          <div className="rounded-xl border hairline surface-1 p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Gaps vs JD</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {analysis.missingSkills.slice(0, 10).map((s) => (
                <span key={s} className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-200">{s}</span>
              ))}
              {!analysis.missingSkills.length && <span className="text-xs text-muted-foreground">Solid alignment.</span>}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-lg border hairline surface-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Back</button>
        <AuroraButton onClick={onGenerate}><TrendingUp className="size-4" /> Generate 10 questions</AuroraButton>
      </div>
    </motion.div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border hairline surface-1 px-3 py-2 text-center">
      <p className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{icon}{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}