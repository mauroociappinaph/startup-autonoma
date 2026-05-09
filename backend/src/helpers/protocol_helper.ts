import { BaseMessage, AIMessage } from "@langchain/core/messages";
import { WorkerInstruction, WorkerInstructionSchema, WorkerResult, WorkerResultSchema } from "@startup/shared";
import { services } from "@/services/index.js";

/**
 * ProtocolHelper: Utilidad para estandarizar la comunicación Chief-Worker.
 */
export class ProtocolHelper {
  /**
   * Extrae una instrucción válida de los mensajes del Chief.
   */
  static getInstruction(messages: BaseMessage[]): WorkerInstruction | null {
    // Buscamos de atrás para adelante el último mensaje del Chief que contenga la instrucción
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg instanceof AIMessage && msg.additional_kwargs?.worker_instruction) {
        const result = WorkerInstructionSchema.safeParse(msg.additional_kwargs.worker_instruction);
        if (result.success) {
          return result.data;
        } else {
          services.logger.error(`Instrucción malformada detectada en el mensaje ${i}: ${result.error.message}`, "PROTOCOL");
        }
      }
    }
    return null;
  }

  /**
   * Extrae el último resultado reportado por un Worker.
   */
  static getResult(messages: BaseMessage[]): WorkerResult | null {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      // Los workers responden con mensajes que contienen worker_result en los metadatos
      if (msg instanceof AIMessage && msg.additional_kwargs?.worker_result) {
        const result = WorkerResultSchema.safeParse(msg.additional_kwargs.worker_result);
        if (result.success) {
          return result.data;
        }
      }
    }
    return null;
  }

  /**
   * Genera el payload de additional_kwargs para enviar una instrucción.
   */
  static packInstruction(instruction: WorkerInstruction) {
    return {
      worker_instruction: instruction
    };
  }

  /**
   * Genera el payload de additional_kwargs para enviar un resultado.
   */
  static packResult(result: WorkerResult) {
    return {
      worker_result: result
    };
  }
}
