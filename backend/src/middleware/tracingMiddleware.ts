import { Request, Response, NextFunction } from "express";
import { TraceContext } from "../services/traceContext.js";

/**
 * TracingMiddleware: Intercepta cada request HTTP para iniciar un contexto de traza.
 * Honra el header 'x-trace-id' si está presente, de lo contrario genera uno nuevo.
 */
export const tracingMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const incomingTraceId = req.headers["x-trace-id"] as string | undefined;

  // Envolvemos la ejecución del pipeline de Express en el contexto de traza
  TraceContext.run(incomingTraceId, () => {
    next();
  });
};
