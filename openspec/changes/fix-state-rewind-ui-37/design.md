# Diseño Técnico: Time-Travel Architecture (Issue #37)

## Arquitectura de Datos

### Extensión de `AgentThought` (@startup/shared)
```typescript
export interface AgentThought {
  // ... campos existentes
  checkpointId?: string; // ID único del estado en Redis
}
```

### Flujo de Rewind
1. **Frontend**: `agentService.rewind(threadId, cpId)` -> API POST `/api/agents/rewind`.
2. **Backend**: `GraphService.rewind` utiliza `graph.updateState` con el `checkpoint_id` para forzar el estado.
3. **Frontend**: Tras el éxito del rewind, se invoca `agentService.getHistory(threadId)`.
4. **Zustand**: Se ejecuta `populateState` (ya existente) y se filtran los `thoughts` locales.

## Cambios por Componente

### Backend
- **`GraphFormatter.ts`**: Añadir `checkpointId` al objeto que retorna `formatUpdate`.
- **`GraphService.ts`**: Capturar el config del evento y pasarlo al formateador.

### Frontend
- **`useAgentStore.ts`**: 
  - Añadir acción `rewindTo(checkpointId)`.
  - Añadir lógica para limpiar pensamientos futuros.
- **`ReasoningFeed.tsx`**:
  - Añadir botón de acción (Tooltip + Button) en cada item de la lista.
  - Bloquear acciones si `isStreaming`.
- **`OrchestrationGraph.tsx`**: Asegurar que React Flow se refresque al cambiar el estado.

## Consideraciones de Seguridad
- Validar que el `threadId` pertenezca al usuario (en futuras fases con Auth).
- Prevenir ataques de inyección de checkpoints inválidos.
