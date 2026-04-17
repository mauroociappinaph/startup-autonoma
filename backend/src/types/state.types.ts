import { BaseMessage } from "@langchain/core/messages";

/**
 * Interfaz pura del estado de los agentes.
 * Cumple con la Ley #7 (Centralización de Tipos).
 */
export interface AgentStateType {
  original_prompt: string; // El input crudo del humano
  refined_prompt: string;  // El input optimizado por el Mirror
  messages: BaseMessage[];
  executive_summary: string;
  retry_count: number;
  plan: string[]; // Tareas pendientes o totales
  completed_steps: string[]; // Tareas finalizadas
  active_chief?: string; // Añadido para el nodo activo del Chief
  [key: string]: unknown; // Firma de índice requerida por LangGraph (tipado seguro)
}
