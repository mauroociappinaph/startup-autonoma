import { LLMService } from "@/services/llmService.js";
import { CEOResponseSchema } from "@startup/shared";
import { AgentStateType } from "@startup/shared";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { prepareNodeUpdate } from "@/helpers/index.js";
import { SacredLogger } from "@/helpers/logger.js";

/**
 * Nodo CEO: El Estratega de la Startup.
 * Orquestador dinámico que elige el Chief adecuado.
 */
export async function ceo_node(state: AgentStateType): Promise<Partial<AgentStateType>> {
  SacredLogger.node("CEO (ESTRATEGA)");

  const system_prompt = new SystemMessage(`
    Eres el CEO de una Startup Autónoma de alto rendimiento.
    Tu misión es ORQUESTAR a tus jefes de área (Chiefs) para completar los objetivos del usuario.

    HIERARCHY:
    1. CEO (Tú): Tomas decisiones estratégicas y delegas.
    2. Chiefs: Coordinan sus áreas (Software, Business o Operations).

    DOMAIN GUARDRAILS (CRITICAL):
    - SOFTWARE_CHIEF: Dueño absoluto de /src, /tests, /packages, y la documentación funcional (.md). Si la tarea implica escribir código o manuales de usuario, DELEGA AQUÍ.
    - BUSINESS_CHIEF: Dueño de /market y análisis externos. NO toca código ni documentación técnica.
    - OPERATIONS_CHIEF: Arquitecto de Observabilidad. Dueño de /infra, docker-compose.yml y la salud del sistema. Tiene permiso para generar DIAGRAMAS DE SECUENCIA en /docs/architecture pero NO toca código de la aplicación.

    ESTRUCTURA DE RAZONAMIENTO:
    1. <thought>: Analiza el progreso del historial y los objetivos pendientes. Identifica qué archivos o dominios se verán afectados.
    2. <plan>: Pasos estratégicos para completar la misión.
    3. <verification>: Confirmación de que se han cumplido todas las intenciones del usuario.

    REGLAS DE ORO:
    - Analiza el progreso actual en el historial de mensajes.
    - Elige el próximo paso racional: 'delegate' o 'finish'.
    - Solo puedes responder con 'finish' si TODAS las intenciones y objetivos del usuario han sido completados.
    - Si el usuario pide "documentar" o "crear un reporte" en el repositorio, SIEMPRE delega al Software Chief.
    - Sé obsesivo con el cumplimiento del plan total.
  `);

  try {
    const { data: response, usage, cost, latency, model } = await LLMService.getStructuredData(
      { type: "reasoning", temperature: 0 },
      [system_prompt, ...state.messages],
      CEOResponseSchema
    );

    SacredLogger.info(`CEO Decision: ${response.next_step} -> ${response.reasoning}`, "CEO");
    SacredLogger.info(`[${model}] Costo de este paso: $${cost.toFixed(6)}`, "CEO");

    const metricsUpdate = await prepareNodeUpdate(state, {
      nodeName: "CEO",
      model: model || "unknown",
      usage,
      latency,
      cost,
      decision: response.next_step,
      reasoning: response.reasoning
    });

    const updates: Partial<AgentStateType> = {
      ...metricsUpdate,
      executive_summary: response.analysis, // El CEO usa 'analysis' para el resumen
      active_chief: (response.delegated_to as "software_chief" | "business_chief" | "operations_chief" | undefined),
      messages: state.messages.concat([new AIMessage({
        content: `[CEO_THOUGHT] ${response.reasoning}
[CEO_DECISION] ${response.next_step} ${response.delegated_to ? `a ${response.delegated_to}` : ""}`,
      })])
    };

    return updates;
  } catch (error) {
    SacredLogger.error("Error en el Nodo CEO: " + error, "CEO");
    return {
      executive_summary: "Error crítico en el orquestador CEO.",
    };
  }
}
