export type Session = {
  id: string;
  title: string;
  hostId: string;
  participants: string[];
  status: string;
  createdAt: string;
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
