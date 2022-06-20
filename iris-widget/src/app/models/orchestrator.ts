/**
 * Wire types for iris-orchestrator (platform-services/iris-orchestrator, port 4517, prefix
 * /iris/v1). Mirrors `Reply` and `Turn` in the orchestrator's conversation.types.ts.
 *
 * Copied by hand in IRIS-0611 and kept in step by convention, not tooling. When the orchestrator
 * adds a field it appears here on the next widget release, not before. Intents live in the
 * orchestrator's intents.yaml; the widget never sees the catalogue, only the scripted reply for
 * whatever it sent. Replies are plain strings: the YAML says "the widget does not render markdown"
 * and it is right.
 */

export interface MessageRequest {
  /** 1..500 chars, orchestrator validates. The composer enforces the same limit client side. */
  text: string;
}

export interface Reply {
  sessionId: string;
  intent: string;
  confidence: number;
  messages: string[];
  quickReplies: string[];
  /** Present once the customer has been queued for an agent. ticketId is what support asks for. */
  handoff?: { queue: string; ticketId: string };
  disclosure?: string;
  /** Intent specific payload (balances, transactions). Shape depends on the intent; rendered generically. */
  data?: unknown;
  ended: boolean;
}

/** GET /sessions/:id/transcript returns Turn[]. Used by support tooling, not by the export button (IRIS-0702). */
export interface Turn {
  at: string;
  from: 'customer' | 'iris' | 'system';
  text: string;
  intent?: string;
  confidence?: number;
}

/** Platform error envelope, PLAT-0781. */
export interface ApiError {
  code: string;
  message: string;
  status: number;
  correlationId: string;
  timestamp: string;
  violations: unknown[];
}
