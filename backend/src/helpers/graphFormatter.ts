import { AgentStateType } from "@startup/shared";
import { StreamEvent } from "@/types/index.js";

/**
 * Helper para formatear las actualizaciones de los nodos en eventos de stream para el frontend.
 */
export class GraphFormatter {
  static *formatUpdate(update: Record<string, unknown>, threadId: string, checkpointId?: string): Generator<StreamEvent> {
    const nodeName = Object.keys(update)[0];
    const nodeData = (update as Record<string, Partial<AgentStateType>>)[nodeName];

    if (nodeData && nodeData.messages && nodeData.messages.length > 0) {
      const lastMsg = nodeData.messages[nodeData.messages.length - 1];
      const content = typeof lastMsg.content === 'string' 
        ? lastMsg.content 
        : JSON.stringify(lastMsg.content);

      const tagMatch = content.match(/\[(.*?)\]/);
      
      if (tagMatch) {
        yield {
          agent: tagMatch[1],
          text: content.replace(/\[.*?\]/g, "").trim(),
          time: new Date().toLocaleTimeString(),
          activeNode: nodeName,
          plan: nodeData.plan || undefined,
          completedSteps: nodeData.completed_steps || undefined,
          executiveSummary: nodeData.executive_summary || undefined,
          token_usage: nodeData.token_usage || undefined,
          iteration_count: nodeData.iteration_count || undefined,
          total_cost_usd: nodeData.total_cost_usd || undefined,
          reasoning: nodeData.reasoning || undefined,
          checkpointId,
          threadId
        } as StreamEvent;
      }
    }
  }
}
