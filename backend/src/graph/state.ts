import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { ProjectContext } from "@/types/project.types.js";

/**
 * AgentAnnotation: Implementación del canal de estado para LangGraph.
 * Define cómo se transforman y acumulan los datos a través del grafo.
 */
export const AgentAnnotation = Annotation.Root({
  /**
   * Contexto del proyecto/startup para aislamiento (Gap 2)
   */
  project_context: Annotation<ProjectContext>({
    reducer: (prev, next) => next || prev,
  }),

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
   * Contador de iteraciones globales del grafo.
   */
  iteration_count: Annotation<number>({
    reducer: (prev, next) => prev + next,
    default: () => 0,
  }),

  /**
   * Uso acumulado de tokens.
   */
  token_usage: Annotation<{ total: number; prompt: number; completion: number }>({
    reducer: (prev, next) => ({
      total: prev.total + next.total,
      prompt: prev.prompt + next.prompt,
      completion: prev.completion + next.completion,
    }),
    default: () => ({ total: 0, prompt: 0, completion: 0 }),
  }),

  /**
   * Flag de emergencia del Circuit Breaker.
   */
  max_budget_reached: Annotation<boolean>({
    reducer: (prev, next) => next || prev,
    default: () => false,
  }),

  /**
   * Indica el nodo activo del Chief.
   */
  active_chief: Annotation<string | undefined>({
    reducer: (prev, next) => next ?? prev,
    default: () => undefined,
  }),

  /**
   * Registro de la última sincronización con el BudgetService.
   */
  last_recorded_tokens: Annotation<number>({
    reducer: (prev, next) => next || prev,
    default: () => 0,
  }),

  /**
   * Nodo de destino tras pasar el Circuit Breaker.
   */
  next_node: Annotation<string | undefined>({
    reducer: (prev, next) => next ?? prev,
    default: () => undefined,
  }),
});
