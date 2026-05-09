import { AgentStateType } from "@startup/shared";
import { services } from "@/services/index.js";
import { MirrorResponseSchema } from "@/types/mirror.types.js";
import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { prepareNodeUpdate } from "@/helpers/index.js";

/**
 * Nodo MirrorAgent: El Arquitecto de Intenciones.
 * Filtra, optimiza y clarifica la petición del usuario antes de que llegue al CEO.
 */
export async function mirror_node(state: AgentStateType) {
  services.logger.node("MIRROR (INTROSPECCIÓN)");
  services.logger.info(`Iniciando ejecución para thread_id: ${state.trace_id}`, "MIRROR");

  // Buscamos el prompt original del usuario en los mensajes
  const originalPrompt = state.messages.find((m: BaseMessage) => m._getType() === 'human')?.content || "";

  if (!originalPrompt) {
    services.logger.error("No se encontró un prompt original en el historial.", "MIRROR");
    return {
      executive_summary: "Error: No hay una instrucción humana para procesar.",
    };
  }

  const system_prompt = new SystemMessage(`
    Eres el Mirror Agent de una Startup Autónoma. 
    Tu misión es actuar como el puente semántico entre la voluntad cruda del humano y la precisión técnica del sistema de agentes.

    ESTRUCTURA DE RAZONAMIENTO:
    1. <thought>: Analiza la voluntad del usuario y detecta ambigüedades.
    2. <plan>: Pasos para el refinamiento de la petición.
    3. <verification>: Confirmación de que el prompt refinado es procesable por el CEO.

    REGLA DE ORO: No eres un ejecutor. Solo clarificas la intención.
  `);

  try {
    services.logger.info("Llamando a servicios.llm para optimización de intención...", "MIRROR");
    const { data: response, usage, cost, latency, model } = await services.llm.getStructuredData(
      { type: "reasoning", temperature: 0 },
      [system_prompt, new HumanMessage(`Optimiza esta petición: "${originalPrompt}"`)],
      MirrorResponseSchema
    );
    services.logger.info(`Respuesta recibida correctamente. Latencia: ${latency}ms`, "MIRROR");

    services.logger.info(`Intenciones detectadas: ${response.intentions.join(', ')}`, "MIRROR");
    services.logger.info(`Prompt refinado: ${response.refined_prompt}`, "MIRROR");
    services.logger.info(`Tokens usandos en este paso: ${usage.total}`, "MIRROR");

    const metricsUpdate = await prepareNodeUpdate(state, {
      nodeName: "Mirror",
      model: model || "unknown",
      usage,
      latency,
      cost,
      reasoning: `Intenciones: ${response.intentions.join(', ')}`
    });

    // Preparamos la respuesta para el grafo
    services.logger.info("Nodo finalizado. Devolviendo estado actualizado.", "MIRROR");
    return {
      ...metricsUpdate,
      refined_prompt: response.refined_prompt, // Guardamos el prompt limpio en el estado
      executive_summary: `Mirror optimizó la petición. Intenciones: ${response.intentions.length}.`,
      messages: [new AIMessage({
        content: `[MIRROR_REPORT] He analizado tu petición. \n\n**Propuesta Refinada:** ${response.refined_prompt}\n\n**Intenciones:** ${response.intentions.join(', ')}\n\n**Información Faltante:** ${response.missing_info.length > 0 ? response.missing_info.join(', ') : 'Ninguna.'}`,
        additional_kwargs: { mirror_data: response }
      })]
    };
  } catch (error: unknown) {
    const err = error as Error;
    services.logger.error(`Fallo en el Nodo Mirror: ${err.message}`, "MIRROR");
    throw err;
  }
}
