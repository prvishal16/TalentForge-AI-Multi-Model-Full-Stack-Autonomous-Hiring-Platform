import { useState } from "react";
import { motion } from "motion/react";
import { Download, FileJson, PlayCircle, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { DemoAIReview } from "./DemoAIReview";
import { MeterRing } from "./MeterRing";
import type { Question } from "@/lib/interview/questions";
import type { Analysis, RecordingResult } from "@/lib/interview/types";
import { cn } from "@/lib/utils";

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

const CAT_TINT: Record<string, string> = {
  Technical: "text-aurora-cyan",
  Projects: "text-aurora-violet",
  Behavioral: "text-aurora-indigo",
  "Problem Solving": "text-amber-300",
  Communication: "text-aurora-emerald",
};

export function ReviewDashboard({
  recordings, questions, analysis, onRestart,
}: {
  recordings: RecordingResult[];
  questions: Question[];
  analysis: Analysis;
  onRestart: () => void;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [openId, setOpenId] = useState<string | null>(recordings[0]?.questionId ?? null);

  const totalMs = recordings.reduce((s, r) => s + r.durationMs, 0);
  const avgAtt = recordings.length ? Math.round(recordings.reduce((s, r) => s + r.avgAttention, 0) / recordings.length) : 0;
  const avgPost = recordings.length ? Math.round(recordings.reduce((s, r) => s + r.avgPosture, 0) / recordings.length) : 0;
  const totalWords = recordings.reduce((s, r) => s + r.transcript.trim().split(/\s+/).filter(Boolean).length, 0);
  const avgWpm = recordings.length ? Math.round(recordings.reduce((s, r) => s + r.wpm, 0) / recordings.length) : 0;
  const totalFillers = recordings.reduce((s, r) => s + r.fillers, 0);

  const download = (r: RecordingResult, q: Question) => {
    const ext = r.mime.includes("mp4") ? "mp4" : "webm";
    const a = document.createElement("a");
    a.href = r.url;
    a.download = `interviewiq-Q${q.index}.${ext}`;
    a.click();
  };

  const exportJson = () => {
    const payload = {
      analysis, questions,
      recordings: recordings.map((r) => ({
        questionId: r.questionId, durationMs: r.durationMs, transcript: r.transcript,
        wpm: r.wpm, fillers: r.fillers, avgAttention: r.avgAttention, avgPosture: r.avgPosture,
        framingScore: r.framingScore,
      })),
      notes,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "interviewiq-session.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-6">
      <GlassCard className="bg-gradient-to-br from-aurora-violet/10 via-transparent to-aurora-cyan/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aurora-cyan">Interview complete</p>
            <h3 className="mt-1 text-xl font-medium tracking-tight text-foreground">
              {recordings.length}/{questions.length} answered · {fmt(totalMs)} on tape
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Every recording lives in your browser — replay, retake, or export whenever you're ready.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportJson} className="inline-flex items-center gap-1.5 rounded-lg border hairline surface-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
              <FileJson className="size-4" /> Export session
            </button>
            <AuroraButton onClick={onRestart}><RotateCcw className="size-4" /> Start over</AuroraButton>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatBox label="Avg attention" value={`${avgAtt}%`} />
          <StatBox label="Avg posture" value={`${avgPost}%`} />
          <StatBox label="Words spoken" value={totalWords.toLocaleString()} />
          <StatBox label="Avg pace" value={`${avgWpm} wpm`} />
          <StatBox label="Filler words" value={totalFillers} />
        </div>
      </GlassCard>

      <DemoAIReview recordings={recordings} questions={questions} analysis={analysis} />

      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Question-by-question replay</h3>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const r = recordings.find((x) => x.questionId === q.id);
            const isOpen = openId === q.id;
            return (
              <motion.div key={q.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <GlassCard className="!p-0 overflow-hidden">
                  <button
                    onClick={() => setOpenId(isOpen ? null : q.id)}
                    className="flex w-full items-start gap-4 p-4 text-left"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-aurora-violet/20 to-aurora-cyan/20 font-mono text-xs text-foreground ring-1 ring-white/10">
                      {q.index}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{q.text}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className={cn("font-mono uppercase tracking-widest", CAT_TINT[q.category])}>{q.category}</span>
                        {r ? (
                          <>
                            <span className="font-mono text-muted-foreground">{fmt(r.durationMs)}</span>
                            <span className="font-mono text-muted-foreground">{r.wpm} wpm</span>
                            <span className="font-mono text-muted-foreground">{r.fillers} fillers</span>
                          </>
                        ) : (
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-200">Skipped</span>
                        )}
                      </div>
                    </div>
                    <PlayCircle className={cn("size-5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-90 text-aurora-cyan")} />
                  </button>
                  {isOpen && r && (
                    <div className="grid gap-4 border-t hairline surface-1 p-4 md:grid-cols-[minmax(0,1fr)_320px]">
                      <div>
                        <video src={r.url} controls className="w-full rounded-xl border hairline bg-black" />
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button onClick={() => download(r, q)} className="inline-flex items-center gap-1.5 rounded-lg border hairline surface-1 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                            <Download className="size-3.5" /> Download
                          </button>
                        </div>
                        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Transcript</p>
                        <p className="mt-1 rounded-lg border hairline bg-black/20 p-3 text-xs text-foreground/85">
                          {r.transcript || <span className="text-muted-foreground italic">No transcript captured.</span>}
                        </p>
                        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Notes</p>
                        <textarea
                          value={notes[q.id] ?? ""}
                          onChange={(e) => setNotes({ ...notes, [q.id]: e.target.value })}
                          placeholder="What went well? What would you change?"
                          className="mt-1 h-20 w-full rounded-lg border hairline surface-1 p-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/40"
                        />
                      </div>
                      <div className="space-y-3">
                        <MeterRing value={r.avgAttention} label="Attention" sublabel={`${r.avgAttention}%`} size={60} />
                        <MeterRing value={r.avgPosture} label="Posture" sublabel={`${r.avgPosture}%`} size={60} />
                        <MeterRing value={r.framingScore} label="Framing" sublabel={`${r.framingScore}%`} size={60} />
                        <div className="rounded-lg border hairline bg-black/20 p-3 font-mono text-[10px] text-muted-foreground">
                          <p>duration: {fmt(r.durationMs)}</p>
                          <p>pace: {r.wpm} wpm</p>
                          <p>fillers: {r.fillers}</p>
                          <p>samples: {r.samples.length}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border hairline surface-1 p-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-medium text-foreground tabular-nums">{value}</p>
    </div>
  );
}