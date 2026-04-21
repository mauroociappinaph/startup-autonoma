import { z } from "zod";
import { BaseMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { LLMFactory } from "./llmFactory.js";
import { LLMFactoryOptions } from "@/types/llm.types.js";
import { ContextManager } from "../helpers/contextManager.js";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

import { TelemetryService } from "./telemetryService.js";

/**
 * Helper interno para Timeouts.
 */
function withTimeout<T>(promise: Promise<T>, ms: number = 45000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`LLM Timeout después de ${ms}ms`)), ms))
  ]);
}

/**
 * Servicio de alto nivel para interactuar con LLMs.
 * Garantiza cumplimiento de Ley #13 (Trimming) y Ley #14 (Structured Data).
 */
export class LLMService {
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
    const startTime = performance.now();
    const rawModel = LLMFactory.createModel(config) as BaseChatModel;
    const trimmedMessages = await ContextManager.trim(messages, rawModel);

    const provider = LLMFactory.getProviderForType(config.type);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modelName = (rawModel as any).modelName || (rawModel as any).model || "unknown";

    if (provider === "nvidia") {
      const result = await this._getManualStructuredData(rawModel, trimmedMessages, schema);
      const latency = performance.now() - startTime;
      const cost = TelemetryService.calculateCost(result.usage, modelName);
      return { ...result, cost, latency, model: modelName };
    }

    try {
      const modelWithStructuredOutput = rawModel.withStructuredOutput(schema, { includeRaw: true });
      const response = (await withTimeout(modelWithStructuredOutput.invoke(trimmedMessages), 45000)) as { 
        parsed: z.infer<T>, 
        raw: { usage_metadata?: { total_tokens?: number, input_tokens?: number, output_tokens?: number } } 
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

      const cost = TelemetryService.calculateCost(usageData, modelName);

      return {
        data: response.parsed as z.infer<T>,
        usage: usageData,
        cost,
        latency,
        model: modelName
      };
    } catch (error) {
       console.warn("⚠️ Falló formato nativo, intentando fallback manual...");
       const result = await this._getManualStructuredData(rawModel, trimmedMessages, schema);
       const latency = performance.now() - startTime;
       const cost = TelemetryService.calculateCost(result.usage, modelName);
       return { ...result, cost, latency, model: modelName };
    }
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
    const startTime = performance.now();
    const rawModel = LLMFactory.createModel(config) as BaseChatModel;
    const trimmedMessages = await ContextManager.trim(messages, rawModel);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modelName = (rawModel as any).modelName || (rawModel as any).model || "unknown";

    const response = await withTimeout(rawModel.invoke(trimmedMessages), 45000);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    
    const responseWithMetadata = response as { usage_metadata?: { total_tokens?: number, input_tokens?: number, output_tokens?: number } };
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
    const cost = TelemetryService.calculateCost(usageData, modelName);

    return {
      content,
      usage: usageData,
      cost,
      latency,
      model: modelName
    };
  }

  /**
   * Método de respaldo: Pide JSON explícito y lo parsea.
   */
  private static async _getManualStructuredData<T extends z.ZodTypeAny>(
    model: BaseChatModel, 
    messages: BaseMessage[], 
    schema: T
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

    const response = await withTimeout(model.invoke(formattedMessages), 45000);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    
    // Cast seguro para evitar eslint error de no-explicit-any
    const responseWithMetadata = response as { usage_metadata?: { total_tokens?: number, input_tokens?: number, output_tokens?: number } };
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
      console.error("❌ Error crítico: El modelo no cumplió con el formato JSON solicitado.");
      throw e;
    }
  }
}
