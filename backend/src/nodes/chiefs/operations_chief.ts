import { AgentStateType } from "@/types/state.types.js";
import { LLMService } from "@/services/llmService.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { TelemetryService } from "@/services/telemetryService.js";
import { AuditService } from "@/services/auditService.js";
import { OperationsChiefSchema } from "@/contracts/operations_chief.js";

/**
 * Nodo OperationsChief: El Guardián de la Infraestructura.
 * Se encarga de despliegues, monitoreo y mantenimiento del sistema.
 */
export async function operations_chief_node(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log("\n--- EJECUTANDO NODO OPERATIONS CHIEF ---");

  const system_prompt = new SystemMessage(`
    Eres el OperationsChief de una Startup Autónoma.
    Tu misión es gestionar la infraestructura, los despliegues y la salud del sistema.
    
    TUS RESPONSABILIDADES:
    - Despliegues (Deploy): Coordinar el paso del código a producción o staging.
    - Monitoreo (Monitor): Vigilar la salud de los servicios y logs.
    - Provisionamiento (Provision): Crear nuevos recursos si son necesarios.
    - Rollback: Revertir cambios si algo falla en producción.

    EL CONTEXTO ACTUAL:
    Estás operando en un entorno de monorepo con Node.js, Python y Next.js.
    
    REGLA DE ORO:
    Si la acción es un 'deploy' a producción o un 'rollback', SIEMPRE marca 'requires_approval: true'.
  `);

  try {
    const { data: response, usage, cost, latency } = await LLMService.getStructuredData(
      { type: "smart", temperature: 0 },
      [system_prompt, ...state.messages],
      OperationsChiefSchema
    );

    const projectId = state.project_context?.projectId || "unknown";

    // 1. Telemetría
    await TelemetryService.recordMetric(projectId, {
      node: "Operations Chief",
      model: "gpt-4o",
      latency,
      usage
    });

    // 2. Auditoría
    await AuditService.logDecision(projectId, {
      agent: "Operations Chief",
      decision: response.action,
      reasoning: response.reasoning,
      metadata: {
        priority: response.priority,
        requires_approval: response.requires_approval
      }
    });

    console.log(`🚀 Operations Decision: ${response.action} -> ${response.reasoning}`);

    const updates: Partial<AgentStateType> = {
      executive_summary: response.reasoning,
      reasoning: response.reasoning,
      active_chief: "operations_chief",
      iteration_count: 1,
      token_usage: usage,
      total_cost_usd: cost,
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
