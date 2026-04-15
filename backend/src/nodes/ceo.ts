import { LLMService } from "../services/llmService.js";
import { CEOResponseSchema } from "../contracts/ceo.js";
import { AgentStateType } from "@/types/state.types.js";
import { SystemMessage } from "@langchain/core/messages";

/**
 * Nodo CEO: Orquestador Principal del Grafo.
 * Su misión es analizar y delegar.
 */
export async function ceo_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO CEO ---");

  const system_prompt = new SystemMessage(`
    Actúa como el CEO de una Startup Autónoma de IA. 
    Tu objetivo es coordinar a un equipo de agentes (Chiefs y Workers) para cumplir con el pedido del usuario.
    
    ESTRATEGIA:
    1. Analiza el historial de mensajes y el progreso actual.
    2. Si el objetivo es complejo, descompónlo en pasos.
    3. Delega tareas atómicas a los agentes correspondientes (ej: GitWorker, ResearchWorker).
    4. Si todo está listo, marca el proceso como completo.
    
    REGLA DE ORO: No hagas el trabajo tú mismo, DELEGA.
  `);

  try {
    const response = await LLMService.getStructuredResponse(
      { type: "smart", temperature: 0 },
      [system_prompt, ...state.messages],
      CEOResponseSchema
    );

    console.log(`✅ CEO Decision: ${response.next_step} -> ${response.reasoning}`);

    // Si el CEO decide delegar, actualizamos el estado para que el Grafo tome el camino condicional
    const nextPlan = response.next_step === "delegate" ? ["research"] : [];

    // Retornamos la actualización del estado incluyendo el campo plan
    return {
      executive_summary: response.analysis,
      plan: nextPlan
    };
  } catch (error) {
    console.error("❌ Fallo en el Nodo CEO:", error);
    throw error;
  }
}
