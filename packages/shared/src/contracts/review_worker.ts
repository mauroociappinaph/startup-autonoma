import { z } from "zod";

/**
 * Esquema de respuesta para el ReviewWorker.
 * Se encarga de la revisión de código (Peer Review) interna.
 */
export const ReviewWorkerSchema = z.object({
  reasoning: z.string().describe("Justificación del análisis de la revisión."),
  status: z.enum(["approved", "needs_changes", "rejected"]).describe("Estado final de la revisión."),
  review_comments: z.array(z.string()).describe("Lista de comentarios técnicos sobre el código."),
  suggestions: z.array(z.string()).optional().describe("Sugerencias de mejora para el código revisado.")
});
