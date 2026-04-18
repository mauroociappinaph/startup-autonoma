import { Request, Response } from 'express';
import { GraphService } from '@/services/graphService.js';
import { enqueueAgentJob } from '@/jobs/index.js';
import { EventBus } from '@/services/eventBus.js';

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
    const { prompt, projectId, repoUrl } = req.body as { 
      prompt?: string; 
      projectId?: string;
      repoUrl?: string;
    };

    if (!prompt) {
      return res.status(400).json({ error: 'Falta el campo "prompt" en el body' });
    }

    try {
      const { jobId, sessionId } = await enqueueAgentJob(prompt, projectId, repoUrl);

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

    // Suscripción al EventBus para eventos generados por el Worker (Gap 4)
    const unsubscribe = await EventBus.subscribe(resolvedSessionId, (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });

    // Manejar desconexión del cliente
    req.on('close', async () => {
      await unsubscribe();
      res.end();
    });

    try {
      // Si hay prompt directo (modo legacy), ejecutamos el grafo aquí.
      // Notese que los eventos también se publicarán en el bus si el worker está activo.
      if (resolvedPrompt) {
        const generator = GraphService.runAgentStream(resolvedPrompt, resolvedSessionId);
        for await (const event of generator) {
          // Publicamos manualmente para modo legacy para que otros suscriptores vean lo mismo
          await EventBus.publish(resolvedSessionId, event);
        }
      }

      // El stream del EventBus mantiene la conexión abierta hasta que el worker envíe el fin
      // o el cliente cierre.
    } catch (error) {
      console.error('❌ Error en AgentController.stream:', error);
      res.write(`data: ${JSON.stringify({ error: 'Error en la orquestación' })}\n\n`);
      await unsubscribe();
      res.end();
    }
  }

  /**
   * Reanuda la ejecución del grafo después de una aprobación humana.
   *
   * @route POST /api/agents/approve
   */
  static async approve(req: Request, res: Response) {
    const { threadId, status, feedback } = req.body;

    if (!threadId) {
      return res.status(400).json({ error: 'Falta el threadId para reanudar' });
    }

    // Configuración SSE para el tramo de reanudación
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      // Si el humano rechaza con feedback, inyectamos el feedback antes de reanudar
      if (status === 'rejected' && feedback) {
        await GraphService.resumeAgent(String(threadId)); // To update mission approved to false if needed? 
        // Actually, we should call a more flexible resume that can accept feedback.
      }

      const generator = GraphService.resumeAgent(String(threadId));

      for await (const event of generator) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
        await EventBus.publish(String(threadId), event); // Sincronizar con otros suscriptores
      }

      res.write('event: end\ndata: "execution_complete"\n\n');
      res.end();
    } catch (error) {
      console.error('❌ Error en AgentController.approve:', error);
      res.write(`data: ${JSON.stringify({ error: 'Error al reanudar la ejecución' })}\n\n`);
      res.end();
    }
  }

  /**
   * Obtiene el historial de checkpoints de un hilo.
   *
   * @route GET /api/agents/history/:threadId
   */
  static async history(req: Request, res: Response) {
    const { threadId } = req.params;
    try {
      const history = await GraphService.getHistory(String(threadId));
      return res.json(history);
    } catch (error) {
      console.error('❌ Error al obtener historial:', error);
      return res.status(500).json({ error: 'Error al recuperar historial' });
    }
  }

  /**
   * Retrocede el estado a un punto anterior.
   *
   * @route POST /api/agents/rewind
   */
  static async rewind(req: Request, res: Response) {
    const { threadId, checkpointId } = req.body;
    if (!threadId || !checkpointId) {
      return res.status(400).json({ error: 'threadId y checkpointId son obligatorios' });
    }

    try {
      const result = await GraphService.rewind(threadId, checkpointId);
      return res.json(result);
    } catch (error) {
      console.error('❌ Error al hacer rewind:', error);
      return res.status(500).json({ error: 'Error al retroceder en el tiempo' });
    }
  }
}

