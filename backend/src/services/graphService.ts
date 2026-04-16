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
      streamMode: "values" 
    });

    for await (const step of stream) {
      const lastMsg = step.messages[step.messages.length - 1];
      const content = typeof lastMsg.content === 'string' 
        ? lastMsg.content 
        : JSON.stringify(lastMsg.content);

      if (content.includes("[CEO_") || content.includes("[BUSINESS_") || content.includes("[WORKER_")) {
        yield {
          agent: content.match(/\[(.*?)\]/)?.[1] || "SYSTEM",
          text: content.replace(/\[.*?\]/, "").trim(),
          time: new Date().toLocaleTimeString()
        } as StreamEvent;
      }
    }
  }
}
