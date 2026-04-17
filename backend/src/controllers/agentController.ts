import { Request, Response } from 'express';
import { GraphService } from '@/services/graphService.js';

/**
 * Controlador para las acciones de los Agentes.
 */
export class AgentController {
  /**
   * Maneja el streaming de eventos hacia el cliente.
   */
  static async stream(req: Request, res: Response) {
    const { prompt, threadId } = req.query;

    if (!prompt) {
      return res.status(400).json({ error: 'Falta el prompt del usuario' });
    }

    // Configuración SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const tid = threadId ? String(threadId) : "default-thread";
      const generator = GraphService.runAgentStream(String(prompt), tid);

      for await (const event of generator) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }

      res.write('event: end\ndata: execution_complete\n\n');
      res.end();
    } catch (error) {
      console.error('❌ Error en AgentController.stream:', error);
      res.write(`data: ${JSON.stringify({ error: 'Error en la orquestación' })}\n\n`);
      res.end();
    }
  }

  /**
   * Reanuda la ejecución del grafo después de una aprobación humana.
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

      res.write('event: end\ndata: execution_complete\n\n');
      res.end();
    } catch (error) {
      console.error('❌ Error en AgentController.approve:', error);
      res.write(`data: ${JSON.stringify({ error: 'Error al reanudar la ejecución' })}\n\n`);
      res.end();
    }
  }
}
