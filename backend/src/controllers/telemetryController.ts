import { Request, Response } from "express";
import { TelemetryService, telemetryService as defaultTelemetryService } from "../services/telemetryService.js";
import { SacredLogger } from "../helpers/logger.js";

/**
 * TelemetryController: Handles infrastructure metrics requests.
 * Uses Dependency Injection [DI] for better testability [ease of testing].
 */
export class TelemetryController {
  private telemetryService: TelemetryService;

  constructor(service: TelemetryService = defaultTelemetryService) {
    this.telemetryService = service;
  }

  /**
   * Retrieves metrics for all nodes in a project.
   */
  async getNodesStats(req: Request, res: Response): Promise<Response> {
    const projectId = req.params.projectId as string;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    try {
      const stats = await this.telemetryService.getNodesStats(projectId);
      return res.json(stats);
    } catch (error) {
      const errorMessage = (error as Error).message;
      SacredLogger.error(`Error fetching telemetry stats: ${errorMessage}`, "TELEMETRY_CONTROLLER");
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Retrieves global project statistics.
   */
  async getProjectStats(req: Request, res: Response): Promise<Response> {
    const projectId = req.params.projectId as string;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    try {
      const stats = await this.telemetryService.getProjectStats(projectId);
      return res.json(stats);
    } catch (error) {
      const errorMessage = (error as Error).message;
      SacredLogger.error(`Error fetching global stats: ${errorMessage}`, "TELEMETRY_CONTROLLER");
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const telemetryController = new TelemetryController();
