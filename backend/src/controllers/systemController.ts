import { Request, Response } from 'express';

/**
 * Controlador para tareas administrativas y de sistema.
 */
export class SystemController {
  /**
   * Verifica la salud de la Startup.
   */
  static healthCheck(_req: Request, res: Response) {
    res.json({ status: 'Startup Autónoma Online', timestamp: new Date() });
  }
}
