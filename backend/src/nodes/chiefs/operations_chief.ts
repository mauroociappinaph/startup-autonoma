import { AgentStateType } from "@startup/shared";
import { LLMService } from "@/services/llmService.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { OperationsChiefSchema } from "@startup/shared";
import { prepareNodeUpdate } from "@/helpers/index.js";

/**
 * Nodo OperationsChief: El Guardián de la Infraestructura.
 * Se encarga de despliegues, monitoreo y mantenimiento del sistema.
 */
export async function operations_chief_node(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log("\n--- EJECUTANDO NODO OPERATIONS CHIEF ---");

  const system_prompt = new SystemMessage(`
    Eres el OperationsChief de una Startup Autónoma.
    Tu misión es gestionar la infraestructura, los despliegues y la salud del sistema.
    
    ESTRUCTURA DE RAZONAMIENTO:
    1. <thought>: Analiza la salud del sistema y el impacto del cambio propuesto.
    2. <plan>: Pasos para el despliegue o mantenimiento.
    3. <verification>: Confirmación de que el sistema sigue operativo tras la acción.

    EL CONTEXTO ACTUAL:
    Estás operando en un entorno de monorepo con Node.js, Python y Next.js.
    
    REGLA DE ORO:
    Si la acción es un 'deploy' a producción o un 'rollback', SIEMPRE marca 'requires_approval: true'.
  `);

  try {
    const { data: response, usage, cost, latency, model } = await LLMService.getStructuredData(
      { type: "ultra", temperature: 0 },
      [system_prompt, ...state.messages],
      OperationsChiefSchema
    );

    console.log(`🚀 Operations Decision: ${response.action} -> ${response.reasoning}`);

    const metricsUpdate = await prepareNodeUpdate(state, {
      nodeName: "Operations Chief",
      model: model || "unknown",
      usage,
      latency,
      cost,
      decision: response.action,
      reasoning: response.reasoning
    });

    const updates: Partial<AgentStateType> = {
      ...metricsUpdate,
      executive_summary: response.reasoning,
      active_chief: "operations_chief",
      messages: state.messages.concat([new AIMessage({
        content: `[OPERATIONS_CHIEF_THOUGHT] ${response.reasoning}
[ACTION] ${response.action} (Prioridad: ${response.priority})
[DETAILS] ${response.details}`,
      })])
    };

    // Lógica de ruteo interno (placeholder para futuros workers de infra)
    if (response.requires_approval) {
      updates.next_node = "ceo"; // Volvemos al CEO para que el Mirror/Humano valide
    } else {
      updates.next_node = "ceo"; // Por ahora siempre vuelve al CEO
    }

    return updates;
  } catch (error) {
    console.error("❌ Error en el Nodo Operations Chief:", error);
    return {
      executive_summary: "Error crítico en el jefe de operaciones.",
    };
  }
}
