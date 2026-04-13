import { BaseMessage } from "@langchain/core/messages";

/**
 * Interfaz pura del estado de los agentes.
 * Cumple con la Ley #7 (Centralización de Tipos).
 */
export interface AgentStateType {
  messages: BaseMessage[];
  executive_summary: string;
  retry_count: number;
  plan: string[]; // Añadido para el plan del Chief
  active_chief?: string; // Añadido para el nodo activo del Chief
  [key: string]: unknown; // Firma de índice requerida por LangGraph (tipado seguro)
}
