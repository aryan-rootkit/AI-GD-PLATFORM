'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { AIFeedbackPreview } from '@/types/aiFeedbackPreview';
import type { SessionHistoryItem } from '@/types/sessionHistory';
import { API_BASE_URL } from '@/utils/constants';
import { MOCK_AI_FEEDBACK_PREVIEW, historyItemToPreview } from '@/utils/aiFeedbackPreview';

export type AIFeedbackPreviewState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'ready'; source: 'live' | 'demo'; preview: AIFeedbackPreview };

export function useAIFeedbackPreview() {
  const [state, setState] = useState<AIFeedbackPreviewState>({ status: 'loading' });

  useEffect(() => {
    if (!API_BASE_URL) {
      setState({ status: 'ready', source: 'demo', preview: MOCK_AI_FEEDBACK_PREVIEW });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    (async () => {
      try {
        const { data } = await api.get<SessionHistoryItem[]>('/api/sessions/history');
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        const first = list[0];
        if (!first) {
          setState({ status: 'empty' });
          return;
        }
        setState({ status: 'ready', source: 'live', preview: historyItemToPreview(first) });
      } catch {
        if (cancelled) return;
        setState({ status: 'ready', source: 'demo', preview: MOCK_AI_FEEDBACK_PREVIEW });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
