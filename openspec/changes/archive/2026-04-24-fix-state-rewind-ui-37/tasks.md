# Tareas: Implementación de Rewind UI (Issue #37)

## Fase 1: Infraestructura de Tipos y Backend
- [x] [SHARED] Añadir `checkpointId?: string` a `AgentThought`.
- [x] [SHARED] Ejecutar `npm run build` en `packages/shared`.
- [x] [BACKEND] Modificar `GraphFormatter.formatUpdate` para aceptar `checkpointId`.
- [x] [BACKEND] Actualizar `GraphService.runAgentStream` y `resumeAgent` para capturar el checkpoint del evento.

## Fase 2: Store e Integración de API
- [x] [FRONTEND] Añadir `rewindTo` a `useAgentStore.ts`.
- [x] [FRONTEND] Implementar lógica de filtrado de `thoughts` tras un rewind exitoso.
- [x] [FRONTEND] Añadir método de carga inicial (hidratación) en el `Dashboard` principal usando `getHistory`.

## Fase 3: Interfaz de Usuario (UX)
- [x] [FRONTEND] Añadir botón de "Rewind" en `ReasoningFeed.tsx`.
- [x] [FRONTEND] Añadir feedback visual (Toast o notificación) al completar un rewind.
- [x] [FRONTEND] Bloquear botones mientras el stream está activo.

## Fase 4: Validación
- [x] [TEST] Verificar que el rewind resetea el presupuesto y los tokens.
- [x] [TEST] Validar que el grafo de orquestación refleja el cambio de estado.
- [x] [TEST] Probar persistencia recargando la página tras un rewind.
