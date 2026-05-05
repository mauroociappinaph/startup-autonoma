/**
 * Módulo centralizado de variables de entorno.
 *
 * CRÍTICAS: El proceso falla de forma explícita si no están definidas.
 * OPCIONALES: Tienen defaults razonables y no representan riesgos de seguridad.
 *
 * Este es el ÚNICO lugar del código donde se leen variables de infra críticas.
 */

/**
 * Valida que una variable de entorno crítica esté definida.
 * Falla el proceso de forma explícita si no lo está.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[ENV] Variable crítica faltante: "${key}"\n` +
        `      Configurala en tu archivo .env antes de arrancar.\n` +
        `      Referencia: .env.example`
    );
  }
  return value;
}

// ─────────────────────────────────────────────
// Variables CRÍTICAS (fail-fast si no están)
// ─────────────────────────────────────────────

/** URL de conexión a Redis. Requerida para BullMQ y el Checkpointer. */
export const REDIS_URL = requireEnv("REDIS_URL");

// ─────────────────────────────────────────────
// Variables OPCIONALES (con defaults razonables)
// ─────────────────────────────────────────────

/** Puerto del servidor backend. Default: 3001 en desarrollo. */
export const PORT = parseInt(process.env.PORT ?? "3001", 10);

/** Nivel de log de Winston. Default: "info". */
export const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";

/** Número de agentes corriendo en paralelo. Default: 2. */
export const AGENT_CONCURRENCY = parseInt(process.env.AGENT_CONCURRENCY ?? "2", 10);

/** Endpoint del colector OTLP para OpenTelemetry. */
export const OTEL_ENDPOINT =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318/v1/traces";

/** Flag para activar/desactivar OpenTelemetry. */
export const OTEL_ENABLED = process.env.OTEL_ENABLED === "true";
