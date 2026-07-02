import { extractResumeText } from "@/lib/interview/parsers";
import { emptyResume, uid, type EducationItem, type ExperienceItem, type ProjectItem, type Resume, type SkillBuckets } from "./types";

// =====================================================================================
// Public API
// =====================================================================================

export async function parseResume(file: File): Promise<Resume> {
  const rawText = await extractResumeText(file);
  const resume = parseResumeText(rawText);
  resume.meta.source = {
    fileName: file.name,
    sizeKB: Math.round(file.size / 1024),
    parsedAt: new Date().toISOString(),
  };
  return resume;
}

export function parseResumeText(rawText: string): Resume {
  const resume = emptyResume();
  const text = normalize(rawText);
  const lines = text.split(/\n/).map((l) => l.replace(/\s+$/g, ""));

  // 1) Contact + identity — run against whole text.
  extractContact(text, lines, resume);

  // 2) Split into sections.
  const blocks = splitBySections(lines);
  const detectedKinds = new Set<string>();

  for (const block of blocks) {
    const kind = classifyHeading(block.heading);
    if (!kind) continue;
    detectedKinds.add(kind);
    const body = trimEmpty(block.body);
    switch (kind) {
      case "summary":
        resume.summary = body.join(" ").replace(/\s+/g, " ").trim();
        break;
      case "experience":
        resume.experience.push(...parseExperience(body));
        break;
      case "internships":
        resume.internships.push(...parseExperience(body));
        break;
      case "education":
        resume.education.push(...parseEducation(body));
        break;
      case "projects":
        resume.projects.push(...parseProjects(body));
        break;
      case "skills":
        mergeSkills(resume.skills, parseSkills(body.join("\n")));
        break;
      case "certifications":
        resume.certifications.push(...toItems(body));
        break;
      case "achievements":
        resume.achievements.push(...toItems(body));
        break;
      case "awards":
        resume.awards.push(...toItems(body));
        break;
      case "languages":
        resume.languages.push(...toItems(splitInline(body)));
        break;
      case "publications":
        resume.publications.push(...toItems(body));
        break;
      case "volunteer":
        resume.volunteer.push(...toItems(body));
        break;
      case "interests":
        resume.interests.push(...toItems(splitInline(body)));
        break;
    }
  }

  // 3) Fallbacks — recover data even when heading detection missed.
  if (!resume.summary) {
    const p = paragraphAfterContact(lines);
    if (p && p.split(/\s+/).length >= 8) resume.summary = p;
  }
  if (skillCount(resume.skills) === 0) {
    mergeSkills(resume.skills, parseSkills(text));
  }

  // 4) Meta — detected vs missing sections + confidence.
  const allSections = [
    "summary","experience","education","projects","skills",
    "certifications","achievements","languages","publications","awards","volunteer","interests",
  ];
  resume.meta.detectedSections = allSections.filter((k) => hasContent(resume, k));
  resume.meta.missingSections = allSections.filter((k) => !hasContent(resume, k));
  const signals = [
    !!resume.personal.name,
    !!resume.personal.email,
    !!resume.personal.phone,
    !!resume.summary,
    resume.experience.length > 0,
    resume.education.length > 0,
    resume.projects.length > 0,
    skillCount(resume.skills) > 0,
  ];
  resume.meta.confidence = Math.round((signals.filter(Boolean).length / signals.length) * 100);
  return resume;
}

// =====================================================================================
// Normalization
// =====================================================================================

