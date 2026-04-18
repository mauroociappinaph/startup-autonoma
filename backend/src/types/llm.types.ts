import { z } from "zod";

/**
 * Proveedores soportados por nuestra Startup.
 */
export type LLMProvider = "openai" | "anthropic" | "groq" | "google" | "mistral" | "nvidia";

/**
 * Tallas de Modelos:
 * - SMART: Para razonamiento complejo, CEO, planificación.
 * - FAST: Para tareas atómicas, GitWorker, validaciones simples.
 */
export type LLMModelType = "smart" | "fast" | "reasoning" | "ultra" | "flow";

/**
 * Configuración de un modelo específico.
 */
export const LLMConfigSchema = z.object({
  provider: z.enum(["openai", "anthropic", "groq", "google", "mistral", "nvidia"]),
  modelName: z.string(),
  temperature: z.number().default(0),
  maxTokens: z.number().optional(),
  apiKey: z.string().optional(),
});

export type LLMConfig = z.infer<typeof LLMConfigSchema>;

/**
 * Interfaz para la respuesta estandarizada de la Factory.
 */
export interface LLMFactoryOptions {
  type: LLMModelType;
  temperature?: number;
  streaming?: boolean;
}
