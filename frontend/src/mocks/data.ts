// Central mock data for TalentForge AI. All values realistic — no lorem ipsum.

export type Stage =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Technical"
  | "Offer"
  | "Hired"
  | "Rejected";

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  role: string;
  location: string;
  stage: Stage;
  matchScore: number;
  resumeScore: number;
  appliedFor: string;
  appliedAt: string;
  skills: string[];
  experience: number;
  email: string;
  avatarTint: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Contract" | "Part-time";
  status: "Open" | "Draft" | "Closed";
  applicants: number;
  postedAt: string;
  priority: "P0" | "P1" | "P2";
  matchRate: number;
  skills?: string[];
  seniority?: "Junior" | "Mid" | "Senior" | "Staff" | "Principal" | "Lead";
  workMode?: "Remote" | "Hybrid" | "Onsite";
  salary?: string;
  company?: string;
  description?: string;
}

export interface ActivityItem {
  id: string;
  kind: "interview" | "application" | "ai" | "offer" | "note";
  title: string;
  detail: string;
  time: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  priority: "high" | "medium" | "low";
  read: boolean;
}

export const candidates: Candidate[] = [
  { id: "c1", name: "Elena Rodriguez", initials: "ER", role: "Staff Product Designer", location: "Barcelona, ES", stage: "Applied", matchScore: 98, resumeScore: 94, appliedFor: "Staff Product Designer", appliedAt: "2h ago", skills: ["Figma", "Design Systems", "Prototyping", "Research", "Accessibility"], experience: 9, email: "elena.r@proton.me", avatarTint: "from-violet-500 to-fuchsia-500" },
  { id: "c2", name: "Marcus Chen", initials: "MC", role: "Senior Platform Engineer", location: "Singapore", stage: "Technical", matchScore: 92, resumeScore: 91, appliedFor: "Senior Platform Engineer", appliedAt: "5h ago", skills: ["Rust", "Kubernetes", "Terraform", "AWS", "gRPC"], experience: 8, email: "marcus.chen@mail.io", avatarTint: "from-cyan-500 to-blue-500" },
  { id: "c3", name: "Sarah Jenkins", initials: "SJ", role: "AI Research Engineer", location: "Toronto, CA", stage: "Interview", matchScore: 96, resumeScore: 97, appliedFor: "AI Research Engineer", appliedAt: "1d ago", skills: ["PyTorch", "LLMs", "RAG", "Distributed Training"], experience: 6, email: "sjenkins@lab.dev", avatarTint: "from-emerald-500 to-teal-500" },
  { id: "c4", name: "Léo Petit", initials: "LP", role: "Frontend Architect", location: "Paris, FR", stage: "Offer", matchScore: 89, resumeScore: 90, appliedFor: "Frontend Architect", appliedAt: "3d ago", skills: ["React", "TypeScript", "Design Systems", "Vite"], experience: 10, email: "leo@petit.fr", avatarTint: "from-amber-500 to-rose-500" },
  { id: "c5", name: "Priya Nair", initials: "PN", role: "Product Lead, Fintech", location: "Bengaluru, IN", stage: "Screening", matchScore: 87, resumeScore: 85, appliedFor: "Product Lead, Fintech", appliedAt: "6h ago", skills: ["Product Strategy", "Payments", "SQL", "Growth"], experience: 7, email: "priya.nair@work.co", avatarTint: "from-pink-500 to-orange-500" },
  { id: "c6", name: "David Whitfield", initials: "DW", role: "DevOps Lead", location: "Austin, TX", stage: "Screening", matchScore: 84, resumeScore: 82, appliedFor: "DevOps Lead", appliedAt: "8h ago", skills: ["Kubernetes", "GitOps", "Prometheus", "AWS"], experience: 9, email: "dwhitfield@ops.dev", avatarTint: "from-indigo-500 to-purple-500" },
  { id: "c7", name: "Yuki Tanaka", initials: "YT", role: "Machine Learning Engineer", location: "Tokyo, JP", stage: "Applied", matchScore: 91, resumeScore: 88, appliedFor: "Machine Learning Engineer", appliedAt: "12h ago", skills: ["JAX", "MLOps", "Vector DB", "Recsys"], experience: 5, email: "yuki@ml.jp", avatarTint: "from-sky-500 to-cyan-500" },
  { id: "c8", name: "Amara Okafor", initials: "AO", role: "Security Engineer", location: "London, UK", stage: "Interview", matchScore: 90, resumeScore: 92, appliedFor: "Security Engineer", appliedAt: "2d ago", skills: ["ZeroTrust", "IAM", "Threat Modeling"], experience: 7, email: "amara.o@sec.uk", avatarTint: "from-rose-500 to-red-500" },
  { id: "c9", name: "Noah Bennett", initials: "NB", role: "Backend Engineer", location: "Berlin, DE", stage: "Rejected", matchScore: 64, resumeScore: 71, appliedFor: "Senior Platform Engineer", appliedAt: "4d ago", skills: ["Go", "Postgres", "Kafka"], experience: 4, email: "noah@bennett.dev", avatarTint: "from-slate-500 to-zinc-500" },
  { id: "c10", name: "Isabelle Moreau", initials: "IM", role: "Design Systems Engineer", location: "Montreal, CA", stage: "Hired", matchScore: 95, resumeScore: 93, appliedFor: "Design Systems Engineer", appliedAt: "1w ago", skills: ["React", "Radix", "Motion", "Tokens"], experience: 6, email: "isabelle@ds.ca", avatarTint: "from-teal-500 to-emerald-500" },
];

