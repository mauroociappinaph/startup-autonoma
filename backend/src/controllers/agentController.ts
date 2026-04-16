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
    const { prompt } = req.query;

    if (!prompt) {
      return res.status(400).json({ error: 'Falta el prompt del usuario' });
    }

    // Configuración SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const generator = GraphService.runAgentStream(String(prompt));

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
}
