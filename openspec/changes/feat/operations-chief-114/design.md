# Design: Operations Chief & Sequence Diagramming (#114)

## Architecture Overview

### 1. Schema Modification
Actualizaremos `packages/shared/src/contracts/operations_chief.ts`:
```typescript
action: z.enum(["deploy", "monitor", "provision", "rollback", "audit_logs", "generate_sequence_diagram"])
```

### 2. Diagram Logic (The DiagramHelper)
Crearemos `backend/src/helpers/diagramHelper.ts`:
- **Input**: `BaseMessage[]`.
- **Logic**:
    1. Filtrar mensajes que indiquen transiciones entre nodos (ej: `[ACTION]`, `[OPERATIONS_CHIEF_THOUGHT]`, `[GIT_WORKER]`).
    2. Identificar el flujo: `A -> B: Mensaje`.
    3. Generar el header `sequenceDiagram`.
    4. Mapear nombres descriptivos para los actores.
- **Output**: String en formato Mermaid.

### 3. Worker Implementation
Actualizaremos `backend/src/nodes/workers/operations_worker_node.ts`:
- Añadir switch case para `generate_sequence_diagram`.
- Llamar al `DiagramHelper`.
- Usar `fs.writeFileSync` para guardar el diagrama.
- Crear el directorio `docs/architecture/sequences` si no existe.

### 4. Operations Chief Prompt
Refinaremos el prompt en `backend/src/nodes/chiefs/operations_chief.ts` para que use la nueva acción cuando detecte que la misión ha avanzado significativamente o el usuario pide "ver qué se hizo".

## File Changes

### New Files
- `backend/src/helpers/diagramHelper.ts`
- `backend/src/tests/diagram_helper.test.ts`

### Modified Files
- `packages/shared/src/contracts/operations_chief.ts`
- `backend/src/nodes/chiefs/operations_chief.ts`
- `backend/src/nodes/workers/operations_worker_node.ts`

## Verification Plan
1. Test unitario para `DiagramHelper` validando la generación de Mermaid desde un array de mensajes mockeado.
2. Test de integración simulando una llamada al OperationsChief pidiendo un diagrama.
3. Verificar la creación física del archivo `.mmd`.
