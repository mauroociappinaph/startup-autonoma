import { z } from "zod";

/**
 * Esquema de respuesta para el DocumentationWorker.
 * Se encarga de mantener la documentación técnica sincronizada.
 */
export const DocumentationWorkerSchema = z.object({
  reasoning: z.string().describe("Justificación de las actualizaciones de documentación."),
  files_updated: z.array(z.string()).describe("Lista de archivos de documentación modificados."),
  summary_of_changes: z.string().describe("Resumen de qué se actualizó en la base de conocimientos."),
  requires_human_review: z.boolean().describe("Si los cambios en la documentación deben ser validados por el usuario.")
});