function normalize(s: string): string {
  return s
    .replace(/\r/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/[\t\u2000-\u200B]/g, " ")
    .replace(/[▪◦●■⁃◆·]/g, "•")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

// =====================================================================================
// Contact extraction
// =====================================================================================

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
const PHONE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{3,5}(?:[\s.-]?\d{2,4})?/;
const URL_RE = /(?:https?:\/\/|www\.)[^\s,)"'<>]+/gi;
const BARE_LINKEDIN = /linkedin\.com\/(?:in|pub)\/[A-Za-z0-9\-_.%]+/i;
const BARE_GITHUB = /github\.com\/[A-Za-z0-9\-_.]+/i;

const PROFILE_HOSTS: Array<[keyof import("./types").PersonalInfo, RegExp]> = [
  ["linkedin", /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|pub)\/[A-Za-z0-9\-_.%]+/i],
  ["github", /(?:https?:\/\/)?github\.com\/[A-Za-z0-9\-_.]+/i],
  ["leetcode", /(?:https?:\/\/)?(?:www\.)?leetcode\.com\/[A-Za-z0-9\-_./]+/i],
  ["codechef", /(?:https?:\/\/)?(?:www\.)?codechef\.com\/users\/[A-Za-z0-9_\-]+/i],
  ["codeforces", /(?:https?:\/\/)?(?:www\.)?codeforces\.com\/profile\/[A-Za-z0-9_\-]+/i],
  ["hackerrank", /(?:https?:\/\/)?(?:www\.)?hackerrank\.com\/(?:profile\/)?[A-Za-z0-9_\-]+/i],
  ["gfg", /(?:https?:\/\/)?(?:auth\.|www\.)?geeksforgeeks\.org\/(?:user\/)?[A-Za-z0-9_\-]+/i],
  ["stackoverflow", /(?:https?:\/\/)?(?:www\.)?stackoverflow\.com\/users\/\d+(?:\/[A-Za-z0-9\-_]+)?/i],
  ["kaggle", /(?:https?:\/\/)?(?:www\.)?kaggle\.com\/[A-Za-z0-9_\-]+/i],
  ["medium", /(?:https?:\/\/)?(?:www\.)?medium\.com\/@?[A-Za-z0-9_\-.]+/i],
  ["devto", /(?:https?:\/\/)?dev\.to\/[A-Za-z0-9_\-]+/i],
  ["behance", /(?:https?:\/\/)?(?:www\.)?behance\.net\/[A-Za-z0-9_\-]+/i],
  ["dribbble", /(?:https?:\/\/)?dribbble\.com\/[A-Za-z0-9_\-]+/i],
];

function extractContact(text: string, lines: string[], resume: Resume): void {
  const email = text.match(EMAIL)?.[0];
  if (email) resume.personal.email = email;
  const phone = pickPhone(text);
  if (phone) resume.personal.phone = phone;

  const urls = new Set<string>();
  const collect = (src: string) => {
    const m = src.match(URL_RE);
    if (m) m.forEach((u) => urls.add(u.replace(/[),.;]+$/, "")));
  };
  collect(text);
  // Also detect bare `linkedin.com/in/...` without protocol.
  const bareLi = text.match(BARE_LINKEDIN)?.[0];
  if (bareLi) urls.add(bareLi);
  const bareGh = text.match(BARE_GITHUB)?.[0];
  if (bareGh) urls.add(bareGh);

  const remaining = new Set(Array.from(urls));
  for (const [key, re] of PROFILE_HOSTS) {
    for (const u of Array.from(remaining)) {
      if (re.test(u)) {
        // @ts-expect-error dynamic key
        resume.personal[key] = normalizeUrl(u);
        remaining.delete(u);
        break;
      }
    }
  }
  // Whatever's left → portfolio/website.
  for (const u of remaining) {
    if (!resume.personal.portfolio) resume.personal.portfolio = normalizeUrl(u);
    else if (!resume.personal.website) { resume.personal.website = normalizeUrl(u); break; }
  }

  // Name / headline / location from top of document.
  const topLines = lines.filter((l) => l.trim()).slice(0, 10);
  const isNameLike = (l: string) =>
    !EMAIL.test(l) &&
    !/https?:|www\.|@|\+\d|linkedin|github/i.test(l) &&
    l.length >= 3 &&
    l.length <= 60 &&
    /^[A-Za-z][A-Za-z .'\-]+$/.test(l) &&
    l.trim().split(/\s+/).length >= 2 &&
    l.trim().split(/\s+/).length <= 5 &&
    !/^(?:resume|curriculum|cv|profile|summary|objective|contact)$/i.test(l);
  const nameLine = topLines.find(isNameLike);
  if (nameLine) resume.personal.name = titleCase(nameLine.trim());

  const headlineLine = topLines.find(
    (l) =>
      l !== nameLine &&
      !EMAIL.test(l) &&
      !URL_RE.test(l) &&
      !/^[\d+()\s.-]+$/.test(l) &&
      l.length >= 6 &&
      l.length <= 90 &&
      /[A-Za-z]/.test(l) &&
      !/^\s*(experience|education|skills|projects|summary|objective)\b/i.test(l),
  );
  if (headlineLine) resume.personal.headline = headlineLine.trim();

  const locLine = topLines
    .map((l) => l.match(/([A-Z][A-Za-z .'\-]+),\s*([A-Z][A-Za-z .'\-]+)/))
    .find((m): m is RegExpMatchArray => !!m);
  if (locLine) resume.personal.location = `${locLine[1]}, ${locLine[2]}`;
}

