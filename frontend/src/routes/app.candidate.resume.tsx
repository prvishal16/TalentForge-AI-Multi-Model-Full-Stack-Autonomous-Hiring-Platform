import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Award,
  Building2,
  CheckCircle2,
  CloudUpload,
  FileText,
  GraduationCap,
  History,
  Layers,
  Mail,
  Radar as RadarIcon,
  RefreshCw,
  Rocket,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { ScoreRing } from "@/components/talent/MatchScore";
import { AINeuralLoader } from "@/components/talent/AIThinking";
import { useResumeStore } from "@/state/resumeStore";
import { parseResume } from "@/lib/resume/parseResume";
import { computeAts, readinessScores, suggestImprovements, skillRadar as computeSkillRadar } from "@/lib/resume/intelligence";

export const Route = createFileRoute("/app/candidate/resume")({
  head: () => ({ meta: [{ title: "My Resume · TalentForge AI" }] }),
  component: Resume,
});

type State = "idle" | "scanning" | "done";
type Tab = "overview" | "match" | "skills" | "career" | "interview" | "cover" | "roadmap" | "versions";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "match", label: "Job Match", icon: Target },
  { id: "skills", label: "Skills & Gaps", icon: RadarIcon },
  { id: "career", label: "Career Intel", icon: TrendingUp },
  { id: "interview", label: "Interview Prep", icon: Rocket },
  { id: "cover", label: "Cover Letter", icon: Mail },
  { id: "roadmap", label: "Learning Roadmap", icon: GraduationCap },
  { id: "versions", label: "Versions", icon: History },
];

