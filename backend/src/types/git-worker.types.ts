import { z } from 'zod';

/**
 * Acciones específicas que el Git Worker puede realizar.
 * Esto desacopla al Software Chief de la sintaxis cruda de Git.
 */
export const GitActionSchema = z.discriminatedUnion('action', [
  // Ejecución de comando Git crudo (como fallback)
  z.object({
    action: z.literal('raw'),
    command: z.string(),
    args: z.array(z.string()),
  }),
  // Crear una nueva branch desde develop o la actual
  z.object({
    action: z.literal('create-branch'),
    branchName: z.string(),
    baseBranch: z.string().default('develop'),
  }),
  // Hacer un commit de todos los cambios actuales
  z.object({
    action: z.literal('commit-all'),
    message: z.string(),
  }),
  // Sincronizar develop con el remoto y pararse ahí
  z.object({
    action: z.literal('sync-develop'),
  }),
  // Pullear cambios en la branch actual
  z.object({
    action: z.literal('pull'),
  }),
  // Pushear cambios al remoto
  z.object({
    action: z.literal('push'),
    branchName: z.string().optional(),
  }),
]);

/**
 * Esquema principal para el comando que recibe el Git Worker.
 */
export const GitCommandSchema = z.object({
  payload: GitActionSchema,
  repoPath: z.string().optional(), // Ruta del repositorio (por defecto el cwd)
  isolationId: z.string().optional(), // Identificador para gestión de worktrees (aislamiento)
});

export type GitCommandInput = z.infer<typeof GitCommandSchema>;

/**
 * Esquema para la respuesta detallada del Git Worker.
 */
export const GitWorkerResponseSchema = z.object({
  success: z.boolean(),
  action: z.string(), // La acción que se intentó ejecutar
  stdout: z.string().optional(),
  stderr: z.string().optional(),
  errorMessage: z.string().optional(),
  commitId: z.string().optional(),
  branchName: z.string().optional(),
  trace_id: z.string().uuid().optional(), // Para trazabilidad distribuida
});

export type GitWorkerResponse = z.infer<typeof GitWorkerResponseSchema>;
