// Curated skill dictionary + extractor. Runs on resume + JD raw text.

export const SKILL_DICTIONARY: string[] = [
  // Frontend
  "React", "React Native", "Next.js", "Redux", "TanStack Query", "Vue", "Angular", "Svelte",
  "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind", "SASS", "Vite", "Webpack",
  "Framer Motion", "GraphQL", "Apollo", "Storybook", "Jest", "Vitest", "Playwright", "Cypress",
  // Backend
  "Node.js", "Express", "NestJS", "Fastify", "Deno", "Bun",
  "Python", "Django", "Flask", "FastAPI", "Java", "Spring", "Kotlin", "Go", "Rust",
  "Ruby", "Rails", "PHP", "Laravel", "C#", ".NET", "Elixir",
  // Data
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "DynamoDB", "Cassandra", "Kafka", "RabbitMQ",
  "Snowflake", "BigQuery", "Airflow", "dbt", "Spark", "Hadoop",
  // Cloud & Infra
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "Ansible", "CI/CD",
  "GitHub Actions", "Jenkins", "Cloudflare", "Vercel", "Netlify",
  // AI / ML
  "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "LLM", "RAG", "LangChain",
  "Transformers", "NLP", "Computer Vision", "OpenAI", "Anthropic",
  // Practices
  "System Design", "Microservices", "REST", "gRPC", "OAuth", "JWT", "SSO",
  "Agile", "Scrum", "TDD", "DDD", "Event-driven", "Observability",
  // Product / Design
  "Figma", "Product Strategy", "A/B Testing", "Analytics", "SEO",
];

const LOWER_MAP = new Map<string, string>(
  SKILL_DICTIONARY.map((s) => [s.toLowerCase(), s]),
);

export function extractSkills(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  const lower = text.toLowerCase();
  for (const [key, orig] of LOWER_MAP) {
    // Word-boundary-ish check; escape regex special chars.
    const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, "i");
    if (re.test(lower)) found.add(orig);
  }
  return Array.from(found);
}

const LEVEL_HINTS: Array<{ level: "Junior" | "Mid" | "Senior" | "Staff"; keys: string[] }> = [
  { level: "Staff", keys: ["staff", "principal", "distinguished"] },
  { level: "Senior", keys: ["senior", "sr.", "lead", "architect"] },
  { level: "Junior", keys: ["junior", "jr.", "intern", "entry"] },
  { level: "Mid", keys: ["mid", "ii ", "iii "] },
];

export function inferLevel(jd: string): "Junior" | "Mid" | "Senior" | "Staff" {
  const l = jd.toLowerCase();
  for (const { level, keys } of LEVEL_HINTS) {
    if (keys.some((k) => l.includes(k))) return level;
  }
  return "Mid";
}

export function inferYears(resume: string): number {
  const matches = resume.match(/(\d{1,2})\+?\s*years?/i);
  if (matches) return Math.min(20, parseInt(matches[1]!, 10));
  return 4;
}

export function inferRole(jd: string): string {
  const candidates = [
    "Senior Frontend Engineer", "Frontend Engineer", "Backend Engineer",
    "Full-Stack Engineer", "Platform Engineer", "Staff Engineer",
    "Product Designer", "Data Engineer", "ML Engineer", "AI Engineer",
    "DevOps Engineer", "SRE", "Mobile Engineer", "iOS Engineer", "Android Engineer",
    "Product Manager", "Engineering Manager", "Security Engineer",
  ];
  const first = jd.split("\n").slice(0, 8).join(" ").toLowerCase();
  const hit = candidates.find((c) => first.includes(c.toLowerCase()));
  return hit ?? "Software Engineer";
}