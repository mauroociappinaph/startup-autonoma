import { SerializerProtocol } from "@langchain/langgraph-checkpoint";
import { encode, decode } from "@msgpack/msgpack";

/**
 * Serializer que utiliza MessagePack para reducir el tamaño del estado en Redis.
 * Proporciona una alternativa binaria eficiente al JSON por defecto.
 */
export class MsgpackSerializer implements SerializerProtocol {
  /**
   * Serializa el objeto a un formato binario (Uint8Array).
   */
  async dumpsTyped(obj: any): Promise<[string, Uint8Array]> {
    // Retornamos 'msgpack' como tipo para que el cargador sepa cómo tratarlo
    return ["msgpack", encode(obj)];
  }

  /**
   * Deserializa los datos binarios de vuelta a un objeto.
   */
  async loadsTyped(type: string, data: Uint8Array | string): Promise<any> {
    if (type === "msgpack") {
      const bytes = typeof data === "string" ? Buffer.from(data, "binary") : data;
      return decode(bytes);
    }
    
    // Fallback para JSON si estamos migrando datos
    if (type === "json") {
      const text = typeof data === "string" ? data : new TextDecoder().decode(data);
      return JSON.parse(text);
    }

    throw new Error(`Serializer desconocido: ${type}`);
  }
}
