import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarPlus, Video, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { CandidateAvatar } from "@/components/talent/CandidateAvatar";
import { candidates, jobs } from "@/mocks/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/recruiter/interviews")({
  head: () => ({ meta: [{ title: "Interviews · TalentForge AI" }] }),
  component: Interviews,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const hours = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

type Slot = {
  id: string;
  day: number;
  hour: number;
  candId: string;
  role: string;
  kind: string;
};

const initial: Slot[] = [
  { id: "s1", day: 3, hour: 1, candId: "c3", role: "AI Research Engineer", kind: "System Design" },
  { id: "s2", day: 3, hour: 4, candId: "c2", role: "Senior Platform Engineer", kind: "Technical" },
  { id: "s3", day: 1, hour: 2, candId: "c1", role: "Staff Product Designer", kind: "Portfolio" },
  { id: "s4", day: 4, hour: 6, candId: "c8", role: "Security Engineer", kind: "Loop close" },
  { id: "s5", day: 2, hour: 5, candId: "c5", role: "Product Lead", kind: "Culture" },
];

function Interviews() {
  const [slots, setSlots] = useState<Slot[]>(initial);
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        eyebrow="Feb 24 — Feb 28"
        title="Interview Schedule"
        description="Auto-balanced against interviewer bandwidth and time-zone constraints."
        actions={
          <AuroraButton onClick={() => setOpen(true)}>
            <CalendarPlus className="size-4" /> Schedule interview
          </AuroraButton>
        }
      />

      <GlassCard className="!p-0 overflow-hidden">
        <div className="grid grid-cols-[80px_repeat(5,minmax(0,1fr))] border-b hairline">
          <div />
          {days.map((d) => (
            <div key={d} className="border-l hairline px-3 py-3">
              <p className="text-xs font-medium text-foreground">{d}</p>
              <p className="text-[10px] text-muted-foreground">Feb {24 + days.indexOf(d)}</p>
            </div>
          ))}
        </div>
        {hours.map((h, hIdx) => (
          <div key={h} className="grid grid-cols-[80px_repeat(5,minmax(0,1fr))] border-b hairline last:border-b-0">
            <div className="border-r hairline px-3 py-4 font-mono text-[10px] text-muted-foreground">{h}</div>
            {days.map((_, dIdx) => {
              const slot = slots.find((s) => s.day === dIdx && s.hour === hIdx);
              const cand = slot ? candidates.find((c) => c.id === slot.candId) : null;
              return (
                <div key={dIdx} className={cn("border-l hairline p-1.5")}>
                  {slot && cand && (
                    <div className="group cursor-pointer rounded-lg border hairline bg-gradient-to-br from-aurora-violet/15 to-aurora-cyan/10 p-2 backdrop-blur-md transition-all hover:from-aurora-violet/25 hover:to-aurora-cyan/20">
                      <div className="flex items-center gap-1.5">
                        <CandidateAvatar initials={cand.initials} tint={cand.avatarTint} size={20} />
                        <p className="truncate text-[11px] font-medium text-foreground">{cand.name}</p>
                      </div>
                      <p className="mt-1 truncate text-[10px] text-muted-foreground">{slot.kind}</p>
                      <div className="mt-1 inline-flex items-center gap-1 rounded surface-3 px-1 py-0.5 text-[9px] text-muted-foreground">
                        <Video className="size-2.5" /> Meet
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </GlassCard>

      <ScheduleInterviewSheet
        open={open}
        onClose={() => setOpen(false)}
        onSchedule={(s) => {
          setSlots((cur) => [...cur, s]);
          const cand = candidates.find((c) => c.id === s.candId);
          toast.success("Interview scheduled", {
            description: `${cand?.name ?? "Candidate"} · ${days[s.day]} ${hours[s.hour]} · ${s.kind}`,
          });
          setOpen(false);
        }}
      />
    </div>
  );
}

function ScheduleInterviewSheet({
  open,
  onClose,
  onSchedule,
}: {
  open: boolean;
  onClose: () => void;
  onSchedule: (s: Slot) => void;
}) {
  const [candId, setCandId] = useState(candidates[0].id);
  const [jobId, setJobId] = useState(jobs[0].id);
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(1);
  const [kind, setKind] = useState("Technical");
  const [notes, setNotes] = useState("");

  const roleTitle = useMemo(() => jobs.find((j) => j.id === jobId)?.title ?? "", [jobId]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (notes.length > 400) return;
    onSchedule({
      id: `s-${Date.now()}`,
      day,
      hour,
      candId,
      role: roleTitle,
      kind,
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Schedule interview"
            className="fixed right-0 top-0 z-50 flex h-full w-[min(520px,100vw)] flex-col border-l hairline bg-background/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-start justify-between border-b hairline p-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-aurora-cyan">Schedule</p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">New interview</h2>
              </div>
              <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:surface-1 hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={submit} className="flex-1 space-y-4 overflow-y-auto p-5">
              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground">Candidate</span>
                <select
                  value={candId}
                  onChange={(e) => setCandId(e.target.value)}
                  className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} · {c.role}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground">Role</span>
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">Day</span>
                  <select
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                    className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none"
                  >
                    {days.map((d, i) => <option key={d} value={i}>{d}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">Time</span>
                  <select
                    value={hour}
                    onChange={(e) => setHour(Number(e.target.value))}
                    className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none"
                  >
                    {hours.map((h, i) => <option key={h} value={i}>{h}</option>)}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground">Interview type</span>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                  className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none"
                >
                  {["Screening", "Technical", "System Design", "Portfolio", "Culture", "Loop close", "Final"].map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground">Notes (optional)</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  maxLength={400}
                  placeholder="Focus areas, panelists, links…"
                  className="w-full resize-none rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40"
                />
              </label>

              <div className="flex items-center justify-end gap-2 border-t hairline pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground hover:surface-2"
                >
                  Cancel
                </button>
                <AuroraButton type="submit">
                  <CalendarPlus className="size-4" /> Schedule
                </AuroraButton>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}