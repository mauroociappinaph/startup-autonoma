import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { ProjectContext } from "@startup/shared";

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
   * Historial de mensajes (Truncado a los últimos 30 para performance).
   */
  messages: Annotation<BaseMessage[]>({
    reducer: (prev, next) => {
      const all = messagesStateReducer(prev, next);
      return all.length > 30 ? all.slice(-30) : all;
    },
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
    reducer: (prev, next) => (next && next.length > 0) ? next : prev,
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
    reducer: (prev, next) => next || prev,
    default: () => ({ total: 0, prompt: 0, completion: 0 }),
  }),

  /**
   * Costo acumulado en USD (Gap 6).
   */
  total_cost_usd: Annotation<number>({
    reducer: (prev, next) => next || prev,
    default: () => 0,
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
    reducer: (prev, next) => next,
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
    reducer: (prev, next) => next,
    default: () => undefined,
  }),

  /**
   * Identificador de traza para observabilidad distribuida.
   */
  trace_id: Annotation<string | undefined>({
    reducer: (prev, next) => next || prev,
    default: () => undefined,
  }),

  /**
   * Justificación del paso actual (Reasoning).
   */
  reasoning: Annotation<string | undefined>({
    reducer: (prev, next) => next || prev,
    default: () => undefined,
  }),

  /**
   * Reporte detallado del Sentinel.
   */
  security_report: Annotation<string | undefined>({
    reducer: (prev, next) => next || prev,
    default: () => undefined,
  }),

  /**
   * Payload específico para tareas de Lead Gen (Engine Python).
   */
  lead_gen_payload: Annotation<{ niche: string; location?: string; limit: number } | undefined>({
    reducer: (prev, next) => next || prev,
    default: () => undefined,
  }),

  /**
   * Resultado de leads calificados obtenidos por el engine.
   */
  qualified_leads: Annotation<string | undefined>({
    reducer: (prev, next) => next || prev,
    default: () => undefined,
  }),

  /**
   * Flag que indica si el input fue detectado como malicioso.
   */
  is_malicious: Annotation<boolean>({
    reducer: (prev, next) => next ?? prev,
    default: () => false,
  }),

  /**
   * Flag de aprobación de misión por el humano (HITL).
   */
  is_mission_approved: Annotation<boolean>({
    reducer: (prev, next) => next ?? prev,
    default: () => false,
  }),
  /**
   * Contenido del último diagrama Mermaid generado.
   */
  last_diagram: Annotation<string | undefined>({
    reducer: (prev, next) => next || prev,
    default: () => undefined,
  }),
});
