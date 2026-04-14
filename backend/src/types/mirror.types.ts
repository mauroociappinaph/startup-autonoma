import { z } from 'zod';

/**
 * Esquema de respuesta del Mirror Agent.
 * Actúa como filtro y optimizador antes de que la orden llegue al CEO.
 */
export const MirrorResponseSchema = z.object({
  refined_prompt: z.string().describe("El prompt optimizado y clarificado para que los agentes lo entiendan mejor."),
  intentions: z.array(z.string()).describe("Lista de intenciones detectadas (desglose semántico)."),
  missing_info: z.array(z.string()).describe("Lista de datos o contextos que el usuario omitió y podrían ser útiles."),
  suggested_next_steps: z.array(z.string()).describe("Pasos lógicos que el sistema seguirá si el usuario aprueba."),
  requires_human_approval: z.boolean().default(true).describe("Indica si el grafo debe pausarse para validación humana."),
});

export type MirrorResponse = z.infer<typeof MirrorResponseSchema>;
