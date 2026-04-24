import { AgentStateType } from "@startup/shared";
import { AIMessage } from "@langchain/core/messages";
import { write_file, patch_file } from "@/tools/fs.js";
import { CodeWriterInstructionSchema } from "@/types/code-writer.types.js";

/**
 * Nodo CodeWriter: Ejecutor atómico "manos en la masa".
 * Responsable de escribir o modificar archivos físicamente en el disco.
 * 
 * Este nodo es determinista: recibe instrucciones claras del Chief y usa
 * las Tools nativas para aplicarlo. No genera planes, sólo ejecuta e informa.
 */
export async function code_writer_node(state: AgentStateType) {
  console.log("--- EJECUTANDO NODO CODE WRITER ---");

  try {
    // 1. Encontrar la instrucción de escritura en los mensajes más recientes
    const instructionMessage = state.messages.find(
      (m): m is AIMessage => m instanceof AIMessage && typeof m.content === "string" && m.content.includes("[CHIEF_DELEGATION] Delegando capacidad de escritura")
    );

    if (!instructionMessage || !("code_writer_instruction" in instructionMessage.additional_kwargs)) {
      throw new Error("No se encontró una instrucción válida de escritura en los mensajes recientes.");
    }

    const rawInstruction = instructionMessage.additional_kwargs.code_writer_instruction;
    
    // Parseo seguro usando el esquema
    const result = CodeWriterInstructionSchema.safeParse(rawInstruction);
    if (!result.success) {
      throw new Error(`Instrucción malformada: ${JSON.stringify(result.error.format())}`);
    }

    const payload = result.data.payload;
    let toolResultStr = "";

    // 2. Ejecutar la acción
    console.log(`[CODE WRITER] Modificando: ${payload.file_path} - Acción: ${payload.action}`);

    if (payload.action === "write") {
      if (!payload.new_content) throw new Error("Falta 'new_content' para realizar un write.");
      const res = await write_file.invoke({
        file_path: payload.file_path,
        content: payload.new_content
      });
      toolResultStr = typeof res === "string" ? res : JSON.stringify(res);
    } else if (payload.action === "patch") {
      if (!payload.new_content || !payload.target_content) throw new Error("Faltan 'new_content' o 'target_content' para realizar un patch.");
      const res = await patch_file.invoke({
        file_path: payload.file_path,
        target_content: payload.target_content,
        replacement_content: payload.new_content
      });
      toolResultStr = typeof res === "string" ? res : JSON.stringify(res);
    } else {
      throw new Error(`Acción ${payload.action} no soportada aún.`);
    }

    // Comprobamos si la herramienta dio error
    if (toolResultStr.toString().includes("error") || toolResultStr.toString().includes("No se encontró coincidencia")) {
      if (payload.action === "patch" && payload.new_content) {
        const fs = await import("fs/promises");
        try {
          const currentContent = await fs.readFile(payload.file_path, "utf-8");
          if (currentContent.includes(payload.new_content)) {
            console.log(`[CODE WRITER] Idempotencia Activa: Parche ya estaba aplicado en ${payload.file_path}`);
            toolResultStr += " [⚠️ Idempotencia: Modificación ya estaba aplicada previamente]";
          } else {
            throw new Error(`Fallo de Filesystem: ${toolResultStr}`);
          }
        } catch {
          throw new Error(`Fallo de Filesystem: ${toolResultStr}`);
        }
      } else {
        throw new Error(`Fallo de Filesystem: ${toolResultStr}`);
      }
    }

    // Validación opcional de sintaxis si es TS/TSX
    if (payload.validation_required && (payload.file_path.endsWith(".ts") || payload.file_path.endsWith(".tsx"))) {
      console.log(`[CODE WRITER] Validando sintaxis de ${payload.file_path}...`);
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);
      try {
        await execAsync(`npx tsc --noEmit ${payload.file_path}`, { cwd: process.cwd() });
        toolResultStr += `\n[Validación TSC: OK]`;
      } catch (tscError: unknown) {
        const errorMsg = tscError instanceof Error ? tscError.message : String(tscError);
        // En caso de error de sintaxis, no revertimos por ahora (el worker es atómico), pero tiramos el error al Chief.
        throw new Error(`Error de sintaxis TypeScript introducido: ${errorMsg}`);
      }
    }

    // 3. Resultado Exitoso
    return {
      messages: state.messages.concat([
        new AIMessage({
          content: `[WORKER_REPLY] Operación ${payload.action} en ${payload.file_path} completada exitosamente. \nResultado interno: ${toolResultStr}`
        })
      ]),
      active_chief: "software_chief", // Devuelve el control
      executive_summary: `Escritura en archivo ${payload.file_path} completada con éxito.`
    };

  } catch (error) {
    console.error("❌ Falló la operación del Code Writer:", error);
    return {
      messages: state.messages.concat([
        new AIMessage({
          content: `[WORKER_ERROR] El Code Writer falló intentando mutar el código: ${error instanceof Error ? error.message : String(error)}`
        })
      ]),
      active_chief: "software_chief",
      executive_summary: `Error crítico al escribir código: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
