import { jest } from "@jest/globals";

// Mock de Redis antes de importar EventBus
const mockRedis: any = {
  publish: (jest.fn() as any).mockResolvedValue(1),
  rpush: (jest.fn() as any).mockReturnThis(),
  ltrim: (jest.fn() as any).mockReturnThis(),
  expire: (jest.fn() as any).mockReturnThis(),
  exec: (jest.fn() as any).mockResolvedValue([]),
  lrange: (jest.fn() as any).mockResolvedValue([]),
  pipeline: function() { return this; },
};

const mockSubscriber: any = {
  subscribe: (jest.fn() as any).mockResolvedValue(undefined),
  on: jest.fn(),
  off: jest.fn(),
  unsubscribe: (jest.fn() as any).mockResolvedValue(undefined),
};

jest.unstable_mockModule("../db/redis.js", () => ({
  getRedisConnection: () => mockRedis,
  getRedisSubscriber: () => mockSubscriber,
}));

// Importar dinámicamente para que el mock funcione con módulos ES
const { EventBus } = await import("../services/eventBus.js");

describe("EventBus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("publish() with Replay Buffer", () => {
    it("debe escribir en el buffer de Redis (RPUSH + LTRIM + EXPIRE) antes de publicar", async () => {
      const sessionId = "test-session";
      const data = { message: "hello" };
      const expectedPayload = JSON.stringify(data);
      const expectedBufferKey = `sse:buffer:${sessionId}`;

      await EventBus.publish(sessionId, data);

      // Verificación de escritura en buffer (RED: esto fallará porque no está implementado)
      expect(mockRedis.rpush).toHaveBeenCalledWith(expectedBufferKey, expectedPayload);
      expect(mockRedis.ltrim).toHaveBeenCalledWith(expectedBufferKey, -500, -1);
      expect(mockRedis.expire).toHaveBeenCalledWith(expectedBufferKey, 300);

      // Verificación de comportamiento existente (Pub/Sub)
      expect(mockRedis.publish).toHaveBeenCalledWith(`agent:stream:${sessionId}`, expectedPayload);
    });
  });

  describe("subscribe() with Replay Buffer", () => {
    it("debe realizar replay de los eventos del buffer antes de suscribirse al canal", async () => {
      const sessionId = "test-session";
      const onMessage = jest.fn();
      const historicalEvents = [
        JSON.stringify({ event: 1 }),
        JSON.stringify({ event: 2 })
      ];

      // Simular que hay eventos en el buffer
      mockRedis.lrange.mockResolvedValue(historicalEvents);

      const unsubscribe = await EventBus.subscribe(sessionId, onMessage);

      // Verificación de replay (RED: esto fallará porque no está implementado)
      expect(mockRedis.lrange).toHaveBeenCalledWith(`sse:buffer:${sessionId}`, 0, -1);
      expect(onMessage).toHaveBeenCalledTimes(2);
      expect(onMessage).toHaveBeenNthCalledWith(1, { event: 1 });
      expect(onMessage).toHaveBeenNthCalledWith(2, { event: 2 });

      // Verificación de suscripción al canal en vivo
      expect(mockSubscriber.subscribe).toHaveBeenCalledWith(`agent:stream:${sessionId}`);
      
      await unsubscribe();
    });

    it("no debe llamar a onMessage si el buffer está vacío", async () => {
      const sessionId = "test-session-empty";
      const onMessage = jest.fn();

      mockRedis.lrange.mockResolvedValue([]);

      const unsubscribe = await EventBus.subscribe(sessionId, onMessage);

      expect(onMessage).not.toHaveBeenCalled();
      expect(mockSubscriber.subscribe).toHaveBeenCalled();
      
      await unsubscribe();
    });

    it("debe aplicar el límite de 500 eventos usando LTRIM", async () => {
      const sessionId = "test-session-cap";
      const data = { msg: "cap-test" };

      await EventBus.publish(sessionId, data);

      expect(mockRedis.ltrim).toHaveBeenCalledWith(`sse:buffer:${sessionId}`, -500, -1);
    });
  });
});
