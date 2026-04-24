import { getRedisConnection } from "../db/redis.js";
import { ProjectContext } from "@startup/shared";
import { EventBus } from "./eventBus.js";

/**
 * BudgetService: Gestiona el control de gastos y límites de tokens por proyecto.
 * Persiste el consumo acumulado en Redis para aislamiento multi-tenant (Gap 5).
 */
export class BudgetService {
  private static readonly KEY_PREFIX = "project:budget:usage:";

  /**
   * Obtiene el consumo acumulado de tokens para un proyecto.
   */
  static async getProjectUsage(projectId: string): Promise<number> {
    const redis = getRedisConnection();
    const key = `${this.KEY_PREFIX}${projectId}`;
    const usage = await redis.get(key);
    return usage ? parseInt(usage, 10) : 0;
  }

  /**
   * Registra un nuevo consumo de tokens.
   * Lo hace de forma atómica usando INCRBY en Redis.
   */
  static async recordUsage(projectId: string, amount: number): Promise<number> {
    if (amount <= 0) return await this.getProjectUsage(projectId);
    
    const redis = getRedisConnection();
    const key = `${this.KEY_PREFIX}${projectId}`;
    const newTotal = await redis.incrby(key, Math.round(amount));
    
    return newTotal;
  }

  /**
   * Evalúa los límites y dispara alertas si es necesario.
   * Retorna un objeto con el estado de seguridad.
   */
  static async checkSecurityStatus(context: ProjectContext, sessionUsage: number) {
    const cumulativeUsage = await this.getProjectUsage(context.projectId);
    const totalUsage = cumulativeUsage + sessionUsage;
    const limit = context.maxTokenBudget;

    const percentage = (totalUsage / limit) * 100;

    // Alerta de umbral (80% y 90%)
    if (percentage >= 80 && percentage < 90) {
      await EventBus.publish(context.projectId, {
        agent: "SYSTEM",
        text: `⚠️ ALERTA DE PRESUPUESTO: Se ha alcanzado el 80% del límite de tokens (${totalUsage}/${limit}).`,
        type: "WARNING",
        level: 80
      });
    } else if (percentage >= 90 && percentage < 100) {
      await EventBus.publish(context.projectId, {
        agent: "SYSTEM",
        text: `🚨 CRÍTICO: Se ha alcanzado el 90% del límite de tokens. El servicio se detendrá al llegar al 100%.`,
        type: "CRITICAL",
        level: 90
      });
    }

    return {
      isLimitReached: totalUsage >= limit,
      totalUsage,
      limit,
      percentage
    };
  }
}
