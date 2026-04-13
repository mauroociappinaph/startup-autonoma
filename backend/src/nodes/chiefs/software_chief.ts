import { AgentStateType } from "@/types/state.types.js";
import { LLMService } from "@/services/llmService.js";
import { ChiefMissionSchema } from "@/types/chief.types.js";
import { SystemMessage } from "@langchain/core/messages";

/**
 * Nodo SoftwareChief: Supervisor Técnico.
 * Coordina a los Workers, desglosa tareas y aplica Validation Gates.
 */
export async function software_chief_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO SOFTWARE CHIEF ---");

  // System prompt que define la personalidad y límites del Chief
  const system_prompt = new SystemMessage(`
    Eres el SoftwareChief de una Startup Autónoma. 
    Tu misión es recibir mandatos estratégicos del CEO y supervisar a los Workers técnicos.

    TUS RESPONSABILIDADES:
    1. Desglosar la misión del CEO en tareas atómicas para los Workers.
    2. Instanciar al Worker necesario (ej: GitWorker, ResearchWorker).
    3. Aplicar "Validation Gates": revisar que el código generado cumpla con las "Leyes Sagradas" (SRP, DRY, 300 líneas, Barrel Files).
    4. Si un Worker falla, reintenta o reporta al CEO.
    
    TOMA DECISIONES: Usa tus herramientas de supervisión para garantizar código de élite.
  `);

  try {
    const response = await LLMService.getStructuredResponse(
      { type: "smart", temperature: 0 },
      [system_prompt, ...state.messages],
      ChiefMissionSchema
    );

    console.log(`✅ Chief Mission: ${response.mision}`);

    // Delegamos al worker dependiendo de la misión
    // Por ahora, si la misión contiene 'research', delegamos al researcher
    return {
      active_chief: "software_chief",
      plan: response.mision.toLowerCase().includes("research") || response.mision.toLowerCase().includes("investigar") || response.mision.toLowerCase().includes("analizar") ? ["research"] : [],
    };
  } catch (error) {
    console.error("❌ Fallo en el Nodo SoftwareChief:", error);
    throw error;
  }
}
