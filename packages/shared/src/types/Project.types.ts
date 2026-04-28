import { z } from "zod";

/**
 * Esquema de validación para el contexto de un proyecto (Startup).
 */
export const ProjectContextSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1, "El nombre del proyecto es requerido"),
  repoUrl: z.string().url().optional(),
  workDir: z.string().min(1, "El directorio de trabajo es requerido"),
  engramNamespace: z.string().min(1, "El namespace de Engram es requerido"),
  maxTokenBudget: z.number().int().positive().default(1000000),
  maxUsdBudget: z.number().positive().default(10.0),
  metadata: z.record(z.any()).optional(),
});

/**
 * Tipo inferido para el contexto del proyecto.
 */
export type ProjectContext = z.infer<typeof ProjectContextSchema>;
