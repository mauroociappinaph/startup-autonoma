import { z } from "zod";

/**
 * Schema del job de agente que se encola en BullMQ.
 * Contrato tipado entre el API REST y el worker que ejecuta el grafo.
 */
export const AgentJobDataSchema = z.object({
  /** Prompt del usuario (ya puede venir refinado del Mirror o en crudo) */
  prompt: z.string().min(1),
  /** ID de sesión/thread para el checkpointer de LangGraph */
  sessionId: z.string(),
  /** ID del proyecto al que pertenece esta ejecución */
  projectId: z.string().optional(),
  /** URL del repositorio asociado (Gap 3: Auto-Clone) */
  repoUrl: z.string().url().optional(),
  /** Timestamp de cuando se recibió el request */
  enqueuedAt: z.string().datetime(),
});

export type AgentJobData = z.infer<typeof AgentJobDataSchema>;

/**
 * Resultado que el worker persiste al finalizar el job.
 */
export interface AgentJobResult {
  sessionId: string;
  completedAt: string;
  success: boolean;
  errorMessage?: string;
}
