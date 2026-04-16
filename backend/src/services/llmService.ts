import { z } from "zod";
import { BaseMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { LLMFactory } from "./llmFactory.js";
import { LLMFactoryOptions } from "@/types/llm.types.js";
import { ContextManager } from "../helpers/contextManager.js";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

/**
 * Servicio de alto nivel para interactuar con LLMs.
 * Garantiza cumplimiento de Ley #13 (Trimming) y Ley #14 (Structured Data).
 */
export class LLMService {
  /**
   * Obtiene datos estructurados garantizados.
   */
  static async getStructuredData<T extends z.ZodTypeAny>(
    config: LLMFactoryOptions,
    messages: BaseMessage[],
    schema: T
  ): Promise<z.infer<T>> {
    const rawModel = LLMFactory.createModel(config) as BaseChatModel;
    const trimmedMessages = await ContextManager.trim(messages, rawModel);

    const provider = LLMFactory.getProviderForType(config.type);

    console.log(`DEBUG: Proveedor detectado -> ${provider}`);

    if (provider === "nvidia") {
      return this._getManualStructuredData(rawModel, trimmedMessages, schema);
    }

    try {
      const modelWithStructuredOutput = rawModel.withStructuredOutput(schema);
      return await modelWithStructuredOutput.invoke(trimmedMessages) as z.infer<T>;
    } catch (error) {
       console.warn("⚠️ Falló formato nativo, intentando fallback manual...");
       return this._getManualStructuredData(rawModel, trimmedMessages, schema);
    }
  }

  /**
   * Método de respaldo: Pide JSON explícito y lo parsea.
   */
  private static async _getManualStructuredData<T extends z.ZodTypeAny>(
    model: BaseChatModel, 
    messages: BaseMessage[], 
    schema: T
  ): Promise<z.infer<T>> {
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

    const response = await model.invoke(formattedMessages);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    
    try {
      return await parser.parse(content);
    } catch (e) {
      console.error("❌ Error crítico: El modelo no cumplió con el formato JSON solicitado.");
      throw e;
    }
  }
}
