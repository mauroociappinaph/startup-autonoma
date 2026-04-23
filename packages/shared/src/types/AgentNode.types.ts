export type AgentNodeData = {
  label: string;
  isActive: boolean;
  type: "mirror" | "ceo" | "chief" | "worker";
  agentId: string;
};
