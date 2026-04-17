import { Request, Response } from 'express';
import { GraphService } from '@/services/graphService.js';
import { enqueueAgentJob } from '@/jobs/index.js';

/**
 * Controlador para las acciones de los Agentes.
 */
export class AgentController {
  /**
   * Encola una nueva ejecución de agente (modo asíncrono con BullMQ).
   * Retorna inmediatamente con { jobId, sessionId } para que el cliente
   * pueda suscribirse al SSE endpoint correspondiente.
   *
   * @route POST /api/agents/run
   */
  static async run(req: Request, res: Response) {
    const { prompt, projectId } = req.body as { prompt?: string; projectId?: string };

    if (!prompt) {
      return res.status(400).json({ error: 'Falta el campo "prompt" en el body' });
    }

    try {
      const { jobId, sessionId } = await enqueueAgentJob(prompt, projectId);

      return res.status(202).json({
        jobId,
        sessionId,
        streamUrl: `/api/agents/stream?sessionId=${sessionId}`,
        message: 'Job encolado. Conectate al streamUrl para recibir eventos en tiempo real.',
      });
    } catch (error) {
      console.error('❌ Error al encolar job:', error);
      return res.status(500).json({ error: 'Error interno al encolar la ejecución' });
    }
  }

  /**
   * Maneja el streaming SSE de eventos hacia el cliente.
   * Usado tanto para ejecuciones directas (legacy) como para las encoladas.
   *
   * @route GET /api/agents/stream
   */
  static async stream(req: Request, res: Response) {
    const { prompt, threadId, sessionId } = req.query;

    // Soporte para ambos modos: legacy (prompt) y encolado (sessionId)
    const resolvedPrompt = prompt ? String(prompt) : null;
    const resolvedSessionId = sessionId ? String(sessionId) : threadId ? String(threadId) : "default-thread";

    if (!resolvedPrompt && !sessionId) {
      return res.status(400).json({ error: 'Falta "prompt" o "sessionId"' });
    }

    // Configuración SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      // Si hay prompt directo (modo legacy), ejecutamos el grafo aquí.
      // En modo encolado, el worker ya ejecutó el grafo y los eventos llegan via EventBus (Gap 3).
      if (resolvedPrompt) {
        const generator = GraphService.runAgentStream(resolvedPrompt, resolvedSessionId);
        for await (const event of generator) {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }
      }

      res.write('event: end\ndata: "execution_complete"\n\n');
      res.end();
    } catch (error) {
      console.error('❌ Error en AgentController.stream:', error);
      res.write(`data: ${JSON.stringify({ error: 'Error en la orquestación' })}\n\n`);
      res.end();
    }
  }

  /**
   * Reanuda la ejecución del grafo después de una aprobación humana.
   *
   * @route POST /api/agents/approve
   */
  static async approve(req: Request, res: Response) {
    const { threadId } = req.body;

    if (!threadId) {
      return res.status(400).json({ error: 'Falta el threadId para reanudar' });
    }

    // Configuración SSE para el tramo de reanudación
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const generator = GraphService.resumeAgent(String(threadId));

      for await (const event of generator) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }

      res.write('event: end\ndata: "execution_complete"\n\n');
      res.end();
    } catch (error) {
      console.error('❌ Error en AgentController.approve:', error);
      res.write(`data: ${JSON.stringify({ error: 'Error al reanudar la ejecución' })}\n\n`);
      res.end();
    }
  }
}

