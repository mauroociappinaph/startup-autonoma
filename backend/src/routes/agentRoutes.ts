import { Router } from 'express';
import { AgentController } from '@/controllers/agentController.js';

const router = Router();

/**
 * @route GET /api/agents/stream
 * @desc Inicia el flujo de orquestación y devuelve streaming de pensamientos.
 */
router.get('/stream', AgentController.stream);

export default router;
