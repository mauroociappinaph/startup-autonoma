import { z } from "zod";

/**
 * Contrato de comunicación del CEO hacia los Chiefs.
 * Define la misión, métricas de éxito y prioridad.
 */
export const ChiefMissionSchema = z.object({
  mision: z.string().describe("Objetivo estratégico a cumplir."),
  prioridad: z.enum(["low", "med", "high"]).describe("Prioridad de la misión."),
  metricas_de_exito: z.array(z.string()).describe("Lista de criterios para validar el éxito de la misión."),
});

export type ChiefMission = z.infer<typeof ChiefMissionSchema>;
