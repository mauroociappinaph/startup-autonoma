import { trimMessages, type BaseMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

/**
 * Gestor de Contexto (Ley #13 de la Arquitectura).
 * Evita el desborde de tokens y el 'Context Bloat'.
 */
export class ContextManager {
  /**
   * Recorta el historial de mensajes para que quepa en la ventana del modelo.
   * Mantiene siempre el System Message al principio.
   */
  static async trim(messages: BaseMessage[], model: BaseChatModel) {
    // Configuración de trimming: 
    // - maxTokens: Limite prudente para no saturar al modelo.
    // - strategy: 'last' para mantener los mensajes más recientes.
    // - allowPartialTrue: No corta mensajes a la mitad.
    const trimmer = trimMessages({
      maxTokens: 4096, 
      strategy: "last",
      tokenCounter: model,
      includeSystem: true,
      allowPartial: false,
      startOn: "human", // Asegura que el hilo empiece con un mensaje del humano tras el system
    });

    return await trimmer.invoke(messages);
  }
}
