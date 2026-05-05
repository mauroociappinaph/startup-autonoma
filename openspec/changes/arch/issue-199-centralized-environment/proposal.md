# Proposal: Centralized Environment - Eliminate Default Config in Code (#199)

## Intent
Eliminar todos los valores de conexión hardcodeados en el código fuente y centralizar la configuración en `.env`. Si una variable crítica falta al arrancar, el proceso debe fallar de forma explícita (fail-fast).

## Scope

### Variables CRÍTICAS (deben causar error fatal si no están):
- `REDIS_URL` — conexión a Redis (backend/src/db/redis.ts)

### Variables CON DEFAULTS LEGÍTIMOS (no se cambian):
- `LOG_LEVEL` — operacional, el default "info" es correcto
- `OTEL_EXPORTER_OTLP_ENDPOINT` — observabilidad opcional, el default a localhost es correcto
- `PORT`, `AGENT_CONCURRENCY` — defaults razonables para desarrollo
- `AI_ENGINE_PORT` — default razonable
- `NVIDIA_*_MODEL` — defaults de modelos LLM, razonables
- `PRIMARY_*_PROVIDER` — defaults de proveedor, razonables

## Approach
1. Crear `backend/src/config/env.ts` — módulo centralizado que valida y exporta variables críticas.
2. Reemplazar el acceso directo a `process.env.REDIS_URL` en `redis.ts` por el módulo de config.
3. Actualizar `.env.example` con todas las variables documentadas y tipadas.

## Alternatives Considered
- **`dotenv-safe`**: Requiere dependencia externa. Rechazado — la validación manual es más explícita y controlable.
- **Zod para validación de env**: Overkill para este scope. Rechazado — no justifica añadir un parser de runtime.
- **Tocar TODOS los fallbacks**: Incorrecto — `LOG_LEVEL || "info"` es un default de comportamiento, no de conexión. No aplica.
