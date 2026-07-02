import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { CandidateAvatar } from "@/components/talent/CandidateAvatar";
import { candidates, type Stage } from "@/mocks/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/recruiter/pipeline")({
  head: () => ({ meta: [{ title: "Pipeline · TalentForge AI" }] }),
  component: Pipeline,
});

const columns: Stage[] = ["Applied", "Screening", "Interview", "Technical", "Offer", "Hired"];

function Pipeline() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Kanban"
        title="Pipeline"
        description="Drag candidates across stages. AI auto-suggests advancements based on match score."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {columns.map((col, colIdx) => {
          const items = candidates.filter((c) => c.stage === col);
          return (
            <div key={col} className="rounded-2xl border hairline surface-1 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{col}</span>
                <span className="rounded-full surface-3 px-1.5 py-0.5 font-mono text-[10px] text-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: colIdx * 0.05 + i * 0.04 }}
                    className={cn(
                      "cursor-grab rounded-xl border hairline bg-background/70 p-3 backdrop-blur-md",
                      "transition-colors hover:hairline-strong hover:surface-1",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CandidateAvatar initials={c.initials} tint={c.avatarTint} size={28} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{c.role}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{c.appliedAt}</span>
                      <span className="font-mono text-aurora-cyan">{c.matchScore}%</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full surface-3">
                      <div className="h-full rounded-full bg-gradient-to-r from-aurora-violet to-aurora-cyan" style={{ width: `${c.matchScore}%` }} />
                    </div>
                  </motion.div>
                ))}
                {items.length === 0 && (
                  <div className="grid h-20 place-items-center rounded-xl border border-dashed hairline text-[10px] text-muted-foreground/60">
                    empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}