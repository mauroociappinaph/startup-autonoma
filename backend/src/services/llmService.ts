import { z } from "zod";
import { BaseMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { LLMFactory } from "./llmFactory.js";
import { LLMFactoryOptions, LangChainResponseWithUsage } from "@/types/llm.types.js";
import { ContextManager } from "../helpers/contextManager.js";
import { MODEL_PRICING } from "../config/pricing.js";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

import { TelemetryService } from "./telemetryService.js";
import { SacredLogger } from "@/helpers/logger.js";
import { SpanStatusCode, Span } from "@opentelemetry/api";

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
 * Servicio de alto nivel para interactuar con LLMs.
 * Garantiza cumplimiento de Ley #13 (Trimming) y Ley #14 (Structured Data).
 */
export class LLMService {
  /**
   * Calculates USD cost based on usage and model.
   */
  public static calculateCost(usage: { prompt: number; completion: number }, model: string): number {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING["default"];
    const inputCost = (usage.prompt / 1_000_000) * pricing.input;
    const outputCost = (usage.completion / 1_000_000) * pricing.output;
    return inputCost + outputCost;
  }

  /**
   * Obtiene datos estructurados garantizados junto con telemetría completa.
   */
  static async getStructuredData<T extends z.ZodTypeAny>(
    config: LLMFactoryOptions,
    messages: BaseMessage[],
    schema: T
  ): Promise<{ 
    data: z.infer<T>; 
    usage: { total: number; prompt: number; completion: number };
    cost: number;
    latency: number;
    model: string;
  }> {
    return this._withSpan(`LLM_GENERATE_STRUCTURED:${config.type}`, { "llm.type": config.type }, async (span) => {
      const startTime = performance.now();
      // ... rest of logic
    const rawModel = LLMFactory.createModel(config) as BaseChatModel;
    const trimmedMessages = await ContextManager.trim(messages, rawModel);

    const provider = LLMFactory.getProviderForType(config.type);
    const modelWithName = rawModel as BaseChatModel & { modelName?: string; model?: string };
    const modelName = modelWithName.modelName || modelWithName.model || "unknown";

    let lastError: Error | null = null;
    let currentConfig = { ...config };
    let currentModel = rawModel;

    // BUCLE DE RESILIENCIA (Máximo 3 intentos con rotación de estrategia/provider)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        SacredLogger.info(`Intento ${attempt}/3 para ${config.type} (${modelName})`, "LLM_SERVICE");
        
        // Intento de salida estructurada nativa (o manual si es nvidia)
        const currentProvider = LLMFactory.getProviderForType(currentConfig.type);
        if (currentProvider === "nvidia") {
          const result = await this._getManualStructuredData(currentModel, trimmedMessages, schema, currentConfig.timeoutMs);
          const latency = performance.now() - startTime;
          const cost = this.calculateCost(result.usage, modelName);
          return { ...result, cost, latency, model: modelName };
        }

        const modelWithStructuredOutput = currentModel.withStructuredOutput(schema, { includeRaw: true });
        const response = (await withTimeout(modelWithStructuredOutput.invoke(trimmedMessages), currentConfig.timeoutMs || 120000)) as { 
          parsed: z.infer<T>, 
          raw: LangChainResponseWithUsage 
        };
        
        const usage = response.raw.usage_metadata || {
          input_tokens: 0,
          output_tokens: 0,
          total_tokens: 0
        };

        const latency = performance.now() - startTime;
        const usageData = {
          total: usage.total_tokens || 0,
          prompt: usage.input_tokens || 0,
          completion: usage.output_tokens || 0
        };

        const cost = this.calculateCost(usageData, modelName);

        return {
          data: response.parsed as z.infer<T>,
          usage: usageData,
          cost,
          latency,
          model: modelName
        };
      } catch (error: unknown) {
        lastError = error as Error;
        SacredLogger.warn(`Fallo en intento ${attempt}: ${lastError.message}`, "LLM_SERVICE");

        if (attempt === 1) {
          // Segundo intento: Mismo modelo pero forzamos modo manual
          SacredLogger.info("Reintentando con modo manual...", "LLM_SERVICE");
          try {
             const result = await this._getManualStructuredData(currentModel, trimmedMessages, schema, currentConfig.timeoutMs);
             const latency = performance.now() - startTime;
             const cost = this.calculateCost(result.usage, modelName);
             return { ...result, cost, latency, model: modelName };
          } catch (manualError: unknown) {
             lastError = manualError as Error;
          }
        } else if (attempt === 2) {
          // Tercer intento: Cambiamos de provider (Fallback a Groq si falló NVIDIA, o viceversa)
          const fallbackProvider = provider === "nvidia" ? "groq" : "nvidia";
          SacredLogger.warn(`Cambiando de proveedor a ${fallbackProvider} para el último intento...`, "LLM_SERVICE");
          
          // Actualizamos la config ANTES de crear el modelo
          currentConfig = { ...currentConfig, type: fallbackProvider === "nvidia" ? "ultra" : "flow" }; 
          // Nota: Forzamos un tipo que sabemos que mapea al provider deseado
          currentModel = LLMFactory.createModel({ ...config, type: fallbackProvider === "nvidia" ? "ultra" : "flow" });
        }
      }
    }

    SacredLogger.error("Agotados todos los intentos de resiliencia.", "LLM_SERVICE", lastError || undefined);
    throw lastError || new Error("Error desconocido en LLMService");
    });
  }
  
  /**
   * Obtiene una respuesta de texto plana junto con telemetría.
   */
  static async getText(
    config: LLMFactoryOptions,
    messages: BaseMessage[]
  ): Promise<{ 
    content: string; 
    usage: { total: number; prompt: number; completion: number };
    cost: number;
    latency: number;
    model: string;
  }> {
    return this._withSpan(`LLM_GENERATE_TEXT:${config.type}`, { "llm.type": config.type }, async (span) => {
      const startTime = performance.now();
    const rawModel = LLMFactory.createModel(config) as BaseChatModel;
    const trimmedMessages = await ContextManager.trim(messages, rawModel);
    
    const modelWithName = rawModel as BaseChatModel & { modelName?: string; model?: string };
    const modelName = modelWithName.modelName || modelWithName.model || "unknown";

    const response = await withTimeout(rawModel.invoke(trimmedMessages), config.timeoutMs || 120000);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    
    const responseWithMetadata = response as LangChainResponseWithUsage;
    const usage = responseWithMetadata.usage_metadata || {
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0
    };

    const usageData = {
      total: usage.total_tokens || 0,
      prompt: usage.input_tokens || 0,
      completion: usage.output_tokens || 0
    };

    const latency = performance.now() - startTime;
    const cost = this.calculateCost(usageData, modelName);

    return {
      content,
      usage: usageData,
      cost,
      latency,
      model: modelName
    };
    });
  }

  /**
   * Método de respaldo: Pide JSON explícito y lo parsea.
   */
  private static async _getManualStructuredData<T extends z.ZodTypeAny>(
    model: BaseChatModel, 
    messages: BaseMessage[], 
    schema: T,
    timeoutMs?: number
  ): Promise<{ data: z.infer<T>; usage: { total: number; prompt: number; completion: number } }> {
    const parser = StructuredOutputParser.fromZodSchema(schema);
    const formatInstructions = parser.getFormatInstructions();
    
    const jsonInstruction = `\n\n${formatInstructions}\n\nIMPORTANTE: Tu respuesta DEBE ser únicamente un objeto JSON válido según las instrucciones anteriores. No incluyas explicaciones fuera del JSON.`;
    
    const formattedMessages = messages.map((m, i) => {
      let role = "user";
      const type = m._getType();
      
      if (type === "ai") role = "assistant";
      if (type === "system") role = "system";
      if (type === "human") role = "user";

      const content = i === messages.length - 1 ? m.content + jsonInstruction : m.content;
      return { role, content };
    });

    const response = await withTimeout(model.invoke(formattedMessages), timeoutMs || 120000);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    
    // Seguro para evitar eslint error de no-explicit-any
    const responseWithMetadata = response as LangChainResponseWithUsage;
    const usage = responseWithMetadata.usage_metadata || {
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0
    };

    try {
      const parsedData = await parser.parse(content);
      return {
        data: parsedData,
        usage: {
          total: usage.total_tokens || 0,
          prompt: usage.input_tokens || 0,
          completion: usage.output_tokens || 0
        }
      };
    } catch (e) {
      SacredLogger.error("Error crítico: El modelo no cumplió con el formato JSON solicitado.", "LLM_SERVICE");
      throw e;
    }
  }

  /**
   * Helper interno para manejar spans de OpenTelemetry.
   */
  private static async _withSpan<T>(
    spanName: string,
    attributes: Record<string, string | number | boolean>,
    fn: (span: Span) => Promise<T>
  ): Promise<T> {
    const tracer = TelemetryService.getTracer();
    return tracer.startActiveSpan(spanName, async (span) => {
      span.setAttributes(attributes);
      try {
        const result = await fn(span);
        // Si el resultado tiene uso de tokens, lo agregamos al span
        interface LLMResult {
          usage?: { prompt: number; completion: number; total: number };
          model?: string;
          cost?: number;
        }
        
        if (result && typeof result === "object") {
          const res = result as LLMResult;
          if (res.usage) {
            span.setAttributes({
              "llm.usage.prompt": res.usage.prompt,
              "llm.usage.completion": res.usage.completion,
              "llm.usage.total": res.usage.total,
            });
          }
          if (res.model) span.setAttribute("llm.model", res.model);
          if (res.cost) span.setAttribute("llm.cost", res.cost);
        }
        return result;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
      } finally {
        span.end();
      }
    });
  }
}
