import { LangGraphStreamEvent } from "@/types/index.js";
import { EventBus } from "@/services/eventBus.js";

/**
 * Helper para procesar el streaming de razonamiento de los modelos.
 */
export class StreamHelper {
  static async processReasoningStream(
    event: LangGraphStreamEvent, 
    threadId: string, 
    reasoningBuffer: string, 
    lastYieldedLength: number
  ): Promise<{ buffer: string, lastLength: number, yielded?: boolean }> {
    const nodeName = event.metadata?.langgraph_node;
    if (nodeName && ["ceo", "software_chief", "business_chief"].includes(nodeName)) {
      const chunk = event.data.chunk as { content?: string | { content: string }; tool_call_chunks?: { args?: string }[] };
      let delta = "";
      if (chunk) {
        if (typeof chunk.content === 'string') delta = chunk.content;
        else if (chunk.tool_call_chunks && chunk.tool_call_chunks.length > 0) delta = chunk.tool_call_chunks[0].args || "";
      }

      if (delta) {
        let newBuffer = reasoningBuffer + delta;
        const startKey = '"reasoning":';
        const startIndex = newBuffer.indexOf(startKey);
        if (startIndex !== -1) {
          const afterKey = newBuffer.substring(startIndex + startKey.length).trim();
          if (afterKey.startsWith('"')) {
            const contentStart = afterKey.indexOf('"') + 1;
            let fullReasoning = afterKey.substring(contentStart);
            const closingQuoteIndex = fullReasoning.search(/[^\\]"/);
            if (closingQuoteIndex !== -1) fullReasoning = fullReasoning.substring(0, closingQuoteIndex + 1);
            const cleaned = fullReasoning.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\t/g, "\t");
            const newChunk = cleaned.substring(lastYieldedLength);
            
            // OPTIMIZACIÓN: Solo emitimos si el nuevo fragmento es suficientemente grande (ej. 40 chars)
            // para evitar inundar el frontend con micro-re-renders de 1-2 caracteres.
            if (newChunk.length > 40) {
              const partialEv = { agent: nodeName.toUpperCase(), text: newChunk, isPartial: true, threadId };
              await EventBus.publish(threadId, partialEv);
              return { buffer: newBuffer, lastLength: cleaned.length, yielded: true };
            }
          }
        }
        return { buffer: newBuffer, lastLength: lastYieldedLength };
      }
    }
    return { buffer: reasoningBuffer, lastLength: lastYieldedLength };
  }
}
