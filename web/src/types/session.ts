export type PracticeParticipant = {
  id: string;
  displayName: string;
};

/** How the discussion is framed; `custom` uses `topicDetail` text; `auto` defers assignment. */
export type SessionTopicKind = 'business' | 'technology' | 'abstract' | 'custom' | 'auto';

export type Session = {
  id: string;
  title: string;
  hostId: string;
  participants: string[];
  status: string;
  createdAt: string;
  /** Resolved topic line (preset label, custom text, or preset · detail) for UI and downstream AI. */
  topic?: string;
  topicKind?: SessionTopicKind;
  /** Required when `topicKind` is `custom`; optional extra note for other presets. */
  topicDetail?: string | null;
  /** Solo practice room with mock AI personas (no real co-participants required). */
  isPractice?: boolean;
  practiceParticipants?: PracticeParticipant[];
};

export type MessageType = 'user' | 'system' | 'ai';

export type ChatPayload = {
  id?: string;
  sessionId: string;
  /** Canonical body (alias: `text`) */
  content?: string;
  text: string;
  /** Canonical sender (alias: `userId`) */
  senderId?: string;
  userId: string;
  senderName?: string;
  /** Denormalized from JWT when the message was stored (alias: `senderName` in newer API) */
  senderEmail?: string;
  at: string;
  timestamp?: string;
  type?: MessageType;
  /** @deprecated Prefer `type: 'system'` from server persistence */
  kind?: 'message' | 'system';
};
