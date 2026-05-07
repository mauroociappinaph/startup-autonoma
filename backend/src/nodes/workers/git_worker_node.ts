import { AgentStateType } from "@startup/shared";
import { gitWorker } from "./gitWorker.js";
import { AIMessage } from "@langchain/core/messages";
import { GitCommandInput } from "@/types/git-worker.types.js";
import { ProtocolHelper } from "@/helpers/protocol_helper.js";
import { SacredLogger } from "@/helpers/logger.js";
import { incrementIteration } from "@/helpers/index.js";

/**
 * Nodo GitWorker: Brazo ejecutor de operaciones Git dentro del grafo.
 */
export async function git_worker_node(state: AgentStateType) {
  SacredLogger.node("GIT WORKER");

  const instruction = ProtocolHelper.getInstruction(state.messages);
  
  if (!instruction) {
    SacredLogger.error("No se encontró una instrucción válida para el Git Worker.", "GIT_NODE");
    return {
      executive_summary: "Error: No se recibió una instrucción Git válida.",
      ...incrementIteration(state)
    };
  }

  const gitInstruction = instruction.payload as GitCommandInput;

  try {
    const repoPath = state.project_context?.workDir || process.cwd();
    const result = await gitWorker({ ...gitInstruction, repoPath });

    if (result.success) {
      SacredLogger.success(`Operación Git [${result.action}] exitosa.`, "GIT_NODE");
      return {
        executive_summary: `Git Worker ejecutó con éxito: ${result.action}.`,
        ...incrementIteration(state),
        messages: [new AIMessage({
          content: `[GIT_REPORT] Operación ${result.action} completada.`,
          additional_kwargs: ProtocolHelper.packResult({
            status: "success",
            payload: result,
            reasoning: `Operación git ${result.action} completada sin conflictos.`
          })
        })]
      };
    } else {
      SacredLogger.error(`Operación Git [${result.action}] fallida: ${result.errorMessage}`, "GIT_NODE");
      return {
        executive_summary: `Error en Git Worker: ${result.errorMessage}`,
        ...incrementIteration(state),
        messages: [new AIMessage({
          content: `[GIT_ERROR] Falló ${result.action}: ${result.errorMessage}`,
          additional_kwargs: ProtocolHelper.packResult({
            status: "failure",
            payload: result,
            reasoning: result.errorMessage || "Fallo desconocido en git."
          })
        })]
      };
    }
  } catch (error: unknown) {
    const err = error as Error;
    SacredLogger.error(`Fallo crítico en el Nodo GitWorker: ${err.message}`, "GIT_NODE");
    return {
      executive_summary: `Fallo crítico en Git Worker: ${err.message}`,
      ...incrementIteration(state),
      messages: [new AIMessage({
        content: `[GIT_CRITICAL_ERROR] ${err.message}`,
        additional_kwargs: ProtocolHelper.packResult({
          status: "error",
          payload: { error: err.message },
          reasoning: "Excepción crítica en el nodo git."
        })
      })]
    };
  }
}
