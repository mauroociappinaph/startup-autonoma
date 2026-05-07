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

      // Limpiamos el nombre del nodo para el agente (e.g. "ceo_node" -> "CEO")
      const agentName = nodeName.replace(/_node$/, "").toUpperCase();
      
      yield {
        agent: agentName,
        text: content,
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

    // Fallback: Si el update contiene campos de seguridad, emitimos un evento de sistema
    if (nodeData && (nodeData.is_malicious !== undefined || nodeData.security_report)) {
      yield {
        agent: "ADUANA_SENTINEL",
        text: nodeData.security_report || (nodeData.is_malicious ? "Intento de inyección bloqueado" : "Análisis de seguridad completado"),
        time: new Date().toLocaleTimeString(),
        activeNode: nodeName,
        threadId,
        checkpointId
      } as StreamEvent;
    }
  }
}
