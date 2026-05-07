import { z } from "zod";
import { BaseMessage } from "@langchain/core/messages";
import { LLMFactoryOptions } from "@/types/llm.types.js";
import { ContextManager } from "../helpers/contextManager.js";
import { TelemetryService } from "./telemetryService.js";
import { SpanStatusCode, Span } from "@opentelemetry/api";
import { ProviderManager } from "./llm/providerManager.js";
import { RetryStrategy } from "./llm/retryStrategy.js";

/**
 * Fachada de alto nivel para interactuar con LLMs.
 * Cumple con la Ley Sagrada de archivos pequeños (< 300 líneas).
 */
export class LLMService {
  /**
   * Delegado para el cálculo de costos.
   */
  public static calculateCost(usage: { prompt: number; completion: number }, model: string): number {
    return ProviderManager.calculateCost(usage, model);
  }

  /**
   * Obtiene datos estructurados con resiliencia y telemetría.
   */
  static async getStructuredData<T extends z.ZodTypeAny>(
    config: LLMFactoryOptions,
    messages: BaseMessage[],
    schema: T
  ) {
    return this._withSpan(`LLM_GENERATE_STRUCTURED:${config.type}`, { "llm.type": config.type }, async (span) => {
      const startTime = performance.now();
      const rawModel = ProviderManager.createModel(config);
      const trimmedMessages = await ContextManager.trim(messages, rawModel);

      const result = await RetryStrategy.executeWithStructuredRetry(config, trimmedMessages, schema, startTime);
      
      const latency = performance.now() - startTime;
      const cost = this.calculateCost(result.usage, result.model);

      return { ...result, cost, latency };
    });
  }
  
  /**
   * Obtiene respuesta de texto plano.
   */
  static async getText(config: LLMFactoryOptions, messages: BaseMessage[]) {
    return this._withSpan(`LLM_GENERATE_TEXT:${config.type}`, { "llm.type": config.type }, async (span) => {
      const startTime = performance.now();
      const rawModel = ProviderManager.createModel(config);
      const trimmedMessages = await ContextManager.trim(messages, rawModel);
      const modelName = ProviderManager.getModelName(rawModel);

      const response = await rawModel.invoke(trimmedMessages);
      const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      
      const usage = (response as any).usage_metadata || { input_tokens: 0, output_tokens: 0, total_tokens: 0 };
      const usageData = { total: usage.total_tokens, prompt: usage.input_tokens, completion: usage.output_tokens };
      
      const latency = performance.now() - startTime;
      const cost = this.calculateCost(usageData, modelName);

      return { content, usage: usageData, cost, latency, model: modelName };
    });
  }

  /**
   * Orquestador de Telemetría (OpenTelemetry Spans).
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
        if (result && typeof result === "object") {
          const res = result as any;
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
