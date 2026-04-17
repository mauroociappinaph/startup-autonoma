import { z } from "zod";

/**
 * Esquema de respuesta estructurada del Agente CEO.
 * Define el plan de acción y la delegación de tareas.
 */
export const CEOResponseSchema = z.object({
  reasoning: z.string().describe("Justificación técnica de la decisión tomada."),
  analysis: z.string().describe("Breve análisis de la situación actual y el progreso."),
  next_step: z.enum(["plan", "delegate", "verify", "finish"]).describe("El tipo de acción que el CEO decide tomar."),
  delegated_to: z.enum(["software_chief", "business_chief"]).optional().describe("Nombre del Jefe de Área al que se le delega la tarea."),
  task_description: z.string().optional().describe("Descripción clara de la tarea atómica a realizar por el delegado."),
  is_complete: z.boolean().describe("Indica si el objetivo global del usuario ha sido cumplido.")
});
