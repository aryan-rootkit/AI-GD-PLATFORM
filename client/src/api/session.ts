import { api } from './client';

export type Session = {
  id: string;
  title: string;
  hostId: string;
  participants: string[];
  status: string;
  createdAt: string;
};

export async function apiCreateSession(title: string) {
  const { data } = await api.post<Session>('/api/session/create', { title });
  return data;
}

export async function apiJoinSession(sessionId: string) {
  const { data } = await api.post<Session>(`/api/session/join/${sessionId}`);
  return data;
}

export async function apiEndSession(sessionId: string) {
  const { data } = await api.post<Session>(`/api/session/end/${sessionId}`);
  return data;
}
