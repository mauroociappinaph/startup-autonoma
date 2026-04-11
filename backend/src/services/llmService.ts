import { ZodSchema } from "zod";
import { LLMFactory } from "./llmFactory.js";
import { LLMFactoryOptions } from "../types/llm.js";
import { ContextManager } from "../helpers/contextManager.js";

/**
 * Servicio de alto nivel para interactuar con los LLMs.
 * Orquestra el Trimming y los Structured Outputs.
 */
export class LLMService {
  /**
   * Ejecuta una llamada al modelo esperando una salida estructurada (JSON).
   * Fuerza el cumplimiento de la Ley #14.
   */
  static async getStructuredResponse<T>(
    options: LLMFactoryOptions,
    messages: any[],
    schema: ZodSchema<T>
  ): Promise<T> {
    const model = LLMFactory.createModel(options);

    // 1. Aplicar la Ley #13 (Trimming de Contexto)
    const trimmedMessages = await ContextManager.trim(messages, model);

    // 2. Aplicar la Ley #14 (Structured Output)
    // El modelo ya devuelve el objeto parseado y validado por Zod.
    const structuredModel = model.withStructuredOutput(schema);
    
    return await structuredModel.invoke(trimmedMessages) as T;
  }
}
