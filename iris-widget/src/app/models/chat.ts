export type ChatRole = 'customer' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  at: Date;
  /** Set on the customer message that the orchestrator rejected, so it can be retried. */
  failed?: boolean;
  /** Intent payload from the orchestrator, attached to the last assistant bubble of the turn. */
  data?: unknown;
}

export interface HandoffState {
  active: boolean;
  queue: string | null;
  ticketId: string | null;
}

export const NO_HANDOFF: HandoffState = { active: false, queue: null, ticketId: null };
