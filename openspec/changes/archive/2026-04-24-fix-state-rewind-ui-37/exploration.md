# Exploración: Estado y Persistencia (Issue #37)

## Contexto Actual
El sistema ya cuenta con una infraestructura de persistencia robusta utilizando `SimpleRedisSaver` en LangGraph. El backend ya expone rutas para obtener el historial y realizar el retroceso (rewind), pero estas capacidades no están integradas en la interfaz de usuario.

### Backend (`GraphService` & `AgentController`)
- `SimpleRedisSaver` está configurado y funcionando.
- `GraphService.getHistory(threadId)` recupera los checkpoints de Redis.
- `GraphService.rewind(threadId, checkpointId)` permite volver a un estado anterior.
- Los eventos actuales de streaming NO incluyen el `checkpoint_id`, lo que impide al frontend saber a qué punto exacto corresponde cada pensamiento.

### Frontend (`UI` & `Store`)
- El `agentService` ya tiene los métodos `getHistory` y `rewind` definidos, pero no se usan.
- El `useAgentStore` no maneja el historial ni permite disparar un rewind.
- El `ReasoningFeed` renderiza los pensamientos pero no ofrece controles de interacción histórica.

## Objetivos de la Implementación
1. **Visibilidad**: Cada "Thought" en el feed debe estar vinculado a un checkpoint ID (cuando sea posible).
2. **Acción**: El usuario debe poder ver una lista de checkpoints o "puntos de restauración".
3. **Control**: Al hacer rewind, el estado global del frontend debe sincronizarse con el estado recuperado del backend.

## Hallazgos de Código
- En `backend/src/services/graphService.ts`, podemos extraer el `checkpoint_id` de `event.config.configurable.checkpoint_id` durante el streaming.
- Necesitamos extender la interfaz `AgentThought` en `@startup/shared` para incluir `checkpointId`.
- El componente `ReasoningFeed.tsx` es el lugar ideal para mostrar botones de "Rewind to this point" en cada bloque de pensamiento finalizado.

## Riesgos y Consideraciones
- **Sincronización**: Al hacer rewind, el store de Zustand debe limpiarse de pensamientos "futuros" que ya no existen en la nueva línea temporal.
- **Tokens/Costos**: El rewind debe resetear los contadores de telemetría a los valores del checkpoint seleccionado.
- **Inconsistencia Visual**: Evitar que el grafo de orquestación se rompa al cambiar abruptamente el estado.
