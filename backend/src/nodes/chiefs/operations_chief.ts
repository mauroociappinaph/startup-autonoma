import { AgentStateType } from "@startup/shared";
import { LLMService } from "@/services/llmService.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { OperationsChiefSchema } from "@startup/shared";
import { prepareNodeUpdate } from "@/helpers/index.js";
import { SacredLogger } from "@/helpers/logger.js";

/**
 * Nodo OperationsChief: El Guardián de la Infraestructura.
 * Se encarga de despliegues, monitoreo y mantenimiento del sistema.
 */
export async function operations_chief_node(state: AgentStateType): Promise<Partial<AgentStateType>> {
  SacredLogger.node("OPERATIONS CHIEF");

  const system_prompt = new SystemMessage(`
    Eres el OperationsChief de una Startup Autónoma.
    Tu misión es gestionar la infraestructura, los despliegues y la salud del sistema.
    
    NUEVA RESPONSABILIDAD: Arquitecto de Observabilidad.
    Eres responsable de la visibilidad del grafo ("Graph Visibility"). Debes generar diagramas de secuencia cuando la misión haya avanzado significativamente o el usuario lo solicite explícitamente para "ver qué está pasando".

    ACCIONES DISPONIBLES:
    - deploy / rollback / provision / monitor / audit_logs: Tareas de infraestructura.
    - generate_sequence_diagram: Genera un archivo Mermaid que representa la ejecución actual.

    ESTRUCTURA DE RAZONAMIENTO:
    1. <thought>: Analiza la salud del sistema o el flujo de mensajes actual.
    2. <plan>: Pasos para la operación.
    3. <verification>: Confirmación de éxito.

    REGLA DE ORO:
    Si la acción es un 'deploy' a producción o un 'rollback', SIEMPRE marca 'requires_approval: true'.
    
    RESTRICCIÓN DE DOMINIO:
    Tú NO tienes acceso a escribir archivos de código. Si el CEO te pide documentar o editar archivos de la APP, DEBES responder con 'requires_approval: true'. Pero SI puedes generar diagramas de arquitectura/secuencia.
  `);

  try {
    const { data: response, usage, cost, latency, model } = await LLMService.getStructuredData(
      { type: "ultra", temperature: 0 },
      [system_prompt, ...state.messages],
      OperationsChiefSchema
    );

    SacredLogger.info(`Operations Decision: ${response.action} -> ${response.reasoning}`, "OPS_CHIEF");

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
        additional_kwargs: {
          node: "operations_chief",
          operations_instruction: {
            command: response.action, 
            args: [response.details], // Pasamos details como argumento
            reasoning: response.reasoning
          }
        }
      })])
    };

    // Lógica de ruteo interno
    if (response.requires_approval) {
      updates.next_node = "ceo"; // Volvemos al CEO para que el Mirror/Humano valide
    } else {
      updates.next_node = "operations_worker"; // Delegamos al worker de infra
    }

    return updates;
  } catch (error) {
    console.error("❌ Error en el Nodo Operations Chief:", error);
    return {
      executive_summary: "Error crítico en el jefe de operaciones.",
    };
  }
}