export const jobs: Job[] = [
  { id: "j1",  title: "Staff Product Designer",        department: "Design",         location: "Remote · EU",         type: "Full-time", status: "Open",  applicants: 42, postedAt: "5d ago",  priority: "P0", matchRate: 78, skills: ["Figma", "Design Systems", "Prototyping", "Research"],       seniority: "Staff",     workMode: "Remote", salary: "$180k–$220k", company: "Northwind", description: "Own the end-to-end design system and lead complex product surfaces across payments and identity." },
  { id: "j2",  title: "Senior Platform Engineer",      department: "Infrastructure", location: "Remote · Global",     type: "Full-time", status: "Open",  applicants: 61, postedAt: "8d ago",  priority: "P0", matchRate: 71, skills: ["Rust", "Kubernetes", "Terraform", "AWS", "gRPC"],             seniority: "Senior",    workMode: "Remote", salary: "$200k–$260k", company: "Northwind", description: "Scale multi-region control plane; own reliability of internal developer platform." },
  { id: "j3",  title: "AI Research Engineer",          department: "AI/ML",          location: "Toronto, CA",         type: "Full-time", status: "Open",  applicants: 29, postedAt: "3d ago",  priority: "P1", matchRate: 82, skills: ["PyTorch", "LLMs", "RAG", "Distributed Training"],             seniority: "Senior",    workMode: "Hybrid", salary: "$220k–$300k", company: "Helios AI", description: "Push frontier of retrieval-augmented reasoning; publish and ship." },
  { id: "j4",  title: "Frontend Architect",            department: "Engineering",    location: "Remote · EU",         type: "Full-time", status: "Open",  applicants: 37, postedAt: "12d ago", priority: "P1", matchRate: 74, skills: ["React", "TypeScript", "Design Systems", "Vite", "Accessibility"], seniority: "Staff",   workMode: "Remote", salary: "€120k–€160k", company: "Parallax", description: "Set frontend direction; shape composable UI, perf, and DX." },
  { id: "j5",  title: "Product Lead, Fintech",         department: "Product",        location: "London, UK",          type: "Full-time", status: "Open",  applicants: 24, postedAt: "6d ago",  priority: "P2", matchRate: 68, skills: ["Product Strategy", "Payments", "SQL", "Growth"],              seniority: "Lead",      workMode: "Hybrid", salary: "£110k–£140k", company: "Meridian",  description: "Lead payments product; drive activation and monetization." },
  { id: "j6",  title: "DevOps Lead",                   department: "Infrastructure", location: "Austin, TX",          type: "Full-time", status: "Open",  applicants: 18, postedAt: "9d ago",  priority: "P1", matchRate: 65, skills: ["Kubernetes", "GitOps", "Prometheus", "AWS", "Terraform"],     seniority: "Lead",      workMode: "Hybrid", salary: "$170k–$210k", company: "Orbital",   description: "Own CI/CD, observability, and cloud infra for a rapidly growing eng org." },
  { id: "j7",  title: "Security Engineer",             department: "Security",       location: "London, UK",          type: "Full-time", status: "Open",  applicants: 21, postedAt: "4d ago",  priority: "P1", matchRate: 72, skills: ["ZeroTrust", "IAM", "Threat Modeling", "AppSec"],              seniority: "Senior",    workMode: "Hybrid", salary: "£100k–£130k", company: "Meridian",  description: "Harden the platform end to end; run threat modeling and incident readiness." },
  { id: "j8",  title: "Machine Learning Engineer",     department: "AI/ML",          location: "Remote · APAC",       type: "Full-time", status: "Open",  applicants: 46, postedAt: "1d ago",  priority: "P1", matchRate: 79, skills: ["JAX", "MLOps", "Vector DB", "Recsys", "Python"],              seniority: "Senior",    workMode: "Remote", salary: "$180k–$230k", company: "Helios AI", description: "Ship recommendation and ranking models at scale." },
  { id: "j9",  title: "Design Systems Engineer",       department: "Design",         location: "Remote · Americas",   type: "Full-time", status: "Open",  applicants: 33, postedAt: "3w ago",  priority: "P2", matchRate: 91, skills: ["React", "Radix", "Motion", "Tokens", "TypeScript"],           seniority: "Senior",    workMode: "Remote", salary: "$170k–$210k", company: "Parallax",  description: "Own the design system engine — tokens, primitives, docs." },
  { id: "j10", title: "Staff Data Engineer",           department: "Data",           location: "Berlin, DE",          type: "Full-time", status: "Open",  applicants: 14, postedAt: "2d ago",  priority: "P2", matchRate: 61, skills: ["Spark", "dbt", "Airflow", "Snowflake", "Python"],             seniority: "Staff",     workMode: "Hybrid", salary: "€120k–€150k", company: "Meridian",  description: "Own the analytics pipeline from ingestion to semantic layer." },
  { id: "j11", title: "Growth Product Manager",        department: "Product",        location: "Remote · EU",         type: "Full-time", status: "Open",  applicants: 33, postedAt: "7d ago",  priority: "P2", matchRate: 66, skills: ["Growth", "SQL", "Experimentation", "Amplitude"],              seniority: "Mid",       workMode: "Remote", salary: "€90k–€120k",  company: "Orbital",   description: "Own activation and retention experiments across the funnel." },
  { id: "j12", title: "Head of Talent Ops",            department: "People",         location: "New York, NY",        type: "Full-time", status: "Open",  applicants: 12, postedAt: "2d ago",  priority: "P1", matchRate: 58, skills: ["Recruiting Ops", "Greenhouse", "HRIS", "Analytics"],          seniority: "Lead",      workMode: "Onsite", salary: "$180k–$220k", company: "Northwind", description: "Build a world-class talent operations function." },
  { id: "j13", title: "Senior iOS Engineer",           department: "Mobile",         location: "Remote · Americas",   type: "Full-time", status: "Open",  applicants: 22, postedAt: "3d ago",  priority: "P1", matchRate: 74, skills: ["Swift", "SwiftUI", "Combine", "Xcode"],                        seniority: "Senior",    workMode: "Remote", salary: "$170k–$210k", company: "Parallax",  description: "Ship a delightful iOS app for millions of users." },
  { id: "j14", title: "Senior Android Engineer",       department: "Mobile",         location: "Bengaluru, IN",       type: "Full-time", status: "Open",  applicants: 27, postedAt: "4d ago",  priority: "P1", matchRate: 76, skills: ["Kotlin", "Jetpack Compose", "Coroutines"],                    seniority: "Senior",    workMode: "Hybrid", salary: "₹40L–₹65L",   company: "Parallax",  description: "Lead Android engineering for a top consumer app." },
  { id: "j15", title: "Site Reliability Engineer",     department: "Infrastructure", location: "Remote · Global",     type: "Full-time", status: "Open",  applicants: 19, postedAt: "6d ago",  priority: "P1", matchRate: 70, skills: ["Kubernetes", "SLOs", "Terraform", "Grafana", "Go"],           seniority: "Senior",    workMode: "Remote", salary: "$180k–$230k", company: "Orbital",   description: "Own reliability, incident response, and cost of the platform." },
  { id: "j16", title: "MLOps Engineer",                department: "AI/ML",          location: "Remote · EU",         type: "Full-time", status: "Open",  applicants: 15, postedAt: "5d ago",  priority: "P2", matchRate: 69, skills: ["MLflow", "Kubeflow", "Feature Store", "Airflow"],             seniority: "Senior",    workMode: "Remote", salary: "€110k–€140k", company: "Helios AI", description: "Turn research prototypes into production-grade ML systems." },
  { id: "j17", title: "Engineering Manager, Payments", department: "Engineering",    location: "Amsterdam, NL",       type: "Full-time", status: "Open",  applicants: 9,  postedAt: "1w ago",  priority: "P1", matchRate: 67, skills: ["Leadership", "Payments", "Distributed Systems", "Coaching"],  seniority: "Lead",      workMode: "Hybrid", salary: "€140k–€180k", company: "Meridian",  description: "Grow and lead the payments platform team across two continents." },
  { id: "j18", title: "Staff Backend Engineer",        department: "Engineering",    location: "Remote · EU",         type: "Full-time", status: "Open",  applicants: 41, postedAt: "2d ago",  priority: "P0", matchRate: 81, skills: ["Go", "Postgres", "Kafka", "Distributed Systems"],             seniority: "Staff",     workMode: "Remote", salary: "€150k–€190k", company: "Orbital",   description: "Design the next generation of our billing and identity services." },
  { id: "j19", title: "Full-Stack Engineer",           department: "Engineering",    location: "Toronto, CA",         type: "Full-time", status: "Open",  applicants: 55, postedAt: "3d ago",  priority: "P2", matchRate: 73, skills: ["React", "Node.js", "Postgres", "TypeScript"],                 seniority: "Mid",       workMode: "Hybrid", salary: "$140k–$180k", company: "Northwind", description: "Ship end-to-end across the customer-facing product surface." },
  { id: "j20", title: "UX Researcher",                 department: "Design",         location: "Remote · EU",         type: "Full-time", status: "Open",  applicants: 17, postedAt: "8d ago",  priority: "P2", matchRate: 64, skills: ["Qualitative Research", "Usability Testing", "Interviews"],   seniority: "Senior",    workMode: "Remote", salary: "€90k–€120k",  company: "Parallax",  description: "Own foundational and evaluative research for two product areas." },
  { id: "j21", title: "Technical Program Manager",     department: "Program",        location: "Seattle, WA",         type: "Full-time", status: "Open",  applicants: 11, postedAt: "9d ago",  priority: "P2", matchRate: 62, skills: ["TPM", "Roadmaps", "Cross-functional", "Risk"],                seniority: "Senior",    workMode: "Onsite", salary: "$170k–$210k", company: "Orbital",   description: "Drive complex, multi-team programs from planning to delivery." },
  { id: "j22", title: "QA Automation Engineer",        department: "Quality",        location: "Remote · Global",     type: "Contract",  status: "Open",  applicants: 8,  postedAt: "6d ago",  priority: "P2", matchRate: 58, skills: ["Playwright", "TypeScript", "CI", "REST"],                     seniority: "Mid",       workMode: "Remote", salary: "$80/hr",       company: "Northwind", description: "Build the automated test backbone for the web app." },
  { id: "j23", title: "Developer Advocate",            department: "Marketing",      location: "Remote · Americas",   type: "Full-time", status: "Open",  applicants: 20, postedAt: "10d ago", priority: "P2", matchRate: 60, skills: ["Public Speaking", "Content", "APIs", "Node.js"],              seniority: "Senior",    workMode: "Remote", salary: "$160k–$190k", company: "Helios AI", description: "Grow the developer community — talks, content, sample apps." },
  { id: "j24", title: "Solutions Architect",           department: "Engineering",    location: "New York, NY",        type: "Full-time", status: "Open",  applicants: 13, postedAt: "5d ago",  priority: "P1", matchRate: 66, skills: ["Cloud Architecture", "Kubernetes", "Networking", "Sales"],   seniority: "Senior",    workMode: "Hybrid", salary: "$200k–$240k", company: "Meridian",  description: "Partner with strategic customers on architecture and rollout." },
  { id: "j25", title: "Principal Engineer, Search",    department: "Engineering",    location: "Remote · EU",         type: "Full-time", status: "Open",  applicants: 6,  postedAt: "11d ago", priority: "P0", matchRate: 84, skills: ["Elasticsearch", "Ranking", "Query Understanding", "Rust"],    seniority: "Principal", workMode: "Remote", salary: "€180k–€230k", company: "Northwind", description: "Set the technical direction of search relevance and infra." },
];

