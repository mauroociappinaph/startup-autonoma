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
          model: modelName,
          temperature: options.temperature ?? 0,
          maxRetries: 0,
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
    const providers: Record<string, LLMProvider> = {
      reasoning: (process.env.PRIMARY_REASONING_PROVIDER as LLMProvider) || "nvidia",
      ultra: (process.env.PRIMARY_ULTRA_PROVIDER as LLMProvider) || "nvidia",
      flow: (process.env.PRIMARY_FLOW_PROVIDER as LLMProvider) || "nvidia",
      smart: (process.env.PRIMARY_SMART_PROVIDER as LLMProvider) || "nvidia",
      fast: (process.env.PRIMARY_FAST_PROVIDER as LLMProvider) || "nvidia",
    };
    return providers[type] || "nvidia";
  }

  private static _getModelName(type: string, provider: LLMProvider): string {
    const selection: Record<string, Record<string, string>> = {
      reasoning: {
        openai: "gpt-4o",
        anthropic: "claude-3-5-sonnet-20240620",
        nvidia: process.env.NVIDIA_REASONING_MODEL || "meta/llama-3.1-70b-instruct",
        groq: "llama-3.3-70b-versatile",
      },
      ultra: {
        openai: "gpt-4o",
        nvidia: process.env.NVIDIA_ULTRA_MODEL || "meta/llama-3.1-70b-instruct",
        groq: "llama-3.3-70b-versatile",
      },
      flow: {
        openai: "gpt-4o-mini",
        groq: "llama-3.3-70b-versatile",
        nvidia: process.env.NVIDIA_FLOW_MODEL || "meta/llama-3.1-8b-instruct",
      },
      smart: {
        openai: "gpt-4o",
        anthropic: "claude-3-5-sonnet-20240620",
        google: "gemini-1.5-pro",
        nvidia: process.env.NVIDIA_SMART_MODEL || "meta/llama-3.1-70b-instruct",
        groq: "llama-3.3-70b-versatile",
      },
      fast: {
        groq: "llama-3.1-8b-instant",
        openai: "gpt-4o-mini",
        google: "gemini-1.5-flash",
        nvidia: process.env.NVIDIA_FLOW_MODEL || "meta/llama-3.1-8b-instruct",
      }
    };

    const providerDefaults: Record<string, string> = {
      openai: "gpt-4o-mini",
      groq: "llama-3.3-70b-versatile",
      nvidia: "meta/llama-3.1-8b-instruct",
      anthropic: "claude-3-haiku-20240307",
      google: "gemini-1.5-flash"
    };

    return selection[type]?.[provider] || providerDefaults[provider] || "gpt-4o-mini";

  }
}
