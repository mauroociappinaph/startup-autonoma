# Delta for Core Persistence

## MODIFIED Requirements

### Requirement: Binary Checkpoint Serialization
The system MUST use a binary serialization format (e.g., MessagePack) for storing LangGraph checkpoints in Redis. This replaces JSON to reduce storage footprint and serialization latency.
(Previously: The system used default JSON serialization for checkpoints.)

#### Scenario: Checkpoint Save
- GIVEN a LangGraph node finishing its execution.
- WHEN the `SimpleRedisSaver` persists the state.
- THEN the data stored in Redis MUST be in binary format.
- AND the size of the payload MUST be significantly smaller than its JSON equivalent.

#### Scenario: Checkpoint Load (Backwards Compatibility)
- GIVEN a `SimpleRedisSaver` initialized with a binary serializer.
- WHEN it attempts to load an existing JSON checkpoint from a previous version.
- THEN the system MUST detect the format and gracefully migrate or fail with a clear "legacy_format" error.

### Requirement: Action de Rewind
El usuario debe poder disparar una acción de `rewind` seleccionando un pensamiento específico del feed. Esto debe:
1. Notificar al backend para resetear el puntero del grafo.
2. Limpiar el store local de pensamientos posteriores al punto elegido.
3. Actualizar la telemetría (costos y tokens) al valor exacto que había en ese checkpoint.
(Previously: Unchanged, but re-documented to ensure binary compatibility is maintained during state reset.)

#### Scenario: El usuario decide retroceder una decisión del CEO
- **Dado** que el agente está en estado "Waiting for approval" después de un plan del CEO.
- **Cuando** el usuario hace click en "Rewind" sobre el pensamiento anterior del CEO.
- **Entonces** el feed debe eliminar el plan actual.
- **Y** el estado del grafo debe volver al punto previo a la generación del plan, deserializando correctamente el checkpoint binario.
