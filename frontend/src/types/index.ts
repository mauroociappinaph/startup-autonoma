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
  threadId?: string;
}

export * from "./ui.types";