function pickPhone(text: string): string | undefined {
  // Prefer phone appearing near contact block (first 30 lines / near email).
  const lines = text.split(/\n/).slice(0, 60);
  for (const l of lines) {
    const m = l.match(PHONE);
    if (!m) continue;
    const digits = m[0].replace(/\D/g, "");
    if (digits.length >= 8 && digits.length <= 15) return m[0].trim();
  }
  return undefined;
}

function normalizeUrl(u?: string): string | undefined {
  if (!u) return undefined;
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

function titleCase(s: string): string {
  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) return s; // mixed already, leave it
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// =====================================================================================
// Section splitting + heading classification
// =====================================================================================

type Block = { heading: string; body: string[] };

const HEADING_SYNONYMS: Record<string, RegExp> = {
  summary: /^(?:summary|profile|about(?:\s*me)?|professional\s+summary|career\s+objective|objective|overview)\b/i,
  internships: /^(?:internships?|training|apprenticeship)\b/i,
  experience: /^(?:work\s+experience|professional\s+experience|employment(?:\s+history)?|experience|work\s+history|career)\b/i,
  education: /^(?:education|academic\s+background|academics|qualifications?|educational\s+background)\b/i,
  projects: /^(?:projects?|academic\s+projects?|personal\s+projects?|technical\s+projects?|selected\s+projects?)\b/i,
  skills: /^(?:skills?|technical\s+skills?|core\s+skills?|technologies|tools?|tech\s*stack|areas?\s+of\s+expertise)\b/i,
  certifications: /^(?:certifications?|licenses?|credentials?)\b/i,
  achievements: /^(?:achievements?|honou?rs?|accomplishments?)\b/i,
  awards: /^(?:awards?|honou?rs?\s+and\s+awards?|recognitions?)\b/i,
  languages: /^(?:languages?)\b/i,
  publications: /^(?:publications?|papers?|research)\b/i,
  volunteer: /^(?:volunteer(?:\s+work)?|community(?:\s+service)?)\b/i,
  interests: /^(?:interests?|hobbies|extra[\s-]?curricular)\b/i,
};

function classifyHeading(h: string): string | null {
  const s = h.trim().replace(/[:•\-–—]+$/g, "").trim();
  if (!s) return null;
  for (const [kind, re] of Object.entries(HEADING_SYNONYMS)) {
    if (re.test(s)) return kind;
  }
  return null;
}

function isHeadingLine(line: string): boolean {
  const l = line.trim();
  if (!l) return false;
  if (l.length > 50) return false;
  if (/[.!?]$/.test(l)) return false;
  if (classifyHeading(l)) return true;
  // Fully uppercase (5+ chars, mostly letters) is treated as a heading.
  const letters = l.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 3 && letters === letters.toUpperCase() && l.length <= 40 && !/\d{2,}/.test(l)) {
    return true;
  }
  return false;
}

