import { MessagesAnnotation } from "@langchain/langgraph";

/**
 * Interfaz fundamental para el estado de la Startup. 
 * Cumple con la Ley #7: Definida en carpeta /types.
 */
export type AgentState = typeof MessagesAnnotation.State & {
  plan: string[];
  next: string;
  retryCount: number;
  executiveSummary: string;
};
