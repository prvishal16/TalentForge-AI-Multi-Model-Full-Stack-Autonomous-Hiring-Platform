import type { Question } from "./questions";
import type { RecordingResult, Analysis } from "./types";

export type SubScore = { key: string; label: string; score: number; note: string };

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

function communicationScore(r: RecordingResult): number {
  const wpm = r.wpm || 0;
  // Ideal 130-170 wpm
  const wpmScore = wpm === 0 ? 40 : clamp(100 - Math.abs(150 - wpm) * 1.2);
  const words = r.transcript.trim().split(/\s+/).filter(Boolean).length || 1;
  const fillerRatio = r.fillers / words;
  const fillerScore = clamp(100 - fillerRatio * 500);
  return Math.round(wpmScore * 0.6 + fillerScore * 0.4);
}

function technicalDepthScore(r: RecordingResult, q: Question, a: Analysis): number {
  const lower = r.transcript.toLowerCase();
  const skillHits = a.skills.filter((s) => lower.includes(s.toLowerCase())).length;
  const expectedHits = q.expectedSkills.filter((s) => lower.includes(s.toLowerCase())).length;
  const durationCoverage = clamp((r.durationMs / 1000) / q.estSeconds * 100);
  return Math.round(clamp(skillHits * 8 + expectedHits * 15 + durationCoverage * 0.4));
}

function structureScore(r: RecordingResult): number {
  const t = r.transcript.toLowerCase();
  const starKeys = ["situation", "task", "action", "result", "because", "so that", "then", "first", "next", "finally"];
  const hits = starKeys.filter((k) => t.includes(k)).length;
  return Math.round(clamp(30 + hits * 9));
}

function confidenceScore(r: RecordingResult): number {
  const words = r.transcript.trim().split(/\s+/).filter(Boolean).length || 1;
  const fillerRatio = r.fillers / words;
  return Math.round(
    clamp(r.avgAttention * 0.4 + r.avgPosture * 0.3 + (100 - fillerRatio * 500) * 0.3),
  );
}

function completenessScore(r: RecordingResult, q: Question): number {
  const durSec = r.durationMs / 1000;
  return Math.round(clamp((durSec / q.estSeconds) * 90));
}

function roleAlignmentScore(r: RecordingResult, a: Analysis): number {
  if (!a.skills.length) return 50;
  const tokens = new Set(r.transcript.toLowerCase().split(/\W+/).filter(Boolean));
  const hits = a.skills.filter((s) => tokens.has(s.toLowerCase().split(" ")[0]!)).length;
  return Math.round(clamp((hits / Math.min(a.skills.length, 8)) * 100 + 20));
}

export function scoreQuestion(r: RecordingResult, q: Question, a: Analysis) {
  return {
    communication: communicationScore(r),
    technicalDepth: technicalDepthScore(r, q, a),
    structure: structureScore(r),
    confidence: confidenceScore(r),
    completeness: completenessScore(r, q),
    roleAlignment: roleAlignmentScore(r, a),
  };
}

export type OverallReview = {
  subScores: SubScore[];
  overall: number;
  strengths: string[];
  improvements: string[];
};

export function scoreOverall(
  recordings: RecordingResult[],
  questions: Question[],
  analysis: Analysis,
): OverallReview {
  if (recordings.length === 0) {
    return {
      subScores: [],
      overall: 0,
      strengths: [],
      improvements: ["Answer at least one question to generate a review."],
    };
  }
  const perQ = recordings.map((r) => {
    const q = questions.find((qq) => qq.id === r.questionId)!;
    return scoreQuestion(r, q, analysis);
  });
  const avg = (key: keyof (typeof perQ)[number]) =>
    Math.round(perQ.reduce((s, x) => s + x[key], 0) / perQ.length);

  const subScores: SubScore[] = [
    { key: "communication", label: "Communication", score: avg("communication"), note: "Pace, clarity, and filler control" },
    { key: "technicalDepth", label: "Technical Depth", score: avg("technicalDepth"), note: "Skill recall vs role expectations" },
    { key: "structure", label: "Answer Structure", score: avg("structure"), note: "STAR + narrative signposts" },
    { key: "confidence", label: "Confidence", score: avg("confidence"), note: "Attention, posture, filler ratio" },
    { key: "completeness", label: "Completeness", score: avg("completeness"), note: "Coverage vs estimated duration" },
    { key: "roleAlignment", label: "Role Alignment", score: avg("roleAlignment"), note: "Language matches JD skills" },
  ];

  const overall = Math.round(subScores.reduce((s, x) => s + x.score, 0) / subScores.length);

  const sorted = [...subScores].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 2).map((s) => `${s.label} — ${s.score}/100. ${s.note}.`);
  const improvements = sorted
    .slice(-2)
    .reverse()
    .map((s) => `${s.label} lands at ${s.score}. Focus on: ${s.note.toLowerCase()}.`);

  return { subScores, overall, strengths, improvements };
}