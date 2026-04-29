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

/** Derive two short lines from the single feedback string returned by the server. */
export function splitStrengthAndImprovement(
  feedback: string | null,
  score: number | null,
): { strength: string; improvement: string } {
  const fb = feedback?.trim() ?? '';
  if (!fb) {
    return {
      strength: 'You wrapped a full session—nice work.',
      improvement: improvementFromScore(score),
    };
  }

  const sentences = fb
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length >= 2) {
    const strength = sentences[0].length > 140 ? `${sentences[0].slice(0, 137)}…` : sentences[0];
    const rest = sentences.slice(1).join(' ');
    const improvement = rest.length > 160 ? `${rest.slice(0, 157)}…` : rest;
    return { strength, improvement };
  }

  const strength = fb.length > 140 ? `${fb.slice(0, 137)}…` : fb;
  return { strength, improvement: improvementFromScore(score) };
}

export function historyItemToPreview(item: SessionHistoryItem): AIFeedbackPreview {
  const { strength, improvement } = splitStrengthAndImprovement(item.feedback, item.score);
  return {
    lastSessionScore: item.score,
    strength,
    improvement,
  };
}
