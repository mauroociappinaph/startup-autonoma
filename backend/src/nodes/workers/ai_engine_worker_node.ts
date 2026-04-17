import { AgentStateType } from "@/types/state.types.js";
import { aiEngineClient } from "@/services/aiEngineClient.js";
import { AIMessage } from "@langchain/core/messages";

interface AIEngineTask {
  worker_name: string;
  task_description: string;
  trace_id?: string;
  payload?: object;
}

/**
 * Nodo AI Engine Worker: Interfaz con el motor de Python vía gRPC.
 * Ejecuta tareas pesadas como Lead Gen, Scraping o ML.
 */
export async function ai_engine_worker_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO WORKER AI ENGINE (gRPC) ---");

  // Recuperamos la instrucción del mensaje del Chief (buscamos en los additional_kwargs)
  const lastMessage = state.messages[state.messages.length - 1];
  const aiTask = lastMessage.additional_kwargs?.ai_engine_task as AIEngineTask | undefined;

  if (!aiTask) {
    console.error("❌ No se encontró una tarea válida para el AI Engine en el historial.");
    return {
      messages: state.messages.concat([new AIMessage({
        content: "[WORKER_ERROR] No hay instrucciones para el AI Engine."
      })]),
      plan: [] // Detenemos la ejecución
    };
  }

  try {
    console.log(`🚀 Llamando a Worker Python: ${aiTask.worker_name}...`);
    
    // Aseguramos que trace_id sea un string
    const traceId = aiTask.trace_id || (state.trace_id ? String(state.trace_id) : "unknown");

    const response = await aiEngineClient.executeTask({
      worker_name: aiTask.worker_name,
      task_description: aiTask.task_description,
      trace_id: traceId,
      payload: aiTask.payload || {}
    });

    if (response.success) {
      console.log(`✅ Resultado del AI Engine recibido: ${response.message}`);
      return {
        messages: state.messages.concat([new AIMessage({
          content: `[WORKER_RESULT] Resultado de ${aiTask.worker_name}: ${response.message}`,
          additional_kwargs: { ai_engine_result: response.result }
        })]),
        completed_steps: ["ai_engine_task"],
        plan: [] // Tarea terminada, vuelve al Chief
      };
    } else {
      throw new Error(response.error_code || response.message);
    }
  } catch (error) {
    console.error("❌ Fallo en la comunicación con el AI Engine:", error);
    return {
      messages: state.messages.concat([new AIMessage({
        content: `[WORKER_ERROR] Falla en AI Engine (${aiTask.worker_name}): ${error instanceof Error ? error.message : String(error)}`
      })]),
      plan: []
    };
  }
}
