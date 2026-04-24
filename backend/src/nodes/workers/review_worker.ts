import { AgentStateType } from "@startup/shared";
import { LLMService } from "@/services/llmService.js";
import { SystemMessage, AIMessage } from "@langchain/core/messages";
import { ReviewWorkerSchema } from "@startup/shared";
import { prepareNodeUpdate } from "@/helpers/index.js";

/**
 * ReviewWorker: El Sensor de Calidad Técnica.
 * Analiza el rastro de cambios y el progreso para asegurar que se cumplen las Leyes Sagradas.
 */
export async function review_worker_node(state: AgentStateType): Promise<Partial<AgentStateType>> {
  console.log("\n--- EJECUTANDO NODO REVIEW WORKER ---");

  const system_prompt = new SystemMessage(`
    Eres un Senior Software Engineer realizando un Peer Review a un compañero Agente.
    Tu misión es validar que el código propuesto o las acciones técnicas sean de alta calidad.
    
    ESTRUCTURA DE RAZONAMIENTO:
    1. <thought>: Analiza la calidad del código.
    2. <plan>: Pasos para la revisión.
    3. <verification>: Criterios para aprobar o rechazar.
    
    LEY SAGRADA: Sé riguroso. Si el código no es excelente, responde 'needs_changes'.
  `);

  try {
    const { data: response, usage, cost, latency, model } = await LLMService.getStructuredData(
      { type: "ultra", temperature: 0 },
      [system_prompt, ...state.messages],
      ReviewWorkerSchema
    );

    console.log(`🧐 Review Result: ${response.status} -> ${response.reasoning}`);

    const metricsUpdate = await prepareNodeUpdate(state, {
      nodeName: "Review Worker",
      model: model || "unknown",
      usage,
      latency,
      cost,
      decision: response.status,
      reasoning: response.reasoning
    });

    const updates: Partial<AgentStateType> = {
      ...metricsUpdate,
      executive_summary: response.reasoning,
      messages: state.messages.concat([new AIMessage({
        content: `[REVIEW_WORKER_RESULT] Status: ${response.status}
Reasoning: ${response.reasoning}
Comments: ${response.review_comments.join(", ")}`,
      })])
    };

    return updates;
  } catch (error) {
    console.error("❌ Error en el Nodo Review Worker:", error);
    return {
      executive_summary: "Error crítico en el proceso de revisión.",
    };
  }
}
