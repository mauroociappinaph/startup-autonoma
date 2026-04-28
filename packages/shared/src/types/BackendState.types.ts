import { ProjectContext } from "./Project.types.js";

/**
 * Interfaz que refleja el estado crudo que viene del backend (AgentStateType).
 * Se utiliza para la repoblación del store (populateState).
 */
export interface BackendAgentState {
  project_context?: ProjectContext;
  active_chief?: string;
  next_node?: string;
  plan: string[];
  completed_steps: string[];
  executive_summary: string;
  token_usage: {
    total: number;
    prompt: number;
    completion: number;
  };
  iteration_count: number;
  total_cost_usd?: number;
  [key: string]: unknown;
}
