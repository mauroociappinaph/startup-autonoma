import { z } from "zod";

/**
 * Esquema de respuesta estructurada del Agente CEO.
 * Define el plan de acción y la delegación de tareas.
 */
export const CEOResponseSchema = z.object({
  analysis: z.string().describe("Breve análisis de la situación actual y el progreso."),
  next_step: z.enum(["plan", "delegate", "verify", "finish"]).describe("El tipo de acción que el CEO decide tomar."),
  reasoning: z.string().describe("Justificación técnica de la decisión tomada."),
  delegated_to: z.string().optional().describe("Nombre del Agente Worker o Chief al que se le delega la tarea (si aplica)."),
  task_description: z.string().optional().describe("Descripción clara de la tarea atómica a realizar por el delegado."),
  is_complete: z.boolean().describe("Indica si el objetivo global del usuario ha sido cumplido.")
});
