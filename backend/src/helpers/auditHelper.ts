import { AgentStateType } from "@startup/shared";
import { auditService } from "../services/auditService.js";
import { SacredLogger } from "./logger.js";

/**
 * AuditHelper: Middleware para el registro persistente de acciones de agentes.
 */
export class AuditHelper {
  /**
   * Envuelve un nodo de LangGraph para registrar automáticamente cada ejecución en PostgreSQL.
   */
  static wrapNode(nodeName: string, nodeFn: (state: AgentStateType, config?: unknown) => Promise<Partial<AgentStateType>> | Partial<AgentStateType>) {
    return async (state: AgentStateType, config?: unknown) => {
      const projectId = state.project_context?.projectId || "unknown";
      
      try {
        const result = await nodeFn(state, config);
        
        // Determinar qué acción se realizó basándose en el estado o el resultado
        const resultData = result as Record<string, unknown>;
        
        await auditService.logAction({
          projectId,
          nodeName,
          action: "EXECUTE",
          reasoning: String(resultData?.reasoning || state.reasoning || "Automatic execution trace"),
          status: "success",
          metadata: {
            next_node: resultData?.next_node,
            active_chief: resultData?.active_chief,
          }
        });

        return result;
      } catch (error) {
        await auditService.logAction({
          projectId,
          nodeName,
          action: "EXECUTE_FAILED",
          reasoning: (error as Error).message,
          status: "failure"
        });
        throw error;
      }
    };
  }
}
