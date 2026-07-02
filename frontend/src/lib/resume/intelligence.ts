import type { Resume } from "./types";

export type AtsBreakdown = {
  overall: number;
  keywords: number;
  formatting: number;
  sectionCompleteness: number;
  impactMetrics: number;
  readability: number;
  contactInfo: number;
};

export function computeAts(resume: Resume): AtsBreakdown {
  const contactInfo = scoreContact(resume);
  const sectionCompleteness = scoreSections(resume);
  const impactMetrics = scoreImpact(resume);
  const readability = scoreReadability(resume);
  const formatting = scoreFormatting(resume);
  const keywords = scoreKeywords(resume);
  const overall = Math.round(
    contactInfo * 0.1 +
      sectionCompleteness * 0.2 +
      impactMetrics * 0.2 +
      readability * 0.15 +
      formatting * 0.15 +
      keywords * 0.2,
  );
  return { overall, keywords, formatting, sectionCompleteness, impactMetrics, readability, contactInfo };
}

function scoreContact(r: Resume): number {
  const p = r.personal;
  let s = 0;
  if (p.name) s += 25;
  if (p.email) s += 25;
  if (p.phone) s += 20;
  if (p.location) s += 10;
  if (p.linkedin) s += 10;
  if (p.github || p.portfolio) s += 10;
  return Math.min(100, s);
}

function scoreSections(r: Resume): number {
  const required = [
    !!r.summary,
    r.experience.length > 0,
    r.education.length > 0,
    Object.values(r.skills).some((a) => a.length > 0),
  ];
  const bonus = [r.projects.length > 0, r.certifications.length > 0, r.achievements.length > 0];
  const req = required.filter(Boolean).length / required.length;
  const bon = bonus.filter(Boolean).length / bonus.length;
  return Math.round(req * 80 + bon * 20);
}

function scoreImpact(r: Resume): number {
  const bullets = [
    ...r.experience.flatMap((e) => e.bullets),
    ...r.projects.flatMap((p) => p.bullets),
  ];
  if (!bullets.length) return 40;
  const withNumbers = bullets.filter((b) => /\d/.test(b) || /%|\$|₹|\bx\b/i.test(b));
  return Math.round(Math.min(100, (withNumbers.length / bullets.length) * 100 + 10));
}

function scoreReadability(r: Resume): number {
  const text = [
    r.summary,
    ...r.experience.flatMap((e) => e.bullets),
    ...r.projects.flatMap((p) => p.bullets),
  ].join(" ");
  if (!text) return 60;
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (!sentences.length) return 60;
  const avg = words.length / sentences.length;
  // ideal 12–20 words/sentence
  const dev = Math.min(20, Math.abs(avg - 16));
  return Math.round(100 - dev * 3);
}

function scoreFormatting(r: Resume): number {
  let s = 60;
  if (r.experience.every((e) => e.bullets.length > 0)) s += 15;
  if (r.experience.every((e) => e.start || e.end)) s += 10;
  if (r.education.every((e) => e.school)) s += 10;
  if (r.summary && r.summary.length < 500) s += 5;
  return Math.min(100, s);
}

function scoreKeywords(r: Resume): number {
  const total = Object.values(r.skills).reduce((n, a) => n + a.length, 0);
  if (total >= 20) return 100;
  if (total >= 12) return 85;
  if (total >= 8) return 72;
  if (total >= 4) return 55;
  if (total >= 1) return 35;
  return 15;
}

export type Suggestion = { id: string; title: string; detail: string; section: string; impact: number };

