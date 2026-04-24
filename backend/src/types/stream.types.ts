/**
 * Evento de streaming para la UI.
 */
export interface StreamEvent {
  agent: string;
  text: string;
  time: string;
  activeNode?: string;
  plan?: string[];
  completedSteps?: string[];
  executiveSummary?: string;
  token_usage?: {
    total: number;
    prompt: number;
    completion: number;
  };
  iteration_count?: number;
  total_cost_usd?: number;
  reasoning?: string;
  threadId?: string;
}
