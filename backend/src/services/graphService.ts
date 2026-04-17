import { graph } from '@/graph/index.js';
import { HumanMessage } from '@langchain/core/messages';
import { AgentStateType } from '@/types/state.types.js';
import { StreamEvent } from '@/types/index.js';

/**
 * Servicio encargado de la orquestación y streaming del grafo.
 */
export class GraphService {
  /**
   * Ejecuta el grafo y devuelve un generador de eventos formateados, incluyendo tokens en tiempo real.
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
             // Buscamos lo que hay entre '"reasoning": "' y la siguiente '"' no escapada (o el final del stream)
             const match = reasoningBuffer.match(/"reasoning":\s*"(.*)/);
             if (match) {
               let fullReasoning = match[1];
               
               // Si encontramos el cierre del campo (otra comilla no escapada) o el inicio de otro campo
               const closingQuoteIndex = fullReasoning.search(/[^\\]"/);
               if (closingQuoteIndex !== -1) {
                 fullReasoning = fullReasoning.substring(0, closingQuoteIndex + 1);
               }

               // Limpiamos escapes de JSON
               const cleaned = fullReasoning
                 .replace(/\\n/g, "\n")
                 .replace(/\\"/g, '"')
                 .replace(/\\t/g, "\t");

               // Solo enviamos la parte nueva para evitar duplicación en el buffer del front
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
       
       // Resetear buffer si cambia de nodo
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
      configurable: { thread_id: threadId }
    };

    // Antes de reanudar, marcamos que la misión fue aprobada manualmente (HITL)
    // Esto evita que el CEO vuelva a pedir aprobación si el plan no ha cambiado drásticamente.
    await graph.updateState(config, { is_mission_approved: true });

    // Bucle de reanudación automática (Mission-based HITL)
    let isWaiting = false;
    let nextNode = "";
    let reasoningBuffer = "";
    let lastYieldedLength = 0;

    do {
      const eventStream = graph.streamEvents(null, { ...config, version: "v2" });
      
      // Reiniciamos buffs para cada iteración de reanudación
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

      // Verificamos si hay una nueva interrupción
      const state = await graph.getState(config);
      isWaiting = state.next.length > 0;
      nextNode = state.next[0] || "";

      // Si se detuvo en el CEO Pero la misión está aprobada, reanudamos instantáneamente (SILENT RESUME)
      const currentState = state.values as AgentStateType;
      if (isWaiting && nextNode === "ceo" && currentState.is_mission_approved) {
        console.log("🔄 Reanudación automática detectada (Mission Approved). Continuando...");
        continue; 
      } else {
        // En cualquier otro caso (terminó, error, o requiere nueva aprobación), rompemos el bucle
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

  /**
   * Formatea un update del grafo para el stream del frontend.
   */
  private static *formatUpdate(update: Record<string, unknown>, threadId: string) {
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
          threadId
        } as StreamEvent;
      }
    }
  }
}
