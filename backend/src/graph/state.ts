import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

/**
 * El AgentState es la "memoria compartida" de nuestra startup. 
 * Usamos Annotation.Root para definir un estado tipado y reactivo.
 */
export const AgentState = Annotation.Root({
  /**
   * Historial de mensajes. 
   * MessagesAnnotation ya incluye el reducer 'addMessages', que permite
   * acumular mensajes automáticamente en lugar de sobrescribirlos.
   */
  ...MessagesAnnotation.spec,

  /**
   * El 'plan' es una lista de objetivos generados por el CEO.
   * Al devolver un nuevo plan desde un nodo, este se sobrescribe (comportamiento default).
   */
  plan: Annotation<string[]>({
    reducer: (oldState, newState) => newState,
    default: () => [],
  }),

  /**
   * El 'next' indica cuál es el siguiente agente/nodo que debe tomar el control.
   */
  next: Annotation<string>({
    reducer: (oldState, newState) => newState,
    default: () => "CEO",
  }),

  /**
   * Monitor de reintentos para evitar loops infinitos (Strict TTL).
   * El reducer (s, v) => s + v permite que cada vez que devolvamos { retryCount: 1 },
   * el estado se autoincremente.
   */
  retryCount: Annotation<number>({
    reducer: (old, val) => old + val,
    default: () => 0,
  }),

  /**
   * Resumen ejecutivo para mantener limpia la ventana de contexto.
   */
  executiveSummary: Annotation<string>({
    reducer: (old, val) => val,
    default: () => "",
  })
});

/**
 * Exportamos el tipo del estado para usarlo en nuestros nodos.
 */
export type AgentState = typeof AgentState.State;
