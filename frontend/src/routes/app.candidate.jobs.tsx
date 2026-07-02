import { createFileRoute } from "@tanstack/react-router";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle2, FileText, MapPin, Search, Send, Sparkles, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { MatchScoreBar } from "@/components/talent/MatchScore";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { jobs, type Job } from "@/mocks/data";

export const Route = createFileRoute("/app/candidate/jobs")({
  head: () => ({ meta: [{ title: "Browse Jobs · TalentForge AI" }] }),
  component: BrowseJobs,
});

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-aurora-cyan/25 px-0.5 text-aurora-cyan">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function BrowseJobs() {
  const openJobs = useMemo(() => jobs.filter((j) => j.status === "Open"), []);
  const [q, setQ] = useState("");
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return openJobs;
    return openJobs.filter((j) =>
      [j.title, j.department, j.location, j.type].some((v) => v.toLowerCase().includes(s)),
    );
  }, [q, openJobs]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader eyebrow="Curated for you" title="Jobs matched to your profile" description="Ranked by your resume, skills, and career goals." />

      <GlassCard className="!p-4">
        <div className="flex items-center gap-2 rounded-lg border hairline surface-1 px-3 py-1.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search jobs"
            placeholder="Search roles, companies, keywords…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
          )}
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "role" : "roles"} · updated live
        </p>
      </GlassCard>

      {filtered.length === 0 ? (
        <GlassCard className="text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full surface-1 ring-1 ring-white/10">
            <Search className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">No roles match "{q}"</p>
          <p className="mt-1 text-xs text-muted-foreground">Try different keywords or clear filters.</p>
          <button onClick={() => setQ("")} className="mt-4 rounded-lg border hairline surface-1 px-3 py-1.5 text-xs text-foreground hover:surface-3">Reset</button>
        </GlassCard>
      ) : (
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((j) => (
          <GlassCard key={j.id} className="transition-colors hover:hairline-strong">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground"><Highlight text={j.title} q={q} /></p>
                <p className="truncate text-xs text-muted-foreground">Northwind · <Highlight text={j.location} q={q} /> · {j.type}</p>
              </div>
              <MatchScoreBar score={90 - (parseInt(j.id.slice(1)) % 12)} />
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
              We're hiring a {j.title.toLowerCase()} to help scale our {j.department.toLowerCase()} org. Ownership mindset, 6+ yrs, remote friendly.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">Posted {j.postedAt}</span>
              {applied.has(j.id) ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-aurora-emerald/15 px-3 py-1.5 text-xs font-medium text-aurora-emerald ring-1 ring-aurora-emerald/30">
                  <CheckCircle2 className="size-3.5" /> Applied
                </span>
              ) : (
                <button
                  onClick={() => setApplyJob(j)}
                  className="rounded-lg surface-3 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:surface-3"
                >
                  Apply
                </button>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
      )}

      <ApplyModal
        job={applyJob}
        onClose={() => setApplyJob(null)}
        onSubmit={(job) => {
          setApplied((s) => new Set(s).add(job.id));
          setApplyJob(null);
          toast.success("Application sent!", {
            description: `Your resume was submitted for ${job.title}. Recruiter will reply within 48h.`,
          });
        }}
      />
    </div>
  );
}

function ApplyModal({ job, onClose, onSubmit }: { job: Job | null; onClose: () => void; onSubmit: (j: Job) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!job) return;
    setName("");
    setEmail("");
    setNote("");
    setResume(null);
    setAuthorized(false);
    setErrors({});
    setSending(false);
  }, [job]);

  function validate() {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (!resume) next.resume = "Upload your resume before applying.";
    if (resume && !/\.(pdf|doc|docx)$/i.test(resume.name)) next.resume = "Resume must be PDF, DOC, or DOCX.";
    if (resume && resume.size > 5 * 1024 * 1024) next.resume = "Resume must be under 5 MB.";
    if (note.trim().length > 500) next.note = "Keep the note under 500 characters.";
    if (!authorized) next.authorized = "Confirm that your details are accurate.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleResume(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setResume(file);
    if (file) setErrors((current) => ({ ...current, resume: "" }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!job) return;
    if (!validate()) {
      toast.error("Please fix the highlighted fields.", {
        description: "Resume upload, contact details, and authorization are required.",
      });
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onSubmit(job);
    }, 1200);
  }

  return (
    <AnimatePresence>
      {job && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border hairline bg-background/95 shadow-2xl backdrop-blur-xl"
            onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
             role="dialog"
             aria-modal="true"
             aria-labelledby="apply-title"
          >
            <div className="flex items-start justify-between border-b hairline p-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-aurora-cyan">Apply</p>
                <h2 id="apply-title" className="mt-1 text-lg font-semibold text-foreground">{job.title}</h2>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> Northwind · {job.location} · {job.type}
                </p>
              </div>
              <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:surface-1 hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={submit} noValidate className="space-y-4 p-5">
              <label className="block rounded-xl border border-dashed hairline-strong surface-1 p-4 transition-colors hover:border-aurora-cyan/40 hover:surface-2">
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleResume} className="sr-only" />
                <span className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-lg surface-1 text-aurora-cyan ring-1 ring-white/10">
                    {resume ? <FileText className="size-5" /> : <UploadCloud className="size-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {resume ? resume.name : "Upload resume"}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      PDF, DOC, or DOCX · max 5 MB · required for this application
                    </span>
                  </span>
                </span>
                {errors.resume && <FieldError>{errors.resume}</FieldError>}
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">Full name</span>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={validate}
                    aria-invalid={Boolean(errors.name)}
                    className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40 aria-[invalid=true]:border-destructive/60"
                  />
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">Email</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={validate}
                    aria-invalid={Boolean(errors.email)}
                    className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40 aria-[invalid=true]:border-destructive/60"
                  />
                  {errors.email && <FieldError>{errors.email}</FieldError>}
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground">Why you? (optional)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={validate}
                  rows={3}
                  maxLength={500}
                  placeholder="One paragraph about why you're a fit — AI will polish it."
                  aria-invalid={Boolean(errors.note)}
                  className="w-full resize-none rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-aurora-cyan/40 aria-[invalid=true]:border-destructive/60"
                />
                {errors.note && <FieldError>{errors.note}</FieldError>}
                <button type="button" onClick={() => { setNote("I've led two 0→1 platform builds and can start immediately. My last role saw a 42% reduction in p99 latency after the Kafka migration."); toast.success("AI drafted your note."); }} className="mt-1 inline-flex items-center gap-1 text-[11px] text-aurora-cyan hover:underline">
                  <Sparkles className="size-3" /> Draft with AI
                </button>
              </label>
              <label className="flex items-start gap-2 rounded-lg border hairline surface-1 p-3">
                <input
                  type="checkbox"
                  checked={authorized}
                  onChange={(e) => {
                    setAuthorized(e.target.checked);
                    if (e.target.checked) setErrors((current) => ({ ...current, authorized: "" }));
                  }}
                  className="mt-0.5 size-4 rounded hairline-strong bg-background accent-current"
                />
                <span className="text-xs leading-relaxed text-muted-foreground">
                  I confirm the information and uploaded resume are accurate, and authorize TalentForge AI to send this application to Northwind.
                  {errors.authorized && <FieldError>{errors.authorized}</FieldError>}
                </span>
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground hover:surface-2">Cancel</button>
                <AuroraButton type="submit" disabled={sending}>
                  {sending ? (<>Sending…</>) : (<><Send className="size-4" /> Submit application</>)}
                </AuroraButton>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FieldError({ children }: { children: string }) {
  return (
    <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-destructive">
      <AlertCircle className="size-3" /> {children}
    </p>
  );
}