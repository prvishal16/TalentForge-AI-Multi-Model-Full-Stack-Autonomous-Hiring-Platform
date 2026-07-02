// Hybrid Data Layer — single entry point for all services.
// Components/hooks should import from here, never call fetch() directly.

export * from "./config";
export { backendStatus } from "./backendStatus";
export { hybridCall } from "./hybrid";
export { AuthService } from "./services/AuthService";
export {
  JobService,
  CandidateService,
  DashboardService,
  AnalyticsService,
  NotificationService,
  InterviewService,
} from "./services/DataServices";
export {
  ResumeService,
  UploadService,
  AIService,
  CareerService,
  SettingsService,
} from "./services/ContentServices";
