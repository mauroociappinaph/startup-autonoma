import { AgentStateType } from "@/types/state.types.js";
import { save_to_engram } from "@/tools/platform/engram_tool.js";
import { EngramToolArgs, EngramResult } from "@/types/engram.types.js";
import { AIMessage } from "@langchain/core/messages";

/**
 * Nodo de Persistencia: Ejecuta el guardado de información en Engram.
 * Es el "archivista" de la Startup.
 */
export async function persistence_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO DE PERSISTENCIA (ENGRAM) ---");

  // Recuperamos la data a persistir de los additional_kwargs del último mensaje
  const lastMessage = state.messages[state.messages.length - 1];
  
  // Tipado seguro para la data de Engram
  const engramData = lastMessage.additional_kwargs?.engram_data as EngramToolArgs | undefined;

  if (!engramData) {
    console.error("❌ No se encontró información para persistir en el historial.");
    return {
      messages: state.messages.concat([new AIMessage({
        content: "[PERSISTENCE_ERROR] No hay datos para guardar en Engram."
      })]),
      plan: []
    };
  }

  try {
    console.log(`💾 Guardando en Engram: ${engramData.title}...`);
    
    // Llamamos a la tool real (simulada por ahora)
    const result = await save_to_engram.invoke(engramData);
    
    // Manejo seguro del resultado de la tool (usando unknown para el puente de tipos)
    const engramResult = result as unknown as EngramResult;
    const successMessage = engramResult.message || "Hito guardado con éxito.";

    return {
      messages: state.messages.concat([new AIMessage({
        content: `[WORKER_RESULT] Datos persistidos correctamente: ${successMessage}`,
        additional_kwargs: { engram_result: result }
      })]),
      plan: [] // Vuelve al Chief para consolidar
    };
  } catch (error) {
    console.error("❌ Fallo en la persistencia:", error);
    return {
      messages: state.messages.concat([new AIMessage({
        content: `[WORKER_ERROR] Falla al guardar en Engram: ${error instanceof Error ? error.message : String(error)}`
      })]),
      plan: []
    };
  }
}
