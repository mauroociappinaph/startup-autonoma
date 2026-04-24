import { type AgentThought, type BackendAgentState } from "./index.js";

export interface AgentState {
  // Estado del Grafo
  thoughts: AgentThought[];
  isStreaming: boolean;
  isWaiting: boolean;
  activeNode: string | null;
  currentPlan: string[];
  completedSteps: string[];
  executiveSummary: string | null;
  threadId: string;
  
  // Telemetría
  totalTokens: number;
  iterations: number;
  totalCost: number;

  // Acciones (Setters)
  setThoughts: (updater: (prev: AgentThought[]) => AgentThought[]) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setIsWaiting: (isWaiting: boolean) => void;
  setActiveNode: (node: string | null) => void;
  setCurrentPlan: (plan: string[]) => void;
  setCompletedSteps: (updater: (prev: string[]) => string[]) => void;
  setExecutiveSummary: (summary: string | null) => void;
  setThreadId: (id: string) => void;
  
  updateTelemetry: (data: { tokens?: number; iterations?: number; cost?: number }) => void;
  populateState: (state: BackendAgentState) => void;
  resetSession: () => void;
  
  // Acciones de Persistencia
  rewindTo: (checkpointId: string) => Promise<void>;
  loadHistory: (threadId: string) => Promise<void>;
}
