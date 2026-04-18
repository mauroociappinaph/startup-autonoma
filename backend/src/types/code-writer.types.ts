import { z } from "zod";

/**
 * Esquema base para cualquier operación de modificación de código
 */
export const CodeWriterPayloadSchema = z.object({
  file_path: z.string().describe("Ruta relativa al archivo a modificar desde la base del repositorio."),
  action: z.enum(["write", "patch", "delete"]).describe("El tipo de operación requerida sobre el archivo."),
  new_content: z.string().optional().describe("Contenido nuevo a inyectar (si es 'write' sobreescribe todo; si es 'patch' reemplaza exacto)."),
  target_content: z.string().optional().describe("Sólo para 'patch': bloque de código exacto a reemplazar. Debe coincidir perfectamente para evitar errores de corrupción."),
  validation_required: z.boolean().default(true).describe("Si se debe correr TSC o sintaxis sobre el archivo modificado antes de devolver éxito."),
});

export type CodeWriterPayload = z.infer<typeof CodeWriterPayloadSchema>;

export const CodeWriterInstructionSchema = z.object({
  payload: CodeWriterPayloadSchema
});

export type CodeWriterInstruction = z.infer<typeof CodeWriterInstructionSchema>;
