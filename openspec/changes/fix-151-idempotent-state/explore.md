# Exploración: Fix Idempotent State Cleanup (Issue #151)

## Contexto Actual
Durante las pruebas E2E, se observó que el sistema entra en un loop infinito cuando el CEO decide terminar la misión (`finish`). En los logs se ve que el CEO emite `finish a software_chief`, lo que indica que `next_step` es `finish` pero el LLM sigue poblando `delegated_to` con el valor del último chief involucrado.

## Problema Identificado
En `ceo_node.ts`, el estado se actualiza así:
```typescript
active_chief: (response.delegated_to as "software_chief" | "business_chief" | "operations_chief" | undefined),
```
Si el CEO decide `finish` pero el modelo LLM rellena `delegated_to` (como alucinación o como referencia al último chief), `active_chief` se vuelve a setear. Luego, la arista condicional del CEO (`backend/src/graph/index.ts`) dice:
```typescript
if (!state.active_chief && (!state.plan || state.plan.length === 0)) return "end";
if (state.active_chief || state.plan?.length > 0) return "circuit_breaker";
```
Como `active_chief` no está vacío, el CEO enruta a `circuit_breaker` en vez de `end`.
Además, si `next_node` no se limpia, el `circuit_breaker` re-enruta al último worker activo, generando el bucle infinito.

## Alternativas de Implementación

### Alternativa 1: Validar estáticamente en el CEO Node
Modificar `ceo_node.ts` para que, si `response.next_step === 'finish'`, obligatoriamente se devuelva:
```typescript
active_chief: undefined,
next_node: undefined,
plan: [],
```
Independientemente de si el LLM alucinó un valor en `delegated_to`.

### Alternativa 2: Modificar la Arista Condicional
Cambiar la arista condicional en `index.ts` para que dependa del último mensaje o de un nuevo flag explícito. Pero esto no limpia la basura en el estado, lo cual viola el principio de idempotencia y estado limpio.

### Alternativa 3: Modificar Zod Schema
Obligar a que `delegated_to` sea nulo si `next_step` es `finish` en el prompt/schema. Esto es más frágil porque dependemos del comportamiento probabilístico del LLM.

## Decisión
Se elegirá la **Alternativa 1**. Es determinista, asegura una limpieza idempotente del estado a nivel del nodo, previniendo loops infinitos y asegurando un cierre limpio del grafo. Además, se asegurará de limpiar `next_node` para que el Circuit Breaker no tenga hacia dónde enrutar si por alguna razón falla el enrutamiento.