export const activity: ActivityItem[] = [
  { id: "a1", kind: "interview", title: "Interview scheduled", detail: "Sarah Jenkins · AI Research Engineer · Thu 10:00", time: "12m ago" },
  { id: "a2", kind: "ai", title: "AI ranking updated", detail: "Recalculated 420 profiles for Platform Engineer", time: "1h ago" },
  { id: "a3", kind: "application", title: "New application", detail: "Elena Rodriguez applied to Staff Product Designer", time: "2h ago" },
  { id: "a4", kind: "offer", title: "Offer accepted", detail: "Isabelle Moreau · Design Systems Engineer", time: "yesterday" },
  { id: "a5", kind: "note", title: "Feedback submitted", detail: "Marcus Chen · Technical screen 4.8/5", time: "yesterday" },
  { id: "a6", kind: "ai", title: "Duplicate detected", detail: "Noah Bennett already exists in your ATS", time: "2d ago" },
];

export const notifications: Notification[] = [
  { id: "n1", title: "Sarah Jenkins accepted interview", body: "Thu 10:00 · Google Meet", time: "12m ago", priority: "high", read: false },
  { id: "n2", title: "AI: 3 new priority matches", body: "Staff Product Designer role has 3 candidates with 90%+ match", time: "1h ago", priority: "high", read: false },
  { id: "n3", title: "Weekly hiring summary is ready", body: "12 interviews · 4 offers · 2 hires this week", time: "3h ago", priority: "medium", read: false },
  { id: "n4", title: "Marcus Chen advanced to Technical", body: "Auto-advanced by pipeline rule", time: "yesterday", priority: "medium", read: true },
  { id: "n5", title: "Amara Okafor completed take-home", body: "Awaiting your review · Security Engineer", time: "yesterday", priority: "medium", read: true },
  { id: "n6", title: "Job posting expires in 3 days", body: "DevOps Lead · Renew or close", time: "2d ago", priority: "low", read: true },
];

