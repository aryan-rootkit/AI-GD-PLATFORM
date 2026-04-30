/** Prefill snippets for structured discussion (chat composer + empty state). */
export const DISCUSSION_TEMPLATES = {
  agree: 'I agree because ',
  disagree: 'I disagree because ',
  raisePoint: "I'd like to raise a point: ",
  askQuestion: 'I have a question: ',
} as const;

export type DiscussionTemplateKey = keyof typeof DISCUSSION_TEMPLATES;
