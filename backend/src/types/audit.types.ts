/**
 * Interfaz para el registro de acciones de agentes en la auditoría.
 */
export interface AgentActionLog {
  projectId: string;
  nodeName: string;
  action: string;
  reasoning: string;
  metadata?: Record<string, unknown>;
  status?: "success" | "failure";
}
