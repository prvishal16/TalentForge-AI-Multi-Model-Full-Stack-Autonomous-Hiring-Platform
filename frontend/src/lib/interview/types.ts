export type Analysis = {
  skills: string[];
  missingSkills: string[];
  role: string;
  level: "Junior" | "Mid" | "Senior" | "Staff";
  years: number;
  resumeChars: number;
  jdChars: number;
};

export type MetricsSample = {
  t: number; // ms since start
  faceDetected: boolean;
  faceCentering: number; // 0..100
  gazeScore: number; // 0..100
  faceVisibility: number; // 0..100
  upperBodyVisible: boolean;
  shoulderTilt: number; // degrees
  postureScore: number; // 0..100
};

export type RecordingResult = {
  questionId: string;
  blob: Blob;
  url: string;
  mime: string;
  durationMs: number;
  transcript: string;
  wpm: number;
  fillers: number;
  avgAttention: number;
  avgPosture: number;
  framingScore: number;
  samples: MetricsSample[];
};