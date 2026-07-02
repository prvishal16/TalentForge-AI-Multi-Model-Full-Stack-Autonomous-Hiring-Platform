import type { Analysis } from "./types";

export type Category =
  | "Technical"
  | "Behavioral"
  | "Projects"
  | "Problem Solving"
  | "Communication";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type Question = {
  id: string;
  index: number;
  text: string;
  category: Category;
  difficulty: Difficulty;
  estSeconds: number;
  expectedSkills: string[];
  hints: string[];
};

type Template = {
  category: Category;
  difficulty: Difficulty;
  build: (a: Analysis) => { text: string; expectedSkills: string[]; hints: string[]; estSeconds: number };
};

const pickSkill = (a: Analysis, i: number): string =>
  a.skills[i % Math.max(1, a.skills.length)] ?? "your primary technology";

const TEMPLATES: Template[] = [
  // Technical (4)
  {
    category: "Technical", difficulty: "Medium",
    build: (a) => ({
      text: `Walk me through how ${pickSkill(a, 0)} handles state changes under the hood, and where you've had to reach past the defaults.`,
      expectedSkills: [pickSkill(a, 0)],
      hints: ["Mention internals", "Compare defaults vs custom", "Real project example"],
      estSeconds: 150,
    }),
  },
  {
    category: "Technical", difficulty: "Hard",
    build: (a) => ({
      text: `Design a system that serves ${a.role.toLowerCase()} features to 1M concurrent users using ${pickSkill(a, 1)}. What are the failure modes?`,
      expectedSkills: ["System Design", pickSkill(a, 1)],
      hints: ["Talk trade-offs", "Discuss failure isolation", "Capacity math"],
      estSeconds: 240,
    }),
  },
  {
    category: "Technical", difficulty: "Medium",
    build: (a) => ({
      text: `Explain a subtle bug you've hit with ${pickSkill(a, 2)} and how you diagnosed it.`,
      expectedSkills: [pickSkill(a, 2), "Debugging"],
      hints: ["Reproduce steps", "Instrumentation", "Root cause"],
      estSeconds: 150,
    }),
  },
  {
    category: "Technical", difficulty: "Easy",
    build: (a) => ({
      text: `What are the biggest changes in ${pickSkill(a, 3)} over the last two years, and how have they affected your work?`,
      expectedSkills: [pickSkill(a, 3)],
      hints: ["Version awareness", "Migration story", "Impact on team"],
      estSeconds: 120,
    }),
  },
  // Projects (2)
  {
    category: "Projects", difficulty: "Medium",
    build: (a) => ({
      text: `Tell me about the most technically ambitious project on your resume. What was your specific contribution, and what would you do differently today?`,
      expectedSkills: a.skills.slice(0, 3),
      hints: ["Scope crisply", "Own your part", "Retrospective lens"],
      estSeconds: 210,
    }),
  },
  {
    category: "Projects", difficulty: "Medium",
    build: (a) => ({
      text: `Describe a project where you introduced ${pickSkill(a, 4)} to a team that hadn't used it. How did adoption go?`,
      expectedSkills: [pickSkill(a, 4), "Leadership"],
      hints: ["Change management", "Metrics", "Team pushback"],
      estSeconds: 180,
    }),
  },
  // Behavioral (2)
  {
    category: "Behavioral", difficulty: "Medium",
    build: () => ({
      text: `Tell me about a time you strongly disagreed with a technical decision. What did you do?`,
      expectedSkills: ["Communication", "Judgment"],
      hints: ["Situation-Task-Action-Result", "Stakes", "Outcome"],
      estSeconds: 150,
    }),
  },
  {
    category: "Behavioral", difficulty: "Easy",
    build: () => ({
      text: `Describe a moment you were proud of the work — not the promotion, the work itself.`,
      expectedSkills: ["Self-awareness"],
      hints: ["Specifics beat adjectives", "Why it mattered"],
      estSeconds: 120,
    }),
  },
  // Problem Solving (1)
  {
    category: "Problem Solving", difficulty: "Hard",
    build: () => ({
      text: `Your production dashboard is flat-lining at midnight UTC — but only on Mondays. Walk me through your first 30 minutes.`,
      expectedSkills: ["Debugging", "Observability"],
      hints: ["Reproduce vs mitigate", "Comms plan", "Hypothesis tree"],
      estSeconds: 180,
    }),
  },
  // Communication (1)
  {
    category: "Communication", difficulty: "Easy",
    build: (a) => ({
      text: `Explain ${pickSkill(a, 0)} to a smart non-engineer in under 90 seconds.`,
      expectedSkills: ["Communication"],
      hints: ["Analogy", "Concrete example", "No jargon"],
      estSeconds: 90,
    }),
  },
];

export function generateQuestions(analysis: Analysis): Question[] {
  return TEMPLATES.map((t, i) => {
    const built = t.build(analysis);
    return {
      id: `q${i + 1}`,
      index: i + 1,
      category: t.category,
      difficulty: t.difficulty,
      text: built.text,
      expectedSkills: built.expectedSkills,
      hints: built.hints,
      estSeconds: built.estSeconds,
    };
  });
}