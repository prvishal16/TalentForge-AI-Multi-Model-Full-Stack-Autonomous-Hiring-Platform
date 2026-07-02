import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Mic, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { KpiCard } from "@/components/talent/KpiCard";
import { ScoreRing } from "@/components/talent/MatchScore";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { StageBadge } from "@/components/talent/StatusBadge";
import { AnnouncementBadge } from "@/components/talent/AnnouncementBadge";
import { ProgressStreamDialog } from "@/components/interactions/ProgressStreamDialog";
import { candidateApplications, upcomingInterviews } from "@/mocks/data";

export const Route = createFileRoute("/app/candidate/dashboard")({
  head: () => ({ meta: [{ title: "Candidate Overview · TalentForge AI" }] }),
  component: CandidateOverview,
});

function CandidateOverview() {
  const navigate = useNavigate();
  const [sweep, setSweep] = useState(false);
  const [improve, setImprove] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [score, setScore] = useState(82);
  const [applied, setApplied] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        eyebrow="Your career, on track"
        title="Welcome back, Priya"
        description="Your resume score improved by 6 points this week. 2 new roles match you above 90%."
        actions={
          <AuroraButton
            onClick={() => { setRunKey((k) => k + 1); setSweep(true); }}
          >
            <Sparkles className="size-4" /> AI Career Sweep
          </AuroraButton>
        }
      />

      <GlassCard className="group overflow-hidden bg-gradient-to-br from-aurora-violet/15 via-transparent to-aurora-cyan/10 transition-all hover:border-aurora-cyan/30 hover:shadow-[0_20px_60px_-30px_var(--color-aurora-cyan)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-aurora-violet to-aurora-cyan text-background">
              <Mic className="size-5" />
            </div>
            <div>
              <AnnouncementBadge>New release · InterviewIQ AI Studio</AnnouncementBadge>
              <h3 className="mt-2 text-lg font-medium text-foreground">Launch InterviewIQ AI Studio</h3>
              <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
                Upload your resume, paste a JD, and rehearse with an on-device AI panel — face & posture insights, live transcript, self-review dashboard.
              </p>
            </div>
          </div>
          <Link to="/app/candidate/interview-studio">
            <AuroraButton>Open Studio</AuroraButton>
          </Link>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <KpiCard index={0} label="Applications sent" value={12} delta="+3 this week" trend="up" />
          <KpiCard index={1} label="Interviews scheduled" value={3} delta="1 this week" trend="flat" />
          <KpiCard index={2} label="Profile views" value={148} delta="+42%" trend="up" sparkline={[20, 30, 24, 42, 36, 48, 60]} />
          <KpiCard index={3} label="Recruiter messages" value={7} delta="2 new" trend="up" accent />
        </div>

        <GlassCard className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-aurora-violet/10 to-transparent text-center">
          <ScoreRing score={score} size={140} label="Resume" />
          <div>
            <p className="text-sm font-medium text-foreground">Your resume score</p>
            <p className="mt-1 text-xs text-muted-foreground">Above 78% of engineers in your bracket.</p>
          </div>
          <AuroraButton className="w-full" onClick={() => setImprove(true)}>
            Improve with AI
          </AuroraButton>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Applications</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">last 30d</span>
          </div>
          <div className="divide-y divide-white/5">
            {candidateApplications.map((a) => (
              <div key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{a.role}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.company} · applied {a.appliedAt}</p>
                </div>
                <StageBadge stage={a.stage} />
                <span className="font-mono text-xs text-aurora-cyan">{a.matchScore}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-3 text-sm font-medium text-foreground">Upcoming interviews</h2>
          <div className="space-y-3">
            {upcomingInterviews.map((i) => (
              <div key={i.id} className="rounded-xl border hairline surface-1 p-3">
                <p className="text-sm font-medium text-foreground">{i.role}</p>
                <p className="text-xs text-muted-foreground">{i.company} · {i.type}</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-aurora-cyan">
                  <CalendarDays className="size-3" /> {i.when}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="bg-gradient-to-br from-aurora-violet/10 to-transparent">
        <div className="flex items-start gap-4">
          <div className="grid size-10 place-items-center rounded-xl surface-3 ring-1 ring-white/10">
            <TrendingUp className="size-5 text-aurora-cyan" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground">Personalized career insight</h3>
            <p className="mt-1 text-sm text-foreground/90">
              Adding a "Systems at scale" section referencing your Kafka work would lift your score to ~88 and better match Staff Engineer roles.
            </p>
            <div className="mt-3 flex gap-2 text-xs">
              <button
                disabled={applied}
                onClick={() => {
                  setApplied(true);
                  setScore((s) => Math.min(99, s + 6));
                  toast.success("Suggestion applied", {
                    description: "Added Systems at scale section · resume score 82 → 88.",
                  });
                }}
                className="rounded-lg surface-3 px-3 py-1.5 font-medium text-foreground hover:surface-3 disabled:opacity-60"
              >
                {applied ? "Applied ✓" : "Apply suggestion"}
              </button>
              <button
                onClick={() =>
                  toast.info("Why this matters", {
                    description:
                      "Staff Engineer JDs mention distributed systems, Kafka, and scale keywords 3× more often than mid-level roles. Adding this section closes the gap.",
                    duration: 6000,
                  })
                }
                className="rounded-lg border hairline px-3 py-1.5 text-muted-foreground hover:text-foreground"
              >
                Explain
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      <ProgressStreamDialog
        open={sweep}
        autoRunKey={`sweep-${runKey}`}
        title="AI Career Sweep · personalized signals"
        eyebrow="Career Sweep"
        steps={[
          { label: "Analyzing your resume", ms: 700 },
          { label: "Scanning 2,140 open roles in your bracket", ms: 900 },
          { label: "Matching skills against market demand", ms: 700 },
          { label: "Identifying skill gaps and learning paths", ms: 700 },
          { label: "Personalizing recommendations", ms: 500 },
        ]}
        result={{
          headline: "3 role recommendations + 2 learning suggestions",
          bullets: [
            "Staff Product Engineer at Orbital · 94% match",
            "Growth PM at Helios AI · 89% match",
            "Head of Payments at Meridian · 87% match",
            "Learn: Distributed systems fundamentals (6h course)",
            "Learn: Executive stakeholder communication (2h workshop)",
          ],
          ctaLabel: "Browse matched jobs",
          onCta: () => navigate({ to: "/app/candidate/jobs" }),
        }}
        onClose={() => setSweep(false)}
      />

      <ProgressStreamDialog
        open={improve}
        autoRunKey={`improve-${runKey}-${score}`}
        title="Improving your resume with AI"
        eyebrow="Improve with AI"
        steps={[
          { label: "Extracting current strengths", ms: 600 },
          { label: "Scanning for missing keywords vs top JDs", ms: 700 },
          { label: "Rewriting weak bullets with metrics", ms: 800 },
          { label: "Recalculating resume score", ms: 500 },
        ]}
        result={{
          headline: `Resume score improved · ${score} → ${Math.min(99, score + 5)}`,
          bullets: [
            "Added measurable outcomes to 4 Experience bullets",
            "Boosted keyword coverage for Staff Engineer JDs by 22%",
            "Tightened Summary to a 3-line elevator pitch",
            "Suggested a new 'Systems at scale' section",
          ],
          ctaLabel: "Open resume builder",
          onCta: () => {
            setScore((s) => Math.min(99, s + 5));
            navigate({ to: "/app/candidate/resume-builder" });
          },
        }}
        onClose={() => setImprove(false)}
      />
    </div>
  );
}