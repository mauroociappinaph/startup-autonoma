import { LLMService } from "@/services/llmService.js";
import { CEOResponseSchema } from "@startup/shared";
import { AgentStateType } from "@startup/shared";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { prepareNodeUpdate } from "@/helpers/index.js";

/**
 * Nodo CEO: El Estratega de la Startup.
 * Orquestador dinámico que elige el Chief adecuado.
 */
export async function ceo_node(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log("\n--- EJECUTANDO NODO CEO ---");

  const system_prompt = new SystemMessage(`
    Eres el CEO de una Startup Autónoma de alto rendimiento.
    Tu misión es ORQUESTAR a tus jefes de área (Chiefs) para completar los objetivos del usuario.

    HIERARCHY:
    1. CEO (Tú): Tomas decisiones estratégicas y delegas.
    2. Chiefs: Coordinan sus áreas (Software vs Business).

    ESTRUCTURA DE RAZONAMIENTO:
    1. <thought>: Analiza el progreso del historial y los objetivos pendientes.
    2. <plan>: Pasos estratégicos para completar la misión.
    3. <verification>: Confirmación de que se han cumplido todas las intenciones del usuario.

    REGLS DE ORO:
    - Analiza el progreso actual en el historial de mensajes.
    - Elige el próximo paso racional: 'delegate' o 'finish'.
    - Solo puedes responder con 'finish' si TODAS las intenciones y objetivos refinados por el Mirror Node han sido completados.
    - Si el Business Chief terminó una investigación pero todavía falta crear una rama de Git (Software), NO termines; delega al Software Chief.
    - Si el Software Chief terminó el código pero falta investigar el mercado, NO termines; delega al Business Chief.
    - Sé obsesivo con el cumplimiento del plan total.
  `);

  try {
    const { data: response, usage, cost, latency, model } = await LLMService.getStructuredData(
      { type: "reasoning", temperature: 0 },
      [system_prompt, ...state.messages],
      CEOResponseSchema
    );

    console.log(`✅ CEO Decision: ${response.next_step} -> ${response.reasoning}`);
    console.log(`📊 [${model}] Costo de este paso: $${cost.toFixed(6)}`);

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
    console.error("❌ Error en el Nodo CEO:", error);
    return {
      executive_summary: "Error crítico en el orquestador CEO.",
    };
  }
}
