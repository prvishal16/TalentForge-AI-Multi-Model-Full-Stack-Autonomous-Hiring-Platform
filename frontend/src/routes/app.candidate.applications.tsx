import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { StageBadge } from "@/components/talent/StatusBadge";
import { candidateApplications } from "@/mocks/data";

export const Route = createFileRoute("/app/candidate/applications")({
  head: () => ({ meta: [{ title: "Applications · TalentForge AI" }] }),
  component: Apps,
});

function Apps() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader eyebrow={`${candidateApplications.length} applications`} title="My Applications" description="Track every stage of your job search in one view." />
      <GlassCard className="!p-0 overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_180px_120px_100px] border-b hairline px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Role · Company</span>
          <span>Stage</span>
          <span>Applied</span>
          <span className="text-right">Match</span>
        </div>
        <div className="divide-y divide-white/5">
          {candidateApplications.map((a) => (
            <div key={a.id} className="grid grid-cols-[minmax(0,1fr)_180px_120px_100px] items-center px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{a.role}</p>
                <p className="truncate text-xs text-muted-foreground">{a.company}</p>
              </div>
              <StageBadge stage={a.stage} />
              <span className="text-xs text-muted-foreground">{a.appliedAt}</span>
              <span className="text-right font-mono text-sm text-aurora-cyan">{a.matchScore}%</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}