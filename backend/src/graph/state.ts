import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

/**
 * AgentAnnotation: Implementación del canal de estado para LangGraph.
 * Define cómo se transforman y acumulan los datos a través del grafo.
 */
export const AgentAnnotation = Annotation.Root({
  /**
   * Prompt original del usuario.
   */
  original_prompt: Annotation<string>({
    reducer: (prev, next) => next || prev,
    default: () => "",
  }),

  /**
   * Prompt optimizado por el Mirror.
   */
  refined_prompt: Annotation<string>({
    reducer: (prev, next) => next || prev,
    default: () => "",
  }),

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

  /**
   * Lista de tareas estratégicas.
   */
  plan: Annotation<string[]>({
    reducer: (prev, next) => next || prev, // Asegura que 'plan' se mantenga si es necesario
    default: () => [],
  }),

  /**
   * Lista de tareas completadas.
   */
  completed_steps: Annotation<string[]>({
    reducer: (prev, next) => Array.from(new Set([...prev, ...next])),
    default: () => [],
  }),

  /**
   * Indica el nodo activo del Chief.
   */
  active_chief: Annotation<string | undefined>({
    reducer: (prev, next) => next ?? prev, // Mantiene el valor anterior si el nuevo es undefined
    default: () => undefined,
  }),
});
