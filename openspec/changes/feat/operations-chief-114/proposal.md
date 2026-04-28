# Proposal: Operations Chief & Automatic Sequence Diagramming (#114)

## Goal
Implementar la funcionalidad completa del **Operations Chief**, dotándolo de la capacidad de orquestar tareas de infraestructura y generar automáticamente diagramas de secuencia que representen la ejecución del grafo.

## Context
Actualmente, el `OperationsChief` es un esqueleto que solo maneja comandos básicos de infraestructura. La visión de la startup requiere que este agente sea el responsable de la observabilidad arquitectónica ("Graph Visibility").

## Proposed Changes

### 1. Schema Expansion
- Modificar `packages/shared/src/contracts/operations_chief.ts` para incluir:
    - Acción: `generate_sequence_diagram`.
    - Campo opcional: `diagram_scope` (ej: "last_5_steps", "full_session").

### 2. Operations Chief Logic
- Refinar el prompt en `backend/src/nodes/chiefs/operations_chief.ts` para que reconozca su rol como "Arquitecto de Observabilidad".
- Instruirlo para que genere diagramas después de hitos importantes o cuando el usuario lo solicite.

### 3. Operations Worker Enhancement
- Extender `backend/src/nodes/workers/operations_worker_node.ts` para manejar la acción `generate_sequence_diagram`.
- Crear un helper `backend/src/helpers/diagramHelper.ts` que transforme el historial de `BaseMessage[]` en un string de Mermaid Sequence Diagram.
- El worker guardará el archivo en `docs/architecture/sequences/sequence_{timestamp}.mmd`.

### 4. Integration
- Asegurar que el `OperationsChief` sea una opción válida de delegación para el `CEO` (ya lo es, pero verificaremos el prompt del CEO).

## Alternatives Considered
- **Diagramado en el Frontend**: Se descartó porque queremos que los diagramas sean artefactos persistentes en el repositorio para documentación técnica automática.
- **Uso de Herramientas Externas**: Se prefiere Mermaid por su compatibilidad nativa con Markdown y GitHub.

## Risks
- **Complejidad del Historial**: Si el historial de mensajes es muy largo, el diagrama puede volverse ilegible. Implementaremos una lógica de "ventana" o "resumen".
