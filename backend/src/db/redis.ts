import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Conexión Redis compartida para BullMQ y el Checkpointer personalizado (via ioredis).
 */
let redisConnection: Redis | null = null;
let redisSubscriber: Redis | null = null;

/**
 * Retorna la conexión principal de ioredis.
 */
export const getRedisConnection = (): Redis => {
  if (!redisConnection) {
    redisConnection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    console.info("🔴 [INFRA] Redis: conexión establecida");
  }
  return redisConnection;
};

/**
 * Retorna la conexión de subscriber (para eventos pub/sub).
 */
export const getRedisSubscriber = (): Redis => {
  if (!redisSubscriber) {
    redisSubscriber = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return redisSubscriber;
};

/**
 * Cierra todas las conexiones de forma segura.
 */
export const closeRedisConnections = async (): Promise<void> => {
  await Promise.allSettled([
    redisConnection?.quit(),
    redisSubscriber?.quit(),
  ]);
  redisConnection = null;
  redisSubscriber = null;
  console.info("🔴 [INFRA] Redis: conexiones cerradas");
};
