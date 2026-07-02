import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Award,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Copy,
  Download,
  FileDown,
  FileText,
  GraduationCap,
  Languages as LangIcon,
  Lightbulb,
  Plus,
  Redo2,
  Rocket,
  Save,
  Share2,
  Sparkles,
  Trash2,
  Undo2,
  UploadCloud,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { GlassCard } from "@/components/talent/GlassCard";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useResumeExport } from "@/hooks/useResumeExport";
import { useResumeStore } from "@/state/resumeStore";
import { parseResume } from "@/lib/resume/parseResume";
import { computeAts, suggestImprovements } from "@/lib/resume/intelligence";
import { uid, type ExperienceItem, type EducationItem, type ProjectItem, type SimpleItem } from "@/lib/resume/types";
import { InsightsSuite } from "@/components/resume/InsightsSuite";
import type { Resume } from "@/lib/resume/types";

const TEMPLATES = ["Modern", "Minimal", "Executive", "Google Style", "Amazon Style", "Microsoft Style", "Startup Style"] as const;
type Template = (typeof TEMPLATES)[number];

export const Route = createFileRoute("/app/candidate/resume-builder")({
  head: () => ({ meta: [{ title: "Resume Builder · TalentForge AI" }] }),
  component: ResumeBuilder,
});

function ResumeBuilder() {
  const resume = useResumeStore((s) => s.resume);
  const updatedAt = useResumeStore((s) => s.updatedAt);
  const setResume = useResumeStore((s) => s.setResume);
  const update = useResumeStore((s) => s.update);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", { description: "Maximum 10MB." });
      return;
    }
    setUploading(true);
    const tid = toast.loading("Parsing resume…", { description: file.name });
    try {
      const parsed = await parseResume(file);
      setResume(parsed);
      toast.success("Resume parsed", {
        id: tid,
        description: `${parsed.meta.detectedSections.length} sections · ${parsed.meta.confidence}% confidence`,
      });
    } catch (e) {
      toast.error("Could not parse resume", { id: tid, description: (e as Error).message });
    } finally {
      setUploading(false);
    }
  }

  if (!resume) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-aurora-cyan">Resume Intelligence Studio</p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">Start with your resume</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Upload a PDF or DOCX — we'll extract every section and open the live editor.</p>
        </div>
        <GlassCard>
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors",
              uploading ? "border-aurora-cyan/60 bg-aurora-cyan/5" : "hairline hover:border-aurora-cyan/40",
            )}
          >
            <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-aurora-violet/20 to-aurora-cyan/20 ring-1 ring-white/10">
              <UploadCloud className="size-6 text-aurora-cyan" />
            </div>
            <p className="text-base font-medium text-foreground">{uploading ? "Parsing…" : "Drop your resume"}</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF or DOCX, up to 10MB</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = "";
              }}
            />
            <span className="mt-5 inline-flex rounded-full border hairline surface-2 px-3 py-1 text-xs text-muted-foreground">or drag & drop anywhere</span>
          </label>
        </GlassCard>
        <p className="text-center text-xs text-muted-foreground">
          Prefer the guided upload experience? <Link to="/app/candidate/resume" className="text-aurora-cyan underline-offset-4 hover:underline">Open My Resume →</Link>
        </p>
      </div>
    );
  }

  return <ResumeEditor key={updatedAt === 0 ? "init" : "live"} />;
}

// ---------- Editor ----------

