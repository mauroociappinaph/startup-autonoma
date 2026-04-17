import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { LLMFactoryOptions, LLMProvider } from "@/types/llm.types.js";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

/**
 * Factory Central de LLMs de la Startup. 
 * Implementa Resiliencia y Fallback (Ley #7 de la Arquitectura).
 */
export class LLMFactory {
  /**
   * Genera una instancia de modelo basada en el tipo (smart/fast).
   */
  static createModel(options: LLMFactoryOptions): BaseChatModel {
    const provider = this.getProviderForType(options.type);
    const modelName = this._getModelName(options.type, provider);

    console.log(`🤖 Iniciando LLM: [${provider.toUpperCase()}] -> ${modelName}`);

    switch (provider) {
      case "openai":
        return new ChatOpenAI({
          modelName,
          temperature: options.temperature ?? 0,
          streaming: options.streaming ?? true,
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

      case "anthropic":
        return new ChatAnthropic({
          modelName,
          temperature: options.temperature ?? 0,
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        });

      case "google":
        return new ChatGoogleGenerativeAI({
          model: modelName,
          temperature: options.temperature ?? 0,
          apiKey: process.env.GOOGLE_API_KEY,
        });

      case "groq":
        return new ChatGroq({
          model: modelName,
          temperature: options.temperature ?? 0,
          apiKey: process.env.GROQ_API_KEY,
        });

      case "nvidia":
        return new ChatOpenAI({
          modelName,
          temperature: options.temperature ?? 0,
          apiKey: process.env.NVIDIA_API_KEY,
          configuration: {
            baseURL: "https://integrate.api.nvidia.com/v1",
          },
        });

      default:
        throw new Error(`Proveedor no soportado: ${provider}`);
    }
  }

  /**
   * Lógica de ruteo inteligente (Smart vs Fast)
   */
  public static getProviderForType(type: string): LLMProvider {
    if (type === "smart") {
       return (process.env.PRIMARY_SMART_PROVIDER as LLMProvider) || "nvidia";
    }
    return (process.env.PRIMARY_FAST_PROVIDER as LLMProvider) || "nvidia";
  }

  private static _getModelName(type: string, provider: LLMProvider): string {
    const selection: Record<string, Record<string, string>> = {
      smart: {
        openai: "gpt-4o",
        anthropic: "claude-3-5-sonnet-20240620",
        google: "gemini-1.5-pro",
        nvidia: process.env.NVIDIA_SMART_MODEL || "nvidia/nemotron-4-340b-instruct",
      },
      fast: {
        groq: "llama-3.1-70b-versatile",
        openai: "gpt-4o-mini",
        google: "gemini-1.5-flash",
        nvidia: "nvidia/llama-3.1-8b-instruct",
      }
    };

    return selection[type]?.[provider] || "gpt-4o-mini";
  }
}
