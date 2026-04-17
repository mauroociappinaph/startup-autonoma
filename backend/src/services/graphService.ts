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
  static async *runAgentStream(prompt: string, threadId: string = "default-thread") {
    const initialInput: Partial<AgentStateType> = {
      messages: [new HumanMessage(prompt)],
      plan: [],
      executive_summary: "",
      retry_count: 0,
      trace_id: `web-${Date.now()}`
    };

    const config = { 
      configurable: { thread_id: threadId },
      streamMode: "updates" as const
    };

    const stream = await graph.stream(initialInput, config);

    for await (const update of stream) {
      yield* this.formatUpdate(update);
    }

    // Verificamos si el grafo se detuvo por una interrupción (HITL)
    const state = await graph.getState(config);
    if (state.next.length > 0) {
      yield {
        agent: "SYSTEM",
        text: "Estrategia generada. Esperando aprobación humana para proceder.",
        time: new Date().toLocaleTimeString(),
        activeNode: state.next[0],
        isWaiting: true,
        threadId
      };
    }
  }

  /**
   * Reanuda la ejecución del grafo después de una interrupción (HITL).
   */
  static async *resumeAgent(threadId: string) {
    const config = { 
      configurable: { thread_id: threadId },
      streamMode: "updates" as const
    };

    // Al pasar null como input, LangGraph reanuda desde el último estado interrumpido
    const stream = await graph.stream(null, config);

    for await (const update of stream) {
      yield* this.formatUpdate(update);
    }

    // Verificamos si hay una nueva interrupción (ej. en otro nodo)
    const state = await graph.getState(config);
    if (state.next.length > 0) {
      yield {
        agent: "SYSTEM",
        text: "Punto de control alcanzado. Esperando aprobación.",
        time: new Date().toLocaleTimeString(),
        activeNode: state.next[0],
        isWaiting: true,
        threadId
      };
    }
  }

  /**
   * Formatea un update del grafo para el stream del frontend.
   */
  private static *formatUpdate(update: Record<string, unknown>) {
    const nodeName = Object.keys(update)[0];
    const nodeData = (update as Record<string, Partial<AgentStateType>>)[nodeName];

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
          executiveSummary: nodeData.executive_summary || undefined,
          threadId: "default-thread" // TODO: Pasar el threadId real
        } as StreamEvent;
      }
    }
  }
}