export function suggestImprovements(r: Resume): Suggestion[] {
  const out: Suggestion[] = [];
  if (!r.personal.linkedin) out.push({ id: "add-linkedin", title: "Add a LinkedIn URL", detail: "Recruiters expect a LinkedIn link in the header.", section: "personal", impact: 6 });
  if (!r.personal.github && !r.personal.portfolio) out.push({ id: "add-portfolio", title: "Link a portfolio or GitHub", detail: "Public work builds trust for technical roles.", section: "personal", impact: 5 });
  if (r.summary && r.summary.split(/\s+/).length > 70) out.push({ id: "shorten-summary", title: "Trim your summary", detail: "Aim for 40–60 words so recruiters can scan it in seconds.", section: "summary", impact: 4 });
  if (!r.summary) out.push({ id: "add-summary", title: "Add a professional summary", detail: "Lead with scope, focus areas, and the outcome you drive.", section: "summary", impact: 8 });
  r.experience.forEach((e, i) => {
    const noMetric = e.bullets.filter((b) => !/\d/.test(b));
    if (noMetric.length > 0) out.push({ id: `metric-${e.id}`, title: `Quantify ${e.role || `role ${i + 1}`}`, detail: `${noMetric.length} bullet(s) lack numbers — recruiters weight measurable outcomes 2× higher.`, section: "experience", impact: 7 });
  });
  if (r.projects.length === 0) out.push({ id: "add-projects", title: "Add at least one project", detail: "Projects showcase applied skills beyond job titles.", section: "projects", impact: 6 });
  const skillTotal = Object.values(r.skills).reduce((n, a) => n + a.length, 0);
  if (skillTotal < 8) out.push({ id: "expand-skills", title: "Expand your Skills section", detail: "Add languages, frameworks, cloud, and tools for better keyword match.", section: "skills", impact: 8 });
  return out;
}

export function skillRadar(r: Resume) {
  return [
    { skill: "Languages", value: cap(r.skills.languages.length * 15) },
    { skill: "Frameworks", value: cap(r.skills.frameworks.length * 15) },
    { skill: "Databases", value: cap(r.skills.databases.length * 20) },
    { skill: "Cloud", value: cap(r.skills.cloud.length * 18) },
    { skill: "Tools", value: cap(r.skills.tools.length * 14) },
    { skill: "Leadership", value: cap(r.skills.soft.length * 15 + r.experience.length * 8) },
  ];
}

function cap(n: number) { return Math.max(10, Math.min(100, Math.round(n))); }

export function readinessScores(r: Resume) {
  const ats = computeAts(r).overall;
  return {
    career: Math.round(ats * 0.6 + Math.min(30, r.experience.length * 10) + Math.min(10, r.projects.length * 3)),
    interview: Math.round(ats * 0.5 + Math.min(50, r.experience.reduce((n, e) => n + e.bullets.length, 0) * 3)),
    jobFit: Math.round(ats * 0.7 + Math.min(30, Object.values(r.skills).reduce((n, a) => n + a.length, 0))),
    companyFit: Math.round(ats * 0.65 + Math.min(35, r.certifications.length * 8 + r.projects.length * 5)),
  };
}

// ---------- Extended intelligence used by the Insights suite ----------

const STRONG_VERBS = [
  "led","shipped","scaled","built","launched","designed","architected","drove","grew","reduced",
  "increased","optimized","automated","migrated","delivered","owned","mentored","spearheaded",
  "improved","implemented","refactored","accelerated","streamlined","released","managed","hired",
];

const TARGET_KEYWORDS = [
  "docker","kubernetes","ci/cd","cloud","aws","gcp","azure","terraform","typescript","react",
  "node","python","java","sql","payments","growth","ml","ai","distributed","microservices",
];

export function subScores(r: Resume) {
  const ats = computeAts(r);
  const bullets = [...r.experience.flatMap(e => e.bullets), ...r.projects.flatMap(p => p.bullets)].filter(b => b.trim());
  const withMetric = bullets.filter(b => /\d/.test(b)).length;
  const experience = Math.min(100, r.experience.length * 22 + withMetric * 4);
  const projects = Math.min(100, r.projects.length * 25 + r.projects.reduce((n, p) => n + p.bullets.length, 0) * 4);
  const achievements = Math.min(100, (r.achievements.length + r.awards.length + r.certifications.length) * 18 + 30);
  const grammar = Math.max(40, 100 - passiveVoiceCount(r) * 6);
  return {
    ats: ats.overall,
    grammar,
    readability: ats.readability,
    keywords: ats.keywords,
    experience,
    projects,
    achievements,
    formatting: ats.formatting,
  };
}

export function passiveVoiceCount(r: Resume): number {
  const text = [r.summary, ...r.experience.flatMap(e => e.bullets), ...r.projects.flatMap(p => p.bullets)].join(" ");
  const matches = text.match(/\b(was|were|been|being|is|are|be)\s+\w+ed\b/gi);
  return matches ? matches.length : 0;
}

