import { closeRedisConnections } from "../db/redis.js";

/**
 * Hook de teardown global para cerrar conexiones abiertas.
 * Esto previene que Jest se quede colgado (Open Handles) por conexiones de Redis.
 */
afterAll(async () => {
  await closeRedisConnections();
});
