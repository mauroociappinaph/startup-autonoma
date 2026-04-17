import { graph } from '@/graph/index.js';
import { HumanMessage } from '@langchain/core/messages';
import { AgentStateType } from '@/types/state.types.js';
import { StreamEvent } from '@/types/index.js';

/**
 * Servicio encargado de la orquestación y streaming del grafo.
 */
export class GraphService {
  /**
   * Ejecuta el grafo y devuelve un generador de eventos formateados.
   */
  static async *runAgentStream(prompt: string) {
    const initialInput: Partial<AgentStateType> = {
      messages: [new HumanMessage(prompt)],
      plan: [],
      executive_summary: "",
      retry_count: 0,
      trace_id: `web-${Date.now()}`
    };

    const stream = await graph.stream(initialInput, { 
      streamMode: "updates" 
    });

    for await (const update of stream) {
      const nodeName = Object.keys(update)[0];
      const nodeData = (update as Record<string, any>)[nodeName];

      if (nodeData && nodeData.messages && nodeData.messages.length > 0) {
        const lastMsg = nodeData.messages[nodeData.messages.length - 1];
        const content = typeof lastMsg.content === 'string' 
          ? lastMsg.content 
          : JSON.stringify(lastMsg.content);

        // Capturamos cualquier mensaje que tenga el formato [TAG]
        const tagMatch = content.match(/\[(.*?)\]/);
        
        if (tagMatch) {
          yield {
            agent: tagMatch[1],
            text: content.replace(/\[.*?\]/g, "").trim(),
            time: new Date().toLocaleTimeString(),
            activeNode: nodeName,
            plan: nodeData.plan || undefined,
            completedSteps: nodeData.completed_steps || undefined,
            executiveSummary: nodeData.executive_summary || undefined
          } as StreamEvent;
        }
      }
    }
  }
}
