import { z } from 'zod';

// Esquema para la tarea que el CEO delega al Software Chief
// Describe la solicitud de alto nivel que el CEO envía.
export const SoftwareChiefTaskSchema = z.object({
  taskId: z.string().uuid("El ID de la tarea debe ser un UUID válido."), // Identificador único de la tarea
  description: z.string().min(1, "La descripción de la tarea es obligatoria."), // Descripción de alto nivel de lo que hay que hacer
  subtasks: z.array(z.string()).optional(), // Tareas desglosadas si el CEO ya las hizo (ej: ["implement git worker", "write tests"])
  priority: z.enum(["low", "medium", "high"]).default("medium"), // Prioridad de la tarea
});

export type SoftwareChiefTaskInput = z.infer<typeof SoftwareChiefTaskSchema>;

// Esquema para la respuesta del Software Chief hacia el CEO
// Describe el resultado de la ejecución de una tarea o delegación.
export const SoftwareChiefOutputSchema = z.object({
  status: z.enum(["success", "failed", "pending", "waiting_for_human_approval"]), // Estado de la operación
  summary: z.string().optional(), // Resumen conciso del resultado
  results: z.array(z.any()).optional(), // Resultados detallados de los workers
  error: z.string().optional(), // Mensaje de error detallado si falla
  next_step: z.string().optional(), // Indica el siguiente paso lógico en el grafo
  trace_id: z.string().uuid("El trace_id debe ser un UUID válido."), // Mismo trace_id para auditoría
});

export type SoftwareChiefOutput = z.infer<typeof SoftwareChiefOutputSchema>;
