const OpenAI = require('openai');
const logger = require('../utils/logger');

let openai;

function getClient() {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) return null;
  if (!openai) openai = new OpenAI({ apiKey: key });
  return openai;
}

const MODERATOR_SYSTEM =
  'You are a group discussion moderator. Keep discussion engaging, ask smart follow-up questions.';

/**
 * @param {Array<{ role: 'user' | 'assistant' | 'system', content: string }>} messages
 * @returns {Promise<string | null>} Assistant text, or null if API key is missing
 */
async function generateModeratorResponse(messages) {
  const client = getClient();
  if (!client) {
    logger.warn('OPENAI_API_KEY not set — skipping AI moderation');
    return null;
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: MODERATOR_SYSTEM }, ...messages],
  });

  const text = response.choices[0]?.message?.content;
  return text && String(text).trim() ? String(text).trim() : null;
}

module.exports = { generateModeratorResponse };