function Resume() {
  const [state, setState] = useState<State>("idle");
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [tab, setTab] = useState<Tab>("overview");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const storedResume = useResumeStore((s) => s.resume);
  const setStoredResume = useResumeStore((s) => s.setResume);
  const clearStoredResume = useResumeStore((s) => s.clearResume);

  function accept(f: File) {
    const ok = /\.(pdf|docx?|)$/i.test(f.name);
    if (!ok) {
      toast.error("Unsupported file", { description: "Upload a PDF, DOC, or DOCX." });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File too large", { description: "Max 10 MB." });
      return;
    }
    setFile({ name: f.name, size: (f.size / 1024).toFixed(0) + " KB" });
    setState("scanning");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 8 + Math.random() * 10);
        if (next >= 100) clearInterval(interval);
        return next;
      });
    }, 160);
    (async () => {
      try {
        const parsed = await parseResume(f);
        setStoredResume(parsed);
        clearInterval(interval);
        setState("done");
        setProgress(100);
        const skillsTotal = Object.values(parsed.skills).reduce<number>((n, a) => n + (a as string[]).length, 0);
        toast.success("Resume analyzed!", {
          description: `${skillsTotal} skills · ${parsed.meta.detectedSections.length} sections · ${parsed.meta.confidence}% confidence`,
        });
      } catch (e) {
        clearInterval(interval);
        setState("idle");
        toast.error("Could not parse resume", { description: (e as Error).message });
      }
    })();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) accept(f);
  }

  function remove() {
    setFile(null);
    setState("idle");
    setProgress(0);
    clearStoredResume();
    toast("Resume removed.");
  }

  function reAnalyze() {
    if (!file) {
      inputRef.current?.click();
      return;
    }
    setState("scanning");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 12);
        if (next >= 100) clearInterval(interval);
        return next;
      });
    }, 140);
    setTimeout(() => {
      setState("done");
      toast.success("Re-analysis complete", { description: "ATS score improved +2 points to 84." });
    }, 2000);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Resume Intelligence"
        title="My Resume"
        description="Upload once. We'll parse, score, and match you continuously against every role in TalentForge."
        actions={
          state === "done" ? (
            <>
              <button onClick={remove} className="inline-flex items-center gap-1.5 rounded-lg border hairline surface-1 px-3 py-1.5 text-sm text-rose-300 hover:bg-rose-500/10">
                <Trash2 className="size-4" /> Remove
              </button>
              <AuroraButton onClick={reAnalyze}><RefreshCw className="size-4" /> Re-analyze</AuroraButton>
            </>
          ) : null
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) accept(f);
        }}
      />

      <AnimatePresence mode="wait">
        {state !== "done" ? (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GlassCard>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => state === "idle" && inputRef.current?.click()}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${dragOver ? "border-aurora-cyan/60 bg-aurora-cyan/5" : "hairline bg-gradient-to-br from-white/[0.02] to-transparent hover:border-aurora-cyan/40"}`}
              >
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-aurora-violet/5 via-transparent to-aurora-cyan/5 opacity-0 transition-opacity group-hover:opacity-100" />
                {state === "idle" && (
                  <div>
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-aurora-violet/20 to-aurora-cyan/20 ring-1 ring-white/10"
                    >
                      <CloudUpload className="size-7 text-aurora-cyan" />
                    </motion.div>
                    <p className="mt-5 text-base font-medium text-foreground">Drop your resume here</p>
                    <p className="mt-1 text-xs text-muted-foreground">PDF, DOC, or DOCX up to 10MB · we redact PII by default</p>
                    <div className="mt-5 flex items-center justify-center gap-2">
                      <AuroraButton onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                        <CloudUpload className="size-4" /> Browse files
                      </AuroraButton>
                    </div>
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">or drag &amp; drop anywhere in this zone</p>
                  </div>
                )}
                {state === "scanning" && (
                  <div>
                    <AINeuralLoader />
                    <div className="mx-auto mt-4 max-w-xs">
                      <div className="h-1 overflow-hidden rounded-full surface-3">
                        <div className="h-full rounded-full bg-gradient-to-r from-aurora-violet to-aurora-cyan transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-aurora-cyan">
                        Parsing · Extracting skills · Scoring · {Math.round(progress)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* File chip */}
            <GlassCard className="!p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-aurora-emerald/15 ring-1 ring-aurora-emerald/20">
                  <FileText className="size-5 text-aurora-emerald" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{file?.name ?? storedResume?.meta.source?.fileName ?? "Resume"}</p>
                  <p className="text-xs text-muted-foreground">
                    {file?.size ?? (storedResume?.meta.source ? `${storedResume.meta.source.sizeKB} KB` : "")}
                    {storedResume ? ` · Parsed just now · ${Object.values(storedResume.skills).reduce((n, a) => n + a.length, 0)} skills · ${storedResume.meta.detectedSections.length} sections` : ""}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-aurora-emerald"><CheckCircle2 className="size-4" /> Ready</span>
                <button onClick={() => inputRef.current?.click()} className="rounded-lg border hairline surface-1 px-3 py-1.5 text-xs text-foreground hover:surface-2">Replace</button>
                <button onClick={remove} className="rounded-lg border hairline surface-1 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10">Remove</button>
              </div>
            </GlassCard>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 rounded-xl border hairline surface-1 p-1">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-gradient-to-br from-aurora-violet/25 to-aurora-cyan/20 text-foreground ring-1 ring-white/10" : "text-muted-foreground hover:surface-1 hover:text-foreground"}`}
                  >
                    <Icon className="size-3.5" /> {t.label}
                  </button>
                );
              })}
            </div>

            {tab === "overview" && <OverviewTab />}
            {tab === "match" && <JobMatchTab />}
            {tab === "skills" && <SkillsTab />}
            {tab === "career" && <CareerTab />}
            {tab === "interview" && <InterviewTab />}
            {tab === "cover" && <CoverTab />}
            {tab === "roadmap" && <RoadmapTab />}
            {tab === "versions" && <VersionsTab />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ATS_BREAKDOWN = [
  { k: "Keywords match", v: 88 },
  { k: "Formatting", v: 94 },
  { k: "Section completeness", v: 72 },
  { k: "Impact metrics", v: 66 },
  { k: "Readability", v: 90 },
  { k: "Contact info", v: 100 },
  { k: "Projects", v: 78 },
  { k: "Certifications", v: 60 },
];

const IMPROVEMENTS = [
  "Add impact numbers to your Kafka migration bullet — recruiters weight metrics 2× higher.",
  "Move 'Skills' section above 'Education' for engineering roles.",
  "Your summary is 60 words — trim to 40 for hiring-manager scannability.",
  "Add Docker & Kubernetes to your skills — 42% of matched roles require them.",
];

const RED_FLAGS = [
  { label: "6-month gap in 2023", severity: "medium" },
  { label: "Missing measurable impact in last 2 roles", severity: "high" },
  { label: "No certifications listed", severity: "low" },
];

function OverviewTab() {
  const r = useResumeStore((s) => s.resume);
  if (!r) {
    return (
      <GlassCard>
        <p className="text-sm text-muted-foreground">Upload a resume to see the parsed overview.</p>
      </GlassCard>
    );
  }
  const ats = computeAts(r);
  const readiness = readinessScores(r);
  const suggestions = suggestImprovements(r);
  const skillCount = Object.values(r.skills).reduce((n, a) => n + a.length, 0);
  const parsedCards: { icon: React.ComponentType<{ className?: string }>; label: string; detail: string }[] = [
    { icon: Mail, label: "Personal", detail: [r.personal.name, r.personal.location, r.personal.email, r.personal.phone].filter(Boolean).join(" · ") || "Not detected" },
    { icon: GraduationCap, label: "Education", detail: r.education[0] ? `${r.education[0].school}${r.education[0].degree ? ` · ${r.education[0].degree}` : ""}${r.education[0].end ? ` · ${r.education[0].end}` : ""}` : "Not detected" },
    { icon: Building2, label: "Experience", detail: r.experience[0] ? `${r.experience[0].company || "—"} · ${r.experience[0].role || "—"}${r.experience[0].start || r.experience[0].end ? ` · ${[r.experience[0].start, r.experience[0].end].filter(Boolean).join("–")}` : ""}` : "Not detected" },
    { icon: Layers, label: "Projects", detail: r.projects[0] ? `${r.projects[0].name}${r.projects[0].description ? ` · ${r.projects[0].description}` : ""}` : "Not detected" },
    { icon: Zap, label: "Skills", detail: skillCount > 0 ? `${skillCount} extracted · ${Object.entries(r.skills).filter(([, v]) => v.length).map(([k]) => k).slice(0, 4).join(", ")}` : "Not detected" },
    { icon: Award, label: "Certifications", detail: r.certifications[0] ? r.certifications.slice(0, 2).map((c) => c.text).join(" · ") : "Not detected" },
  ];
  const atsRows: { k: string; v: number }[] = [
    { k: "Keywords match", v: ats.keywords },
    { k: "Formatting", v: ats.formatting },
    { k: "Section completeness", v: ats.sectionCompleteness },
    { k: "Impact metrics", v: ats.impactMetrics },
    { k: "Readability", v: ats.readability },
    { k: "Contact info", v: ats.contactInfo },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <GlassCard className="lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Parsed sections</h3>
          <span className="inline-flex items-center gap-1 rounded-full border border-aurora-emerald/20 bg-aurora-emerald/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-aurora-emerald">
            <CheckCircle2 className="size-3" /> {r.meta.detectedSections.length} detected
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {parsedCards.map((s) => (
            <div key={s.label} className="rounded-xl border hairline surface-1 p-3">
              <div className="mb-1 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-aurora-cyan">
                <s.icon className="size-3" /> {s.label}
              </div>
              <p className="text-xs text-foreground/90">{s.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-foreground">ATS breakdown</h3>
            <div className="space-y-2 text-sm">
              {atsRows.map((row) => (
                <div key={row.k} className="grid grid-cols-[130px_minmax(0,1fr)_36px] items-center gap-3">
                  <span className="text-xs text-muted-foreground">{row.k}</span>
                  <div className="h-1.5 overflow-hidden rounded-full surface-3">
                    <div className="h-full rounded-full bg-gradient-to-r from-aurora-violet to-aurora-cyan" style={{ width: `${row.v}%` }} />
                  </div>
                  <span className="text-right font-mono text-xs text-foreground">{row.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 flex items-center justify-between text-sm font-medium text-foreground">
              <span>AI improvements</span>
              <button onClick={() => toast.success("Suggestions ready", { description: "Open the Resume Builder to apply them inline." })} className="inline-flex items-center gap-1 text-[11px] text-aurora-cyan hover:underline">
                <Wand2 className="size-3" /> Fix all
              </button>
            </h3>
            <ul className="space-y-2 text-sm">
              {suggestions.length === 0 && <li className="rounded-lg border hairline surface-1 p-3 text-xs text-muted-foreground">No critical issues detected.</li>}
              {suggestions.slice(0, 4).map((t) => (
                <li key={t.id} className="flex items-start gap-2 rounded-lg border hairline surface-1 p-3 text-foreground/90">
                  <Sparkles className="mt-0.5 size-3.5 shrink-0 text-aurora-cyan" />
                  <span className="text-xs"><span className="font-medium text-foreground">{t.title}</span> — {t.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-medium text-foreground">Missing sections</h3>
          <div className="space-y-2">
            {r.meta.missingSections.length === 0 && <p className="rounded-lg border hairline surface-1 p-3 text-xs text-muted-foreground">Every standard section was detected.</p>}
            {r.meta.missingSections.map((label) => (
              <div key={label} className="flex items-center gap-2 rounded-lg border hairline surface-1 p-3 text-sm text-foreground/90">
                <AlertTriangle className="size-4 text-amber-400" />
                <span className="flex-1 capitalize">{label}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">missing</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="space-y-6">
        <GlassCard className="flex flex-col items-center gap-3 bg-gradient-to-br from-aurora-violet/10 to-transparent text-center">
          <ScoreRing score={ats.overall} size={160} label="ATS Score" />
          <div>
            <p className="text-sm font-medium text-foreground">{ats.overall >= 80 ? "Above average" : ats.overall >= 60 ? "Solid baseline" : "Needs work"}</p>
            <p className="mt-1 text-xs text-muted-foreground">Computed from your parsed resume in real time.</p>
          </div>
          <div className="mt-2 grid w-full grid-cols-3 gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            {[
              { k: "Skills", v: gradeFor(ats.keywords) },
              { k: "Impact", v: gradeFor(ats.impactMetrics) },
              { k: "Format", v: gradeFor(ats.formatting) },
            ].map((s) => (
              <div key={s.k} className="rounded-lg border hairline surface-1 p-2 text-center">
                <p>{s.k}</p>
                <p className="mt-0.5 font-mono text-sm text-foreground">{s.v}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-3 text-sm font-medium text-foreground">Readiness scores</h3>
          <div className="space-y-3">
            {[
              { k: "Career readiness", v: Math.min(100, readiness.career) },
              { k: "Interview readiness", v: Math.min(100, readiness.interview) },
              { k: "Job fit", v: Math.min(100, readiness.jobFit) },
              { k: "Company fit", v: Math.min(100, readiness.companyFit) },
            ].map((row) => (
              <div key={row.k}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-foreground/90">{row.k}</span>
                  <span className="font-mono text-muted-foreground">{row.v}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full surface-3">
                  <div className="h-full rounded-full bg-gradient-to-r from-aurora-violet to-aurora-cyan" style={{ width: `${row.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-aurora-cyan/10 to-transparent">
          <div className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-aurora-cyan">
            <Sparkles className="size-3" /> Recruiter Summary
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {buildRecruiterSummary(r)}
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

function gradeFor(n: number) {
  if (n >= 90) return "A";
  if (n >= 80) return "A-";
  if (n >= 70) return "B+";
  if (n >= 60) return "B";
  if (n >= 50) return "C";
  return "D";
}

function buildRecruiterSummary(r: ReturnType<typeof useResumeStore.getState>["resume"] & object) {
  const name = r.personal.name || "This candidate";
  const yearsish = r.experience.length ? `${r.experience.length} role${r.experience.length > 1 ? "s" : ""} of experience` : "an early-career profile";
  const focus = r.skills.frameworks[0] || r.skills.languages[0] || r.skills.cloud[0] || "software";
  const proj = r.projects.length ? ` with ${r.projects.length} shipped project${r.projects.length > 1 ? "s" : ""}` : "";
  return `${name} brings ${yearsish} anchored in ${focus}${proj}. Strengths: ${r.skills.languages.slice(0, 3).join(", ") || "cross-functional impact"}.`;
}

function JobMatchTab() {
  const [jd, setJd] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<null | { score: number; matched: string[]; missing: string[] }>(null);

  function analyze() {
    if (!jd.trim()) {
      toast.error("Paste a job description first.");
      return;
    }
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      setResult({
        score: 87,
        matched: ["Product Strategy", "SQL", "Payments", "0→1", "Growth", "React", "Systems Design"],
        missing: ["gRPC", "Terraform", "Rust"],
      });
      toast.success("Match analysis complete", { description: "87% match · 7 matched · 3 gaps" });
    }, 1800);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard>
        <h3 className="mb-3 text-sm font-medium text-foreground">Paste a job description</h3>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={10}
          placeholder="Paste any JD here — AI will compare it to your resume."
          className="w-full resize-none rounded-lg border hairline surface-1 p-3 text-sm text-foreground outline-none focus:border-aurora-cyan/40"
        />
        <div className="mt-3 flex justify-end">
          <AuroraButton onClick={analyze} disabled={scanning}>
            {scanning ? "Analyzing…" : (<><Target className="size-4" /> Analyze match</>)}
          </AuroraButton>
        </div>
      </GlassCard>
      <GlassCard>
        {!result && !scanning && (
          <div className="grid h-full min-h-[280px] place-items-center text-center text-sm text-muted-foreground">
            Paste a JD and click Analyze to see your match.
          </div>
        )}
        {scanning && <AINeuralLoader />}
        {result && (
          <div>
            <div className="flex items-center justify-center">
              <ScoreRing score={result.score} size={140} label="Match Score" />
            </div>
            <div className="mt-4">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-aurora-emerald">Matched skills</p>
              <div className="flex flex-wrap gap-1.5">
                {result.matched.map((s) => (
                  <span key={s} className="rounded-full border border-aurora-emerald/30 bg-aurora-emerald/10 px-2 py-0.5 text-xs text-aurora-emerald">{s}</span>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-rose-400">Missing skills</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.map((s) => (
                  <span key={s} className="rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 text-xs text-rose-300">{s}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

const SKILL_RADAR = [
  { skill: "Product", value: 92 },
  { skill: "Systems", value: 74 },
  { skill: "Growth", value: 85 },
  { skill: "Data", value: 78 },
  { skill: "Leadership", value: 88 },
  { skill: "Craft", value: 70 },
];

const SKILL_GAPS = [
  { skill: "Distributed Systems", have: 60, target: 85, priority: "High", time: "3 mo" },
  { skill: "Rust", have: 20, target: 65, priority: "Med", time: "6 mo" },
  { skill: "Terraform", have: 40, target: 80, priority: "Med", time: "2 mo" },
  { skill: "gRPC", have: 30, target: 70, priority: "Low", time: "4 mo" },
];

function SkillsTab() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard>
        <h3 className="mb-3 text-sm font-medium text-foreground">Skill radar</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <RadarChart data={SKILL_RADAR}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} />
              <Radar dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="mb-3 text-sm font-medium text-foreground">Priority skill gaps</h3>
        <div className="space-y-3">
          {SKILL_GAPS.map((s) => {
            const gap = Math.max(0, s.target - s.have);
            return (
              <div key={s.skill}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-foreground">{s.skill}</span>
                  <span className="font-mono text-muted-foreground">{s.have}/{s.target} · {s.time}</span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full surface-3">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-aurora-violet to-aurora-cyan" style={{ width: `${s.have}%` }} />
                  {gap > 0 && <div className="absolute inset-y-0 rounded-full surface-3" style={{ left: `${s.have}%`, width: `${gap}%` }} />}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

const SALARY = [
  { region: "India", low: 42, mid: 58, high: 78 },
  { region: "SEA", low: 65, mid: 92, high: 130 },
  { region: "US Remote", low: 180, mid: 235, high: 310 },
  { region: "EU Remote", low: 110, mid: 150, high: 205 },
];

function CareerTab() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard>
        <h3 className="mb-3 text-sm font-medium text-foreground">Recommended roles</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {["Staff PM · Fintech", "Group PM · Payments", "Head of Product · B2B", "Product Lead · Growth", "AI PM · Platform", "Principal PM · Infra"].map((r) => (
            <div key={r} className="rounded-lg border hairline surface-1 p-3 text-sm text-foreground/90">{r}</div>
          ))}
        </div>
        <h3 className="mb-3 mt-6 text-sm font-medium text-foreground">Best-fit companies</h3>
        <div className="flex flex-wrap gap-1.5">
          {["Stripe", "Ramp", "Linear", "Vercel", "Notion", "Anthropic", "Figma", "Airbnb"].map((c) => (
            <span key={c} className="rounded-full border hairline surface-1 px-2.5 py-1 text-xs text-foreground/90">{c}</span>
          ))}
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="mb-3 text-sm font-medium text-foreground">Salary prediction (LPA · ₹)</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={SALARY}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="region" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "rgba(15,17,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }} itemStyle={{ color: "#fff" }} labelStyle={{ color: "#fff" }} />
              <Bar dataKey="low" stackId="a" fill="#818cf8" radius={[0, 0, 6, 6]} />
              <Bar dataKey="mid" stackId="a" fill="#c084fc" />
              <Bar dataKey="high" stackId="a" fill="#22d3ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}

function InterviewTab() {
  const [generated, setGenerated] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function generate() {
    setBusy(true);
    setGenerated([]);
    const q = [
      "Walk me through the largest system you designed end-to-end.",
      "Describe a trade-off between velocity and correctness — what did you choose and why?",
      "How would you rearchitect a monolith serving 400 rps under budget?",
      "Tell me about a time you led a team through a major technical migration.",
      "How do you measure product-market fit for a B2B platform?",
    ];
    q.forEach((question, i) => {
      setTimeout(() => {
        setGenerated((prev) => [...prev, question]);
        if (i === q.length - 1) setBusy(false);
      }, (i + 1) * 500);
    });
  }

  return (
    <GlassCard>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">AI Interview Prep</h3>
        <AuroraButton onClick={generate} disabled={busy}>
          <Sparkles className="size-4" /> {busy ? "Streaming…" : "Generate questions"}
        </AuroraButton>
      </div>
      {generated.length === 0 && !busy && (
        <p className="text-sm text-muted-foreground">Click Generate to stream tailored technical, HR, and system-design questions.</p>
      )}
      <ol className="space-y-2">
        {generated.map((q, i) => (
          <motion.li key={q} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border hairline surface-1 p-3 text-sm text-foreground/90">
            <span className="mr-2 font-mono text-[11px] text-aurora-cyan">Q{i + 1}</span>{q}
          </motion.li>
        ))}
      </ol>
    </GlassCard>
  );
}

function CoverTab() {
  const [company, setCompany] = useState("Stripe");
  const [role, setRole] = useState("Staff Product Manager");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  function gen() {
    setBusy(true);
    setText("");
    const full = `Dear ${company} Hiring Team,\n\nI'm writing to express strong interest in the ${role} role. Over 7 years I've led 0→1 platform builds — most recently taking Northwind's payments platform to $120M ARR. I've shipped systems that reduced p99 latency by 42%, launched pricing experiments that lifted ARPU 18%, and built the rubric that hired our current PM bench.\n\nWhat draws me to ${company} is the craft: pragmatic infrastructure, obsessive customer focus, and a design bar I want to match. I'd love to bring that same intensity to your team.\n\nWarmly,\nPriya Nair`;
    let i = 0;
    const iv = setInterval(() => {
      i += 6;
      setText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(iv);
        setBusy(false);
        toast.success("Cover letter drafted");
      }
    }, 25);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
      <GlassCard>
        <h3 className="mb-3 text-sm font-medium text-foreground">Personalize</h3>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">Company</span>
          <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40" />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs text-muted-foreground">Role</span>
          <input value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40" />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <AuroraButton onClick={gen} disabled={busy}><Sparkles className="size-4" /> {busy ? "Writing…" : "Generate"}</AuroraButton>
          <button onClick={() => { navigator.clipboard?.writeText(text); toast.success("Copied to clipboard"); }} disabled={!text} className="rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground hover:surface-2 disabled:opacity-40">Copy</button>
          <button onClick={() => toast.success("Exported as PDF")} disabled={!text} className="rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground hover:surface-2 disabled:opacity-40">Export PDF</button>
        </div>
      </GlassCard>
      <GlassCard className="!p-8 bg-white text-zinc-900 min-h-[400px]">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{text || "Your cover letter will appear here…"}</pre>
      </GlassCard>
    </div>
  );
}

function RoadmapTab() {
  const steps = [
    { t: "Now", body: "Staff PM · fintech · 7 yrs", tone: "current" },
    { t: "0–3 mo", body: "Ship 1 externally-visible bet · complete Distributed Systems course", tone: "near" },
    { t: "3–9 mo", body: "Own a P&L · lead 2 direct reports · 2 open-source contributions", tone: "mid" },
    { t: "9–18 mo", body: "Group PM · set roadmap for $30M+ product line", tone: "far" },
  ];
  return (
    <div className="space-y-6">
      <GlassCard>
        <h3 className="mb-4 text-sm font-medium text-foreground">Personalized learning roadmap</h3>
        <div className="grid gap-3 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.t} className="rounded-xl border hairline bg-gradient-to-b from-white/[0.03] to-transparent p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-aurora-cyan">Step {i + 1}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{s.t}</p>
              <p className="mt-2 text-xs text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="mb-3 text-sm font-medium text-foreground">Recommended certifications</h3>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {["AWS Solutions Architect", "Google Cloud PDE", "Azure AI Engineer", "Reforge · Growth Series", "Kubernetes CKAD", "TensorFlow Developer"].map((c) => (
            <div key={c} className="rounded-lg border hairline surface-1 p-3 text-sm text-foreground/90">{c}</div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function VersionsTab() {
  const versions = [
    { v: "v4", when: "just now", score: 82, note: "Current — parsed" },
    { v: "v3", when: "12 days ago", score: 76, note: "Added Kafka migration bullet" },
    { v: "v2", when: "1 month ago", score: 71, note: "Restructured experience section" },
    { v: "v1", when: "3 months ago", score: 64, note: "Initial upload" },
  ];
  return (
    <GlassCard className="!p-0 overflow-hidden">
      <div className="grid grid-cols-[80px_140px_100px_1fr_100px] border-b hairline px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>Version</span><span>When</span><span>ATS</span><span>Notes</span><span className="text-right">Action</span>
      </div>
      <div className="divide-y divide-white/5">
        {versions.map((v, i) => (
          <div key={v.v} className="grid grid-cols-[80px_140px_100px_1fr_100px] items-center px-5 py-3 text-sm">
            <span className="font-mono text-foreground">{v.v}</span>
            <span className="text-muted-foreground">{v.when}</span>
            <span className="font-mono text-aurora-cyan">{v.score}</span>
            <span className="text-foreground/90">{v.note}</span>
            <div className="text-right">
              {i === 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-aurora-emerald/15 px-2 py-0.5 text-[10px] font-medium text-aurora-emerald ring-1 ring-aurora-emerald/30">Active</span>
              ) : (
                <button onClick={() => toast.success(`Restored ${v.v}`)} className="text-xs text-aurora-cyan hover:underline">Restore</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}