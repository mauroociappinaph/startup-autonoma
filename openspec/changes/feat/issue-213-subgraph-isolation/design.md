# Technical Design: Sub-Graph Domain Isolation (Issue #213)

## File Structure
```text
backend/src/graph/
├── index.ts (Orquestador Principal)
├── state.ts (Estado Compartido)
└── domains/
    ├── software/
    │   ├── index.ts (Sub-grafo Software)
    │   └── router.ts (Lógica de ruteo interna)
    ├── business/
    │   └── index.ts
    └── operations/
        └── index.ts
```

## Implementation Details

### 1. Sub-graph Definition (Example: Software)
Cada dominio exportará un `CompiledStateGraph` o simplemente un nodo que envuelve el grafo. LangGraph permite anidar grafos fácilmente tratándolos como nodos.

### 2. State Mapping
Usaremos el mismo `AgentAnnotation` para todos los grafos para simplificar el flujo. Al ser el mismo esquema, el "mapeo" es automático.

### 3. CEO Logic Refactor
El CEO ya no decidirá sobre `git_worker` o `test_runner`. Solo decidirá quién es el `active_chief`.
El ruteador del grafo principal enviará el flujo al dominio correspondiente basándose en `active_chief`.

### 4. Circuit Breaker Global
El `circuit_breaker` permanecerá en el grafo principal para controlar el presupuesto y los límites de seguridad globales de toda la misión.

## Verification Plan
- **Unit Tests**: Probar cada sub-grafo de forma aislada (Mocking el estado inicial).
- **Integration Test**: `test-full-autonomy.ts` debe seguir funcionando sin cambios en su firma, pero con una ejecución interna ramificada.
