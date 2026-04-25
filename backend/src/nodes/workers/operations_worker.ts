import { AgentStateType } from "@startup/shared";
import { AIMessage } from "@langchain/core/messages";
import child_process from "child_process";
import { safeExec } from "./operationsHelper.js";
import { OperationsWorkerInput, OperationsWorkerResult, ExecError } from "@/types/operations.types.js";
import { SacredLogger } from "@/helpers/logger.js";
import { incrementIteration } from "@/helpers/index.js";

/**
 * Nodo OperationsWorker: Ejecutor de comandos de infraestructura.
 */
export async function operations_worker_node(state: AgentStateType) {
  SacredLogger.node("OPERATIONS WORKER");

  const lastMessage = state.messages[state.messages.length - 1];
  
  if (!lastMessage || !lastMessage.additional_kwargs?.operations_instruction) {
    SacredLogger.error("No se encontró una instrucción válida para el Operations Worker.", "OPS_NODE");
    return {
      executive_summary: "Error: No se recibió una instrucción de operaciones válida.",
      ...incrementIteration(state)
    };
  }

  const instruction = lastMessage.additional_kwargs.operations_instruction as OperationsWorkerInput;

  try {
    const command = safeExec(instruction.command, instruction.args);
    SacredLogger.info(`Ejecutando comando: ${command}`, "OPS_NODE");

    const { stdout, stderr } = await new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
      child_process.exec(command, (error, stdout, stderr) => {
        if (error) {
          const err = error as ExecError;
          err.stdout = stdout;
          err.stderr = stderr;
          reject(err);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });

    const result: OperationsWorkerResult = {
      success: true,
      action: instruction.command,
      stdout,
      stderr
    };

    SacredLogger.success(`Comando ${instruction.command} ejecutado con éxito.`, "OPS_NODE");

    return {
      executive_summary: `Operations Worker ejecutó ${instruction.command}:\n${stdout || stderr || 'Sin salida'}`,
      completed_steps: ["infrastructure_operation"],
      ...incrementIteration(state),
      next_node: state.active_chief || "ceo",
      messages: [new AIMessage({
        content: `[OPS_REPORT] Comando ${instruction.command} completado.`,
        additional_kwargs: { operations_result: result }
      })]
    };
  } catch (error: unknown) {
    const err = error as ExecError;
    SacredLogger.error(`Error en Operations Worker: ${err.message}`, "OPS_NODE");
    
    const result: OperationsWorkerResult = {
      success: false,
      action: instruction.command,
      errorMessage: err.message,
      stderr: err.stderr
    };

    return {
      executive_summary: `Error en Operations Worker: ${err.message}`,
      ...incrementIteration(state),
      next_node: state.active_chief || "ceo",
      messages: [new AIMessage({
        content: `[OPS_ERROR] Falló ${instruction.command}: ${err.message}`,
        additional_kwargs: { operations_result: result }
      })]
    };
  }
}
