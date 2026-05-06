# Proposal: fix(core) Circular Dependency - Logger & Redis Decoupling (#187)

## Intent
Eliminar las dependencias circulares y los acoplamientos rígidos entre los servicios de infraestructura base (`SacredLogger`, `LoggerService`, `Redis`, `TelemetryService`). Asegurar que los cimientos del sistema cumplan con la **Ley #1 (SRP & DRY)** y permitan una inicialización determinista sin efectos secundarios asíncronos ocultos.

## Scope
- `backend/src/db/redis.ts`: Reemplazar `console.info` con el logger estandarizado (si es posible) o asegurar su independencia.
- `backend/src/services/telemetryService.ts`: Revisar el acoplamiento con `SacredLogger` y `Redis`.
- `backend/src/helpers/logger.ts`: Asegurar que no importe directa o indirectamente módulos que requieran el logger antes de su propia definición.

## Approach
1. **Detección Rigurosa**: Usar `madge` para identificar el grafo exacto de la circularidad.
2. **Inyección de Dependencias / Lazy Loading**: Si un servicio de infra necesita a otro, cargarlo bajo demanda o pasarlo como parámetro para evitar el import en el top-level.
3. **Estandarización de Logs de Infra**: Crear un micro-logger para `db/` y `config/` que no dependa del `SacredLogger` principal si este último requiere a su vez de esos módulos.

## Risks
- Romper el inicio de la aplicación si el orden de inicialización cambia.
- Perder logs críticos durante el arranque de Redis u OpenTelemetry.
