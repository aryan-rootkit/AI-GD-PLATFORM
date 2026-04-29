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
  topicKind?: SessionTopicKind;
  /** Required when `topicKind` is `custom`; optional extra note for other presets. */
  topicDetail?: string | null;
  /** Solo practice room with mock AI personas (no real co-participants required). */
  isPractice?: boolean;
  practiceParticipants?: PracticeParticipant[];
};

export type ChatPayload = {
  id?: string;
  sessionId: string;
  text: string;
  userId: string;
  /** Denormalized from JWT when the message was stored */
  senderEmail?: string;
  at: string;
  /** Inline system line (join/leave); not persisted on the server */
  kind?: 'message' | 'system';
};
