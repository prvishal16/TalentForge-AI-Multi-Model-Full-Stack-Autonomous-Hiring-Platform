import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Mail, MapPin, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { CandidateAvatar } from "@/components/talent/CandidateAvatar";
import { ScoreRing } from "@/components/talent/MatchScore";
import { StageBadge } from "@/components/talent/StatusBadge";
import { candidates } from "@/mocks/data";

export const Route = createFileRoute("/app/recruiter/candidates/$id")({
  head: ({ params }) => {
    const c = candidates.find((x) => x.id === params.id);
    return { meta: [{ title: `${c?.name ?? "Candidate"} · TalentForge AI` }] };
  },
  loader: ({ params }) => {
    const c = candidates.find((x) => x.id === params.id);
    if (!c) throw notFound();
    return { c };
  },
  component: CandidateDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl p-8 text-center">
      <h2 className="text-lg font-medium">Candidate not found</h2>
      <Link to="/app/recruiter/candidates" className="mt-2 inline-block text-aurora-cyan hover:underline">Back to candidates</Link>
    </div>
  ),
});

function CandidateDetail() {
  const { c } = Route.useLoaderData();
  const timeline = [
    { when: c.appliedAt, title: "Applied", detail: `for ${c.appliedFor}` },
    { when: "1 day ago", title: "Auto-screened", detail: `AI matched ${c.matchScore}% — advanced to Screening` },
    { when: "6 hours ago", title: "Recruiter reviewed", detail: "Alex Rivera left a note: 'strong signal'" },
    { when: "now", title: "Awaiting decision", detail: "Recommended for technical loop" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link to="/app/recruiter/candidates" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> All candidates
      </Link>

      <GlassCard>
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 md:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
          <CandidateAvatar initials={c.initials} tint={c.avatarTint} size={72} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-medium text-foreground">{c.name}</h1>
              <StageBadge stage={c.stage} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {c.role} · {c.experience} yrs · applied for <span className="text-foreground">{c.appliedFor}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" /> {c.location}</span>
              <span className="inline-flex items-center gap-1.5"><Mail className="size-3.5" /> {c.email}</span>
            </div>
          </div>
          <div className="hidden md:block">
            <ScoreRing score={c.matchScore} label="Match" />
          </div>
          <AuroraButton>
            <Sparkles className="size-4" /> Generate interview
          </AuroraButton>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <GlassCard>
            <h3 className="mb-4 text-sm font-medium text-foreground">Skill graph</h3>
            <div className="space-y-3">
              {c.skills.map((s: string, i: number) => {
                const val = 70 + ((i * 37) % 30);
                return (
                  <div key={s} className="grid grid-cols-[140px_minmax(0,1fr)_40px] items-center gap-3">
                    <span className="text-sm text-foreground">{s}</span>
                    <div className="h-1.5 overflow-hidden rounded-full surface-3">
                      <div className="h-full rounded-full bg-gradient-to-r from-aurora-violet to-aurora-cyan" style={{ width: `${val}%` }} />
                    </div>
                    <span className="text-right font-mono text-xs text-muted-foreground">{val}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="mb-4 text-sm font-medium text-foreground">Timeline</h3>
            <div className="relative space-y-4 pl-4">
              <div className="absolute left-[5px] top-1 bottom-1 w-px surface-3" />
              {timeline.map((t) => (
                <div key={t.title} className="relative">
                  <span className="absolute -left-[13px] top-1.5 size-2.5 rounded-full bg-aurora-cyan ring-4 ring-background" />
                  <p className="text-sm font-medium text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.detail}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">{t.when}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Resume score</h3>
              <span className="rounded border border-aurora-violet/20 bg-aurora-violet/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-aurora-violet">AI</span>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <ScoreRing score={c.resumeScore} size={140} label="ATS" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Strong in {c.skills.slice(0, 2).join(" and ")}. Consider asking about testing depth and mentorship experience in the loop.
            </p>
          </GlassCard>

          <GlassCard className="bg-gradient-to-br from-aurora-violet/10 to-transparent">
            <h3 className="mb-2 text-sm font-medium text-foreground">AI recommendations</h3>
            <ul className="space-y-2 text-sm text-foreground/90">
              <li>· Fast-track — 3 previous candidates with similar profile were hired.</li>
              <li>· Assign Sarah as interviewer — highest signal match.</li>
              <li>· Skip take-home; portfolio already covers signal.</li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}