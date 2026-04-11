import { BaseMessage } from "@langchain/core/messages";

/**
 * Interfaz pura del estado de los agentes.
 * Cumple con la Ley #7 (Centralización de Tipos).
 */
export interface AgentStateType {
  messages: BaseMessage[];
  executive_summary: string;
  retry_count: number;
  [key: string]: any; // Firma de índice requerida por LangGraph
}
