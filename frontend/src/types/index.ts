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
}

export * from "./ui.types";

export type AgentNodeData = {
  label: string;
  isActive: boolean;
  type: "mirror" | "ceo" | "chief" | "worker";
  agentId: string;
};