export const funnel = [
  { stage: "Applied", value: 4209 },
  { stage: "Screening", value: 1840 },
  { stage: "Interview", value: 512 },
  { stage: "Offer", value: 82 },
  { stage: "Hired", value: 54 },
];

export const hiringTrend = [
  { week: "W1", applications: 420, interviews: 42, hires: 4 },
  { week: "W2", applications: 512, interviews: 61, hires: 6 },
  { week: "W3", applications: 468, interviews: 55, hires: 5 },
  { week: "W4", applications: 601, interviews: 72, hires: 8 },
  { week: "W5", applications: 588, interviews: 80, hires: 7 },
  { week: "W6", applications: 712, interviews: 91, hires: 11 },
  { week: "W7", applications: 690, interviews: 88, hires: 12 },
  { week: "W8", applications: 802, interviews: 104, hires: 14 },
];

export const skillDemand = [
  { skill: "TypeScript", demand: 92 },
  { skill: "Python", demand: 88 },
  { skill: "Rust", demand: 71 },
  { skill: "Kubernetes", demand: 84 },
  { skill: "LLM Ops", demand: 76 },
  { skill: "Figma", demand: 63 },
  { skill: "Terraform", demand: 58 },
];

export const resumeScoreDistribution = [
  { bucket: "0–40", count: 12 },
  { bucket: "41–60", count: 48 },
  { bucket: "61–75", count: 96 },
  { bucket: "76–85", count: 62 },
  { bucket: "86–100", count: 29 },
];

