import { getRedisConnection, getRedisSubscriber } from "../db/redis.js";

/**
 * EventBus: Sistema de mensajería en tiempo real basado en Redis Pub/Sub.
 * Permite la comunicación desacoplada entre los Workers y los Controllers (Gap 4).
 */
export class EventBus {
  private static readonly CHANNEL_PREFIX = "agent:stream:";

  /**
   * Publica un evento para una sesión específica.
   */
  static async publish(sessionId: string, data: unknown): Promise<void> {
    const redis = getRedisConnection();
    const channel = `${this.CHANNEL_PREFIX}${sessionId}`;
    
    // Serializamos la data asegurando que sea un JSON válido
    const payload = JSON.stringify(data);
    await redis.publish(channel, payload);
  }

  /**
   * Suscribe a un cliente a los eventos de una sesión.
   * Retorna una función para cancelar la suscripción.
   */
  static async subscribe(sessionId: string, onMessage: (data: unknown) => void): Promise<() => void> {
    const subscriber = getRedisSubscriber();
    const channel = `${this.CHANNEL_PREFIX}${sessionId}`;

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
}
