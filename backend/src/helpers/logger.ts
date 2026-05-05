import { LoggerService } from "../services/loggerService.js";
import * as Sentry from "@sentry/node";

/**
 * SacredLogger
 * Servicio de logging estructurado que cumple con la LEY #14 de la Startup.
 * Refactorizado (v2) para utilizar LoggerService (Winston) como motor interno.
 */
export class SacredLogger {
  private static readonly PREFIX = "🛡️ ";

  public static info(msg: string, context?: string): void {
    LoggerService.info(`${this.PREFIX}${msg}`, context);
    Sentry.addBreadcrumb({
      category: context || "log",
      message: msg,
      level: "info",
    });
  }

  public static warn(msg: string, context?: string): void {
    LoggerService.warn(`${this.PREFIX}${msg}`, context);
    Sentry.addBreadcrumb({
      category: context || "log",
      message: msg,
      level: "warning",
    });
  }

  public static error(msg: string, context?: string, error?: unknown): void {
    const err = error instanceof Error ? error : undefined;
    LoggerService.error(`${this.PREFIX}${msg}`, context, err);
    if (err) {
      Sentry.captureException(err, { tags: { context } });
    } else {
      Sentry.captureMessage(msg, "error");
    }
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
