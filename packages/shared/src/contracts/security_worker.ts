import { z } from "zod";

/**
 * Esquema de respuesta para el SecurityWorker.
 * Realiza auditorías de seguridad sobre el código propuesto.
 */
export const SecurityWorkerSchema = z.object({
  reasoning: z.string().describe("Justificación del análisis de seguridad."),
  status: z.enum(["safe", "warning", "threat_detected"]).describe("Estado de seguridad del código."),
  vulnerabilities: z.array(z.object({
    type: z.string().describe("Tipo de vulnerabilidad (ej: SQL Injection, XSS)."),
    severity: z.enum(["low", "medium", "high", "critical"]),
    description: z.string().describe("Descripción detallada del riesgo."),
    location: z.string().describe("Archivo y línea o bloque de código afectado."),
    recommendation: z.string().describe("Acción sugerida para mitigar el riesgo.")
  })).describe("Lista de vulnerabilidades encontradas."),
  should_block: z.boolean().describe("Si el hallazgo es lo suficientemente grave como para detener el flujo (HITL mandatorio).")
});
