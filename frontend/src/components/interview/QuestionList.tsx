import { useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, PlayCircle, RefreshCcw } from "lucide-react";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";
import type { Question } from "@/lib/interview/questions";
import { cn } from "@/lib/utils";

const CATEGORY_TINT: Record<Question["category"], string> = {
  Technical: "bg-aurora-cyan/15 text-aurora-cyan border-aurora-cyan/30",
  Projects: "bg-aurora-violet/15 text-aurora-violet border-aurora-violet/30",
  Behavioral: "bg-aurora-indigo/15 text-aurora-indigo border-aurora-indigo/30",
  "Problem Solving": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Communication: "bg-aurora-emerald/15 text-aurora-emerald border-aurora-emerald/30",
};

export function QuestionList({
  questions,
  onBack,
  onRegenerate,
  onStart,
}: {
  questions: Question[];
  onBack: () => void;
  onRegenerate: () => void;
  onStart: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {questions.map((q, i) => {
          const isOpen = open === q.id;
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard className="!p-0 overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : q.id)}
                  className="flex w-full items-start gap-4 p-4 text-left"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-aurora-violet/20 to-aurora-cyan/20 font-mono text-xs text-foreground ring-1 ring-white/10">
                    {q.index}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{q.text}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5", CATEGORY_TINT[q.category])}>{q.category}</span>
                      <span className="rounded-full surface-3 px-2 py-0.5 text-muted-foreground">{q.difficulty}</span>
                      <span className="font-mono text-muted-foreground">~{Math.round(q.estSeconds / 60)} min</span>
                    </div>
                  </div>
                  <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="border-t hairline surface-1 px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Hints</p>
                    <ul className="mt-2 space-y-1 text-xs text-foreground/85">
                      {q.hints.map((h) => <li key={h}>• {h}</li>)}
                    </ul>
                    {q.expectedSkills.length > 0 && (
                      <>
                        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Expected skills</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {q.expectedSkills.map((s) => (
                            <span key={s} className="rounded-md surface-3 px-2 py-0.5 text-[10px] text-foreground">{s}</span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button onClick={onBack} className="rounded-lg border hairline surface-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Back</button>
        <div className="flex items-center gap-2">
          <button onClick={onRegenerate} className="inline-flex items-center gap-1.5 rounded-lg border hairline surface-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            <RefreshCcw className="size-4" /> Regenerate
          </button>
          <AuroraButton onClick={onStart}><PlayCircle className="size-4" /> Start Interview</AuroraButton>
        </div>
      </div>
    </div>
  );
}