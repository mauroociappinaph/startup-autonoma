import { getGraph } from '@/graph/index.js';
import { AgentStateType } from '@/types/state.types.js';
import { ProjectContext } from '@/types/project.types.js';
import { EventBus } from './eventBus.js';
import { GraphFormatter } from '@/helpers/graphFormatter.js';
import { HumanMessage } from '@langchain/core/messages';
import { SacredLogger } from '@/helpers/logger.js';

/**
 * Servicio encargado de la orquestación y streaming del grafo.
 */
export class GraphService {
  /**
   * Ejecuta el grafo y devuelve un generador de eventos formateados, incluyendo tokens en tiempo real.
   */
  static async *runAgentStream(
    prompt: string, 
    threadId: string = "default-thread",
    projectContext?: ProjectContext
  ) {
    const graph = await getGraph();
    const initialInput: Partial<AgentStateType> = {
      project_context: projectContext, // Gap 2: Inyección de aislamiento
      messages: [new HumanMessage(prompt)],
      plan: [],
      executive_summary: "",
      retry_count: 0,
    };

    const config = { 
      configurable: { thread_id: threadId }
    };

    // Usamos streamEvents para capturar tokens granulares de los modelos
    const eventStream = graph.streamEvents(initialInput, { ...config, version: "v2" });

    // Acumulador para limpiar el stream de JSON del reasoning
    let reasoningBuffer = "";
    let lastYieldedLength = 0;

    for await (const event of eventStream) {
       const eventType = event.event;
       
       // 1. Capturamos tokens de razonamiento (Streaming de LLM)
       if (eventType === "on_chat_model_stream") {
         const nodeName = event.metadata?.langgraph_node;
         if (nodeName && ["ceo", "software_chief", "business_chief"].includes(nodeName)) {
           const chunk = event.data.chunk;
           
           let delta = "";
           if (typeof chunk.content === 'string') {
             delta = chunk.content;
           } else if (chunk.tool_call_chunks && chunk.tool_call_chunks.length > 0) {
             delta = chunk.tool_call_chunks[0].args || "";
           }

           if (delta) {
             reasoningBuffer += delta;

             // Extraer el valor del campo "reasoning" del JSON parcial acumulado
             const match = reasoningBuffer.match(/"reasoning":\s*"(.*)/);
             if (match) {
               let fullReasoning = match[1];
               
               const closingQuoteIndex = fullReasoning.search(/[^\\]"/);
               if (closingQuoteIndex !== -1) {
                 fullReasoning = fullReasoning.substring(0, closingQuoteIndex + 1);
               }

               const cleaned = fullReasoning
                 .replace(/\\n/g, "\n")
                 .replace(/\\"/g, '"')
                 .replace(/\\t/g, "\t");

               const newChunk = cleaned.substring(lastYieldedLength);
               if (newChunk) {
                 const ev = {
                   agent: nodeName.toUpperCase(),
                   text: newChunk,
                   isPartial: true,
                   threadId
                 };
                 await EventBus.publish(threadId, ev);
                 yield ev;
                 lastYieldedLength = cleaned.length;
               }
             }
           }
         }
       }
       
       if (eventType === "on_node_start") {
         reasoningBuffer = "";
         lastYieldedLength = 0;
       }

        if (eventType === "on_node_end") {
          const updates = event.data.output;
          if (updates) {
             for (const updateEvent of GraphFormatter.formatUpdate(updates, threadId)) {
               await EventBus.publish(threadId, updateEvent);
               yield updateEvent;
             }
          }
        }
    }

    const state = await graph.getState(config);
    if (state.next.length > 0) {
      const waitEvent = {
        agent: "SYSTEM",
        text: "Estrategia generada. Esperando aprobación humana para proceder.",
        time: new Date().toLocaleTimeString(),
        activeNode: state.next[0],
        isWaiting: true,
        threadId
      };
      await EventBus.publish(threadId, waitEvent);
      yield waitEvent;
    }
  }

  /**
   * Reanuda la ejecución del grafo después de una interrupción (HITL).
   */
  static async *resumeAgent(threadId: string, status: 'approved' | 'rejected' = 'approved', feedback?: string) {
    const graph = await getGraph();
    const config = { 
      configurable: { thread_id: threadId }
    };

    if (status === 'approved') {
      await graph.updateState(config, { is_mission_approved: true });
    } else if (status === 'rejected' && feedback) {
      // Si el humano rechaza, inyectamos su feedback como un nuevo mensaje y reseteamos la aprobación
      await graph.updateState(config, { 
        is_mission_approved: false,
        messages: [new HumanMessage(`[HUMAN_FEEDBACK]: ${feedback}`)]
      });
    }

    let isWaiting = false;
    let nextNode = "";

    do {
      const eventStream = graph.streamEvents(null, { ...config, version: "v2" });
      
      for await (const event of eventStream) {
        const eventType = event.event;
        
        if (eventType === "on_node_end") {
          const updates = event.data.output;
          if (updates) { 
            for (const updateEvent of GraphFormatter.formatUpdate(updates, threadId)) {
              await EventBus.publish(threadId, updateEvent);
              yield updateEvent;
            }
          }
        }
      }

      const state = await graph.getState(config);
      isWaiting = state.next.length > 0;
      nextNode = state.next[0] || "";

      const currentState = state.values as AgentStateType;
      if (isWaiting && nextNode === "ceo" && currentState.is_mission_approved) {
        SacredLogger.info("Reanudación automática detectada (Mission Approved). Continuando...", "GRAPH_SERVICE");
        continue; 
      } else {
        break;
      }
    } while (true);

    if (isWaiting) {
      const waitEv = {
        agent: "SYSTEM",
        text: "Misión pausada. Esperando nueva instrucción o confirmación.",
        time: new Date().toLocaleTimeString(),
        activeNode: nextNode,
        isWaiting: true,
        threadId
      };
      await EventBus.publish(threadId, waitEv);
      yield waitEv;
    }
  }

  /**
   * Obtiene el historial de estados (checkpoints) de un hilo.
   */
  static async getHistory(threadId: string) {
    const graph = await getGraph();
    const config = { configurable: { thread_id: threadId } };
    const history = [];
    
    for await (const state of graph.getStateHistory(config)) {
      history.push({
        id: state.config.configurable?.checkpoint_id,
        next: state.next,
        values: state.values,
        createdAt: (state.metadata as { step?: number })?.step
      });
    }
    
    return history;
  }

  /**
   * Retrocede el grafo a un checkpoint específico.
   */
  static async rewind(threadId: string, checkpointId: string) {
    const graph = await getGraph();
    const config = { 
      configurable: { 
        thread_id: threadId,
        checkpoint_id: checkpointId
      } 
    };
    
    // Al obtener el estado con un checkpoint_id específico y luego actualizar el estado base,
    // LangGraph se posiciona en ese punto del tiempo.
    const state = await graph.getState(config);
    if (!state) throw new Error("Checkpoint no encontrado");

    // Guardamos el estado recuperado como el nuevo estado actual del hilo
    await graph.updateState({ configurable: { thread_id: threadId } }, state.values);
    
    return { success: true, checkpointId };
  }
}
