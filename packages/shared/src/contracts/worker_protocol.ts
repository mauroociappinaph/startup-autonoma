import { z } from "zod";

/**
 * Estados posibles de la ejecución de un worker.
 */
export const WorkerStatusSchema = z.enum(["success", "failure", "error"]);
export type WorkerStatus = z.infer<typeof WorkerStatusSchema>;

/**
 * Esquema base para el resultado de cualquier Worker.
 * Obligatorio para todos los nodos tipo Worker.
 */
export const WorkerResultSchema = z.object({
  status: WorkerStatusSchema,
  payload: z.record(z.any()).describe("Datos resultantes de la operación (tipado por acción)."),
  reasoning: z.string().describe("Justificación técnica del resultado o del error."),
  metadata: z.record(z.any()).optional().describe("Datos adicionales para observabilidad (latencia, costo, etc).")
});

export type WorkerResult = z.infer<typeof WorkerResultSchema>;

/**
 * Esquema base para la instrucción enviada por un Chief.
 * Obligatorio para todas las delegaciones de Chief a Worker.
 */
export const WorkerInstructionSchema = z.object({
  action: z.string().describe("Nombre de la acción técnica a ejecutar."),
  payload: z.record(z.any()).describe("Carga útil con los parámetros de la acción."),
  reasoning: z.string().describe("Explicación de por qué el Chief delega esta tarea.")
});

export type WorkerInstruction = z.infer<typeof WorkerInstructionSchema>;
