export type EvaluationMetrics = {
  communication: number;
  engagement: number;
  clarity: number;
  confidence: number;
};

/** Structured session evaluation (API / future AI-ready shape). */
export type SessionEvaluation = {
  score: number;
  strengths: string;
  improvements: string;
  metrics: EvaluationMetrics;
};

export type SessionHistoryItem = {
  sessionId: string;
  title: string;
  /** ISO 8601 (session created at; ended sessions retain this) */
  date: string;
  evaluation: SessionEvaluation | null;
};
