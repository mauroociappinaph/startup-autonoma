/* eslint-disable */
/* eslint-disable */
import { z } from "zod";
import { BaseMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { LLMFactory } from "./llmFactory.js";
import { LLMFactoryOptions } from "../types/llm.js";
import { ContextManager } from "../helpers/contextManager.js";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

/**
 * Servicio de alto nivel para interactuar con LLMs.
 * Garantiza cumplimiento de Ley #13 (Trimming) y Ley #14 (Structured Outputs).
 */
export class LLMService {
  /**
   * Obtiene una respuesta estructurada garantizada.
   */
  static async getStructuredResponse<T extends z.ZodTypeAny>(
    config: LLMFactoryOptions,
    messages: BaseMessage[],
    schema: T
  ): Promise<z.infer<T>> {
    const rawModel = LLMFactory.createModel(config) as BaseChatModel;
    const trimmedMessages = await ContextManager.trim(messages, rawModel);

    // Obtenemos el proveedor real consultando a la Factory
    const provider = LLMFactory.getProviderForType(config.type);

    console.log(`DEBUG: Proveedor detectado -> ${provider}`);

    // ESTRATEGIA SEGÚN PROVEEDOR (Ley #14 de Resiliencia)
    // Para NVIDIA, evitamos asmr/withStructuredOutput por incompatibilidad de Zod/NIM en el bridge actual.
    if (provider === "nvidia") {
      return this._getManualStructuredResponse(rawModel, trimmedMessages, schema);
    }

    try {
      const modelWithStructuredOutput = rawModel.withStructuredOutput(schema);
      return await modelWithStructuredOutput.invoke(trimmedMessages) as z.infer<T>;
    } catch (error) {
       console.warn("⚠️ Falló formato nativo, intentando fallback manual...");
       return this._getManualStructuredResponse(rawModel, trimmedMessages, schema);
    }
  }

  /**
   * Método de respaldo: Pide JSON explícito siguiendo el esquema y lo parsea.
   */
  private static async _getManualStructuredResponse<T extends z.ZodTypeAny>(
    model: BaseChatModel, 
    messages: BaseMessage[], 
    schema: T
  ): Promise<z.infer<T>> {
    const parser = StructuredOutputParser.fromZodSchema(schema);
    const formatInstructions = parser.getFormatInstructions();
    
    // Inyectamos las instrucciones de formato autogeneradas por LangChain
    const jsonInstruction = `\n\n${formatInstructions}\n\nIMPORTANTE: Tu respuesta DEBE ser únicamente un objeto JSON válido según las instrucciones anteriores. No incluyas explicaciones fuera del JSON.`;
    
    // Mapeamos los mensajes a roles compatibles (OpenAI/NIM)
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
      // El parser de LangChain extrae el JSON incluso si viene dentro de bloques ```json
      return await parser.parse(content);
    } catch (e) {
      console.error("❌ Error crítico: El modelo no cumplió con el formato JSON solicitado por el esquema.");
      throw e;
    }
  }
}
