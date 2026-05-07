import { z } from "zod";

/**
 * Esquema de respuesta para el OperationsChief.
 * Se encarga de la infraestructura y mantenimiento.
 */
export const OperationsChiefSchema = z.object({
  reasoning: z.string().describe("Justificación de la acción de infraestructura."),
  action: z.enum(["deploy", "monitor", "provision", "rollback", "audit_logs", "generate_sequence_diagram", "complete"]).describe("Tipo de operación de infraestructura."),
  details: z.string().describe("Detalles técnicos de la operación (ej: branch de deploy, servicios a monitorear)."),
  priority: z.enum(["low", "medium", "high", "critical"]).describe("Nivel de prioridad de la operación."),
  requires_approval: z.boolean().describe("Si la acción requiere validación humana (HITL).")
});
