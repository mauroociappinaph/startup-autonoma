import * as winston from "winston";
import { TraceContext } from "./traceContext.js";

/**
 * LoggerService: Motor de observabilidad basado en Winston.
 * Centraliza el formateo y ruteo de logs según la Ley #14.
 */
const { combine, timestamp, printf, colorize } = winston.format;

const customFormat = printf(({ level, message, timestamp, context }) => {
  const ctx = context ? `[${context}]` : "";
  const traceId = TraceContext.getTraceId();
  const traceStr = traceId ? ` [${traceId}]` : "";
  return `${timestamp} ${level}${traceStr} ${ctx}: ${message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        customFormat
      ),
    }),
  ],
});

/**
 * Interface para estandarizar el uso del Logger en la Startup.
 */
export class LoggerService {
  static info(message: string, context?: string) {
    logger.info(message, { context });
  }

  static warn(message: string, context?: string) {
    logger.warn(message, { context });
  }

  static error(message: string, context?: string, error?: Error) {
    logger.error(message, { 
      context, 
      stack: error?.stack,
      error_name: error?.name 
    });
  }

  static debug(message: string, context?: string) {
    logger.debug(message, { context });
  }
}
