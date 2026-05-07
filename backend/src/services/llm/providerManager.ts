import { MODEL_PRICING } from "../../config/pricing.js";
import { LLMFactory } from "../llmFactory.js";
import { LLMFactoryOptions } from "@/types/llm.types.js";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

/**
 * Gestiona la selección de proveedores, modelos y cálculo de costos.
 */
export class ProviderManager {
  /**
   * Calcula el costo de una ejecución basado en el modelo y el uso de tokens.
   */
  public static calculateCost(usage: { prompt: number; completion: number }, model: string): number {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING["default"];
    return (usage.prompt / 1_000_000) * pricing.input + (usage.completion / 1_000_000) * pricing.output;
  }

  /**
   * Crea una instancia de modelo a partir de la configuración.
   */
  public static createModel(config: LLMFactoryOptions): BaseChatModel {
    return LLMFactory.createModel(config) as BaseChatModel;
  }

  /**
   * Extrae el nombre del modelo de la instancia de LangChain.
   */
  public static getModelName(model: BaseChatModel): string {
    const modelWithName = model as BaseChatModel & { modelName?: string; model?: string };
    return modelWithName.modelName || modelWithName.model || "unknown";
  }
}
