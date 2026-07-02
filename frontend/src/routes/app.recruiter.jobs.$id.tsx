import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Sparkles, Users } from "lucide-react";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { CandidateAvatar } from "@/components/talent/CandidateAvatar";
import { MatchScoreBar } from "@/components/talent/MatchScore";
import { PriorityBadge, StageBadge } from "@/components/talent/StatusBadge";
import { candidates, jobs } from "@/mocks/data";

export const Route = createFileRoute("/app/recruiter/jobs/$id")({
  head: ({ params }) => {
    const job = jobs.find((j) => j.id === params.id);
    return {
      meta: [
        { title: `${job?.title ?? "Role"} · TalentForge AI` },
        { name: "description", content: job ? `${job.title} at Northwind — ${job.applicants} applicants, ${job.matchRate}% match rate.` : "Job details" },
      ],
    };
  },
  loader: ({ params }) => {
    const job = jobs.find((j) => j.id === params.id);
    if (!job) throw notFound();
    return { job };
  },
  component: JobDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl p-8 text-center">
      <h2 className="text-lg font-medium">Job not found</h2>
      <Link to="/app/recruiter/jobs" className="mt-2 inline-block text-aurora-cyan hover:underline">Back to jobs</Link>
    </div>
  ),
});

function JobDetail() {
  const { job } = Route.useLoaderData();
  const matches = candidates.filter((c) => c.appliedFor === job.title).sort((a, b) => b.matchScore - a.matchScore);
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link to="/app/recruiter/jobs" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> All jobs
      </Link>
      <PageHeader
        eyebrow={`${job.department} · ${job.type}`}
        title={job.title}
        description={`${job.applicants} applicants · Posted ${job.postedAt}`}
        actions={
          <>
            <PriorityBadge priority={job.priority} />
            <AuroraButton>
              <Sparkles className="size-4" /> Generate interview loop
            </AuroraButton>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <GlassCard>
            <h2 className="mb-3 text-sm font-medium text-foreground">Role summary</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We're hiring a {job.title.toLowerCase()} to help shape the next chapter of our {job.department.toLowerCase()} org.
              You will own end-to-end delivery, partner with cross-functional leadership, and set the bar for craft.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {["Ownership mindset", "6+ yrs experience", "System design", "Mentorship", "Remote friendly"].map((t) => (
                <span key={t} className="rounded-full border hairline surface-1 px-2.5 py-1 text-muted-foreground">{t}</span>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Top matches</h2>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Ranked by AI
              </span>
            </div>
            <div className="divide-y divide-white/5">
              {(matches.length ? matches : candidates.slice(0, 4)).map((c) => (
                <div key={c.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 py-3">
                  <CandidateAvatar initials={c.initials} tint={c.avatarTint} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.role} · {c.experience} yrs</p>
                  </div>
                  <StageBadge stage={c.stage} />
                  <MatchScoreBar score={c.matchScore} />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Details</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-foreground/90"><MapPin className="size-4 text-muted-foreground" /> {job.location}</li>
              <li className="flex items-center gap-2 text-foreground/90"><Users className="size-4 text-muted-foreground" /> {job.applicants} applicants</li>
              <li className="flex items-center gap-2 text-foreground/90"><Sparkles className="size-4 text-aurora-cyan" /> Match rate {job.matchRate}%</li>
            </ul>
          </GlassCard>
          <GlassCard className="bg-gradient-to-br from-aurora-violet/10 to-transparent">
            <h3 className="mb-2 text-sm font-medium text-foreground">AI recommendation</h3>
            <p className="text-sm text-foreground/90">
              Rebalance the interview loop — remove the 4th coding round, add a portfolio review, and cap total loop time at 4h. Expected time-to-hire savings: <span className="text-aurora-cyan">2.1 days</span>.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}