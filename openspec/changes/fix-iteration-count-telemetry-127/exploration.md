## Exploration: Corregir iteration_count y Hardcodes en Telemetría (#127)

### Current State
El sistema presenta un patrón de "hardcoding" en la actualización del estado de los nodos principales (`CEO`, `SoftwareChief`, `BusinessChief`). 
- **Bug de Iteración**: En lugar de incrementar el contador global (`state.iteration_count + 1`), cada nodo lo sobreescribe con un valor estático de `1`. Esto invalida el `recursion_limit` de LangGraph, permitiendo loops infinitos indetectables.
- **Inconsistencia de Telemetría**: El nodo CEO reporta métricas usando la cadena estática `"gpt-4o"`, ignorando el modelo realmente utilizado y devuelto por el `LLMService`.

### Affected Areas
- `backend/src/nodes/ceo.ts` — Contiene ambos problemas (hardcode de modelo y reset de iteración).
- `backend/src/nodes/chiefs/software_chief.ts` — Contiene el reset de iteración.
- `backend/src/nodes/chiefs/business_chief.ts` — Contiene el reset de iteración.
- `backend/src/services/telemetryService.ts` — Aunque el servicio es correcto, se debe verificar que los tipos permitan el paso dinámico del modelo.

### Approaches
1. **Corrección Directa (Manual)** — Modificar cada nodo para que use `(state.iteration_count || 0) + 1` y pase el modelo dinámicamente.
   - Pros: Rápido, no introduce nuevas dependencias.
   - Cons: Propenso a errores futuros (si se agrega un nuevo nodo, el programador podría olvidar el patrón).
   - Effort: Low

2. **Refactorización vía State Helpers (Recomendado)** — Crear una utilidad compartida para preparar las actualizaciones comunes de los nodos (incremento de iteración, cálculo de costos/telemetría).
   - Pros: Sigue las leyes SRP y DRY. Centraliza la lógica de control del grafo.
   - Cons: Requiere un cambio estructural pequeño en cómo los nodos retornan su estado.
   - Effort: Medium

### Recommendation
Se recomienda el **Approach 2 (State Helpers)**. Dado que este es un monorepo con leyes de ingeniería estrictas, centralizar la lógica de "Mantenimiento del Estado del Grafo" evitará que este bug se repita en futuros nodos. Implementaremos un helper `updateGraphMetrics` en el backend.

### Risks
- Romper el tipado de `AgentStateType` si la actualización no se maneja con cuidado.
- Impactar los tests existentes que esperan valores exactos (aunque los mocks actuales ya parecen contemplar valores variables).

### Ready for Proposal
Yes — La causa raíz está identificada y la solución centralizada es la más robusta para el horizonte 2026.
