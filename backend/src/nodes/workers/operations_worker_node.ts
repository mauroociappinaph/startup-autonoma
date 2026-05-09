import { AgentStateType } from "@startup/shared";
import { AIMessage } from "@langchain/core/messages";
import child_process from "child_process";
import fs from "fs";
import path from "path";
import { safeExec } from "@/helpers/operationsHelper.js";
import { OperationsWorkerInput, OperationsWorkerResult, ExecError } from "@/types/operations.types.js";
import { services } from "@/services/index.js";
import { incrementIteration } from "@/helpers/index.js";
import { generateSequenceDiagram } from "@/helpers/diagramHelper.js";

/**
 * Nodo OperationsWorker: Ejecutor de comandos de infraestructura.
 */
export async function operations_worker_node(state: AgentStateType) {
  services.logger.node("OPERATIONS WORKER");

  const lastMessage = state.messages[state.messages.length - 1];
  const instruction = lastMessage?.additional_kwargs?.operations_instruction as OperationsWorkerInput;
  
  if (!instruction) {
    services.logger.error("No se encontró una instrucción válida para el Operations Worker.", "OPS_NODE");
    return {
      executive_summary: "Error: No se recibió una instrucción de operaciones válida.",
      ...incrementIteration(state)
    };
  }

  try {
    // --- NUEVO: Manejo de acciones integradas (Internal Operations) ---
    if (instruction.command === "generate_sequence_diagram") {
      services.logger.info("Generando diagrama de secuencia automático...", "OPS_NODE");
      const diagram = generateSequenceDiagram(state.messages);
      
      const docsDir = path.join(process.cwd(), "docs/architecture/sequences");
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }

      const fileName = `sequence_${Date.now()}.mmd`;
      const filePath = path.join(docsDir, fileName);
      fs.writeFileSync(filePath, diagram);

      services.logger.success(`Diagrama generado exitosamente en ${filePath}`, "OPS_NODE");

      return {
        executive_summary: `Se ha generado un diagrama de secuencia de la ejecución actual en: ${filePath}`,
        completed_steps: (state.completed_steps || []).concat(["generate_sequence_diagram"]),
        last_diagram: diagram,
        ...incrementIteration(state),
        next_node: state.active_chief || "ceo",
        messages: [new AIMessage({
          content: `[OPS_REPORT] Diagrama de secuencia generado: ${fileName}`,
          additional_kwargs: { 
            node: "operations_worker",
            operations_result: { success: true, action: "generate_sequence_diagram", stdout: filePath } 
          }
        })]
      };
    }

    // --- Ejecución de comandos de Shell (Legacy / External Ops) ---
    const command = safeExec(instruction.command, instruction.args);
    services.logger.info(`Ejecutando comando: ${command}`, "OPS_NODE");

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

    services.logger.success(`Comando ${instruction.command} ejecutado con éxito.`, "OPS_NODE");

    return {
      executive_summary: `Operations Worker ejecutó ${instruction.command}:\n${stdout || stderr || 'Sin salida'}`,
      completed_steps: (state.completed_steps || []).concat(["infrastructure_operation"]),
      ...incrementIteration(state),
      next_node: state.active_chief || "ceo",
      messages: [new AIMessage({
        content: `[OPS_REPORT] Comando ${instruction.command} completado.`,
        additional_kwargs: { 
          node: "operations_worker",
          operations_result: result 
        }
      })]
    };
  } catch (err: any) {
    services.logger.error(`Error en Operations Worker: ${err.message}`, "OPS_NODE");
    
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
        additional_kwargs: { 
          node: "operations_worker",
          operations_result: result 
        }
      })]
    };
  }
}