export function actionVerbs(r: Resume): string[] {
  const bullets = [...r.experience.flatMap(e => e.bullets), ...r.projects.flatMap(p => p.bullets)];
  const found = new Set<string>();
  for (const b of bullets) {
    const w = b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (w && STRONG_VERBS.includes(w)) found.add(w);
  }
  return Array.from(found).slice(0, 8);
}

export function impactScoreValue(r: Resume): number {
  const bullets = [...r.experience.flatMap(e => e.bullets), ...r.projects.flatMap(p => p.bullets)].filter(b => b.trim());
  if (!bullets.length) return 0;
  const withMetric = bullets.filter(b => /\d/.test(b) || /%|\$|₹/.test(b)).length;
  return Math.round((withMetric / bullets.length) * 100);
}

export function topStrengths(r: Resume): string {
  const buckets = Object.entries(r.skills).sort((a, b) => b[1].length - a[1].length);
  const top = buckets.filter(([, v]) => v.length > 0).slice(0, 2).map(([k]) => k);
  if (top.length === 0) return "Add skills to surface strengths";
  const pretty = top.map(t => t[0].toUpperCase() + t.slice(1)).join(" + ");
  return `${pretty} depth`;
}

export function weakSection(r: Resume): string {
  const ss = subScores(r);
  const entries = Object.entries(ss) as [keyof typeof ss, number][];
  const worst = entries.sort((a, b) => a[1] - b[1])[0];
  const map: Record<string, string> = {
    achievements: "Achievements need metrics",
    experience: "Experience needs depth",
    projects: "Projects need business impact",
    grammar: "Reduce passive voice",
    readability: "Tighten sentence length",
    keywords: "Expand skill keywords",
    formatting: "Improve formatting consistency",
    ats: "Improve ATS parseability",
  };
  return map[worst[0]] ?? "Refine content";
}

export function missingKeywords(r: Resume): string[] {
  const have = new Set(
    Object.values(r.skills).flat().map(s => s.toLowerCase()),
  );
  return TARGET_KEYWORDS.filter(k => !have.has(k)).slice(0, 4).map(pretty);
}

export function strongKeywords(r: Resume): string[] {
  const have = Object.values(r.skills).flat();
  return have.slice(0, 4);
}

function pretty(s: string) {
  if (s === "ci/cd") return "CI/CD";
  if (s.length <= 3) return s.toUpperCase();
  return s[0].toUpperCase() + s.slice(1);
}

export function careerAdvice(r: Resume): string {
  const years = r.experience.length;
  if (years >= 4) return "Target Staff / Principal roles";
  if (years >= 2) return "Target Senior / Lead roles";
  if (years >= 1) return "Target Mid-level roles";
  return "Target Junior / Associate roles";
}

export function marketDemand(r: Resume): string {
  const has = (k: string) => Object.values(r.skills).flat().some(s => s.toLowerCase().includes(k));
  if (has("payments") || has("fintech")) return "+18% demand for fintech roles";
  if (has("ai") || has("ml")) return "+24% demand for AI/ML roles";
  if (has("cloud") || has("aws")) return "+15% demand for cloud roles";
  return "+10% demand in your field";
}

export function expectedSalary(r: Resume): { min: number; max: number; currency: string } {
  const yrs = r.experience.length;
  const base = 8 + yrs * 6;
  const skillBonus = Math.min(20, Object.values(r.skills).flat().length);
  const min = Math.max(6, base + skillBonus - 4);
  const max = min + Math.max(12, Math.round(min * 0.6));
  return { min, max, currency: "₹" };
}

export function priorityAction(r: Resume): string {
  const sug = suggestImprovements(r).sort((a, b) => b.impact - a.impact)[0];
  return sug?.title ?? "Keep iterating";
}

export function recruiterVisibility(r: Resume): number {
  const ats = computeAts(r);
  return Math.round(ats.overall * 0.6 + ats.keywords * 0.25 + ats.contactInfo * 0.15);
}

export function jobMatch(r: Resume): number {
  const skillCount = Object.values(r.skills).flat().length;
  return Math.min(99, 40 + skillCount * 3 + r.experience.length * 5);
}