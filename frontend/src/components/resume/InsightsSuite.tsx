import { useMemo } from "react";
import { motion } from "motion/react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Sparkles, Target, Brain, Cloud, Lightbulb, History, GitCompare, Copy, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/talent/GlassCard";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/state/resumeStore";
import {
  computeAts,
  subScores,
  skillRadar,
  suggestImprovements,
  topStrengths,
  weakSection,
  missingKeywords,
  strongKeywords,
  passiveVoiceCount,
  careerAdvice,
  marketDemand,
  expectedSalary,
  priorityAction,
  recruiterVisibility,
  jobMatch,
  actionVerbs,
  impactScoreValue,
} from "@/lib/resume/intelligence";

export function InsightsSuite({
  versions,
  activeVersion,
  onRestore,
  onDuplicate,
}: {
  versions: { id: string; label: string; at: number }[];
  activeVersion: string;
  onRestore: (id: string) => void;
  onDuplicate: () => void;
}) {
  const r = useResumeStore((s) => s.resume!);
  const ats = useMemo(() => computeAts(r), [r]);
  const ss = useMemo(() => subScores(r), [r]);
  const sug = useMemo(() => suggestImprovements(r), [r]);
  const radar = useMemo(() => skillRadar(r), [r]);
  const sal = expectedSalary(r);

  return (
    <div className="space-y-4">
      {/* Score ring + metric bars + side cards */}
      <GlassCard>
        <div className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
          <div>
            <ScoreRing value={ats.overall} />
            <div className="mt-4 space-y-2">
              <Bar label="ATS Compatibility" value={ats.overall} />
              <Bar label="Grammar" value={ss.grammar} />
              <Bar label="Readability" value={ss.readability} />
              <Bar label="Keywords" value={ss.keywords} />
              <Bar label="Experience" value={ss.experience} />
              <Bar label="Projects" value={ss.projects} />
              <Bar label="Achievements" value={ss.achievements} />
              <Bar label="Formatting" value={ss.formatting} />
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-aurora-cyan">AI Insights · Always on</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">Career coach beside your resume</h3>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border hairline surface-2 px-2.5 py-1 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-aurora-emerald" /> Live suggestions active
            </span>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <InfoTile title="Top strengths" tone="emerald" body={topStrengths(r)} />
              <InfoTile title="Weak section" tone="amber" body={weakSection(r)} />
              <InfoTile title="Missing skills" tone="amber" body={missingKeywords(r).join(", ") || "None"} />
              <InfoTile title="Grammar" tone="neutral" body={`${passiveVoiceCount(r)} passive sentences`} />
              <InfoTile title="Career advice" tone="emerald" body={careerAdvice(r)} />
              <InfoTile title="Market demand" tone="emerald" body={marketDemand(r)} />
              <InfoTile title="Expected salary" tone="neutral" body={`${sal.currency}${sal.min}L–${sal.currency}${sal.max}L`} />
              <InfoTile title="Priority" tone="rose" body={priorityAction(r)} />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Action verbs + Impact score */}
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <p className="text-xs font-medium text-foreground">Action verbs</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {actionVerbs(r).length ? actionVerbs(r).join(", ") : "Start bullets with strong verbs (led, shipped, scaled, automated)"}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs font-medium text-foreground">Impact score</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {impactScoreValue(r)}/100 · {impactScoreValue(r) < 60 ? "improve with metrics" : "strong measurable outcomes"}
          </p>
        </GlassCard>
      </div>

      {/* Skills radar / ATS intel / Job matching */}
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard>
          <h4 className="flex items-center gap-2 text-sm font-medium text-foreground"><Brain className="size-4 text-aurora-cyan" /> Skills intelligence</h4>
          <div className="mt-2 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="75%">
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "rgb(148 163 184)", fontSize: 10 }} />
                <Radar dataKey="value" stroke="rgb(34 211 238)" fill="rgb(34 211 238)" fillOpacity={0.22} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h4 className="flex items-center gap-2 text-sm font-medium text-foreground"><Target className="size-4 text-aurora-cyan" /> ATS intelligence</h4>
          <div className="mt-3 space-y-2">
            <Bar label="Keyword match" value={ats.keywords} />
            <Bar label="Formatting score" value={ats.formatting} />
            <Bar label="Section score" value={ats.sectionCompleteness} />
            <Bar label="Recruiter visibility" value={recruiterVisibility(r)} />
          </div>
          <div className="mt-3 rounded-lg border hairline surface-2 p-2 text-[11px] leading-relaxed">
            <p><span className="text-rose-300">Missing:</span> {missingKeywords(r).join(", ") || "—"}</p>
            <p className="mt-1"><span className="text-aurora-emerald">Strong:</span> {strongKeywords(r).join(", ") || "—"}</p>
          </div>
        </GlassCard>

        <GlassCard>
          <h4 className="flex items-center gap-2 text-sm font-medium text-foreground"><Cloud className="size-4 text-aurora-cyan" /> Job matching</h4>
          <div className="mt-3 rounded-xl border border-dashed hairline p-4 text-center">
            <p className="text-xs font-medium text-foreground">Upload job description</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Instant match %, missing skills, and recommendations</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <MiniStat label="Match" value={`${jobMatch(r)}%`} />
            <MiniStat label="Salary" value={`${sal.currency}${sal.min}–${sal.max}L`} />
          </div>
        </GlassCard>
      </div>

      {/* Live suggestions + Version control */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h4 className="flex items-center gap-2 text-sm font-medium text-foreground"><Lightbulb className="size-4 text-aurora-cyan" /> Live suggestions</h4>
          <ul className="mt-3 space-y-2">
            {sug.slice(0, 6).map((s) => (
              <li key={s.id} className="flex items-start gap-2 rounded-lg border hairline surface-1 p-2.5">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-aurora-violet" />
                <div>
                  <p className="text-xs font-medium text-foreground">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground">{s.detail}</p>
                </div>
              </li>
            ))}
            {sug.length === 0 && <p className="text-xs text-muted-foreground">Resume looks strong — no critical suggestions.</p>}
          </ul>
        </GlassCard>

        <GlassCard>
          <h4 className="flex items-center gap-2 text-sm font-medium text-foreground"><History className="size-4 text-aurora-cyan" /> Version control</h4>
          <div className="mt-3 space-y-2">
            <button onClick={onDuplicate} className="flex w-full items-center gap-2 rounded-lg border hairline surface-1 px-3 py-2 text-xs text-foreground hover:surface-2">
              <Copy className="size-3.5" /> Duplicate current
            </button>
            <div className="rounded-lg border hairline surface-1 p-2">
              <p className="mb-1 flex items-center gap-1 text-[11px] text-muted-foreground"><GitCompare className="size-3" /> Auto-save timeline</p>
              <ul className="space-y-1">
                {versions.length === 0 && <li className="px-2 py-1 text-[11px] text-muted-foreground">No versions yet.</li>}
                {versions.map((v) => (
                  <li key={v.id} className="flex items-center justify-between rounded-md px-2 py-1 text-[11px] hover:surface-2">
                    <span className={cn("font-mono", v.id === activeVersion ? "text-aurora-cyan" : "text-foreground")}>{v.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{new Date(v.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <button onClick={() => onRestore(v.id)} className="inline-flex items-center gap-1 rounded-md border hairline px-1.5 py-0.5 text-[10px] text-foreground hover:surface-2">
                        <RotateCcw className="size-3" /> Restore
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function ScoreRing({ value }: { value: number }) {
  const size = 180;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative mx-auto grid size-[180px] place-items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-4xl font-semibold text-foreground">{value}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">/ 100</p>
        </div>
      </div>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full surface-3">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-aurora-violet to-aurora-cyan"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function InfoTile({ title, body, tone }: { title: string; body: string; tone: "emerald" | "amber" | "rose" | "neutral" }) {
  const toneMap: Record<string, string> = {
    emerald: "text-aurora-emerald",
    amber: "text-amber-300",
    rose: "text-rose-300",
    neutral: "text-foreground",
  };
  return (
    <div className="rounded-xl border hairline surface-2 p-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{title}</p>
      <p className={cn("mt-1 text-sm font-medium", toneMap[tone])}>{body}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border hairline surface-2 p-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}