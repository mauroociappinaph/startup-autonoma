import { getGraph } from '@/graph/index.js';
import { HumanMessage } from '@langchain/core/messages';
import { AgentStateType } from '@/types/state.types.js';
import { StreamEvent } from '@/types/index.js';
import { ProjectContext } from '@/types/project.types.js';

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
                 yield {
                   agent: nodeName.toUpperCase(),
                   text: newChunk,
                   isPartial: true,
                   threadId
                 };
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
            yield* this.formatUpdate(updates, threadId);
         }
       }
    }

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
    const graph = await getGraph();
    const config = { 
      configurable: { thread_id: threadId }
    };

    await graph.updateState(config, { is_mission_approved: true });

    let isWaiting = false;
    let nextNode = "";
    let reasoningBuffer = "";
    let lastYieldedLength = 0;

    do {
      const eventStream = graph.streamEvents(null, { ...config, version: "v2" });
      
      reasoningBuffer = "";
      lastYieldedLength = 0;

      for await (const event of eventStream) {
        const eventType = event.event;
        
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
                   yield { agent: nodeName.toUpperCase(), text: newChunk, isPartial: true, threadId };
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
          if (updates) { yield* this.formatUpdate(updates, threadId); }
        }
      }

      const state = await graph.getState(config);
      isWaiting = state.next.length > 0;
      nextNode = state.next[0] || "";

      const currentState = state.values as AgentStateType;
      if (isWaiting && nextNode === "ceo" && currentState.is_mission_approved) {
        console.log("🔄 Reanudación automática detectada (Mission Approved). Continuando...");
        continue; 
      } else {
        break;
      }
    } while (true);

    if (isWaiting) {
      yield {
        agent: "SYSTEM",
        text: "Misión pausada. Esperando nueva instrucción o confirmación.",
        time: new Date().toLocaleTimeString(),
        activeNode: nextNode,
        isWaiting: true,
        threadId
      };
    }
  }

  private static *formatUpdate(update: Record<string, unknown>, threadId: string) {
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
          threadId
        } as StreamEvent;
      }
    }
  }
}
