import { SerializerProtocol } from "@langchain/langgraph-checkpoint";
import { encode, decode } from "@msgpack/msgpack";
import { load } from "@langchain/core/load";

/**
 * Serializer que utiliza MessagePack para reducir el tamaño del estado en Redis.
 * Proporciona una alternativa binaria eficiente al JSON por defecto.
 * Utiliza el sistema de carga de LangChain para preservar prototipos de mensajes.
 */
export class MsgpackSerializer implements SerializerProtocol {
  /**
   * Serializa el objeto a un formato binario (Uint8Array).
   */
  async dumpsTyped(obj: unknown): Promise<[string, Uint8Array]> {
    // Usamos JSON.stringify para que se ejecuten los métodos toJSON() de LangChain
    // y luego parse para tener un objeto plano que msgpack pueda procesar.
    const plain = JSON.parse(JSON.stringify(obj));
    return ["msgpack", encode(plain)];
  }

  /**
   * Deserializa los datos binarios de vuelta a un objeto.
   */
  async loadsTyped(type: string, data: Uint8Array | string): Promise<unknown> {
    if (type === "msgpack") {
      const bytes = typeof data === "string" ? Buffer.from(data, "binary") : data;
      const plain = decode(bytes);
      // Reconstruimos los objetos de LangChain usando su cargador oficial
      return load(JSON.stringify(plain));
    }
    
    // Fallback para JSON
    if (type === "json") {
      const text = typeof data === "string" ? data : new TextDecoder().decode(data);
      return load(text);
    }

    throw new Error(`Serializer desconocido: ${type}`);
  }
}
