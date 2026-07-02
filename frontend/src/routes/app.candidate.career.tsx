import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { candidateSkillGaps } from "@/mocks/data";

export const Route = createFileRoute("/app/candidate/career")({
  head: () => ({ meta: [{ title: "Career AI · TalentForge AI" }] }),
  component: Career,
});

const roadmap = [
  { title: "Now — Product Lead", body: "You're in the top 22% of Product Managers for fintech.", tone: "current" },
  { title: "6–12 mo — Senior PM", body: "Own a full P&L. Ship 2 externally-visible bets end-to-end.", tone: "near" },
  { title: "12–24 mo — Group PM", body: "Lead 3–5 PMs. Set roadmap for a $30M+ product line.", tone: "next" },
  { title: "24–36 mo — Director of Product", body: "Own strategy across a business unit.", tone: "future" },
];

function Career() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader eyebrow="Career AI" title="Your Roadmap" description="An honest, personalized path — refreshed as your profile grows." />

      <GlassCard>
        <div className="grid gap-4 md:grid-cols-4">
          {roadmap.map((r, i) => (
            <div key={r.title} className="rounded-xl border hairline bg-gradient-to-b from-white/[0.03] to-transparent p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-aurora-cyan">Step {i + 1}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{r.title}</p>
              <p className="mt-2 text-xs text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 text-sm font-medium text-foreground">Skill gaps to your next role</h3>
          <div className="space-y-3">
            {candidateSkillGaps.map((s) => {
              const gap = Math.max(0, s.target - s.have);
              return (
                <div key={s.skill}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-foreground">{s.skill}</span>
                    <span className="font-mono text-muted-foreground">{s.have} / target {s.target}</span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full surface-3">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-aurora-violet to-aurora-cyan" style={{ width: `${s.have}%` }} />
                    {gap > 0 && (
                      <div className="absolute inset-y-0 rounded-full surface-3" style={{ left: `${s.have}%`, width: `${gap}%` }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-aurora-violet/10 to-transparent">
          <h3 className="mb-2 text-sm font-medium text-foreground">Recommended learning</h3>
          <ul className="space-y-2 text-sm text-foreground/90">
            <li className="rounded-lg border hairline surface-1 p-3">Advanced Systems Design — 6-week cohort at StaffPlus.</li>
            <li className="rounded-lg border hairline surface-1 p-3">Interview prep loop: 12 mock system design sessions, AI-graded.</li>
            <li className="rounded-lg border hairline surface-1 p-3">Ship one open-source contribution to a distributed-systems project.</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}