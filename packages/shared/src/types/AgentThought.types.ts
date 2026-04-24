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
  thought?: string;
  plan_steps?: string;
  verification?: string;
  // --- MEJORA #128: Eventos de Sistema y Telemetría ---
  type?: string;
  metadata?: {
    estimated_tokens?: number;
    estimated_cost?: number;
    node?: string;
    [key: string]: any;
  };
}

/**
 * Interfaz para desacoplar el procesador de la implementación del store.
 */
export interface AgentActions {
  setThoughts: (updater: (prev: AgentThought[]) => AgentThought[]) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setIsWaiting: (isWaiting: boolean) => void;
  setActiveNode: (node: string | null) => void;
  setCurrentPlan: (plan: string[]) => void;
  setCompletedSteps: (updater: (prev: string[]) => string[]) => void;
  setExecutiveSummary: (summary: string | null) => void;
  setThreadId: (id: string) => void;
  updateTelemetry: (data: { tokens?: number; iterations?: number; cost?: number }) => void;
  resetSession: () => void;
}

export interface SSEReaderOptions {
  onData: (data: AgentThought) => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}
