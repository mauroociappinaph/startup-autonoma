import { getRedisConnection, getRedisSubscriber } from "../db/redis.js";

/**
 * EventBus: Sistema de mensajería en tiempo real basado en Redis Pub/Sub.
 * Permite la comunicación desacoplada entre los Workers y los Controllers (Gap 4).
 */
export class EventBus {
  private static readonly CHANNEL_PREFIX = "agent:stream:";
  private static readonly BUFFER_PREFIX = "sse:buffer:";
  private static readonly BUFFER_TTL_SECONDS = 300; // 5 minutos
  private static readonly BUFFER_MAX_EVENTS = 500;

  /**
   * Publica un evento para una sesión específica.
   */
  static async publish(sessionId: string, data: unknown): Promise<void> {
    const redis = getRedisConnection();
    const channel = `${this.CHANNEL_PREFIX}${sessionId}`;
    
    // Serializamos la data asegurando que sea un JSON válido
    const payload = JSON.stringify(data);

    // 1. Guardar en el buffer (replay support)
    await this.writeToBuffer(sessionId, payload);

    // 2. Publicar en tiempo real (Pub/Sub)
    await redis.publish(channel, payload);
  }

  /**
   * Suscribe a un cliente a los eventos de una sesión.
   * Retorna una función para cancelar la suscripción.
   */
  static async subscribe(sessionId: string, onMessage: (data: unknown) => void): Promise<() => void> {
    const subscriber = getRedisSubscriber();
    const channel = `${this.CHANNEL_PREFIX}${sessionId}`;

    // 1. Replay de eventos históricos si existen
    await this.replayBuffer(sessionId, onMessage);

    const handler = (chan: string, message: string) => {
      if (chan === channel) {
        try {
          const data = JSON.parse(message);
          onMessage(data);
        } catch (e) {
          console.error("❌ EventBus: Error parseando mensaje", e);
        }
      }
    };

    subscriber.on("message", handler);
    await subscriber.subscribe(channel);

    // Retornamos cleanup
    return async () => {
      subscriber.off("message", handler);
      await subscriber.unsubscribe(channel);
    };
  }

  /**
   * Escribe un evento en el buffer de Redis con TTL y límite de tamaño.
   */
  private static async writeToBuffer(sessionId: string, payload: string): Promise<void> {
    const redis = getRedisConnection();
    const key = `${this.BUFFER_PREFIX}${sessionId}`;

    await redis
      .pipeline()
      .rpush(key, payload)
      .ltrim(key, -this.BUFFER_MAX_EVENTS, -1)
      .expire(key, this.BUFFER_TTL_SECONDS)
      .exec();
  }

  /**
   * Recupera los eventos del buffer y los envía al callback.
   */
  private static async replayBuffer(sessionId: string, onMessage: (data: unknown) => void): Promise<void> {
    const redis = getRedisConnection();
    const key = `${this.BUFFER_PREFIX}${sessionId}`;

    const events = await redis.lrange(key, 0, -1);
    
    for (const event of events) {
      try {
        const data = JSON.parse(event);
        onMessage(data);
      } catch (e) {
        console.error("❌ EventBus: Error parseando evento histórico", e);
      }
    }
  }
}
