import { api } from './client';

export type Session = {
  id: string;
  title: string;
  hostId: string;
  participants: string[];
  status: string;
  createdAt: string;
  topic?: string;
  topicKind?: string;
  topicDetail?: string | null;
};

export async function apiCreateSession(title: string) {
  const { data } = await api.post<Session>('/api/session/create', { title });
  return data;
}

export async function apiJoinSession(sessionId: string) {
  const { data } = await api.post<Session>(`/api/session/join/${sessionId}`);
  return data;
}

export type SessionEvaluationPayload = {
  score: number;
  strengths: string;
  improvements: string;
  metrics: {
    communication: number;
    engagement: number;
    clarity: number;
    confidence: number;
  };
};

export type ParticipantEvaluationPayload = SessionEvaluationPayload & { userId: string };

export type SessionEndPayload = {
  status: string;
  evaluations: ParticipantEvaluationPayload[];
};

export async function apiEndSession(sessionId: string) {
  const { data } = await api.post<SessionEndPayload>(`/api/session/end/${sessionId}`);
  return data;
}
