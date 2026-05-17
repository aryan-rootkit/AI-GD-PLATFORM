export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type SessionType = "interview" | "gd";

export interface SubjectTrack {
  id: string;
  name: string;
  category: "technical" | "hr" | "gd";
  difficulty: Difficulty;
  attempts: number;
  averageScore: number;
  weakAreas: string[];
  progress: number;
}

export interface RecentSession {
  id: string;
  title: string;
  type: SessionType;
  score: number;
  duration: string;
  confidence: "Low" | "Medium" | "High";
  summary: string;
  date: string;
}

export interface AiSuggestion {
  id: string;
  message: string;
  tone: "positive" | "neutral" | "action";
}

export interface StudentOverview {
  streak: number;
  practiceHours: number;
  lastSessionScore: number;
  activeSessionId?: string;
}

export const studentOverview: StudentOverview = {
  streak: 7,
  practiceHours: 18.5,
  lastSessionScore: 78,
  activeSessionId: undefined,
};

export const subjectTracks: SubjectTrack[] = [
  { id: "ds", name: "Data Structures", category: "technical", difficulty: "Intermediate", attempts: 12, averageScore: 74, weakAreas: ["Time complexity", "Trees"], progress: 68 },
  { id: "os", name: "Operating Systems", category: "technical", difficulty: "Advanced", attempts: 8, averageScore: 71, weakAreas: ["Scheduling", "Memory"], progress: 54 },
  { id: "dbms", name: "DBMS", category: "technical", difficulty: "Intermediate", attempts: 10, averageScore: 76, weakAreas: ["Normalization", "Indexing"], progress: 62 },
  { id: "cn", name: "Computer Networks", category: "technical", difficulty: "Intermediate", attempts: 6, averageScore: 69, weakAreas: ["TCP/IP", "Subnetting"], progress: 48 },
  { id: "hr", name: "HR Interview", category: "hr", difficulty: "Beginner", attempts: 15, averageScore: 81, weakAreas: ["Salary negotiation"], progress: 72 },
  { id: "behavioral", name: "Behavioral Questions", category: "hr", difficulty: "Intermediate", attempts: 11, averageScore: 77, weakAreas: ["STAR format"], progress: 65 },
  { id: "aptitude", name: "Aptitude Discussion", category: "gd", difficulty: "Beginner", attempts: 5, averageScore: 70, weakAreas: ["Structure"], progress: 40 },
  { id: "leadership", name: "Leadership GD", category: "gd", difficulty: "Advanced", attempts: 4, averageScore: 66, weakAreas: ["Interruptions"], progress: 35 },
  { id: "technical-gd", name: "Technical GD", category: "gd", difficulty: "Advanced", attempts: 7, averageScore: 73, weakAreas: ["Depth"], progress: 58 },
  { id: "startup", name: "Product / Startup GD", category: "gd", difficulty: "Intermediate", attempts: 3, averageScore: 75, weakAreas: ["Evidence"], progress: 44 },
];

export const recentSessions: RecentSession[] = [
  { id: "s1", title: "Frontend Developer — Technical", type: "interview", score: 78, duration: "24 min", confidence: "Medium", summary: "Strong React fundamentals; improve system design depth.", date: "2026-05-16" },
  { id: "s2", title: "Leadership in Tech Teams", type: "gd", score: 72, duration: "18 min", confidence: "Medium", summary: "Good ideas but interrupted peers twice.", date: "2026-05-15" },
  { id: "s3", title: "HR — Campus Placement", type: "interview", score: 85, duration: "20 min", confidence: "High", summary: "Clear communication and confident delivery.", date: "2026-05-14" },
];

export const aiSuggestions: AiSuggestion[] = [
  { id: "a1", message: "Your communication clarity improved 12% this week.", tone: "positive" },
  { id: "a2", message: "Practice leadership discussions — you score lower in GD moderation.", tone: "action" },
  { id: "a3", message: "You interrupt frequently during GDs. Try 3-second pauses.", tone: "neutral" },
];

export const interviewSetupOptions = {
  roles: ["Frontend Developer", "Backend Developer", "Full Stack Engineer", "Data Analyst", "Product Manager"],
  difficulties: ["Junior", "Mid-Level", "Senior"] as const,
  companyTypes: ["Startup", "MNC", "Product Company", "Service Company"],
  topics: ["React + System Design", "Node.js + APIs", "DSA Fundamentals", "HR + Behavioral", "Cloud + DevOps"],
  styles: ["Technical Round", "HR Round", "Managerial Round", "Case Study"],
};

export const gdSetupOptions = {
  topics: ["AI in Education", "Remote Work Culture", "Climate Policy", "Startup vs Job", "Social Media Impact"],
  participantCounts: [4, 6, 8],
  evaluationModes: ["Communication", "Leadership", "Critical Thinking", "Balanced"],
};

export interface AnalyticsMetrics {
  communication: number;
  confidence: number;
  clarity: number;
  fillerWords: number;
  speakingBalance: number;
  interruptions: number;
  responseQuality: number;
  leadership: number;
  emotionalStability: number;
}

export const defaultAnalytics: AnalyticsMetrics = {
  communication: 78,
  confidence: 72,
  clarity: 81,
  fillerWords: 14,
  speakingBalance: 68,
  interruptions: 3,
  responseQuality: 75,
  leadership: 70,
  emotionalStability: 74,
};
