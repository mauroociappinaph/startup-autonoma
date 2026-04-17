import { AgentStateType } from "@/types/state.types.js";
import { gitWorker } from "./gitWorker.js";
import { AIMessage } from "@langchain/core/messages";
import { GitCommandInput } from "@/types/git-worker.types.js";

/**
 * Nodo GitWorker: Brazo ejecutor de operaciones Git dentro del grafo.
 * Recibe instrucciones estructuradas y devuelve el resultado de la operación.
 */
export async function git_worker_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO GIT WORKER ---");

  // Buscamos la última instrucción para el Git Worker en los mensajes
  // El Software Chief debería haber dejado un mensaje con la instrucción
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (!lastMessage || !lastMessage.additional_kwargs?.git_instruction) {
    console.error("❌ No se encontró una instrucción válida para el Git Worker.");
    return {
      executive_summary: "Error: No se recibió una instrucción Git válida.",
    };
  }

  const gitInstruction = lastMessage.additional_kwargs.git_instruction as GitCommandInput;

  try {
    const result = await gitWorker(gitInstruction);

    if (result.success) {
      console.log(`✅ Operación Git [${result.action}] exitosa.`);
      return {
        executive_summary: `Git Worker ejecutó con éxito: ${result.action}. Stdout: ${result.stdout || 'N/A'}`,
        completed_steps: ["git_operation"],
        messages: [new AIMessage({
          content: `[GIT_REPORT] Operación ${result.action} completada.`,
          additional_kwargs: { git_result: result }
        })]
      };
    } else {
      console.error(`❌ Operación Git [${result.action}] fallida: ${result.errorMessage}`);
      return {
        executive_summary: `Error en Git Worker: ${result.errorMessage}`,
        messages: [new AIMessage({
          content: `[GIT_ERROR] Falló ${result.action}: ${result.errorMessage}`,
          additional_kwargs: { git_result: result }
        })]
      };
    }
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    console.error("❌ Fallo crítico en el Nodo GitWorker:", err.message);
    return {
      executive_summary: `Fallo crítico en Git Worker: ${err.message}`,
    };
  }
}
