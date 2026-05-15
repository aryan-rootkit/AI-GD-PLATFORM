import { useQuery, useMutation } from '@tanstack/react-query';
import { dashboardApi } from '../services/dashboard.api';
import { API_BASE_URL } from '@/utils/constants';
import { MOCK_AI_FEEDBACK_PREVIEW, historyItemToPreview } from '@/utils/aiFeedbackPreview';

export function useUserActivityQuery() {
  return useQuery({
    queryKey: ['userActivity'],
    queryFn: dashboardApi.getUserActivity,
    enabled: !!API_BASE_URL,
    initialData: {
      sessionsParticipated: 0,
      lastSessionScore: null,
      activeSession: false,
    },
  });
}

export function useSessionHistoryQuery() {
  return useQuery({
    queryKey: ['sessionHistory'],
    queryFn: dashboardApi.getSessionHistory,
    enabled: !!API_BASE_URL,
    initialData: [],
  });
}

export function useAIFeedbackPreviewQuery() {
  const { data: history, isLoading } = useSessionHistoryQuery();

  if (!API_BASE_URL) {
    return { preview: MOCK_AI_FEEDBACK_PREVIEW, source: 'demo' as const, isLoading: false, isEmpty: false };
  }

  const first = history?.[0];
  if (!first) {
    return { preview: null, source: null, isLoading, isEmpty: true };
  }

  return { preview: historyItemToPreview(first), source: 'live' as const, isLoading, isEmpty: false };
}

export function useCreateSessionMutation() {
  return useMutation({
    mutationFn: dashboardApi.createSession,
  });
}

export function useJoinSessionMutation() {
  return useMutation({
    mutationFn: dashboardApi.joinSession,
  });
}

export function useLeaveSessionMutation() {
  return useMutation({
    mutationFn: dashboardApi.leaveSession,
  });
}