// Candidate-side mocks
export const candidateApplications = [
  { id: "ap1", company: "Northwind Labs", role: "Senior Frontend Engineer", stage: "Interview" as Stage, appliedAt: "3d ago", matchScore: 94 },
  { id: "ap2", company: "Helios AI", role: "Product Designer", stage: "Screening" as Stage, appliedAt: "5d ago", matchScore: 88 },
  { id: "ap3", company: "Parallax", role: "Design Engineer", stage: "Applied" as Stage, appliedAt: "6d ago", matchScore: 91 },
  { id: "ap4", company: "Orbital", role: "Staff Engineer", stage: "Offer" as Stage, appliedAt: "2w ago", matchScore: 96 },
  { id: "ap5", company: "Meridian", role: "Frontend Architect", stage: "Rejected" as Stage, appliedAt: "3w ago", matchScore: 71 },
];

export const candidateSkillGaps = [
  { skill: "React", have: 95, target: 90 },
  { skill: "TypeScript", have: 92, target: 90 },
  { skill: "Testing", have: 68, target: 85 },
  { skill: "System Design", have: 74, target: 88 },
  { skill: "Accessibility", have: 60, target: 80 },
  { skill: "Performance", have: 82, target: 85 },
];

export const upcomingInterviews = [
  { id: "i1", role: "Senior Frontend Engineer", company: "Northwind Labs", when: "Thu, Feb 27 · 10:00 AM", interviewer: "Priya Nair", type: "System Design" },
  { id: "i2", role: "Design Engineer", company: "Parallax", when: "Fri, Feb 28 · 3:30 PM", interviewer: "Elena Rossi", type: "Portfolio Review" },
  { id: "i3", role: "Staff Engineer", company: "Orbital", when: "Mon, Mar 3 · 11:00 AM", interviewer: "Marcus Chen", type: "Final Round" },
];

export const chatSeed = [
  { role: "assistant" as const, content: "Hi Alex — I'm your TalentForge AI copilot. I can source, screen, rank, and prep interview loops. Try asking me to _'find 5 backend engineers with Rust and Kafka experience'_." },
];