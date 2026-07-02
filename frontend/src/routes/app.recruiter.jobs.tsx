import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Filter, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { PriorityBadge } from "@/components/talent/StatusBadge";
import { jobs as seedJobs, type Job } from "@/mocks/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/recruiter/jobs")({
  head: () => ({ meta: [{ title: "Jobs · TalentForge AI" }] }),
  component: Jobs,
});

type StatusFilter = "All" | "Open" | "Draft" | "Closed";

function Jobs() {
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [openNew, setOpenNew] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return jobs.filter((j) => {
      if (status !== "All" && j.status !== status) return false;
      if (!s) return true;
      return [j.title, j.department, j.location, j.company ?? "", ...(j.skills ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(s);
    });
  }, [jobs, q, status]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Requisitions"
        title="Open Roles"
        description={`${jobs.filter((j) => j.status === "Open").length} active · ${jobs.length} total`}
        actions={
          <AuroraButton onClick={() => setOpenNew(true)}>
            <Plus className="size-4" /> New role
          </AuroraButton>
        }
      />

      <GlassCard className="!p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border hairline surface-1 px-3 py-1.5">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search jobs"
              placeholder="Search roles, departments, skills…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-xs text-muted-foreground hover:text-foreground">
                Clear
              </button>
            )}
          </div>
          <span className="inline-flex items-center gap-2 rounded-lg border hairline surface-1 px-3 py-1.5 text-xs text-muted-foreground">
            <Filter className="size-3.5" /> {filtered.length} shown
          </span>
          <div className="hidden gap-1 rounded-lg border hairline surface-1 p-1 md:inline-flex">
            {(["All", "Open", "Draft", "Closed"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs transition-colors",
                  status === s ? "surface-3 text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="!p-0 overflow-hidden">
        <div className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_100px_100px_120px] items-center gap-4 border-b hairline px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Role</span>
          <span>Department</span>
          <span>Location</span>
          <span>Applicants</span>
          <span>Match</span>
          <span className="text-right">Status</span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-muted-foreground">No roles match "{q}".</p>
            <button
              onClick={() => {
                setQ("");
                setStatus("All");
              }}
              className="mt-3 rounded-lg border hairline surface-1 px-3 py-1.5 text-xs text-foreground hover:surface-2"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((j) => (
              <Link
                key={j.id}
                to="/app/recruiter/jobs/$id"
                params={{ id: j.id }}
                className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_100px_100px_120px] items-center gap-4 px-5 py-4 transition-colors hover:surface-1"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-foreground">{j.title}</span>
                    <PriorityBadge priority={j.priority} />
                  </div>
                  <p className="text-xs text-muted-foreground">Posted {j.postedAt} · {j.type}</p>
                </div>
                <span className="text-sm text-muted-foreground">{j.department}</span>
                <span className="text-sm text-muted-foreground">{j.location}</span>
                <span className="font-mono text-sm text-foreground">{j.applicants}</span>
                <span className="font-mono text-sm text-aurora-cyan">{j.matchRate > 0 ? `${j.matchRate}%` : "—"}</span>
                <span className="text-right">
                  <span className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
                    j.status === "Open" && "border-aurora-emerald/20 bg-aurora-emerald/10 text-aurora-emerald",
                    j.status === "Draft" && "border-amber-500/20 bg-amber-500/10 text-amber-300",
                    j.status === "Closed" && "hairline surface-1 text-muted-foreground",
                  )}>{j.status}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </GlassCard>

      <NewRoleSheet
        open={openNew}
        onClose={() => setOpenNew(false)}
        onCreate={(job) => {
          setJobs((current) => [job, ...current]);
          toast.success("Role created", { description: `${job.title} · ${job.location}` });
          setOpenNew(false);
        }}
      />
    </div>
  );
}

function NewRoleSheet({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (j: Job) => void;
}) {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("Remote · EU");
  const [type, setType] = useState<Job["type"]>("Full-time");
  const [priority, setPriority] = useState<Job["priority"]>("P1");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (title.trim().length < 3) next.title = "Give the role a clear title.";
    if (description.trim().length < 20) next.description = "Add a short description (20+ chars).";
    setErrors(next);
    if (Object.keys(next).length) return;
    const newJob: Job = {
      id: `j-new-${Date.now()}`,
      title: title.trim(),
      department,
      location,
      type,
      status: "Open",
      applicants: 0,
      postedAt: "just now",
      priority,
      matchRate: 0,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      description: description.trim(),
    };
    // reset for next open
    setTitle("");
    setDescription("");
    setSkills("");
    onCreate(newJob);
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
            aria-label="Create a new role"
            className="fixed right-0 top-0 z-50 flex h-full w-[min(520px,100vw)] flex-col border-l hairline bg-background/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-start justify-between border-b hairline p-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-aurora-cyan">New requisition</p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">Create a new role</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-muted-foreground hover:surface-1 hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={submit} noValidate className="flex-1 space-y-4 overflow-y-auto p-5">
              <Field label="Title" error={errors.title}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Staff Backend Engineer"
                  className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Department">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none"
                  >
                    {["Engineering", "Design", "Product", "AI/ML", "Infrastructure", "Data", "Security", "Marketing", "People", "Mobile"].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Location">
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40"
                  />
                </Field>
                <Field label="Employment">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Job["type"])}
                    className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none"
                  >
                    <option>Full-time</option>
                    <option>Contract</option>
                    <option>Part-time</option>
                  </select>
                </Field>
                <Field label="Priority">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Job["priority"])}
                    className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none"
                  >
                    <option>P0</option>
                    <option>P1</option>
                    <option>P2</option>
                  </select>
                </Field>
              </div>
              <Field label="Skills (comma separated)">
                <input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Go, Postgres, Kafka"
                  className="w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40"
                />
              </Field>
              <Field label="Description" error={errors.description}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="What will this person own?"
                  className="w-full resize-none rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none focus:border-aurora-cyan/40"
                />
              </Field>
              <div className="flex items-center justify-end gap-2 border-t hairline pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground hover:surface-2"
                >
                  Cancel
                </button>
                <AuroraButton type="submit">Publish role</AuroraButton>
              </div>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[11px] text-destructive">{error}</span>}
    </label>
  );
}