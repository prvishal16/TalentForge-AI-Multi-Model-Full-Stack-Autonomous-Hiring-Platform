import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useReducer } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mic } from "lucide-react";
import { PageHeader } from "@/components/talent/PageHeader";
import { Stepper } from "@/components/interview/Stepper";
import { ResumeUpload, type UploadedResume } from "@/components/interview/ResumeUpload";
import { JDInput } from "@/components/interview/JDInput";
import { AnalysisRunner } from "@/components/interview/AnalysisRunner";
import { Blueprint } from "@/components/interview/Blueprint";
import { QuestionList } from "@/components/interview/QuestionList";
import { InterviewRunner } from "@/components/interview/InterviewRunner";
import { ReviewDashboard } from "@/components/interview/ReviewDashboard";
import { generateQuestions, type Question } from "@/lib/interview/questions";
import type { Analysis, RecordingResult } from "@/lib/interview/types";

export const Route = createFileRoute("/app/candidate/interview-studio")({
  head: () => ({
    meta: [
      { title: "InterviewIQ AI Studio · TalentForge AI" },
      { name: "description", content: "Practice interviews with an on-device AI panel — resume-aware questions, live face and posture insights, and a full self-review dashboard. Runs entirely in your browser." },
    ],
  }),
  component: InterviewStudio,
});

type Step = "upload" | "jd" | "analyze" | "blueprint" | "questions" | "interview" | "review";

type State = {
  step: Step;
  resume: UploadedResume | null;
  jd: string;
  analysis: Analysis | null;
  questions: Question[];
  recordings: RecordingResult[];
};

type Action =
  | { type: "SET_STEP"; step: Step }
  | { type: "SET_RESUME"; resume: UploadedResume | null }
  | { type: "SET_JD"; jd: string }
  | { type: "SET_ANALYSIS"; analysis: Analysis }
  | { type: "SET_QUESTIONS"; questions: Question[] }
  | { type: "SET_RECORDINGS"; recordings: RecordingResult[] }
  | { type: "RESET" };

const initial: State = {
  step: "upload", resume: null, jd: "",
  analysis: null, questions: [], recordings: [],
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "SET_STEP": return { ...s, step: a.step };
    case "SET_RESUME": return { ...s, resume: a.resume };
    case "SET_JD": return { ...s, jd: a.jd };
    case "SET_ANALYSIS": return { ...s, analysis: a.analysis };
    case "SET_QUESTIONS": return { ...s, questions: a.questions };
    case "SET_RECORDINGS": return { ...s, recordings: a.recordings };
    case "RESET": return initial;
  }
}

const STEPS = [
  { key: "upload", label: "Resume" },
  { key: "jd", label: "Job description" },
  { key: "analyze", label: "Analysis" },
  { key: "blueprint", label: "Blueprint" },
  { key: "questions", label: "Questions" },
  { key: "interview", label: "Interview" },
  { key: "review", label: "Review" },
];

function InterviewStudio() {
  const [state, dispatch] = useReducer(reducer, initial);
  const currentIdx = useMemo(() => STEPS.findIndex((s) => s.key === state.step), [state.step]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="InterviewIQ AI"
        title="AI Mock Interview Studio"
        description="Resume-aware questions, on-device face & posture insights, full self-review — every byte stays in your browser."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border hairline surface-1 px-3 py-1.5 text-xs text-muted-foreground">
            <Mic className="size-3.5 text-aurora-cyan" /> On-device AI
          </span>
        }
      />

      <Stepper steps={STEPS} current={currentIdx} />

      <AnimatePresence mode="wait">
        <motion.div
          key={state.step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {state.step === "upload" && (
            <ResumeUpload
              value={state.resume}
              onChange={(v) => dispatch({ type: "SET_RESUME", resume: v })}
              onContinue={() => dispatch({ type: "SET_STEP", step: "jd" })}
            />
          )}

          {state.step === "jd" && (
            <JDInput
              value={state.jd}
              onChange={(v) => dispatch({ type: "SET_JD", jd: v })}
              onBack={() => dispatch({ type: "SET_STEP", step: "upload" })}
              onContinue={() => dispatch({ type: "SET_STEP", step: "analyze" })}
            />
          )}

          {state.step === "analyze" && state.resume && (
            <AnalysisRunner
              resumeText={state.resume.text}
              jdText={state.jd}
              onDone={(a) => {
                dispatch({ type: "SET_ANALYSIS", analysis: a });
                dispatch({ type: "SET_STEP", step: "blueprint" });
              }}
            />
          )}

          {state.step === "blueprint" && state.analysis && (
            <Blueprint
              analysis={state.analysis}
              onBack={() => dispatch({ type: "SET_STEP", step: "jd" })}
              onGenerate={() => {
                const qs = generateQuestions(state.analysis!);
                dispatch({ type: "SET_QUESTIONS", questions: qs });
                dispatch({ type: "SET_STEP", step: "questions" });
              }}
            />
          )}

          {state.step === "questions" && (
            <QuestionList
              questions={state.questions}
              onBack={() => dispatch({ type: "SET_STEP", step: "blueprint" })}
              onRegenerate={() => {
                if (state.analysis) {
                  dispatch({ type: "SET_QUESTIONS", questions: generateQuestions(state.analysis) });
                }
              }}
              onStart={() => dispatch({ type: "SET_STEP", step: "interview" })}
            />
          )}

          {state.step === "interview" && (
            <InterviewRunner
              questions={state.questions}
              onFinish={(recs) => {
                dispatch({ type: "SET_RECORDINGS", recordings: recs });
                dispatch({ type: "SET_STEP", step: "review" });
              }}
            />
          )}

          {state.step === "review" && state.analysis && (
            <ReviewDashboard
              recordings={state.recordings}
              questions={state.questions}
              analysis={state.analysis}
              onRestart={() => {
                state.recordings.forEach((r) => URL.revokeObjectURL(r.url));
                dispatch({ type: "RESET" });
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}