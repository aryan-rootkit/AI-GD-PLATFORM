import type { AIFeedbackPreview } from '@/types/aiFeedbackPreview';
import type { SessionHistoryItem } from '@/types/sessionHistory';

/** Shown when API URL is missing, history is empty, or the request fails. */
export const MOCK_AI_FEEDBACK_PREVIEW: AIFeedbackPreview = {
  lastSessionScore: 8,
  strength: 'Strong participation and clarity in your last discussion.',
  improvement: 'Next time, invite a counterargument earlier to deepen the debate.',
};

function improvementFromScore(score: number | null): string {
  if (score == null) {
    return 'Complete and end a session as host to unlock a scored summary.';
  }
  if (score >= 8) {
    return 'Keep stretching into harder topics and diverse groups.';
  }
  if (score >= 5) {
    return 'Tighten structure and make space for others to contribute.';
  }
  return 'Practice concise points and active listening next session.';
}

function clip(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function historyItemToPreview(item: SessionHistoryItem): AIFeedbackPreview {
  const ev = item.evaluation;
  if (ev && typeof ev.score === 'number') {
    const strengthRaw = ev.strengths?.trim() || '';
    const improvementRaw = ev.improvements?.trim() || '';
    return {
      lastSessionScore: ev.score,
      strength: strengthRaw ? clip(strengthRaw, 140) : 'You wrapped a full session—nice work.',
      improvement: improvementRaw ? clip(improvementRaw, 160) : improvementFromScore(ev.score),
    };
  }
  return {
    lastSessionScore: null,
    strength: MOCK_AI_FEEDBACK_PREVIEW.strength,
    improvement: improvementFromScore(null),
  };
}
