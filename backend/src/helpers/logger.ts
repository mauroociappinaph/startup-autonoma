/**
 * SacredLogger
 * Servicio de logging estructurado que cumple con la LEY #14 de la Startup.
 * Reemplaza los console.log con una salida formateada y profesional.
 */
export class SacredLogger {
  private static prefix = "🛡️  [SACRED_LOG]";

  private static formatMessage(msg: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const ctx = context ? `[${context}]` : "";
    return `${timestamp} ${this.prefix}${ctx} ${msg}`;
  }

  public static info(msg: string, context?: string): void {
    console.info(this.formatMessage(msg, context));
  }

  public static warn(msg: string, context?: string): void {
    console.warn(this.formatMessage(msg, context));
  }

  public static error(msg: string, context?: string): void {
    console.error(this.formatMessage(msg, context));
  }

  public static success(msg: string, context?: string): void {
    console.log(`${this.formatMessage(`✅ ${msg}`, context)}`);
  }

  public static node(nodeName: string): void {
    console.info(`\n--- 🤖 EJECUTANDO NODO: ${nodeName.toUpperCase()} ---`);
  }
}
