import { Router } from 'express';
import { AgentController } from '@/controllers/agentController.js';

const router = Router();

/**
 * @route GET /api/agents/stream
 * @desc Inicia el flujo de orquestación y devuelve streaming de pensamientos.
 */
router.get('/stream', AgentController.stream);

/**
 * @route POST /api/agents/run
 * @desc Encola una nueva ejecución de agente.
 */
router.post('/run', AgentController.run);

/**
 * @route POST /api/agents/approve
 * @desc Reanuda la ejecución del grafo pausado por una interrupción HITL.
 */
router.post('/approve', AgentController.approve);
router.get('/history/:threadId', AgentController.history);
router.post('/rewind', AgentController.rewind);

export default router;
