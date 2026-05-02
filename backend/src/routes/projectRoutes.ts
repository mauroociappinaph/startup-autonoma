import { Router } from "express";
import { ProjectController } from "../controllers/projectController.js";

const router = Router();

/**
 * PATCH /api/projects/:id/budget
 * Actualiza el presupuesto máximo en USD para un proyecto.
 */
router.patch("/:id/budget", ProjectController.updateBudget);

/**
 * GET /api/projects/:id
 * Recupera la configuración de un proyecto.
 */
router.get("/:id", ProjectController.getProjectConfig);

export default router;
