import { Request, Response } from "express";
import { services } from "@/services/index.js";

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

      const project = await services.project.getProject(id as string);
      if (!project) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      const updatedProject = await services.project.updateBudget(String(id), maxUsdBudget);
      services.logger.info(`💰 Presupuesto actualizado para ${updatedProject.name}: $${maxUsdBudget}`, "PROJECT_CONFIG");
      return res.json({ message: "Presupuesto actualizado", project: updatedProject });
    } catch (error) {
      services.logger.error("Error actualizando presupuesto", (error as Error).message, "PROJECT_ROUTES");
      return res.status(500).json({ error: "Error al actualizar presupuesto" });
    }
  }

  /**
   * Recupera la configuración de un proyecto.
   */
  static async getProjectConfig(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const project = await services.project.getProject(id as string);
      if (!project) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
