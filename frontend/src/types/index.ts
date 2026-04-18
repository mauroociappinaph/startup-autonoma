export interface AgentThought {
  agent: string;
  text: string;
  time: string;
  activeNode?: string;
  plan?: string[];
  completedSteps?: string[];
  executiveSummary?: string;
  error?: string;
  isWaiting?: boolean;
  isPartial?: boolean;
  threadId?: string;
  token_usage?: {
    total: number;
    prompt: number;
    completion: number;
  };
  iteration_count?: number;
  total_cost_usd?: number;
  reasoning?: string;
}

export * from "./ui.types";

export type AgentNodeData = {
  label: string;
  isActive: boolean;
  type: "mirror" | "ceo" | "chief" | "worker";
  agentId: string;
};
