import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpDown, Download, Filter, Search, SlidersHorizontal, Star, UserX, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { CandidateAvatar } from "@/components/talent/CandidateAvatar";
import { MatchScoreBar } from "@/components/talent/MatchScore";
import { StageBadge } from "@/components/talent/StatusBadge";
import { candidates as seedCandidates, type Candidate, type Stage } from "@/mocks/data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/recruiter/candidates")({
  head: () => ({ meta: [{ title: "Candidates · TalentForge AI" }] }),
  component: Candidates,
});

const STAGES: Stage[] = ["Applied", "Screening", "Interview", "Technical", "Offer", "Hired", "Rejected"];
type SortKey = "match" | "resume" | "experience" | "recent";
const SORTS: { key: SortKey; label: string }[] = [
  { key: "match", label: "Match score" },
  { key: "resume", label: "Resume score" },
  { key: "experience", label: "Experience" },
  { key: "recent", label: "Recently applied" },
];

function Candidates() {
  const [q, setQ] = useState("");
  const [stages, setStages] = useState<Set<Stage>>(new Set());
  const [minExp, setMinExp] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("match");
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [rejected, setRejected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = seedCandidates
      .filter((c) => !rejected.has(c.id))
      .filter((c) => {
        if (stages.size && !stages.has(c.stage)) return false;
        if (c.experience < minExp) return false;
        if (!s) return true;
        return [c.name, c.role, c.location, ...c.skills].join(" ").toLowerCase().includes(s);
      });
    return [...base].sort((a, b) => {
      switch (sortKey) {
        case "match": return b.matchScore - a.matchScore;
        case "resume": return b.resumeScore - a.resumeScore;
        case "experience": return b.experience - a.experience;
        case "recent": return a.appliedAt.localeCompare(b.appliedAt);
      }
    });
  }, [q, stages, minExp, sortKey, rejected]);

  const activeFilters = stages.size + (minExp > 0 ? 1 : 0);

  function toggleStage(s: Stage) {
    setStages((cur) => {
      const next = new Set(cur);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  function shortlist(c: Candidate) {
    setShortlisted((cur) => new Set(cur).add(c.id));
    toast.success("Shortlisted", { description: `${c.name} was added to your shortlist.` });
  }

  function reject(c: Candidate) {
    setRejected((cur) => new Set(cur).add(c.id));
    toast.info("Candidate rejected", { description: `${c.name} was removed from the pool.` });
  }

  function downloadResume(c: Candidate) {
    const text = `${c.name}\n${c.role} · ${c.location}\nExperience: ${c.experience} years\nSkills: ${c.skills.join(", ")}\nEmail: ${c.email}\n`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${c.name.replace(/\s+/g, "_")}_resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Resume downloaded", { description: `${c.name.replace(/\s+/g, "_")}_resume.txt` });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow={`${filtered.length} of ${seedCandidates.length} people`}
        title="Talent Pool"
        description="Semantic search across every candidate you've ever touched."
      />

      <GlassCard className="!p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border hairline surface-1 px-3 py-1.5">
            <Search className="size-4 text-aurora-cyan" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='e.g. "senior rust engineer with kafka, remote EU"'
              aria-label="Search candidates"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-xs text-muted-foreground hover:text-foreground">
                Clear
              </button>
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded-lg border hairline surface-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Filter className="size-3.5" /> Filter
                {activeFilters > 0 && (
                  <span className="ml-1 rounded-full bg-aurora-cyan/20 px-1.5 text-[10px] text-aurora-cyan">
                    {activeFilters}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 hairline bg-background/95 backdrop-blur-xl">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Stage</p>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {STAGES.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStage(s)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                      stages.has(s)
                        ? "border-aurora-cyan/40 bg-aurora-cyan/15 text-aurora-cyan"
                        : "hairline surface-1 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Minimum experience
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={15}
                  value={minExp}
                  onChange={(e) => setMinExp(Number(e.target.value))}
                  className="flex-1 accent-aurora-cyan"
                />
                <span className="w-14 text-right font-mono text-xs text-foreground">{minExp}+ yrs</span>
              </div>
              <button
                onClick={() => { setStages(new Set()); setMinExp(0); }}
                className="mt-4 w-full rounded-lg border hairline surface-1 px-3 py-1.5 text-xs text-foreground hover:surface-2"
              >
                Reset filters
              </button>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded-lg border hairline surface-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                <SlidersHorizontal className="size-3.5" /> Rank by {SORTS.find((s) => s.key === sortKey)?.label.toLowerCase()}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 hairline bg-background/95 p-1 backdrop-blur-xl">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSortKey(s.key)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                    sortKey === s.key ? "surface-2 text-foreground" : "text-muted-foreground hover:surface-1 hover:text-foreground",
                  )}
                >
                  <span className="inline-flex items-center gap-2"><ArrowUpDown className="size-3.5" /> {s.label}</span>
                  {sortKey === s.key && <span className="text-aurora-cyan">•</span>}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {(stages.size > 0 || minExp > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {[...stages].map((s) => (
              <Chip key={s} onRemove={() => toggleStage(s)}>{s}</Chip>
            ))}
            {minExp > 0 && <Chip onRemove={() => setMinExp(0)}>{minExp}+ years experience</Chip>}
          </div>
        )}
      </GlassCard>

      {filtered.length === 0 ? (
        <GlassCard className="text-center">
          <p className="text-sm font-medium text-foreground">No candidates match your filters.</p>
          <button
            onClick={() => { setQ(""); setStages(new Set()); setMinExp(0); }}
            className="mt-3 rounded-lg border hairline surface-1 px-3 py-1.5 text-xs text-foreground hover:surface-2"
          >
            Reset all
          </button>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <GlassCard
              key={c.id}
              className={cn(
                "h-full transition-all hover:-translate-y-0.5 hover:hairline-strong hover:shadow-[0_20px_60px_-30px_var(--color-aurora-violet)]",
                shortlisted.has(c.id) && "ring-1 ring-aurora-emerald/40",
              )}
            >
              <Link to="/app/recruiter/candidates/$id" params={{ id: c.id }} className="block">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <CandidateAvatar initials={c.initials} tint={c.avatarTint} size={44} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.role}</p>
                    </div>
                  </div>
                  <StageBadge stage={c.stage} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {c.location} · {c.experience} yrs exp · applied {c.appliedAt}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.skills.slice(0, 4).map((s) => (
                    <span key={s} className="rounded-md border hairline surface-1 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Resume score</p>
                    <p className="font-mono text-lg text-foreground">{c.resumeScore}</p>
                  </div>
                  <MatchScoreBar score={c.matchScore} />
                </div>
              </Link>
              <div className="mt-4 flex items-center gap-1.5 border-t hairline pt-3">
                <ActionBtn onClick={() => shortlist(c)} active={shortlisted.has(c.id)} icon={Star} label={shortlisted.has(c.id) ? "Shortlisted" : "Shortlist"} />
                <ActionBtn onClick={() => downloadResume(c)} icon={Download} label="Resume" />
                <ActionBtn onClick={() => reject(c)} icon={UserX} label="Reject" tone="danger" />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-aurora-cyan/25 bg-aurora-cyan/10 px-2 py-0.5 text-[11px] text-aurora-cyan">
      {children}
      <button onClick={onRemove} aria-label="Remove filter" className="text-aurora-cyan/70 hover:text-aurora-cyan">
        <X className="size-3" />
      </button>
    </span>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  active,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  tone?: "danger";
}) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border hairline surface-1 px-2 py-1.5 text-[11px] font-medium transition-colors",
        active && "border-aurora-emerald/40 bg-aurora-emerald/10 text-aurora-emerald",
        !active && tone === "danger" && "text-destructive hover:border-destructive/40 hover:bg-destructive/10",
        !active && !tone && "text-muted-foreground hover:text-foreground hover:surface-2",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}