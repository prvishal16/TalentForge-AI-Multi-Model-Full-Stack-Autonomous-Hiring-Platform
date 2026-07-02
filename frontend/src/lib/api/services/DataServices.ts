import { hybridCall } from "../hybrid";
import { apiRequest } from "../httpClient";
import {
  activity,
  candidateApplications,
  candidateSkillGaps,
  candidates,
  chatSeed,
  funnel,
  hiringTrend,
  jobs,
  notifications,
  resumeScoreDistribution,
  skillDemand,
  upcomingInterviews,
  type Candidate,
  type Job,
  type Notification,
} from "@/mocks/data";

export const JobService = {
  getJobs: (): Promise<Job[]> =>
    hybridCall(() => apiRequest<Job[]>("/api/jobs/"), () => jobs),

  getJob: (id: string): Promise<Job | undefined> =>
    hybridCall(() => apiRequest<Job>(`/api/jobs/${id}/`), () => jobs.find((j) => j.id === id)),

  createJob: (payload: Partial<Job>): Promise<Job> =>
    hybridCall(
      () => apiRequest<Job>("/api/jobs/", { method: "POST", body: JSON.stringify(payload) }),
      () => ({ ...(payload as Job), id: `local-${Date.now()}` })
    ),

  updateJob: (id: string, payload: Partial<Job>): Promise<Job> =>
    hybridCall(
      () => apiRequest<Job>(`/api/jobs/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
      () => ({ ...(jobs.find((j) => j.id === id) as Job), ...payload }) as Job
    ),

  deleteJob: (id: string): Promise<void> =>
    hybridCall(
      () => apiRequest<void>(`/api/jobs/${id}/`, { method: "DELETE" }),
      () => undefined
    ),
};

export const CandidateService = {
  getCandidates: (): Promise<Candidate[]> =>
    hybridCall(() => apiRequest<Candidate[]>("/api/candidates/"), () => candidates),

  getCandidate: (id: string): Promise<Candidate | undefined> =>
    hybridCall(
      () => apiRequest<Candidate>(`/api/candidates/${id}/`),
      () => candidates.find((c) => c.id === id)
    ),

  getApplications: () =>
    hybridCall(() => apiRequest<typeof candidateApplications>("/api/candidates/applications/"), () => candidateApplications),

  getSkillGaps: () =>
    hybridCall(() => apiRequest<typeof candidateSkillGaps>("/api/candidates/skill-gaps/"), () => candidateSkillGaps),
};

export const DashboardService = {
  getRecruiterOverview: () =>
    hybridCall(
      () => apiRequest<{ funnel: typeof funnel; hiringTrend: typeof hiringTrend; activity: typeof activity }>("/api/dashboard/recruiter/"),
      () => ({ funnel, hiringTrend, activity })
    ),

  getCandidateOverview: () =>
    hybridCall(
      () => apiRequest<{ applications: typeof candidateApplications; interviews: typeof upcomingInterviews }>("/api/dashboard/candidate/"),
      () => ({ applications: candidateApplications, interviews: upcomingInterviews })
    ),
};

export const AnalyticsService = {
  getSkillDemand: () =>
    hybridCall(() => apiRequest<typeof skillDemand>("/api/analytics/skill-demand/"), () => skillDemand),

  getResumeScoreDistribution: () =>
    hybridCall(() => apiRequest<typeof resumeScoreDistribution>("/api/analytics/resume-scores/"), () => resumeScoreDistribution),
};

export const NotificationService = {
  getNotifications: (): Promise<Notification[]> =>
    hybridCall(() => apiRequest<Notification[]>("/api/notifications/"), () => notifications),

  markRead: (id: string): Promise<void> =>
    hybridCall(
      () => apiRequest<void>(`/api/notifications/${id}/read/`, { method: "POST" }),
      () => undefined
    ),
};

export const InterviewService = {
  getUpcoming: () =>
    hybridCall(() => apiRequest<typeof upcomingInterviews>("/api/interviews/upcoming/"), () => upcomingInterviews),

  getChatSeed: () =>
    hybridCall(() => apiRequest<typeof chatSeed>("/api/interviews/assistant-seed/"), () => chatSeed),
};
