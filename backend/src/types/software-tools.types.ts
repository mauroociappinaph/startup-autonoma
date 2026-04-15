import { z } from 'zod';

/**
 * Esquema de entrada para la herramienta TestRunner.
 * Permite ejecutar tests en un paquete específico del monorepo.
 */
export const TestRunnerInputSchema = z.object({
  package: z.enum(['backend', 'frontend', 'ai-engine']).describe('Paquete donde se ejecutarán los tests.'),
  filter: z.string().optional().describe('Filtro opcional para ejecutar una suite o archivo específico (ej: "git_worker").'),
});

export type TestRunnerInput = z.infer<typeof TestRunnerInputSchema>;

/**
 * Esquema de salida para la herramienta TestRunner.
 * Provee un resumen estructurado del resultado para que el Chief pueda razonar.
 */
export const TestRunnerOutputSchema = z.object({
  success: z.boolean().describe('Indica si todos los tests pasaron.'),
  summary: z.string().describe('Resumen legible de los resultados (ej: "10 tests passed, 0 failed").'),
  stdout: z.string().optional().describe('Salida estándar completa del comando.'),
  stderr: z.string().optional().describe('Salida de error del comando (incluye fallos de tests).'),
  commandExecuted: z.string().describe('El comando real que se ejecutó en la terminal.'),
});

export type TestRunnerOutput = z.infer<typeof TestRunnerOutputSchema>;
