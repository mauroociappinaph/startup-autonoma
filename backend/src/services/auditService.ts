import { prisma } from "@startup/db";
import { SacredLogger } from "@/helpers/logger.js";
import { AgentActionLog } from "@/types/audit.types.js";

export class AuditService {
  /**
   * Registra una acción de un agente en la base de datos SQL.
   */
  static async logAction(log: AgentActionLog): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          projectId: log.projectId,
          nodeName: log.nodeName,
          action: log.action,
          reasoning: log.reasoning,
          metadata: (log.metadata || {}) as any, // architecture-disable
          status: log.status || "success",
        },
      });

      SacredLogger.info(`📝 Audit: ${log.nodeName} -> ${log.action}`, "AUDIT");
    } catch (error) {
      SacredLogger.error("Fallo al persistir log de auditoría", (error as Error).message, "AUDIT");
    }
  }

  /**
   * Helper para registrar decisiones estratégicas (compatibilidad).
   */
  static async logDecision(projectId: string, decision: { agent: string; decision: string; reasoning: string }) {
    return this.logAction({
      projectId,
      nodeName: decision.agent,
      action: decision.decision,
      reasoning: decision.reasoning,
      status: "success"
    });
  }

  /**
   * Recupera el historial de auditoría de un proyecto.
   */
  static async getProjectHistory(projectId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

// Exportamos también una instancia para compatibilidad con código que use minúsculas
export const auditService = AuditService;
