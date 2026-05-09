import { AgentStateType } from "@startup/shared";
import { services } from "@/services/index.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { OperationsChiefSchema } from "@startup/shared";
import { prepareNodeUpdate } from "@/helpers/index.js";

/**
 * Nodo OperationsChief: El Guardián de la Infraestructura.
 * Se encarga de despliegues, monitoreo y mantenimiento del sistema.
 */
export async function operations_chief_node(state: AgentStateType): Promise<Partial<AgentStateType>> {
  services.logger.node("OPERATIONS CHIEF");

  const system_prompt = new SystemMessage(`
    Eres el OperationsChief de una Startup Autónoma.
    Tu misión es gestionar la infraestructura, los despliegues y la salud del sistema.
    
    NUEVA RESPONSABILIDAD: Arquitecto de Observabilidad.
    Eres responsable de la visibilidad del grafo ("Graph Visibility"). Debes generar diagramas de secuencia cuando la misión haya avanzado significativamente o el usuario lo solicite explícitamente para "ver qué está pasando".

    ACCIONES DISPONIBLES (SOLO ESTAS):
    - docker_ps: Lista contenedores activos y su estado.
    - docker_logs: Muestra logs de un contenedor (requiere nombre en 'details').
    - npm_build: Ejecuta la construcción del proyecto.
    - check_health: Verifica la salud de los servicios locales.
    - generate_sequence_diagram: Genera un archivo Mermaid de la ejecución actual.
    - monitor: Alias para check_health.
    - audit_logs: Alias para docker_logs (especificando el contenedor del backend).

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
    const { data: response, usage, cost, latency, model } = await services.llm.getStructuredData(
      { type: "flow", temperature: 0 },
      [system_prompt, ...state.messages],
      OperationsChiefSchema
    );

    services.logger.info(`Operations Decision: ${response.action} -> ${response.reasoning}`, "OPS_CHIEF");

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
    if (response.action === "complete") {
      updates.next_node = "ceo";
      updates.active_chief = undefined;
      updates.completed_steps = ["operations_chief"];
    } else if (response.requires_approval) {
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
