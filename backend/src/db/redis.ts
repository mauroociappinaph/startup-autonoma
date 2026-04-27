import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Conexión Redis compartida para BullMQ y el Checkpointer personalizado (via ioredis).
 */
let redisConnection: Redis | null = null;
let redisSubscriber: Redis | null = null;

/**
 * Retorna la instancia de SacredLogger de forma dinámica para evitar dependencias circulares.
 */
async function getLogger() {
  const { SacredLogger } = await import("../helpers/logger.js");
  return SacredLogger;
}

/**
 * Configura los límites de memoria de Redis si es posible.
 */
async function enforceRedisLimits(redis: Redis) {
  try {
    // Intentamos configurar maxmemory y política de desalojo
    // Esto es vital para entornos locales/dev sin configurar
    await redis.config("SET", "maxmemory", "256mb");
    await redis.config("SET", "maxmemory-policy", "allkeys-lru");
    const logger = await getLogger();
    logger.info("✅ Redis: límites de memoria configurados (256mb, allkeys-lru)", "INFRA");
  } catch (e) {
    const logger = await getLogger();
    logger.warn("⚠️ Redis: no se pudo configurar maxmemory automáticamente. Asegúrate de configurarlo manualmente si es un entorno productivo.", "INFRA");
  }
}

/**
 * Retorna la conexión principal de ioredis.
 */
export const getRedisConnection = (): Redis => {
  if (!redisConnection) {
    redisConnection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    console.log("🔴 Redis: conexión establecida");
    
    // Lanzamos la configuración de límites de forma asíncrona
    enforceRedisLimits(redisConnection).catch(console.error);
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
  console.log("🔴 Redis: conexiones cerradas");
};
