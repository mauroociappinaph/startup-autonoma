import { AgentStateType } from "@startup/shared";
import { TelemetryService } from "@/services/telemetryService.js";
import { AuditService } from "@/services/auditService.js";
import { NodeMetadata } from "@/types/state-helper.types.js";

/**
 * Prepara la actualización del estado de un nodo, centralizando el control de iteraciones,
 * costos, telemetría y auditoría.
 */
export async function prepareNodeUpdate(
  state: AgentStateType,
  metadata: NodeMetadata
): Promise<Partial<AgentStateType>> {
  const projectId = state.project_context?.projectId || "unknown";

  // 1. Telemetría Dinámica (Usa el modelo real configurado en el LLMService)
  await TelemetryService.recordMetric(projectId, {
    node: metadata.nodeName,
    model: metadata.model,
    latency: metadata.latency,
    usage: metadata.usage
  });

  // 2. Auditoría (solo si hay una decisión estratégica)
  if (metadata.decision && metadata.reasoning) {
    await AuditService.logDecision(projectId, {
      agent: metadata.nodeName,
      decision: metadata.decision,
      reasoning: metadata.reasoning
    });
  }

  // 3. Preparar Updates del Estado
  // IMPORTANTE: Calculamos los valores absolutos para que el estado sea explícito.
  return {
    iteration_count: (state.iteration_count || 0) + 1,
    total_cost_usd: (state.total_cost_usd || 0) + metadata.cost,
    token_usage: {
      prompt: (state.token_usage?.prompt || 0) + metadata.usage.prompt,
      completion: (state.token_usage?.completion || 0) + metadata.usage.completion,
      total: (state.token_usage?.total || 0) + metadata.usage.total,
    },
    reasoning: metadata.reasoning || state.reasoning,
    executive_summary: metadata.reasoning || state.executive_summary,
  };
}

/**
 * Solo incrementa la iteración (para workers que no usan LLM).
 */
export function incrementIteration(state: AgentStateType): Partial<AgentStateType> {
  return {
    iteration_count: (state.iteration_count || 0) + 1
  };
}
