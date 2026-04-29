export type SessionHistoryItem = {
  sessionId: string;
  title: string;
  /** ISO 8601 (session created at; ended sessions retain this) */
  date: string;
  score: number | null;
  feedback: string | null;
};
