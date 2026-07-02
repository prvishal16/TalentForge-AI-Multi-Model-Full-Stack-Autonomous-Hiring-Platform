import { hybridCall } from "../hybrid";
import { apiRequest } from "../httpClient";
import { streamSteps } from "@/lib/mock/simulate";

export const ResumeService = {
  analyzeResume: async (file: File | null) =>
    hybridCall(
      async () => {
        const form = new FormData();
        if (file) form.append("file", file);
        return apiRequest<{ score: number; summary: string }>("/api/resume/analyze/", {
          method: "POST",
          body: form,
          headers: {}, // let browser set multipart boundary
        });
      },
      async () => {
        await streamSteps([{ label: "Parsing resume", ms: 500 }, { label: "Scoring", ms: 500 }], () => {});
        return { score: 87, summary: "Strong technical match with minor keyword gaps." };
      }
    ),
};

export const UploadService = {
  // Today: mock upload (returns a fake object URL). Future: Cloudinary via backend.
  uploadFile: async (file: File, kind: "resume" | "profile" | "logo" | "certificate" | "video" | "attachment") =>
    hybridCall(
      async () => {
        const form = new FormData();
        form.append("file", file);
        form.append("kind", kind);
        return apiRequest<{ url: string }>("/api/uploads/", { method: "POST", body: form, headers: {} });
      },
      async () => ({ url: URL.createObjectURL(file) })
    ),
};

export const AIService = {
  generateInterview: (jobDescription: string) =>
    hybridCall(
      () => apiRequest<{ questions: string[] }>("/api/ai/generate-interview/", { method: "POST", body: JSON.stringify({ jobDescription }) }),
      async () => ({ questions: ["Tell me about a challenging project.", "How do you approach debugging?", "Describe a time you disagreed with a teammate."] })
    ),

  generateATS: (resumeText: string) =>
    hybridCall(
      () => apiRequest<{ score: number; keywords: string[] }>("/api/ai/ats/", { method: "POST", body: JSON.stringify({ resumeText }) }),
      async () => ({ score: 82, keywords: ["React", "TypeScript", "Leadership"] })
    ),

  generateCoverLetter: (jobTitle: string) =>
    hybridCall(
      () => apiRequest<{ letter: string }>("/api/ai/cover-letter/", { method: "POST", body: JSON.stringify({ jobTitle }) }),
      async () => ({ letter: `A tailored cover letter draft for the ${jobTitle} role would appear here.` })
    ),

  generateCareerPlan: (goal: string) =>
    hybridCall(
      () => apiRequest<{ steps: string[] }>("/api/ai/career-plan/", { method: "POST", body: JSON.stringify({ goal }) }),
      async () => ({ steps: ["Strengthen core skills", "Build a portfolio project", "Network with senior peers", "Target mid-level roles"] })
    ),
};

export const CareerService = {
  getPlan: () =>
    hybridCall(
      () => apiRequest<{ steps: string[] }>("/api/career/plan/"),
      async () => ({ steps: ["Complete system design course", "Contribute to an open-source project", "Update resume with quantifiable impact"] })
    ),
};

export const SettingsService = {
  getSettings: () =>
    hybridCall(
      () => apiRequest<{ theme: string; notifications: boolean }>("/api/settings/"),
      async () => ({ theme: "system", notifications: true })
    ),

  updateSettings: (payload: { theme?: string; notifications?: boolean }) =>
    hybridCall(
      () => apiRequest<{ theme: string; notifications: boolean }>("/api/settings/", { method: "PATCH", body: JSON.stringify(payload) }),
      async () => ({ theme: "system", notifications: true, ...payload })
    ),
};
