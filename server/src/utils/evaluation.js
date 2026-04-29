/**
 * @typedef {{
 *   score: number,
 *   strengths: string,
 *   improvements: string,
 *   metrics: Record<string, number>,
 *   isGenerated: boolean
 * }} EvaluationDto
 */

const METRIC_KEYS = ['communication', 'engagement', 'clarity', 'confidence'];

function clampScore(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return null;
  return Math.max(1, Math.min(10, Math.round(n)));
}

function randomOneToTen() {
  return Math.floor(Math.random() * 10) + 1;
}

/**
 * Placeholder evaluation for ended sessions (no external AI).
 * @returns {EvaluationDto}
 */
function buildDummyEvaluation() {
  const score = randomOneToTen();
  const metrics = {
    communication: randomOneToTen(),
    engagement: randomOneToTen(),
    clarity: randomOneToTen(),
    confidence: randomOneToTen(),
  };

  let strengths;
  let improvements;
  if (score >= 8) {
    strengths = 'Clear articulation and strong engagement with the topic.';
    improvements = 'Next time, invite opposing views earlier to stress-test your reasoning.';
  } else if (score >= 5) {
    strengths = 'Good participation; you stayed active in the discussion.';
    improvements = 'Structure your points more tightly and make room for others to contribute.';
  } else {
    strengths = 'You showed up and contributed to the conversation.';
    improvements = 'Practice concise phrasing and active listening before your next session.';
  }

  return { score, strengths, improvements, metrics, isGenerated: true };
}

function legacyMetricsFromScore(score) {
  const s = clampScore(score) ?? 5;
  return {
    communication: s,
    engagement: Math.max(1, s - 1),
    clarity: Math.min(10, s + 1),
    confidence: s,
  };
}

/**
 * Normalize stored evaluation (including legacy { score, feedback }) to API shape.
 * @param {Record<string, unknown> | null | undefined} raw
 * @returns {EvaluationDto | null}
 */
function normalizeEvaluationForApi(raw) {
  if (!raw || typeof raw.score !== 'number' || Number.isNaN(raw.score)) return null;

  const score = clampScore(raw.score) ?? 1;
  const legacyFeedback = typeof raw.feedback === 'string' ? raw.feedback.trim() : '';

  let strengths = typeof raw.strengths === 'string' ? raw.strengths.trim() : '';
  let improvements = typeof raw.improvements === 'string' ? raw.improvements.trim() : '';
  if (!improvements && legacyFeedback) {
    improvements = legacyFeedback;
  }

  const src = raw.metrics && typeof raw.metrics === 'object' && !Array.isArray(raw.metrics) ? raw.metrics : {};
  const fallback = legacyMetricsFromScore(score);
  const metrics = {};
  for (const k of METRIC_KEYS) {
    const v = clampScore(/** @type {Record<string, unknown>} */ (src)[k]);
    metrics[k] = v ?? fallback[k];
  }

  const isGenerated = raw.isGenerated !== false;

  return { score, strengths, improvements, metrics, isGenerated };
}

module.exports = {
  METRIC_KEYS,
  buildDummyEvaluation,
  normalizeEvaluationForApi,
};
