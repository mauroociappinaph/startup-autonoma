import { AgentStateType } from "@startup/shared";
import { services } from "@/services/index.js";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { incrementIteration } from "@/helpers/index.js";
import { AIEngineTask } from "@/types/index.js";
import { TraceContext } from "@/services/traceContext.js";


/**
 * Nodo AI Engine Worker: Interfaz con el motor de Python vía gRPC.
 * Ejecuta tareas pesadas como Lead Gen, Scraping o ML.
 */
export async function ai_engine_worker_node(state: AgentStateType) {
  services.logger.node("AI ENGINE WORKER");

  // Recuperamos la instrucción del mensaje del Chief (buscamos en los additional_kwargs)
  const lastMessage = state.messages[state.messages.length - 1];
  const aiTask = lastMessage.additional_kwargs?.ai_engine_task as AIEngineTask | undefined;

  if (!aiTask) {
    services.logger.error("No se encontró una tarea válida para el AI Engine en el historial.", "AI_ENGINE");
    return {
      messages: state.messages.concat([new AIMessage({
        content: "[WORKER_ERROR] No hay instrucciones para el AI Engine."
      })]),
      ...incrementIteration(state)
    };
  }

  // IDEMPOTENCIA: Verificar si ya obtuvimos el resultado para esta tarea específica
  const existingResult = state.messages.find((m: BaseMessage) => 
    m instanceof AIMessage && 
    typeof m.content === "string" && 
    m.content.includes(`[WORKER_RESULT] Resultado de ${aiTask.worker_name}`) &&
    m.content.includes(aiTask.task_description.substring(0, 50)) // Check partial match
  );

  if (existingResult) {
    services.logger.info(`ℹ️ [AI_ENGINE] Idempotencia disparada: Resultado ya existe para ${aiTask.worker_name}. Saltando gRPC...`, "AI_ENGINE");
    return {
      next_node: state.active_chief || "ceo"
    };
  }

  try {
    services.logger.info(`🚀 Llamando a Worker Python: ${aiTask.worker_name}...`, "AI_ENGINE");
    
    const traceId = TraceContext.getTraceId() || aiTask.trace_id || (state.trace_id ? String(state.trace_id) : "unknown");

    // Iniciar streaming de progreso en background
    const progressStream = services.aiEngine.streamProgress({
      worker_name: aiTask.worker_name,
      task_description: aiTask.task_description,
      trace_id: traceId,
      payload: aiTask.payload || {}
    });

    progressStream.on("data", (update) => {
      services.logger.info(`📢 [PROGRESS] ${aiTask.worker_name}: ${update.status} (${update.progress_percentage}%)`, "AI_ENGINE");
      // Publicar al EventBus para que llegue al Dashboard via SSE
      services.eventBus.publish(traceId, {
        type: "agent_progress",
        worker: aiTask.worker_name,
        ...update
      }).catch(err => services.logger.error("❌ Fallo publicando progreso", "AI_ENGINE"));
    });

    const response = await services.aiEngine.executeTask({
      worker_name: aiTask.worker_name,
      task_description: aiTask.task_description,
      trace_id: traceId,
      payload: aiTask.payload || {}
    });

    if (response.success) {
      services.logger.success(`✅ Resultado del AI Engine recibido: ${response.message}`, "AI_ENGINE");
      return {
        messages: state.messages.concat([new AIMessage({
          content: `[WORKER_RESULT] Resultado de ${aiTask.worker_name}: ${response.message}`,
          additional_kwargs: { ai_engine_result: response.result }
        })]),
        completed_steps: ["ai_engine_task"],
        iteration_count: 1,
        next_node: state.active_chief || "ceo"
      };
    } else {
      throw new Error(response.errorCode || response.message);
    }
  } catch (error) {
    services.logger.error(`❌ Fallo en la comunicación con el AI Engine: ${error instanceof Error ? error.message : String(error)}`, "AI_ENGINE");
    return {
      messages: state.messages.concat([new AIMessage({
        content: `[WORKER_ERROR] Falla en AI Engine (${aiTask.worker_name}): ${error instanceof Error ? error.message : String(error)}`
      })]),
      iteration_count: 1,
      next_node: state.active_chief || "ceo"
    };
  }
}