function ResumeEditor() {
  const resume = useResumeStore((s) => s.resume!);
  const update = useResumeStore((s) => s.update);
  const setResume = useResumeStore((s) => s.setResume);
  const updatedAt = useResumeStore((s) => s.updatedAt);
  const clearResume = useResumeStore((s) => s.clearResume);
  const { busy, downloadPdf, downloadDocx } = useResumeExport();
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [template, setTemplate] = useState<Template>("Modern");
  const [versions, setVersions] = useState<{ id: string; label: string; at: number; snapshot: Resume }[]>(
    () => [{ id: "v1", label: "v1 · baseline", at: Date.now(), snapshot: resume }],
  );
  const [activeVersion, setActiveVersion] = useState<string>("v1");

  // Undo/redo history tracked from store updates.
  const historyRef = useRef<{ stack: Resume[]; idx: number; suppress: boolean }>({
    stack: [resume],
    idx: 0,
    suppress: false,
  });
  useEffect(() => {
    const h = historyRef.current;
    if (h.suppress) { h.suppress = false; return; }
    h.stack = h.stack.slice(0, h.idx + 1);
    h.stack.push(JSON.parse(JSON.stringify(resume)));
    if (h.stack.length > 50) h.stack.shift();
    h.idx = h.stack.length - 1;
  }, [updatedAt, resume]);

  const undo = () => {
    const h = historyRef.current;
    if (h.idx <= 0) return;
    h.idx -= 1; h.suppress = true;
    setResume(h.stack[h.idx]);
  };
  const redo = () => {
    const h = historyRef.current;
    if (h.idx >= h.stack.length - 1) return;
    h.idx += 1; h.suppress = true;
    setResume(h.stack[h.idx]);
  };

  const duplicateVersion = () => {
    const next = versions.length + 1;
    const id = `v${next}`;
    const label = `${id} · snapshot`;
    setVersions((vs) => [...vs, { id, label, at: Date.now(), snapshot: JSON.parse(JSON.stringify(resume)) }]);
    setActiveVersion(id);
    toast.success("Version saved", { description: label });
  };
  const restoreVersion = (id: string) => {
    const v = versions.find((x) => x.id === id);
    if (!v) return;
    setResume(v.snapshot);
    setActiveVersion(id);
    toast("Version restored", { description: v.label });
  };

  const improveAll = () => {
    update((r) => {
      if (!r.summary && r.personal.name) {
        r.summary = `${r.personal.headline || "Professional"} with ${r.experience.length || 1}+ years of experience delivering measurable outcomes across ${Object.values(r.skills).flat().slice(0, 3).join(", ") || "modern stacks"}.`;
      }
      if (r.skills.cloud.length === 0) r.skills.cloud = ["AWS", "Docker"];
      if (r.skills.tools.length < 2) r.skills.tools = Array.from(new Set([...r.skills.tools, "Git", "CI/CD"]));
      r.experience.forEach((e) => {
        e.bullets = e.bullets.map((b) => {
          if (!b.trim()) return b;
          if (!/\d/.test(b)) return b.replace(/\.?$/, " (+20% impact).");
          return b;
        });
      });
    });
    toast.success("Improvements applied", { description: "Bullets, skills, and summary enriched." });
  };

  const shareResume = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied", { description: "Share the current view." });
    } catch {
      toast.error("Could not copy link");
    }
  };

  const ats = useMemo(() => computeAts(resume), [resume]);
  const suggestions = useMemo(() => suggestImprovements(resume), [resume]);

  const sectionNav: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { id: "personal", label: "Personal Info", icon: FileText, count: resume.personal.name ? 1 : 0 },
    { id: "summary", label: "Summary", icon: Sparkles, count: resume.summary ? 1 : 0 },
    { id: "experience", label: "Experience", icon: BriefcaseBusiness, count: resume.experience.length },
    { id: "education", label: "Education", icon: GraduationCap, count: resume.education.length },
    { id: "projects", label: "Projects", icon: Rocket, count: resume.projects.length },
    { id: "skills", label: "Skills", icon: BrainCircuit, count: Object.values(resume.skills).reduce((n, a) => n + a.length, 0) },
    { id: "certifications", label: "Certifications", icon: Award, count: resume.certifications.length },
    { id: "achievements", label: "Achievements", icon: Award, count: resume.achievements.length },
    { id: "languages", label: "Languages", icon: LangIcon, count: resume.languages.length },
  ];

  const fileName = resume.personal.name
    ? resume.personal.name.replace(/\s+/g, "_")
    : "resume";

  return (
    <div className="mx-auto max-w-[1680px] space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 rounded-2xl border hairline surface-1 p-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-aurora-cyan">Resume Intelligence Studio</p>
          <h1 className="mt-1 text-xl font-semibold text-foreground md:text-2xl">
            {resume.personal.name || "Untitled Resume"}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {resume.personal.headline || "Add a headline to introduce your role"}
            {resume.meta.source ? ` · Parsed from ${resume.meta.source.fileName}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-aurora-emerald/25 bg-aurora-emerald/10 px-2.5 py-1 text-xs text-aurora-emerald">
            <Save className="size-3.5" /> Auto-saved
          </span>
          <span className="inline-flex h-9 items-center rounded-lg border border-aurora-cyan/25 bg-aurora-cyan/10 px-3 font-mono text-xs text-aurora-cyan">
            ATS {ats.overall}/100
          </span>
          <button
            onClick={() => downloadPdf("resume-preview-node", `${fileName}.pdf`)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border hairline surface-1 px-3 text-sm text-foreground hover:surface-2"
          >
            <Download className="size-4" /> {busy === "pdf" ? "Generating…" : "PDF"}
          </button>
          <button
            onClick={() =>
              downloadDocx(
                {
                  name: resume.personal.name || "Resume",
                  headline: resume.personal.headline ?? "",
                  contact: [resume.personal.email, resume.personal.phone, resume.personal.location, resume.personal.linkedin]
                    .filter(Boolean)
                    .join(" · "),
                  sections: buildDocxSections(resume),
                },
                `${fileName}.docx`,
              )
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border hairline surface-1 px-3 text-sm text-foreground hover:surface-2"
          >
            <FileDown className="size-4" /> {busy === "docx" ? "Generating…" : "DOCX"}
          </button>
          <button
            onClick={() => {
              clearResume();
              toast("Resume cleared", { description: "Upload another resume to start again." });
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border hairline surface-1 px-3 text-sm text-rose-300 hover:bg-rose-500/10"
          >
            <Trash2 className="size-4" /> Reset
          </button>
        </div>
      </motion.div>

      {/* Toolbar: template + version + quick actions */}
      <div className="grid gap-3 rounded-2xl border hairline surface-1 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Template</span>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as Template)}
            className="h-10 w-full rounded-lg border hairline bg-background/40 px-3 text-sm text-foreground outline-none focus:border-aurora-cyan/40"
          >
            {TEMPLATES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Version</span>
          <select
            value={activeVersion}
            onChange={(e) => restoreVersion(e.target.value)}
            className="h-10 w-full rounded-lg border border-aurora-violet/40 bg-background/40 px-3 text-sm text-foreground outline-none focus:border-aurora-cyan/40"
          >
            {versions.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-1.5">
          <ToolbarBtn onClick={undo} label="Undo"><Undo2 className="size-4" /></ToolbarBtn>
          <ToolbarBtn onClick={redo} label="Redo"><Redo2 className="size-4" /></ToolbarBtn>
          <span className="inline-flex h-9 items-center rounded-lg border border-aurora-cyan/25 bg-aurora-cyan/10 px-3 font-mono text-xs text-aurora-cyan">Score {ats.overall}/100</span>
          <ToolbarBtn onClick={() => downloadPdf("resume-preview-node", `${fileName}.pdf`)} label="PDF"><Download className="size-4" /></ToolbarBtn>
          <ToolbarBtn onClick={() =>
            downloadDocx(
              {
                name: resume.personal.name || "Resume",
                headline: resume.personal.headline ?? "",
                contact: [resume.personal.email, resume.personal.phone, resume.personal.location, resume.personal.linkedin].filter(Boolean).join(" · "),
                sections: buildDocxSections(resume),
              },
              `${fileName}.docx`,
            )
          } label="DOCX"><FileDown className="size-4" /></ToolbarBtn>
          <ToolbarBtn onClick={duplicateVersion} label="Duplicate"><Copy className="size-4" /></ToolbarBtn>
          <ToolbarBtn onClick={shareResume} label="Share"><Share2 className="size-4" /></ToolbarBtn>
          <button
            onClick={improveAll}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-aurora-violet to-aurora-cyan px-3 text-sm font-medium text-background shadow-lg shadow-aurora-violet/20 hover:opacity-95"
          >
            <Wand2 className="size-4" /> Improve all
          </button>
          <ToolbarBtn onClick={() => toast("AI assistant", { description: "Ask me anything about your resume." })} label="Assistant"><Bot className="size-4" /></ToolbarBtn>
        </div>
      </div>

      <div className="grid gap-4 min-[1200px]:grid-cols-[240px_minmax(0,1fr)_380px]">
        {/* Sidebar */}
        <aside className="rounded-2xl border hairline surface-1 p-3">
          <div className="mb-3 rounded-xl border hairline surface-2 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-mono text-aurora-cyan">{ats.overall}%</span>
            </div>
            <Progress value={ats.overall} className="mt-2 surface-3 [&>div]:bg-gradient-to-r [&>div]:from-aurora-violet [&>div]:to-aurora-cyan" />
          </div>
          <nav className="space-y-1">
            {sectionNav.map((s) => {
              const active = s.id === activeSection;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    active ? "surface-2 text-foreground ring-1 ring-white/10" : "text-muted-foreground hover:surface-1 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{s.label}</span>
                  <span className={cn("rounded-full px-1.5 text-[10px]", s.count > 0 ? "bg-aurora-emerald/15 text-aurora-emerald" : "surface-3 text-muted-foreground")}>{s.count}</span>
                </button>
              );
            })}
          </nav>

          {resume.meta.missingSections.length > 0 && (
            <div className="mt-4 rounded-xl border hairline surface-2 p-3">
              <p className="text-[11px] font-medium text-foreground">Missing sections</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {resume.meta.missingSections.slice(0, 4).join(" · ")}
              </p>
            </div>
          )}
        </aside>

        {/* Editor */}
        <main className="space-y-4">
          {activeSection === "personal" && <PersonalEditor />}
          {activeSection === "summary" && <SummaryEditor />}
          {activeSection === "experience" && <ExperienceEditor />}
          {activeSection === "education" && <EducationEditor />}
          {activeSection === "projects" && <ProjectsEditor />}
          {activeSection === "skills" && <SkillsEditor />}
          {activeSection === "certifications" && <SimpleListEditor field="certifications" title="Certifications" />}
          {activeSection === "achievements" && <SimpleListEditor field="achievements" title="Achievements" />}
          {activeSection === "languages" && <SimpleListEditor field="languages" title="Languages" />}

          <GlassCard>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Lightbulb className="size-4 text-aurora-cyan" /> AI suggestions
            </h3>
            {suggestions.length === 0 ? (
              <p className="text-xs text-muted-foreground">Resume looks strong — no critical issues detected.</p>
            ) : (
              <ul className="space-y-2">
                {suggestions.slice(0, 6).map((s) => (
                  <li key={s.id} className="rounded-lg border hairline surface-1 p-3">
                    <p className="text-sm font-medium text-foreground">{s.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </main>

        {/* Live preview */}
        <aside className="min-[1200px]:sticky min-[1200px]:top-20 h-fit">
          <GlassCard className="!p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Live preview</p>
                <h2 className="text-sm font-medium text-foreground">{template} · updates as you type</h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border hairline px-2 py-0.5 text-[10px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-aurora-emerald" /> Live
              </span>
            </div>
            <div className="max-h-[720px] overflow-auto rounded-xl surface-1 p-3">
              <ResumePreview template={template} />
            </div>
          </GlassCard>
        </aside>
      </div>

      {/* Insights suite */}
      <InsightsSuite
        versions={versions.map(({ id, label, at }) => ({ id, label, at }))}
        activeVersion={activeVersion}
        onRestore={restoreVersion}
        onDuplicate={duplicateVersion}
      />
    </div>
  );
}

function ToolbarBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border hairline surface-1 text-foreground hover:surface-2"
    >
      {children}
    </button>
  );
}

// ---------- Field editors ----------

function PersonalEditor() {
  const p = useResumeStore((s) => s.resume!.personal);
  const update = useResumeStore((s) => s.update);
  const setField = (k: keyof typeof p, v: string) => update((r) => { r.personal[k] = v; });
  return (
    <GlassCard>
      <h3 className="mb-3 text-sm font-medium text-foreground">Personal information</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name" value={p.name} onChange={(v) => setField("name", v)} />
        <Field label="Headline" value={p.headline ?? ""} onChange={(v) => setField("headline", v)} placeholder="e.g. Senior Software Engineer" />
        <Field label="Email" value={p.email ?? ""} onChange={(v) => setField("email", v)} />
        <Field label="Phone" value={p.phone ?? ""} onChange={(v) => setField("phone", v)} />
        <Field label="Location" value={p.location ?? ""} onChange={(v) => setField("location", v)} />
        <Field label="LinkedIn" value={p.linkedin ?? ""} onChange={(v) => setField("linkedin", v)} />
        <Field label="GitHub" value={p.github ?? ""} onChange={(v) => setField("github", v)} />
        <Field label="Portfolio" value={p.portfolio ?? ""} onChange={(v) => setField("portfolio", v)} />
      </div>
    </GlassCard>
  );
}

function SummaryEditor() {
  const summary = useResumeStore((s) => s.resume!.summary);
  const update = useResumeStore((s) => s.update);
  const words = summary.split(/\s+/).filter(Boolean).length;
  return (
    <GlassCard>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Professional summary</h3>
        <span className="font-mono text-[11px] text-muted-foreground">{words} words</span>
      </div>
      <textarea
        value={summary}
        onChange={(e) => update((r) => { r.summary = e.target.value; })}
        placeholder="A 2–3 sentence pitch about your scope, focus, and outcomes."
        className="min-h-[140px] w-full resize-y rounded-xl border hairline bg-background/35 px-4 py-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-aurora-cyan/40"
      />
    </GlassCard>
  );
}

function ExperienceEditor() {
  const items = useResumeStore((s) => s.resume!.experience);
  const update = useResumeStore((s) => s.update);
  return (
    <GlassCard>
      <SectionHeader
        title="Experience"
        onAdd={() =>
          update((r) => {
            r.experience.push({ id: uid("exp"), role: "", company: "", bullets: [] });
          })
        }
      />
      <div className="space-y-3">
        {items.length === 0 && <EmptyState label="No experience yet — add your first role." />}
        {items.map((item, i) => (
          <div key={item.id} className="rounded-xl border hairline surface-1 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Role {i + 1}</span>
              <button
                onClick={() => update((r) => { r.experience.splice(i, 1); })}
                aria-label="Delete role"
                className="rounded-md p-1 text-muted-foreground hover:text-rose-300"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Role" value={item.role} onChange={(v) => update((r) => { (r.experience[i] as ExperienceItem).role = v; })} />
              <Field label="Company" value={item.company} onChange={(v) => update((r) => { (r.experience[i] as ExperienceItem).company = v; })} />
              <Field label="Location" value={item.location ?? ""} onChange={(v) => update((r) => { (r.experience[i] as ExperienceItem).location = v; })} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Start" value={item.start ?? ""} onChange={(v) => update((r) => { (r.experience[i] as ExperienceItem).start = v; })} />
                <Field label="End" value={item.end ?? ""} onChange={(v) => update((r) => { (r.experience[i] as ExperienceItem).end = v; })} />
              </div>
            </div>
            <label className="mt-2 block text-[11px] text-muted-foreground">Bullets (one per line)</label>
            <textarea
              value={item.bullets.join("\n")}
              onChange={(e) => update((r) => { (r.experience[i] as ExperienceItem).bullets = e.target.value.split("\n"); })}
              placeholder="• Shipped X that improved Y by 32%"
              className="mt-1 min-h-[110px] w-full resize-y rounded-lg border hairline bg-background/35 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40"
            />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function EducationEditor() {
  const items = useResumeStore((s) => s.resume!.education);
  const update = useResumeStore((s) => s.update);
  return (
    <GlassCard>
      <SectionHeader
        title="Education"
        onAdd={() => update((r) => { r.education.push({ id: uid("edu"), school: "" }); })}
      />
      <div className="space-y-3">
        {items.length === 0 && <EmptyState label="No education entries — add one." />}
        {items.map((item, i) => (
          <div key={item.id} className="rounded-xl border hairline surface-1 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Entry {i + 1}</span>
              <button onClick={() => update((r) => { r.education.splice(i, 1); })} aria-label="Delete" className="rounded-md p-1 text-muted-foreground hover:text-rose-300">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="School" value={item.school} onChange={(v) => update((r) => { (r.education[i] as EducationItem).school = v; })} />
              <Field label="Degree" value={item.degree ?? ""} onChange={(v) => update((r) => { (r.education[i] as EducationItem).degree = v; })} />
              <Field label="Field" value={item.field ?? ""} onChange={(v) => update((r) => { (r.education[i] as EducationItem).field = v; })} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Start" value={item.start ?? ""} onChange={(v) => update((r) => { (r.education[i] as EducationItem).start = v; })} />
                <Field label="End" value={item.end ?? ""} onChange={(v) => update((r) => { (r.education[i] as EducationItem).end = v; })} />
              </div>
            </div>
            <label className="mt-2 block text-[11px] text-muted-foreground">Details</label>
            <textarea
              value={item.details ?? ""}
              onChange={(e) => update((r) => { (r.education[i] as EducationItem).details = e.target.value; })}
              placeholder="Coursework, GPA, honors"
              className="mt-1 min-h-[70px] w-full resize-y rounded-lg border hairline bg-background/35 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40"
            />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function ProjectsEditor() {
  const items = useResumeStore((s) => s.resume!.projects);
  const update = useResumeStore((s) => s.update);
  return (
    <GlassCard>
      <SectionHeader
        title="Projects"
        onAdd={() => update((r) => { r.projects.push({ id: uid("proj"), name: "", bullets: [] }); })}
      />
      <div className="space-y-3">
        {items.length === 0 && <EmptyState label="No projects yet — add one to showcase applied work." />}
        {items.map((item, i) => (
          <div key={item.id} className="rounded-xl border hairline surface-1 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Project {i + 1}</span>
              <button onClick={() => update((r) => { r.projects.splice(i, 1); })} aria-label="Delete" className="rounded-md p-1 text-muted-foreground hover:text-rose-300">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Name" value={item.name} onChange={(v) => update((r) => { (r.projects[i] as ProjectItem).name = v; })} />
              <Field label="Link" value={item.link ?? ""} onChange={(v) => update((r) => { (r.projects[i] as ProjectItem).link = v; })} />
            </div>
            <label className="mt-2 block text-[11px] text-muted-foreground">Description</label>
            <textarea
              value={item.description ?? ""}
              onChange={(e) => update((r) => { (r.projects[i] as ProjectItem).description = e.target.value; })}
              className="mt-1 min-h-[60px] w-full resize-y rounded-lg border hairline bg-background/35 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40"
            />
            <label className="mt-2 block text-[11px] text-muted-foreground">Bullets (one per line)</label>
            <textarea
              value={item.bullets.join("\n")}
              onChange={(e) => update((r) => { (r.projects[i] as ProjectItem).bullets = e.target.value.split("\n"); })}
              className="mt-1 min-h-[90px] w-full resize-y rounded-lg border hairline bg-background/35 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40"
            />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function SkillsEditor() {
  const skills = useResumeStore((s) => s.resume!.skills);
  const update = useResumeStore((s) => s.update);
  const buckets: (keyof typeof skills)[] = ["languages", "frameworks", "databases", "cloud", "tools", "technical", "soft", "other"];
  return (
    <GlassCard>
      <h3 className="mb-3 text-sm font-medium text-foreground">Skills</h3>
      <div className="space-y-3">
        {buckets.map((b) => (
          <SkillBucketEditor
            key={b}
            label={labelFor(b)}
            values={skills[b]}
            onChange={(next) => update((r) => { r.skills[b] = next; })}
          />
        ))}
      </div>
    </GlassCard>
  );
}

function SkillBucketEditor({ label, values, onChange }: { label: string; values: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="rounded-xl border hairline surface-1 p-3">
      <p className="mb-2 text-[11px] font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span key={`${v}-${i}`} className="inline-flex items-center gap-1 rounded-full border border-aurora-cyan/20 bg-aurora-cyan/10 px-2 py-0.5 text-xs text-foreground">
            {v}
            <button onClick={() => onChange(values.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-rose-300"><X className="size-3" /></button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onChange([...values, draft.trim()]);
              setDraft("");
            }
          }}
          placeholder="Type & press Enter"
          className="flex-1 rounded-lg border hairline bg-background/35 px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-aurora-cyan/40"
        />
      </div>
    </div>
  );
}

function SimpleListEditor({ field, title }: { field: "certifications" | "achievements" | "languages" | "awards" | "publications" | "volunteer" | "interests"; title: string }) {
  const items = useResumeStore((s) => s.resume![field] as SimpleItem[]);
  const update = useResumeStore((s) => s.update);
  return (
    <GlassCard>
      <SectionHeader
        title={title}
        onAdd={() => update((r) => { (r[field] as SimpleItem[]).push({ id: uid("i"), text: "" }); })}
      />
      <div className="space-y-2">
        {items.length === 0 && <EmptyState label={`No ${title.toLowerCase()} yet.`} />}
        {items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              value={item.text}
              onChange={(e) => update((r) => { (r[field] as SimpleItem[])[i].text = e.target.value; })}
              className="flex-1 rounded-lg border hairline bg-background/35 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40"
            />
            <button onClick={() => update((r) => { (r[field] as SimpleItem[]).splice(i, 1); })} aria-label="Delete" className="rounded-md p-1 text-muted-foreground hover:text-rose-300">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ---------- Small building blocks ----------

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border hairline bg-background/35 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-aurora-cyan/40"
      />
    </label>
  );
}

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <button onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg border hairline surface-1 px-2.5 py-1 text-xs text-foreground hover:surface-2">
        <Plus className="size-3.5" /> Add
      </button>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="rounded-lg border border-dashed hairline p-4 text-center text-xs text-muted-foreground">{label}</p>;
}

function labelFor(k: string) {
  const map: Record<string, string> = {
    languages: "Languages",
    frameworks: "Frameworks",
    databases: "Databases",
    cloud: "Cloud & DevOps",
    tools: "Tools",
    technical: "Technical",
    soft: "Soft skills",
    other: "Other",
  };
  return map[k] ?? k;
}

// ---------- Live preview (subscribed to store) ----------

function ResumePreview({ template = "Modern" as Template }: { template?: Template }) {
  const r = useResumeStore((s) => s.resume!);
  const contact = [r.personal.email, r.personal.phone, r.personal.location].filter(Boolean).join(" · ");
  const links = [r.personal.linkedin, r.personal.github, r.personal.portfolio].filter(Boolean).join(" · ");
  const style = templateStyle(template);
  return (
    <div id="resume-preview-node" className={cn("mx-auto min-h-[640px] w-[380px] rounded-xl bg-white p-6 text-[13px] leading-relaxed text-neutral-900 shadow-2xl", style.root)}>
      <div className={cn("pb-3", style.header)}>
        <h2 className={cn("text-xl", style.name)}>{r.personal.name || "Your name"}</h2>
        {r.personal.headline && <p className="text-[12px] text-neutral-600">{r.personal.headline}</p>}
        {contact && <p className="mt-1 text-[11px] text-neutral-600">{contact}</p>}
        {links && <p className="text-[11px] text-neutral-500">{links}</p>}
      </div>

      {r.summary && (
        <PreviewSection title="Summary">
          <p>{r.summary}</p>
        </PreviewSection>
      )}

      {r.experience.length > 0 && (
        <PreviewSection title="Experience">
          {r.experience.map((e) => (
            <div key={e.id} className="mb-2">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold text-neutral-900">{e.role || "Role"}{e.company && <span className="font-normal text-neutral-700"> · {e.company}</span>}</p>
                <p className="text-[11px] text-neutral-500">{[e.start, e.end].filter(Boolean).join(" – ")}</p>
              </div>
              {e.location && <p className="text-[11px] text-neutral-500">{e.location}</p>}
              {e.bullets.filter((b) => b.trim()).length > 0 && (
                <ul className="mt-1 list-disc pl-4 text-[12px] text-neutral-800">
                  {e.bullets.filter((b) => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </PreviewSection>
      )}

      {r.projects.length > 0 && (
        <PreviewSection title="Projects">
          {r.projects.map((p) => (
            <div key={p.id} className="mb-2">
              <p className="font-semibold text-neutral-900">{p.name || "Project"}</p>
              {p.description && <p className="text-[12px] text-neutral-700">{p.description}</p>}
              {p.bullets.filter((b) => b.trim()).length > 0 && (
                <ul className="mt-1 list-disc pl-4 text-[12px] text-neutral-800">
                  {p.bullets.filter((b) => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </PreviewSection>
      )}

      {r.education.length > 0 && (
        <PreviewSection title="Education">
          {r.education.map((e) => (
            <div key={e.id} className="mb-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold text-neutral-900">{e.school}</p>
                <p className="text-[11px] text-neutral-500">{[e.start, e.end].filter(Boolean).join(" – ")}</p>
              </div>
              <p className="text-[12px] text-neutral-700">{[e.degree, e.field].filter(Boolean).join(", ")}</p>
              {e.details && <p className="text-[11px] text-neutral-600">{e.details}</p>}
            </div>
          ))}
        </PreviewSection>
      )}

      {Object.values(r.skills).some((a) => a.length > 0) && (
        <PreviewSection title="Skills">
          <div className="space-y-0.5 text-[12px]">
            {Object.entries(r.skills).map(([k, v]) =>
              v.length ? <p key={k}><span className="font-medium">{labelFor(k)}:</span> {v.join(", ")}</p> : null,
            )}
          </div>
        </PreviewSection>
      )}

      {r.certifications.length > 0 && (
        <PreviewSection title="Certifications">
          <ul className="list-disc pl-4 text-[12px]">
            {r.certifications.map((c) => <li key={c.id}>{c.text}</li>)}
          </ul>
        </PreviewSection>
      )}

      {r.achievements.length > 0 && (
        <PreviewSection title="Achievements">
          <ul className="list-disc pl-4 text-[12px]">
            {r.achievements.map((c) => <li key={c.id}>{c.text}</li>)}
          </ul>
        </PreviewSection>
      )}

      {r.languages.length > 0 && (
        <PreviewSection title="Languages">
          <p className="text-[12px]">{r.languages.map((l) => l.text).join(" · ")}</p>
        </PreviewSection>
      )}
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">{title}</h3>
      <div className="mt-1">{children}</div>
    </section>
  );
}

function templateStyle(t: Template): { root: string; header: string; name: string } {
  switch (t) {
    case "Minimal":
      return { root: "font-serif", header: "border-b border-neutral-300", name: "font-normal tracking-wide" };
    case "Executive":
      return { root: "", header: "border-b-2 border-neutral-900", name: "font-bold uppercase tracking-[0.14em]" };
    case "Google Style":
      return { root: "", header: "border-b border-blue-500", name: "font-semibold text-blue-700" };
    case "Amazon Style":
      return { root: "", header: "border-b border-orange-400", name: "font-semibold text-orange-700" };
    case "Microsoft Style":
      return { root: "", header: "border-b border-sky-500", name: "font-semibold text-sky-700" };
    case "Startup Style":
      return { root: "bg-gradient-to-br from-white to-violet-50", header: "border-b border-violet-300", name: "font-bold text-violet-700" };
    case "Modern":
    default:
      return { root: "", header: "border-b border-neutral-200", name: "font-semibold" };
  }
}

function buildDocxSections(r: ReturnType<typeof useResumeStore.getState>["resume"] & object) {
  const sections: { label: string; body: string }[] = [];
  if (r.summary) sections.push({ label: "Summary", body: r.summary });
  if (r.experience.length) sections.push({
    label: "Experience",
    body: r.experience.map((e) => {
      const head = `${e.role}${e.company ? ` · ${e.company}` : ""}${e.start || e.end ? ` (${[e.start, e.end].filter(Boolean).join(" – ")})` : ""}`;
      const bullets = e.bullets.filter((b) => b.trim()).map((b) => `• ${b}`).join("\n");
      return `${head}\n${bullets}`;
    }).join("\n\n"),
  });
  if (r.projects.length) sections.push({
    label: "Projects",
    body: r.projects.map((p) => {
      const head = `${p.name}${p.description ? ` — ${p.description}` : ""}`;
      const bullets = p.bullets.filter((b) => b.trim()).map((b) => `• ${b}`).join("\n");
      return `${head}\n${bullets}`;
    }).join("\n\n"),
  });
  if (r.education.length) sections.push({
    label: "Education",
    body: r.education.map((e) => `${e.school}${e.degree ? ` — ${e.degree}` : ""}${e.field ? `, ${e.field}` : ""}${e.start || e.end ? ` (${[e.start, e.end].filter(Boolean).join(" – ")})` : ""}${e.details ? `\n${e.details}` : ""}`).join("\n\n"),
  });
  const skillLines = Object.entries(r.skills).filter(([, v]) => v.length).map(([k, v]) => `${labelFor(k)}: ${v.join(", ")}`);
  if (skillLines.length) sections.push({ label: "Skills", body: skillLines.join("\n") });
  if (r.certifications.length) sections.push({ label: "Certifications", body: r.certifications.map((c) => `• ${c.text}`).join("\n") });
  if (r.achievements.length) sections.push({ label: "Achievements", body: r.achievements.map((c) => `• ${c.text}`).join("\n") });
  if (r.languages.length) sections.push({ label: "Languages", body: r.languages.map((c) => c.text).join(" · ") });
  return sections;
}