import { Router } from "express";
import { telemetryController } from "@/controllers/telemetryController.js";

const router = Router();

/**
 * @route GET /api/telemetry/:projectId/nodes
 * @desc Obtiene métricas por cada nodo del grafo
 */
router.get("/:projectId/nodes", telemetryController.getNodesStats);

/**
 * @route GET /api/telemetry/:projectId/stats
 * @desc Obtiene estadísticas globales de la misión
 */
router.get("/:projectId/stats", telemetryController.getProjectStats);

export default router;
