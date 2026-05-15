import { api } from '@/lib/api';
import type { UserActivityOverview } from '@/types/userActivity';
import type { SessionHistoryItem } from '@/types/sessionHistory';
import type { Session } from '@/types/session';

export const dashboardApi = {
  getUserActivity: async (): Promise<UserActivityOverview> => {
    const { data } = await api.get<UserActivityOverview>('/api/user/activity');
    return {
      sessionsParticipated: Number(data?.sessionsParticipated) || 0,
      lastSessionScore:
        data?.lastSessionScore === null || data?.lastSessionScore === undefined
          ? null
          : Number(data.lastSessionScore),
      activeSession: Boolean(data?.activeSession),
    };
  },

  getSessionHistory: async (): Promise<SessionHistoryItem[]> => {
    const { data } = await api.get<SessionHistoryItem[]>('/api/sessions/history');
    return Array.isArray(data) ? data : [];
  },

  createSession: async (payload: Record<string, unknown>): Promise<Session> => {
    const { data } = await api.post<Session>('/api/session/create', payload);
    return data;
  },

  joinSession: async (sessionId: string): Promise<Session> => {
    const { data } = await api.post<Session>(`/api/session/join/${sessionId}`);
    return data;
  },

  leaveSession: async (sessionId: string): Promise<void> => {
    await api.post(`/api/session/leave/${sessionId}`);
  },
};
