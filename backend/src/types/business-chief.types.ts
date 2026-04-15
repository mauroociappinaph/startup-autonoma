import { z } from 'zod';

/**
 * Esquema para la tarea que el CEO delega al Business Chief.
 * Enfocado en metas de mercado, clientes y estrategia.
 */
export const BusinessChiefTaskSchema = z.object({
  taskId: z.string().uuid("El ID de la tarea debe ser un UUID válido."),
  description: z.string().min(1, "La descripción de la tarea es obligatoria."),
  target_audience: z.string().optional().describe("Público objetivo definido por el CEO."),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export type BusinessChiefTaskInput = z.infer<typeof BusinessChiefTaskSchema>;

/**
 * Esquema para la respuesta del Business Chief hacia el CEO.
 * Enfocado en leads, insights de mercado y validaciones.
 */
export const BusinessChiefOutputSchema = z.object({
  status: z.enum(["success", "failed", "pending", "market_validated", "waiting_for_strategic_decision"]),
  summary: z.string().optional(),
  leads_found: z.number().optional().describe("Cantidad de leads generados/identificados."),
  market_insights: z.array(z.string()).optional().describe("Hallazgos clave tras la investigación."),
  error: z.string().optional(),
  trace_id: z.string().uuid("El trace_id debe ser un UUID válido."),
});

export type BusinessChiefOutput = z.infer<typeof BusinessChiefOutputSchema>;
