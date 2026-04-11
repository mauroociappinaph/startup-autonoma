/* eslint-disable */
/* eslint-disable */
/* eslint-disable */
import { z } from "zod";

/**
 * Esquema de respuesta estructurada para el Agente Researcher.
 * Define el formato de los hallazgos tras explorar el repositorio.
 */
export const ResearcherResponseSchema = z.object({
  findings: z.string().describe("Resumen detallado y técnico de los descubrimientos realizados en el repositorio."),
  relevant_files: z.array(z.string()).describe("Lista de rutas de archivos o directorios que fueron analizados durante la tarea."),
  conclusion: z.string().describe("Conclusión final simplificada para que el CEO tome la siguiente decisión estratégica.")
});
