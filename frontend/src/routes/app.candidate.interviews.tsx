import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Sparkles, Video } from "lucide-react";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { upcomingInterviews } from "@/mocks/data";

export const Route = createFileRoute("/app/candidate/interviews")({
  head: () => ({ meta: [{ title: "My Interviews · TalentForge AI" }] }),
  component: MyInterviews,
});

const questions = [
  "Walk me through the largest system you designed end-to-end.",
  "Describe a trade-off between velocity and correctness — what did you choose and why?",
  "How would you rearchitect a monolith serving 400 rps under budget?",
];

function MyInterviews() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader eyebrow="Upcoming" title="My Interviews" description="AI-prepped questions and rubric guides for every loop." />
      <div className="grid gap-4 md:grid-cols-2">
        {upcomingInterviews.map((i) => (
          <GlassCard key={i.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">{i.role}</p>
                <p className="text-xs text-muted-foreground">{i.company} · {i.type}</p>
              </div>
              <span className="rounded border border-aurora-violet/20 bg-aurora-violet/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-aurora-violet">upcoming</span>
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-aurora-cyan">
              <CalendarDays className="size-4" /> {i.when}
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Video className="size-3.5" /> Google Meet · Interviewer: {i.interviewer}
            </p>
          </GlassCard>
        ))}
      </div>
      <GlassCard className="bg-gradient-to-br from-aurora-violet/10 to-transparent">
        <div className="mb-3 inline-flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md surface-3 ring-1 ring-white/10"><Sparkles className="size-3.5 text-aurora-cyan" /></span>
          <h3 className="text-sm font-medium text-foreground">AI-prepped questions for your Northwind loop</h3>
        </div>
        <ol className="space-y-2 text-sm text-foreground/90">
          {questions.map((q, i) => (
            <li key={q} className="rounded-lg border hairline surface-1 p-3">
              <span className="mr-2 font-mono text-[11px] text-aurora-cyan">Q{i + 1}</span>{q}
            </li>
          ))}
        </ol>
      </GlassCard>
    </div>
  );
}