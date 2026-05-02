import { Request, Response } from "express";
import { projectService } from "../services/projectService.js";
import { SacredLogger } from "../helpers/logger.js";

export class ProjectController {
  /**
   * Actualiza el presupuesto máximo en USD para un proyecto.
   */
  static async updateBudget(req: Request, res: Response) {
    const { id } = req.params;
    const { maxUsdBudget } = req.body;

    try {
      if (typeof maxUsdBudget !== "number" || maxUsdBudget <= 0) {
        return res.status(400).json({ error: "Presupuesto USD inválido" });
      }

      const project = await projectService.getProject(id as string);
      if (!project) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      project.maxUsdBudget = maxUsdBudget;
      await projectService.saveProject(project);

      SacredLogger.info(`💰 Presupuesto actualizado para ${project.name}: $${maxUsdBudget}`, "PROJECT_CONFIG");

      res.json({ message: "Presupuesto actualizado", project });
    } catch (error) {
      SacredLogger.error("Error actualizando presupuesto", (error as Error).message, "PROJECT_ROUTES");
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  /**
   * Recupera la configuración de un proyecto.
   */
  static async getProjectConfig(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const project = await projectService.getProject(id as string);
      if (!project) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
