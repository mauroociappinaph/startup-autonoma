import { z } from "zod";
import { BaseMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { SacredLogger } from "@/helpers/logger.js";
import { ProviderManager } from "./providerManager.js";
import { LLMFactoryOptions, LangChainResponseWithUsage } from "@/types/llm.types.js";
import { LLMFactory } from "../llmFactory.js";

/**
 * Helper interno para Timeouts.
 */
function withTimeout<T>(promise: Promise<T>, ms: number = 120000): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`LLM Timeout después de ${ms}ms`));
    }, ms);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

/**
 * Encapsula la lógica de resiliencia, reintentos y parsing manual de JSON.
 */
export class RetryStrategy {
  /**
   * Ejecuta una llamada a LLM con reintentos y fallbacks estratégicos.
   */
  public static async executeWithStructuredRetry<T extends z.ZodTypeAny>(
    config: LLMFactoryOptions,
    messages: BaseMessage[],
    schema: T,
    startTime: number
  ): Promise<{ 
    data: z.infer<T>; 
    usage: { total: number; prompt: number; completion: number };
    model: string;
  }> {
    const rawModel = ProviderManager.createModel(config);
    const modelName = ProviderManager.getModelName(rawModel);

    let lastError: Error | null = null;
    let currentConfig = { ...config };
    let currentModel = rawModel;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        SacredLogger.info(`Intento ${attempt}/3 para ${currentConfig.type} (${modelName})`, "LLM_RETRY");
        
        const provider = LLMFactory.getProviderForType(currentConfig.type);
        
        // Si es NVIDIA o falló el primer intento nativo, probamos manual
        if (provider === "nvidia" || attempt > 1) {
          return await this._getManualStructuredData(currentModel, messages, schema, currentConfig.timeoutMs);
        }

        const modelWithStructuredOutput = currentModel.withStructuredOutput(schema, { includeRaw: true });
        const response = (await withTimeout(modelWithStructuredOutput.invoke(messages), currentConfig.timeoutMs || 120000)) as { 
          parsed: z.infer<T>, 
          raw: LangChainResponseWithUsage 
        };
        
        const usage = response.raw.usage_metadata || { input_tokens: 0, output_tokens: 0, total_tokens: 0 };

        return {
          data: response.parsed as z.infer<T>,
          usage: {
            total: usage.total_tokens || 0,
            prompt: usage.input_tokens || 0,
            completion: usage.output_tokens || 0
          },
          model: modelName
        };
      } catch (error: unknown) {
        lastError = error as Error;
        SacredLogger.warn(`Fallo en intento ${attempt}: ${lastError.message}`, "LLM_RETRY");

        if (attempt === 1) {
          SacredLogger.info("Reintentando con modo manual...", "LLM_RETRY");
          // El loop continuará y en attempt=2 entrará al bloque de manual
        } else if (attempt === 2) {
          this._applyFallbackRotation(currentConfig, config);
          currentModel = ProviderManager.createModel(currentConfig);
        }
      }
    }

    throw lastError || new Error("Error agotando intentos en RetryStrategy");
  }

  /**
   * Aplica la lógica de rotación de modelos para el último intento.
   */
  private static _applyFallbackRotation(currentConfig: LLMFactoryOptions, originalConfig: LLMFactoryOptions) {
    const provider = LLMFactory.getProviderForType(originalConfig.type);
    if (originalConfig.type === "fast") {
      SacredLogger.warn(`Cambiando a Groq 70b para el último intento...`, "LLM_RETRY");
      currentConfig.type = "flow";
    } else {
      const fallbackProvider = provider === "nvidia" ? "groq" : "nvidia";
      SacredLogger.warn(`Cambiando de proveedor a ${fallbackProvider}...`, "LLM_RETRY");
      currentConfig.type = fallbackProvider === "nvidia" ? "ultra" : "flow";
    }
  }

  /**
   * Parsing manual agresivo con heurística de recuperación.
   */
  private static async _getManualStructuredData<T extends z.ZodTypeAny>(
    model: BaseChatModel, 
    messages: BaseMessage[], 
    schema: T,
    timeoutMs?: number
  ): Promise<{ data: z.infer<T>; usage: { total: number; prompt: number; completion: number }; model: string }> {
    const parser = StructuredOutputParser.fromZodSchema(schema);
    const formatInstructions = parser.getFormatInstructions();
    const modelName = ProviderManager.getModelName(model);
    
    const jsonInstruction = `\n\n${formatInstructions}\n\nIMPORTANTE: Tu respuesta DEBE ser únicamente un objeto JSON válido. No incluyas explicaciones.`;
    
    const formattedMessages = messages.map((m, i) => {
      let role = i === 0 ? "system" : "user";
      if (i === messages.length - 1) return { role, content: m.content + jsonInstruction };
      return { role, content: m.content };
    });

    const response = await withTimeout(model.invoke(formattedMessages), timeoutMs || 120000);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const responseWithMetadata = response as LangChainResponseWithUsage;
    const usage = responseWithMetadata.usage_metadata || { input_tokens: 0, output_tokens: 0, total_tokens: 0 };

    try {
      let sanitizedContent = this._sanitizeJson(content);
      const parsedData = JSON.parse(sanitizedContent);
      return {
        data: parsedData,
        usage: {
          total: usage.total_tokens || 0,
          prompt: usage.input_tokens || 0,
          completion: usage.output_tokens || 0
        },
        model: modelName
      };
    } catch (e) {
      return this._recoverJson(content, usage, modelName);
    }
  }

  private static _sanitizeJson(content: string): string {
    let sanitized = content.trim();
    if (sanitized.includes("```")) {
      const match = sanitized.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) sanitized = match[1];
    }
    const firstBrace = sanitized.indexOf("{");
    const lastBrace = sanitized.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      sanitized = sanitized.substring(firstBrace, lastBrace + 1);
    }
    return sanitized;
  }

  private static _recoverJson(content: string, usage: any, modelName: string): any {
    SacredLogger.warn("Fallo de JSON.parse, intentando recuperación...", "LLM_RETRY");
    let tempContent = this._sanitizeJson(content);
    while (tempContent.length > 0) {
      const lastIdx = tempContent.lastIndexOf("}");
      if (lastIdx === -1) break;
      tempContent = tempContent.substring(0, lastIdx + 1);
      try {
        const parsedData = JSON.parse(tempContent);
        return {
          data: parsedData,
          usage: {
            total: usage.total_tokens || 0,
            prompt: usage.input_tokens || 0,
            completion: usage.output_tokens || 0
          },
          model: modelName
        };
      } catch {
        tempContent = tempContent.substring(0, tempContent.length - 1);
      }
    }
    throw new Error("Imposible recuperar JSON del modelo.");
  }
}
