## Exploration: Bucle Infinito en el Grafo (CEO Loop)

### Current State
Actualmente, el sistema entra en un bucle infinito cuando se solicita una tarea de documentación. 
El flujo detectado es:
1. **CEO** delega a **Software Chief** (regla rígida de prompt).
2. **Software Chief** delega a **DocumentationWorker**.
3. **DocumentationWorker** emite un reporte de "éxito" (simulado).
4. El flujo vuelve al **Software Chief** vía `circuit_breaker` porque `active_chief` persiste.
5. El **Software Chief** marca como `complete` y redirige al **CEO**.
6. El **CEO** vuelve a evaluar, ignora el historial o prioriza su regla de oro, y vuelve a delegar a **Software Chief**.

### Affected Areas
- `backend/src/graph/state.ts` — Los reducers de `active_chief` y `next_node` usan `next ?? prev`, lo que impide limpiar estos campos (enviar `undefined` no hace nada).
- `backend/src/nodes/ceo.ts` — El prompt del CEO tiene una "Regla de Oro" que lo obliga a delegar tareas de documentación siempre, sin verificar si ya se completaron en el historial.
- `backend/src/nodes/chiefs/software_chief.ts` — El nodo no limpia `active_chief` al retornar `complete`.

### Approaches
1. **Fix de Estado y Prompts (Recomendado)** — Corregir los reducers para permitir limpieza, añadir lógica de limpieza en los nodos Chief al terminar, y flexibilizar el prompt del CEO.
   - Pros: Soluciona la causa raíz técnica y de razonamiento.
   - Cons: Requiere cambios en múltiples archivos.
   - Effort: Low/Medium

2. **Campo Explícito de 'completed_tasks'** — Forzar a los agentes a escribir en un campo del estado cada vez que terminan una tarea atómica.
   - Pros: Muy determinista.
   - Cons: Aumenta la complejidad del estado y requiere que todos los workers lo soporten.
   - Effort: Medium

### Recommendation
Implementar el **Approach 1**. Es fundamental que el estado de LangGraph sea "limpiable". El patrón `next ?? prev` es útil para el contexto del proyecto, pero destructivo para el control del flujo del grafo. Además, el CEO debe ser más inteligente al leer el historial.

### Risks
- Cambiar los reducers podría afectar otros flujos que dependan accidentalmente de la persistencia de `next_node` (poco probable pero a verificar).
- El CEO podría dejar de delegar si el historial es confuso (necesita un prompt muy equilibrado).

### Ready for Proposal
Yes. Se procederá a crear la propuesta de cambio formal.
