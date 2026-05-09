import { Request, Response } from 'express';
import { getRedisConnection } from '../db/redis.js';
import { services } from '@/services/index.js';

/**
 * Controlador para tareas administrativas y de sistema.
 */
export class SystemController {
  /**
   * Verifica la salud de la Startup y sus dependencias críticas.
   */
  static async healthCheck(_req: Request, res: Response) {
    const health = {
      status: 'Startup Autónoma Online',
      timestamp: new Date(),
      services: {
        redis: false,
        ai_engine: false
      }
    };

    try {
      // 1. Verificar Redis
      const redis = getRedisConnection();
      const redisPing = await redis.ping();
      health.services.redis = redisPing === 'PONG';

      // 2. Verificar AI Engine (gRPC)
      health.services.ai_engine = await services.aiEngine.ping();

      const isHealthy = health.services.redis && health.services.ai_engine;

      if (!isHealthy) {
        return res.status(503).json({
          ...health,
          status: 'Degraded / Unhealthy'
        });
      }

      res.json(health);
    } catch (error) {
      res.status(503).json({
        ...health,
        status: 'Unhealthy',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
