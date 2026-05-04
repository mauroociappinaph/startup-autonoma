import { Request, Response } from "express";
import { telemetryService } from "@/services/telemetryService.js";
import { SacredLogger } from "@/helpers/logger.js";

/**
 * TelemetryController: Maneja las peticiones de métricas de infraestructura.
 */
export class TelemetryController {
  /**
   * Obtiene las métricas de todos los nodos de un proyecto.
   */
  async getNodesStats(req: Request, res: Response) {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    try {
      const stats = await telemetryService.getNodesStats(projectId);
      return res.json(stats);
    } catch (error) {
      SacredLogger.error(`Error obteniendo stats de telemetría: ${(error as Error).message}`, "TELEMETRY_CONTROLLER");
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Obtiene las estadísticas globales del proyecto.
   */
  async getProjectStats(req: Request, res: Response) {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    try {
      const stats = await telemetryService.getProjectStats(projectId);
      return res.json(stats);
    } catch (error) {
      SacredLogger.error(`Error obteniendo stats globales: ${(error as Error).message}`, "TELEMETRY_CONTROLLER");
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const telemetryController = new TelemetryController();
