import { getRedisConnection } from "../db/redis.js";

/**
 * AuditService: Auditoría inmutable de decisiones (Gap 6).
 * Persiste el rastro de razonamiento de los agentes por proyecto.
 */
export class AuditService {
  private static readonly KEY_PREFIX = "project:audit:reasoning:";

  /**
   * Registra una decisión y su razonamiento en la auditoría del proyecto.
   * Usa una lista de Redis para mantener el orden cronológico.
   */
  static async logDecision(projectId: string, data: {
    agent: string;
    decision: string;
    reasoning: string;
    metadata?: Record<string, unknown>;
  }) {
    const redis = getRedisConnection();
    const key = `${this.KEY_PREFIX}${projectId}`;
    
    const entry = {
      ...data,
      timestamp: new Date().toISOString()
    };

    // Guardamos en la lista (LPUSH) y limitamos a los últimos 500 registros para no saturar
    await redis.lpush(key, JSON.stringify(entry));
    await redis.ltrim(key, 0, 499);

    console.log(`📜 [AUDITORÍA] Registro guardado para ${data.agent} en proyecto ${projectId}`);
  }

  /**
   * Recupera el historial de auditoría de un proyecto.
   */
  static async getAuditTrail(projectId: string, limit = 50) {
    const redis = getRedisConnection();
    const key = `${this.KEY_PREFIX}${projectId}`;
    const logs = await redis.lrange(key, 0, limit - 1);
    
    return logs.map(log => JSON.parse(log));
  }
}
