# Tareas: SSE Security Streaming (#143)

## Fix del Bug de ThreadId

- [ ] `[/]` En `aduana_sentinel_node.ts` línea 85, cambiar `state.trace_id || "unknown"`
  por el campo correcto del estado que contiene el threadId del grafo.
- [ ] Migrar `console.error` del bloque `catch` a `SacredLogger.error` con el objeto
  de error para capturar el stack trace.

## Verificación con Tests

- [ ] En `aduana_sentinel_node.test.ts`, agregar Escenario 1: prompt limpio publica
  evento `SECURITY_ANALYSIS` en canal correcto.
- [ ] Agregar Escenario 2: prompt malicioso publica evento con `decision: "block"`.
- [ ] Agregar Escenario 3: error del LLM llama a `SacredLogger.error` (no `console.error`).

## Validación Final

- [ ] Correr la suite completa `npm run test` → debe pasar en verde.
- [ ] Correr `npm run check` (TypeScript) → sin errores.
