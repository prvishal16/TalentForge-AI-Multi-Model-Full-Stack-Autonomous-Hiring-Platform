// Strongly typed Resume model — single source of truth across the app.

export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  location?: string;
  start?: string;
  end?: string;
  bullets: string[];
  employmentType?: string;
  durationMonths?: number;
};

export type EducationItem = {
  id: string;
  school: string;
  degree?: string;
  field?: string;
  start?: string;
  end?: string;
  details?: string;
  cgpa?: string;
  percentage?: string;
  coursework?: string[];
  current?: boolean;
};

export type ProjectItem = {
  id: string;
  name: string;
  description?: string;
  tech?: string[];
  link?: string;
  bullets: string[];
  github?: string;
  demo?: string;
  duration?: string;
};

export type SimpleItem = { id: string; text: string };

export type PersonalInfo = {
  name: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
  leetcode?: string;
  codechef?: string;
  codeforces?: string;
  hackerrank?: string;
  gfg?: string;
  stackoverflow?: string;
  kaggle?: string;
  medium?: string;
  devto?: string;
  behance?: string;
  dribbble?: string;
};

export type SkillBuckets = {
  technical: string[];
  frameworks: string[];
  languages: string[];
  databases: string[];
  cloud: string[];
  tools: string[];
  soft: string[];
  other: string[];
};

export type Resume = {
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  internships: ExperienceItem[];
  skills: SkillBuckets;
  certifications: SimpleItem[];
  achievements: SimpleItem[];
  awards: SimpleItem[];
  languages: SimpleItem[];
  publications: SimpleItem[];
  volunteer: SimpleItem[];
  interests: SimpleItem[];
  meta: {
    source?: { fileName: string; sizeKB: number; parsedAt: string };
    detectedSections: string[];
    missingSections: string[];
    confidence: number; // 0..100
  };
};

export function emptyResume(): Resume {
  return {
    personal: { name: "" },
    summary: "",
    experience: [],
    education: [],
    projects: [],
    internships: [],
    skills: {
      technical: [],
      frameworks: [],
      languages: [],
      databases: [],
      cloud: [],
      tools: [],
      soft: [],
      other: [],
    },
    certifications: [],
    achievements: [],
    awards: [],
    languages: [],
    publications: [],
    volunteer: [],
    interests: [],
    meta: { detectedSections: [], missingSections: [], confidence: 0 },
  };
}

export const RESUME_SECTION_LABELS: Record<string, string> = {
  personal: "Personal Information",
  summary: "Professional Summary",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  internships: "Internships",
  skills: "Skills",
  certifications: "Certifications",
  achievements: "Achievements",
  awards: "Awards",
  languages: "Languages",
  publications: "Publications",
  volunteer: "Volunteer Work",
  interests: "Interests",
};

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}