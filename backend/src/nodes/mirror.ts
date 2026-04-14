import { AgentStateType } from "@/types/state.types.js";
import { LLMService } from "@/services/llmService.js";
import { MirrorResponseSchema } from "@/types/mirror.types.js";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

/**
 * Nodo MirrorAgent: El Arquitecto de Intenciones.
 * Filtra, optimiza y clarifica la petición del usuario antes de que llegue al CEO.
 */
export async function mirror_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO MIRROR (INTROSPECCIÓN) ---");

  // Buscamos el prompt original del usuario en los mensajes
  const originalPrompt = state.messages.find(m => m._getType() === 'human')?.content || "";

  if (!originalPrompt) {
    console.error("❌ No se encontró un prompt original en el historial.");
    return {
      executive_summary: "Error: No hay una instrucción humana para procesar.",
    };
  }

  const system_prompt = new SystemMessage(`
    Eres el Mirror Agent de una Startup Autónoma. 
    Tu misión es actuar como el puente semántico entre la voluntad cruda del humano y la precisión técnica del sistema de agentes.

    TUS RESPONSABILIDADES:
    1. INTENTION MULTIPLEXING: Detecta si el prompt tiene múltiples órdenes y desglósalas.
    2. REFINAMIENTO: Reescribe el pedido para que sea técnico, claro y sin ambigüedades.
    3. GAP DETECTION: Identifica qué información falta para que los Chiefs puedan trabajar (ej: rutas de archivos, stacks tecnológicos).
    4. ALINEACIÓN DE ESTILO: Mantén el tono profesional y directo.

    REGLA DE ORO: No eres un ejecutor. Solo clarificas la intención.
  `);

  try {
    const response = await LLMService.getStructuredResponse(
      { type: "smart", temperature: 0 },
      [system_prompt, new HumanMessage(`Optimiza esta petición: "${originalPrompt}"`)],
      MirrorResponseSchema
    );

    console.log(`🧠 Intenciones detectadas: ${response.intentions.join(', ')}`);
    console.log(`✨ Prompt refinado: ${response.refined_prompt}`);

    // Preparamos la respuesta para el grafo
    return {
      refined_prompt: response.refined_prompt, // Guardamos el prompt limpio en el estado
      executive_summary: `Mirror optimizó la petición. Intenciones: ${response.intentions.length}.`,
      messages: [new AIMessage({
        content: `[MIRROR_REPORT] He analizado tu petición. \n\n**Propuesta Refinada:** ${response.refined_prompt}\n\n**Intenciones:** ${response.intentions.join(', ')}\n\n**Información Faltante:** ${response.missing_info.length > 0 ? response.missing_info.join(', ') : 'Ninguna.'}`,
        additional_kwargs: { mirror_data: response }
      })]
    };
  } catch (error: any) {
    console.error("❌ Fallo en el Nodo Mirror:", error);
    throw error;
  }
}
