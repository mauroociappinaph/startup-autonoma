import { z } from "zod";

/**
 * Esquema de instrucción para el OperationsWorker.
 * Define qué comandos de infraestructura se pueden ejecutar.
 */
export const OperationsWorkerSchema = z.object({
  command: z.enum(["docker_ps", "docker_logs", "npm_build", "check_health"]).describe("El comando de infraestructura a ejecutar."),
  args: z.array(z.string()).optional().describe("Argumentos opcionales para el comando."),
  reasoning: z.string().describe("Justificación técnica de por qué se ejecuta este comando.")
});

export type OperationsWorkerInput = z.infer<typeof OperationsWorkerSchema>;
