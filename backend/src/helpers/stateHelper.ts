import { AgentStateType } from "@startup/shared";
import { telemetryService } from "@/services/telemetryService.js";
import { auditService } from "@/services/auditService.js";
import { NodeMetadata } from "@/types/state-helper.types.js";

/**
 * Prepares the state update for a node, centralizing iteration tracking,
 * costs, telemetry, and auditing.
 */
export async function prepareNodeUpdate(
  state: AgentStateType,
  metadata: NodeMetadata
): Promise<Partial<AgentStateType>> {
  const projectId = state.project_context?.projectId || "unknown";

  // 1. Dynamic Telemetry (Uses the actual model configured in LLMService)
  await telemetryService.recordMetric(projectId, {
    node: metadata.nodeName,
    model: metadata.model,
    latency: metadata.latency,
    usage: metadata.usage,
    cost: metadata.cost
  });

  // 2. Auditing (only if there's a strategic decision)
  if (metadata.decision && metadata.reasoning) {
    await auditService.logDecision(projectId, {
      agent: metadata.nodeName,
      decision: metadata.decision,
      reasoning: metadata.reasoning
    });
  }

  // 3. Prepare State Updates
  // IMPORTANT: Calculate absolute values to make state explicit, except for additive reducers.
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
 * Only increments the iteration count (for workers that don't use LLMs).
 */
export function incrementIteration(state: AgentStateType): Partial<AgentStateType> {
  return {
    iteration_count: (state.iteration_count || 0) + 1
  };
}
