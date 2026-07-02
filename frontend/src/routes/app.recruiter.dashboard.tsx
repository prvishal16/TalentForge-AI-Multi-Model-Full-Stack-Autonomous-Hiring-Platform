import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Users,
  Briefcase,
  CalendarDays,
  Clock3,
  ArrowUpRight,
  Circle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/talent/PageHeader";
import { KpiCard } from "@/components/talent/KpiCard";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { CandidateAvatar } from "@/components/talent/CandidateAvatar";
import { MatchScoreBar } from "@/components/talent/MatchScore";
import { StageBadge } from "@/components/talent/StatusBadge";
import { activity, candidates, funnel, hiringTrend } from "@/mocks/data";
import { ProgressStreamDialog } from "@/components/interactions/ProgressStreamDialog";

export const Route = createFileRoute("/app/recruiter/dashboard")({
  head: () => ({
    meta: [
      { title: "Recruiter Dashboard · TalentForge AI" },
      { name: "description", content: "Real-time hiring KPIs, pipeline snapshot, and AI insights across your talent org." },
    ],
  }),
  component: RecruiterDashboard,
});

function RecruiterDashboard() {
  const total = funnel[0].value;
  const navigate = useNavigate();
  const [sweep, setSweep] = useState<null | "ai" | "talent">(null);
  const [runKey, setRunKey] = useState(0);

  function openSweep(kind: "ai" | "talent") {
    setRunKey((k) => k + 1);
    setSweep(kind);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="Overview · Q1 2026"
        title="Good morning, Alex"
        description="Your hiring loop moved 18 candidates forward yesterday. 3 offers are awaiting response."
        actions={
          <AuroraButton onClick={() => openSweep("ai")}>
            <Sparkles className="size-4" />
            Run AI Sweep
          </AuroraButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard index={0} label="Open Roles" value={12} delta="+2 mom" trend="up" sparkline={[3, 5, 4, 6, 8, 7, 12]} />
        <KpiCard index={1} label="In Pipeline" value={247} delta="+18 wow" trend="up" sparkline={[180, 190, 210, 215, 230, 240, 247]} />
        <KpiCard index={2} label="Interviews · this week" value={38} delta="12 today" trend="flat" sparkline={[4, 6, 5, 8, 6, 5, 4]} />
        <KpiCard index={3} label="Avg Time to Hire" value={"8.4"} unit="days" delta="-1.2d" trend="down" accent sparkline={[12, 11, 10, 10, 9, 9, 8.4]} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <GlassCard>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Application volume · last 8 weeks
                </p>
                <h2 className="mt-1 text-lg font-medium text-foreground">Hiring velocity</h2>
              </div>
              <div className="flex gap-2 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-aurora-violet" /> Applications</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-aurora-cyan" /> Interviews</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-aurora-emerald" /> Hires</span>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hiringTrend} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#c084fc" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,17,25,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                      color: "#fff",
                    }}
                    labelStyle={{ color: "white" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Area type="monotone" dataKey="applications" stroke="#c084fc" fill="url(#ga)" strokeWidth={2} />
                  <Area type="monotone" dataKey="interviews" stroke="#22d3ee" fill="url(#gb)" strokeWidth={2} />
                  <Area type="monotone" dataKey="hires" stroke="#34d399" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">Hiring funnel</h2>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                last 30 days
              </span>
            </div>
            <div className="space-y-3">
              {funnel.map((row, i) => {
                const width = (row.value / total) * 100;
                return (
                  <motion.div
                    key={row.stage}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="grid grid-cols-[80px_minmax(0,1fr)_60px] items-center gap-3"
                  >
                    <span className="text-xs text-muted-foreground">{row.stage}</span>
                    <div className="flex h-9 items-center rounded-lg surface-1">
                      <div
                        className="flex h-full items-center rounded-lg bg-gradient-to-r from-aurora-violet/60 via-aurora-indigo/50 to-aurora-cyan/60 px-3 text-xs font-medium text-foreground shadow-[0_0_20px_-8px_#c084fc]"
                        style={{ width: `${width}%`, minWidth: 40 }}
                      >
                        {row.value.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-right font-mono text-[10px] text-muted-foreground">
                      {((row.value / total) * 100).toFixed(0)}%
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">Top talent stream</h2>
              <a className="text-xs font-medium text-aurora-cyan hover:underline" href="/app/recruiter/candidates">
                View all candidates
              </a>
            </div>
            <div className="divide-y divide-white/5">
              {candidates.slice(0, 5).map((c) => (
                <div key={c.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 py-3">
                  <CandidateAvatar initials={c.initials} tint={c.avatarTint} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.role} · {c.location}
                    </p>
                  </div>
                  <StageBadge stage={c.stage} />
                  <MatchScoreBar score={c.matchScore} />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <GlassCard className="relative overflow-hidden bg-gradient-to-br from-aurora-violet/12 via-transparent to-aurora-cyan/8">
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-md surface-3 ring-1 ring-white/10">
                  <Sparkles className="size-3.5 text-aurora-cyan" />
                </span>
                <h2 className="text-sm font-medium text-foreground">Talent Insights</h2>
              </div>
              <span className="rounded border border-aurora-violet/20 bg-aurora-violet/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-aurora-violet">
                AI
              </span>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border hairline surface-1 p-3">
                <p className="text-sm leading-relaxed text-foreground/90">
                  <span className="text-aurora-cyan">Elena Rodriguez</span> matches 98% of Staff Designer requirements. Immediate advancement recommended.
                </p>
                <button className="mt-2 text-[11px] font-medium text-aurora-cyan hover:underline">
                  Fast-track candidate
                </button>
              </div>
              <div className="rounded-xl border hairline surface-1 p-3">
                <p className="text-sm leading-relaxed text-foreground/90">
                  Platform Engineer funnel has a 14% drop-off at technical screen. Review your rubric or the interview loop composition.
                </p>
                <button className="mt-2 text-[11px] font-medium text-aurora-cyan hover:underline">
                  Open rubric analysis
                </button>
              </div>
              <div className="rounded-xl border hairline surface-1 p-3">
                <p className="text-sm leading-relaxed text-foreground/90">
                  Demand for Rust developers is up 14% in your region. Consider adjusting comp bands.
                </p>
              </div>
            </div>
            <AuroraButton className="mt-5 w-full" onClick={() => openSweep("talent")}>
              Run Talent Sweep <ArrowUpRight className="size-4" />
            </AuroraButton>
          </GlassCard>

          <GlassCard>
            <h2 className="mb-4 text-sm font-medium text-foreground">Recent activity</h2>
            <div className="relative space-y-4 pl-4">
              <div className="absolute left-[5px] top-1 bottom-1 w-px surface-3" />
              {activity.map((a) => {
                const tone =
                  a.kind === "interview"
                    ? "bg-aurora-cyan"
                    : a.kind === "offer"
                    ? "bg-aurora-emerald"
                    : a.kind === "ai"
                    ? "bg-aurora-violet"
                    : "bg-muted-foreground";
                return (
                  <div key={a.id} className="relative">
                    <span className={`absolute -left-[13px] top-1.5 size-2.5 rounded-full ${tone} ring-4 ring-background`} />
                    <p className="text-xs font-medium text-foreground">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground">{a.detail}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">{a.time}</p>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="mb-3 text-sm font-medium text-foreground">Quick stats</h2>
            <div className="space-y-3 text-xs">
              {[
                { icon: Users, label: "Sourced by AI", value: "134" },
                { icon: Briefcase, label: "Roles filled QTD", value: "9" },
                { icon: CalendarDays, label: "Interview slots open", value: "22" },
                { icon: Clock3, label: "Response SLA", value: "97%" },
                { icon: Circle, label: "NPS from candidates", value: "68" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Icon className="size-3.5" />
                    {label}
                  </span>
                  <span className="font-mono text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <ProgressStreamDialog
        open={sweep === "ai"}
        autoRunKey={`ai-${runKey}`}
        title="AI Sweep across your entire pipeline"
        eyebrow="Run AI Sweep"
        steps={[
          { label: "Loading 1,284 active candidates", ms: 600 },
          { label: "Re-ranking against 12 open roles", ms: 800 },
          { label: "Detecting duplicate profiles", ms: 500 },
          { label: "Surfacing high-fit matches", ms: 700 },
          { label: "Generating recruiter recommendations", ms: 600 },
        ]}
        result={{
          headline: "12 high-fit candidates surfaced across 4 roles",
          bullets: [
            "Elena Rodriguez → Staff Product Designer · 98% match",
            "Marcus Chen → Senior Platform Engineer · 94% match",
            "3 candidates flagged for immediate outreach",
            "2 duplicate profiles merged automatically",
          ],
          ctaLabel: "View candidates",
          onCta: () => navigate({ to: "/app/recruiter/candidates" }),
        }}
        onClose={() => setSweep(null)}
      />

      <ProgressStreamDialog
        open={sweep === "talent"}
        autoRunKey={`talent-${runKey}`}
        title="Talent Sweep · market signals refresh"
        eyebrow="Run Talent Sweep"
        steps={[
          { label: "Pulling market comp bands for 12 roles", ms: 700 },
          { label: "Scanning talent supply across regions", ms: 800 },
          { label: "Detecting funnel drop-off patterns", ms: 600 },
          { label: "Synthesizing insights", ms: 600 },
        ]}
        result={{
          headline: "3 actionable talent insights refreshed",
          bullets: [
            "Rust supply up 14% in EU — consider expanding sourcing",
            "Platform Eng screen drop-off is 14% — review rubric",
            "Design comp bands lag market by 8% at Staff level",
          ],
          ctaLabel: "Open analytics",
          onCta: () => navigate({ to: "/app/recruiter/analytics" }),
        }}
        onClose={() => setSweep(null)}
      />
    </div>
  );
}