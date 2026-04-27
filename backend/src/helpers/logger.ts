import { LoggerService } from "../services/loggerService.js";

/**
 * SacredLogger
 * Servicio de logging estructurado que cumple con la LEY #14 de la Startup.
 * Refactorizado (v2) para utilizar LoggerService (Winston) como motor interno.
 */
export class SacredLogger {
  private static readonly PREFIX = "🛡️ ";

  public static info(msg: string, context?: string): void {
    LoggerService.info(`${this.PREFIX}${msg}`, context);
  }

  public static warn(msg: string, context?: string): void {
    LoggerService.warn(`${this.PREFIX}${msg}`, context);
  }

  public static error(msg: string, context?: string, error?: unknown): void {
    const err = error instanceof Error ? error : undefined;
    LoggerService.error(`${this.PREFIX}${msg}`, context, err);
  }

  public static success(msg: string, context?: string): void {
    LoggerService.info(`✅ ${msg}`, context);
  }

  public static node(nodeName: string): void {
    console.info(`\n--- 🤖 EJECUTANDO NODO: ${nodeName.toUpperCase()} ---`);
  }

  public static log(msg: string, context?: string): void {
    LoggerService.info(msg, context);
  }
}