function splitBySections(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let current: Block | null = null;
  for (const line of lines) {
    if (!line.trim()) {
      if (current) current.body.push("");
      continue;
    }
    if (isHeadingLine(line) && classifyHeading(line)) {
      if (current) blocks.push(current);
      current = { heading: line.trim(), body: [] };
    } else if (current) {
      current.body.push(line);
    } else {
      // pre-heading content (header block) — ignored for section parsing.
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

function trimEmpty(arr: string[]): string[] {
  let s = 0, e = arr.length;
  while (s < e && !arr[s].trim()) s++;
  while (e > s && !arr[e - 1].trim()) e--;
  return arr.slice(s, e);
}

function paragraphAfterContact(lines: string[]): string {
  const start = lines.findIndex((l) => EMAIL.test(l) || URL_RE.test(l) || PHONE.test(l));
  const from = start === -1 ? 3 : start + 1;
  const buf: string[] = [];
  for (let i = from; i < lines.length && buf.length < 8; i++) {
    const l = lines[i];
    if (!l.trim()) {
      if (buf.length) break;
      continue;
    }
    if (isHeadingLine(l)) break;
    buf.push(l.trim());
  }
  return buf.join(" ").replace(/\s+/g, " ").trim();
}

// =====================================================================================
// Section parsers
// =====================================================================================

function groupByBlankLine(lines: string[]): string[][] {
  const out: string[][] = [];
  let cur: string[] = [];
  for (const l of lines) {
    if (!l.trim()) {
      if (cur.length) { out.push(cur); cur = []; }
    } else {
      cur.push(l);
    }
  }
  if (cur.length) out.push(cur);
  if (out.length <= 1 && lines.length > 4) return groupByHeadingHeuristic(lines);
  return out;
}

// When no blank lines, split whenever we see a "header-ish" non-bullet line
// after we've already seen at least one bullet.
function groupByHeadingHeuristic(lines: string[]): string[][] {
  const out: string[][] = [];
  let cur: string[] = [];
  const isBullet = (l: string) => /^[•\-*·–—]\s+/.test(l.trim());
  const looksLikeHeader = (l: string) =>
    !isBullet(l) &&
    l.length <= 100 &&
    (/\b(19|20)\d{2}\b/.test(l) || /\s[–—-]\s/.test(l) || /^[A-Z]/.test(l.trim()));
  for (const l of lines) {
    if (cur.length && cur.some(isBullet) && looksLikeHeader(l)) {
      out.push(cur);
      cur = [];
    }
    cur.push(l);
  }
  if (cur.length) out.push(cur);
  return out;
}

function extractDateRange(s: string): { start?: string; end?: string; current?: boolean } | null {
  const MONTHS = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December";
  const dateToken = `(?:(?:${MONTHS})\\.?\\s+)?(?:\\d{4}|\\d{2})`;
  const re = new RegExp(`(${dateToken})\\s*(?:[-–—to]+|to)\\s*(${dateToken}|Present|Current|Now|Ongoing)`, "i");
  const m = s.match(re);
  if (m) {
    const end = m[2].trim();
    return { start: m[1].trim(), end, current: /^(present|current|now|ongoing)$/i.test(end) };
  }
  const single = s.match(/\b(19|20)\d{2}\b/);
  if (single) return { start: single[0], end: undefined };
  return null;
}

function stripBullet(l: string): string {
  return l.replace(/^[•\-*·–—▪◦●■]+\s*/, "").trim();
}

function parseExperience(body: string[]): ExperienceItem[] {
  const groups = groupByBlankLine(body);
  const out: ExperienceItem[] = [];
  for (const g of groups) {
    const header = g.slice(0, 3).filter((l) => !/^[•\-*·–—]/.test(l));
    const headerText = header.join(" · ");
    const dates = extractDateRange(headerText);

    // Split header into role / company.
    let role = "", company = "", location = "";
    const firstLine = (g[0] ?? "").trim();
    const secondLine = (g[1] ?? "").trim();

    // Common shapes:
    //  "Software Engineer — Acme Corp"
    //  "Software Engineer, Acme Corp"
    //  "Acme Corp — Software Engineer"
    //  "Software Engineer | Acme | Remote | 2022 - Present"
    const cleaned = firstLine.replace(/\s*\((?:[^()]*\d{4}[^()]*)\)\s*/g, " ").trim();
    const parts = cleaned.split(/\s+[·|—–\-]\s+|\s+at\s+/i).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      role = parts[0];
      company = parts[1];
      if (parts[2] && /[A-Z]/.test(parts[2]) && !/\d{3,}/.test(parts[2])) location = parts[2];
    } else {
      role = firstLine;
      if (secondLine && !/^[•\-*·–—]/.test(secondLine)) company = secondLine.split(/\s+[·|—–]\s+/)[0];
    }

    const locMatch = headerText.match(/\b([A-Z][A-Za-z .'\-]+,\s*[A-Z][A-Za-z .'\-]+)\b/);
    if (locMatch && !location) location = locMatch[1];

    const empType = headerText.match(/\b(Intern(?:ship)?|Full[\s-]?time|Part[\s-]?time|Contract|Freelance|Consultant|Temporary)\b/i)?.[1];

    const bullets = g
      .slice(1)
      .filter((l) => l.trim())
      .filter((l) => /^[•\-*·–—]/.test(l) || l.length > 20)
      .map(stripBullet)
      .filter(Boolean);

    if (!role && !company && bullets.length === 0) continue;

    out.push({
      id: uid("exp"),
      role: role.replace(/\d{4}.*$/, "").trim(),
      company: company.replace(/\d{4}.*$/, "").trim(),
      location: location || undefined,
      start: dates?.start,
      end: dates?.end,
      bullets,
      employmentType: empType || undefined,
      durationMonths: computeMonths(dates?.start, dates?.end),
    });
  }
  return out;
}

function computeMonths(start?: string, end?: string): number | undefined {
  const parseYM = (s?: string): { y: number; m: number } | null => {
    if (!s) return null;
    if (/^(present|current|now|ongoing)$/i.test(s)) {
      const d = new Date();
      return { y: d.getFullYear(), m: d.getMonth() + 1 };
    }
    const monthMap: Record<string, number> = {
      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7,
      aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
    };
    const m = s.toLowerCase().match(/([a-z]+)?\.?\s*(\d{4})/);
    if (!m) return null;
    const mm = m[1] ? monthMap[m[1].slice(0, 4)] || monthMap[m[1].slice(0, 3)] || 1 : 1;
    return { y: Number(m[2]), m: mm };
  };
  const a = parseYM(start);
  const b = parseYM(end) ?? parseYM("present");
  if (!a || !b) return undefined;
  const months = (b.y - a.y) * 12 + (b.m - a.m);
  return months > 0 && months < 600 ? months : undefined;
}

function parseEducation(body: string[]): EducationItem[] {
  const groups = groupByBlankLine(body);
  const out: EducationItem[] = [];
  for (const g of groups) {
    const joined = g.join(" · ");
    const dates = extractDateRange(joined);
    const cgpaMatch = joined.match(/\b(?:CGPA|GPA)\s*[:\-]?\s*([\d.]+(?:\s*\/\s*\d+(?:\.\d+)?)?)/i);
    const pctMatch = joined.match(/\b(\d{2}(?:\.\d+)?)\s*%/);
    const schoolLine = g.find((l) => /\b(University|College|Institute|School|Academy|Polytechnic|IIT|NIT|BITS|IIIT)\b/i.test(l))
      || g[0]
      || "";
    const degreeMatch = joined.match(/\b(B\.?Tech|B\.?E\.?|B\.?Sc\.?|B\.?A\.?|B\.?Com\.?|B\.?B\.?A\.?|BCA|MCA|M\.?Tech|M\.?E\.?|M\.?Sc\.?|M\.?A\.?|MBA|Ph\.?D|Bachelor(?:'s)?(?:\s+of\s+[A-Za-z]+)?|Master(?:'s)?(?:\s+of\s+[A-Za-z]+)?|Diploma|High\s+School|Class\s+X{1,2}|12th|10th)\b[^,·|\n]*/i);
    const fieldMatch = joined.match(/\bin\s+([A-Z][A-Za-z &/\-]+?)(?=[,·|\n]|$)/);
    const courseworkMatch = joined.match(/\b(?:relevant\s+)?coursework\s*[:\-]\s*([^.\n]+)/i);
    out.push({
      id: uid("edu"),
      school: cleanupLine(schoolLine),
      degree: degreeMatch?.[1]?.trim(),
      field: fieldMatch?.[1]?.trim(),
      start: dates?.start,
      end: dates?.end,
      current: dates?.current,
      cgpa: cgpaMatch?.[1]?.trim(),
      percentage: pctMatch ? `${pctMatch[1]}%` : undefined,
      coursework: courseworkMatch ? courseworkMatch[1].split(/[,;]/).map((s) => s.trim()).filter(Boolean) : undefined,
      details: g.slice(1).join(" ").trim() || undefined,
    });
  }
  return out;
}

function cleanupLine(l: string): string {
  return l.replace(/^[•\-*·–—]\s*/, "").replace(/\s+/g, " ").trim();
}

function parseProjects(body: string[]): ProjectItem[] {
  const groups = groupByBlankLine(body);
  const out: ProjectItem[] = [];
  for (const g of groups) {
    const first = (g[0] ?? "").trim();
    if (!first) continue;
    const [rawName, ...rest] = first.split(/\s+[—–|·]\s+/).map((s) => s.trim());
    const description = rest.join(" · ") || undefined;
    const all = g.join(" ");
    const urls = all.match(URL_RE) ?? [];
    const github = urls.find((u) => /github\.com/i.test(u));
    const demo = urls.find((u) => u !== github);
    const techMatch = g.find((l) => /^(?:tech(?:\s*stack)?|stack|built\s+with|technologies)\s*[:\-]/i.test(l.trim()));
    let tech: string[] | undefined;
    if (techMatch) {
      tech = techMatch.split(/[:\-]/).slice(1).join(":").split(/[,•·|]/).map((s) => s.trim()).filter(Boolean);
    }
    const dates = extractDateRange(all);
    const bullets = g
      .slice(1)
      .filter((l) => l.trim() && l !== techMatch)
      .filter((l) => /^[•\-*·–—]/.test(l) || l.length > 15)
      .map(stripBullet)
      .filter(Boolean);
    out.push({
      id: uid("proj"),
      name: rawName || first,
      description,
      tech,
      link: normalizeUrl(demo || github),
      github: normalizeUrl(github),
      demo: normalizeUrl(demo),
      duration: dates?.start ? [dates.start, dates.end].filter(Boolean).join(" – ") : undefined,
      bullets,
    });
  }
  return out;
}

function splitInline(body: string[]): string[] {
  return body
    .flatMap((l) => l.split(/\s*[,•·|]\s*/))
    .map((l) => l.trim())
    .filter(Boolean);
}

function toItems(lines: string[]) {
  return lines
    .flatMap((l) => l.split(/\s*[•·|]\s*/))
    .map((l) => stripBullet(l))
    .filter((l) => l.length > 1)
    .map((text) => ({ id: uid("i"), text }));
}

// =====================================================================================
// Skills taxonomy + normalization
// =====================================================================================

const ALIASES: Record<string, string> = {
  reactjs: "React", "react.js": "React", "react js": "React",
  nodejs: "Node.js", "node js": "Node.js", "node.js": "Node.js",
  nextjs: "Next.js", "next.js": "Next.js",
  nestjs: "NestJS",
  vuejs: "Vue", "vue.js": "Vue",
  angularjs: "Angular",
  expressjs: "Express", "express.js": "Express",
  "mongo db": "MongoDB", mongodb: "MongoDB", mongo: "MongoDB",
  "postgre sql": "PostgreSQL", postgres: "PostgreSQL", postgresql: "PostgreSQL",
  mysql: "MySQL",
  ts: "TypeScript", typescript: "TypeScript",
  js: "JavaScript", javascript: "JavaScript",
  py: "Python", python: "Python",
  tf: "TensorFlow", tensorflow: "TensorFlow",
  pytorch: "PyTorch",
  k8s: "Kubernetes", kubernetes: "Kubernetes",
  "gh actions": "GitHub Actions", "github actions": "GitHub Actions",
  "aws": "AWS", "amazon web services": "AWS",
  "gcp": "GCP", "google cloud": "GCP", "google cloud platform": "GCP",
  "ms azure": "Azure", azure: "Azure",
  html5: "HTML", html: "HTML",
  css3: "CSS", css: "CSS",
  tailwindcss: "TailwindCSS", tailwind: "TailwindCSS",
  restapi: "REST", "rest api": "REST", "rest apis": "REST",
  graphql: "GraphQL",
  "c++": "C++", "c#": "C#",
};

const TAXONOMY: Record<keyof SkillBuckets, string[]> = {
  languages: [
    "JavaScript","TypeScript","Python","Java","C","C++","C#","Go","Rust","Ruby","PHP",
    "Swift","Kotlin","Scala","R","Dart","Elixir","SQL","Bash","Shell","Objective-C","Perl","Lua","Haskell","MATLAB",
  ],
  frameworks: [
    "React","Next.js","Vue","Nuxt","Angular","Svelte","SvelteKit","Remix","Astro",
    "Node.js","Express","NestJS","FastAPI","Django","Flask","Spring","Spring Boot",
    "Rails","Laravel",".NET","React Native","Flutter","Electron","TanStack","Redux",
    "TailwindCSS","Bootstrap","GraphQL","jQuery","Material UI","Chakra UI","Shadcn",
  ],
  databases: [
    "PostgreSQL","MySQL","MongoDB","Redis","SQLite","MariaDB","Cassandra","DynamoDB",
    "Firestore","Elasticsearch","Neo4j","Snowflake","BigQuery","Redshift","ClickHouse",
    "Supabase","Firebase","PlanetScale","Oracle","MSSQL","Cosmos DB",
  ],
  cloud: [
    "AWS","Azure","GCP","Cloudflare","Vercel","Netlify","Heroku","DigitalOcean",
    "Kubernetes","Docker","Terraform","Ansible","Jenkins","CircleCI","GitHub Actions",
    "GitLab CI","ArgoCD","Helm","Lambda","S3","EC2","RDS","EKS","ECS","CloudFormation",
    "Serverless","OpenShift","Nginx","Apache",
  ],
  tools: [
    "Git","GitHub","GitLab","Bitbucket","Jira","Confluence","Slack","Figma","Notion",
    "Linear","Postman","Insomnia","VS Code","IntelliJ","Xcode","Android Studio",
    "Datadog","Grafana","Prometheus","Sentry","Amplitude","Mixpanel","Segment","Webpack","Vite","Babel","ESLint","Prettier",
  ],
  technical: [
    "REST","gRPC","WebSockets","OAuth","JWT","Microservices","System Design",
    "Distributed Systems","CI/CD","TDD","Agile","Scrum","Machine Learning","Deep Learning",
    "NLP","Computer Vision","LLM","RAG","Prompt Engineering","Data Structures","Algorithms",
    "OOP","Functional Programming","Design Patterns","Data Analysis","ETL","Data Engineering",
    "MLOps","DevOps","Security","Networking","Linux","Unix","Windows","macOS",
    "TensorFlow","PyTorch","scikit-learn","Pandas","NumPy","Keras","OpenCV","Hugging Face",
    "Kafka","RabbitMQ","Spark","Hadoop","Airflow","dbt",
    "HTML","CSS","Sass","Less",
  ],
  soft: [
    "Leadership","Communication","Mentoring","Collaboration","Problem Solving","Critical Thinking",
    "Teamwork","Ownership","Strategy","Product Sense","Public Speaking","Writing","Stakeholder Management",
    "Time Management","Adaptability","Creativity","Analytical","Presentation",
  ],
  other: [],
};

function normalizeSkill(raw: string): string | null {
  const t = raw.trim().replace(/[.,;]+$/g, "");
  if (!t) return null;
  if (t.length < 1 || t.length > 40) return null;
  const key = t.toLowerCase();
  if (ALIASES[key]) return ALIASES[key];
  // Try alias fragments (strip trailing "js").
  const stripped = key.replace(/\s+/g, " ").replace(/[.·]/g, "").trim();
  if (ALIASES[stripped]) return ALIASES[stripped];
  return null;
}

function findInTaxonomy(text: string): { key: keyof SkillBuckets; value: string }[] {
  const found: { key: keyof SkillBuckets; value: string }[] = [];
  const seen = new Set<string>();
  for (const key of Object.keys(TAXONOMY) as (keyof SkillBuckets)[]) {
    for (const skill of TAXONOMY[key]) {
      const re = new RegExp(`(?<![A-Za-z0-9+#])${escapeRe(skill)}(?![A-Za-z0-9+#])`, "i");
      if (re.test(text)) {
        const kk = skill.toLowerCase();
        if (!seen.has(kk)) { found.push({ key, value: skill }); seen.add(kk); }
      }
    }
  }
  return found;
}

function classifyFreeform(skill: string): keyof SkillBuckets {
  const lc = skill.toLowerCase();
  if (/^(html|css|sass|less|jquery|bootstrap|tailwind|material|chakra|shadcn|react|vue|angular|svelte|next|nuxt|astro)/i.test(lc)) return "frameworks";
  if (/(sql|mongo|redis|postgres|mysql|firebase|supabase|elastic|dynamo)/i.test(lc)) return "databases";
  if (/(aws|azure|gcp|docker|kubernetes|terraform|jenkins|cloudflare|vercel|netlify|nginx|serverless)/i.test(lc)) return "cloud";
  if (/(git|github|gitlab|jira|figma|notion|postman|vscode|webpack|vite|eslint|prettier|slack)/i.test(lc)) return "tools";
  return "other";
}

export function parseSkills(text: string): SkillBuckets {
  const buckets: SkillBuckets = {
    languages: [], frameworks: [], databases: [], cloud: [],
    tools: [], technical: [], soft: [], other: [],
  };
  const seen = new Set<string>();
  const push = (k: keyof SkillBuckets, v: string) => {
    const kk = v.toLowerCase();
    if (seen.has(kk)) return;
    seen.add(kk);
    buckets[k].push(v);
  };

  // 1) Taxonomy hits on whole text.
  for (const { key, value } of findInTaxonomy(` ${text.replace(/\s+/g, " ")} `)) push(key, value);

  // 2) Freeform tokens from comma/pipe/bullet lists (skills sections tend to look like this).
  const tokens = text
    .split(/[\n,•·|;]+/)
    .map((t) => t.replace(/^[-*]\s*/, "").trim())
    .filter((t) => t && t.length >= 1 && t.length <= 40)
    .filter((t) => /[A-Za-z]/.test(t))
    .filter((t) => !/^(and|the|with|for|of|to|a|an|in|on|by|at|as|or|etc)$/i.test(t));

  for (const raw of tokens) {
    const norm = normalizeSkill(raw);
    const v = norm ?? (isPlausibleFreeform(raw) ? tidyToken(raw) : null);
    if (!v) continue;
    // Try taxonomy match on the normalized value first.
    let placed = false;
    for (const key of Object.keys(TAXONOMY) as (keyof SkillBuckets)[]) {
      if (TAXONOMY[key].some((s) => s.toLowerCase() === v.toLowerCase())) {
        push(key, TAXONOMY[key].find((s) => s.toLowerCase() === v.toLowerCase())!);
        placed = true;
        break;
      }
    }
    if (!placed) push(classifyFreeform(v), v);
  }
  return buckets;
}

function isPlausibleFreeform(t: string): boolean {
  // Reject sentences and long descriptions; accept things that look like tech names.
  if (t.split(/\s+/).length > 4) return false;
  if (/[.?!]/.test(t)) return false;
  if (!/^[A-Za-z][A-Za-z0-9+.#/\- ]*$/.test(t)) return false;
  return true;
}

function tidyToken(t: string): string {
  // Preserve casing for acronyms like "AWS", "SQL"; title-case single lowercase words.
  if (/^[A-Z0-9+.#/-]+$/.test(t)) return t;
  return t.split(/\s+/).map((w) => (/^[A-Z]/.test(w) ? w : w[0].toUpperCase() + w.slice(1))).join(" ");
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mergeSkills(into: SkillBuckets, from: SkillBuckets) {
  const seen = new Set<string>(Object.values(into).flat().map((s) => s.toLowerCase()));
  for (const key of Object.keys(from) as (keyof SkillBuckets)[]) {
    for (const v of from[key]) {
      if (seen.has(v.toLowerCase())) continue;
      into[key].push(v);
      seen.add(v.toLowerCase());
    }
  }
}

function skillCount(s: SkillBuckets): number {
  return Object.values(s).reduce((n, a) => n + a.length, 0);
}

function hasContent(resume: Resume, key: string): boolean {
  switch (key) {
    case "summary": return !!resume.summary.trim();
    case "experience": return resume.experience.length > 0;
    case "education": return resume.education.length > 0;
    case "projects": return resume.projects.length > 0;
    case "skills": return skillCount(resume.skills) > 0;
    case "certifications": return resume.certifications.length > 0;
    case "achievements": return resume.achievements.length > 0;
    case "awards": return resume.awards.length > 0;
    case "languages": return resume.languages.length > 0;
    case "publications": return resume.publications.length > 0;
    case "volunteer": return resume.volunteer.length > 0;
    case "interests": return resume.interests.length > 0;
    default: return false;
  }
}