import { z } from 'zod';

// Esquema para el comando que el Software Chief envía al Git Worker
// Define la operación Git específica a ejecutar.
export const GitCommandSchema = z.object({
  command: z.string(), // El comando Git a ejecutar (ej: "commit", "branch", "checkout")
  args: z.array(z.string()), // Argumentos para el comando Git (ej: ["-m", "feat: add git worker"])
  repoPath: z.string().optional(), // Ruta del repositorio si no es el actual (para casos futuros)
  isolationId: z.string().optional(), // Identificador para usar con git worktree
});

export type GitCommandInput = z.infer<typeof GitCommandSchema>;

// Esquema para la respuesta del Git Worker hacia el Software Chief
// Reporta el resultado de la ejecución de un comando Git.
export const GitWorkerResponseSchema = z.object({
  success: z.boolean(), // Si la operación Git fue exitosa
  stdout: z.string().optional(), // Salida estándar del comando Git
  stderr: z.string().optional(), // Salida de error del comando Git
  errorMessage: z.string().optional(), // Mensaje de error específico si falla
  commitId: z.string().optional(), // El ID del commit si la operación fue un commit exitoso
  branchName: z.string().optional(), // El nombre de la branch si la operación fue crear/cambiar branch
});

export type GitWorkerResponse = z.infer<typeof GitWorkerResponseSchema>;
