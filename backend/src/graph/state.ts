import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

/**
 * AgentAnnotation: Implementación del canal de estado para LangGraph.
 * Define cómo se transforman y acumulan los datos a través del grafo.
 */
export const AgentAnnotation = Annotation.Root({
  /**
   * Historial de mensajes.
   */
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),

  /**
   * Resumen ejecutivo del progreso actual.
   */
  executive_summary: Annotation<string>({
    reducer: (prev, next) => next || prev,
    default: () => "",
  }),

  /**
   * Contador de reintentos.
   */
  retry_count: Annotation<number>({
    reducer: (prev, next) => prev + next,
    default: () => 0,
  }),
});
