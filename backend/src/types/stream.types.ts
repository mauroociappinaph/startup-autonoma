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
  checkpointId?: string;
}

/**
 * Evento de análisis de seguridad del Sentinel.
 */
export interface SecurityAnalysisEvent {
  type: "SECURITY_ANALYSIS";
  agent: "ADUANA_SENTINEL";
  threat_level: "none" | "low" | "medium" | "high" | "critical";
  decision: "pass" | "block";
  reasoning: string;
  latency_ms: number;
  threadId: string;
}
