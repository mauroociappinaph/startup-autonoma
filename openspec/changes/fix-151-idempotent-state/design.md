# Diseño Técnico: Limpieza Idempotente del Estado del CEO (Issue #151)

## Arquitectura del Fix

El componente afectado es `backend/src/nodes/ceo.ts`.
Cuando LangGraph.js recibe un `Partial<AgentStateType>`, llama a los reducers definidos en `state.ts`.
Si la clave es `undefined`, el reducer reemplazará el valor existente con `undefined` porque está definido así: `reducer: (prev, next) => next`.

### Cambios a realizar en ceo_node.ts

```typescript
const isFinishing = response.next_step === "finish";

const updates: Partial<AgentStateType> = {
  ...metricsUpdate,
  executive_summary: response.analysis,
  // Limpieza estricta si termina, sino asignamos lo que devuelve
  active_chief: isFinishing ? undefined : (response.delegated_to as "software_chief" | "business_chief" | "operations_chief" | undefined),
  // Limpiamos el nodo destino para que el circuit breaker no intente rutear
  next_node: isFinishing ? undefined : state.next_node,
  // Limpiamos el plan 
  plan: isFinishing ? [] : state.plan,
  messages: state.messages.concat([new AIMessage({
    content: `[CEO_THOUGHT] ${response.reasoning}\n[CEO_DECISION] ${response.next_step} ${!isFinishing && response.delegated_to ? `a ${response.delegated_to}` : ""}`,
  })])
};
```

## Validación

- Se observará mediante un test de flujo E2E o un test unitario si el nodo CEO vacía correctamente `active_chief` y `next_node`.
- Con esto, al pasar a la validación de la arista condicional en `index.ts`:
  ```typescript
  if (!state.active_chief && (!state.plan || state.plan.length === 0)) return "end";
  ```
  La condición se cumplirá y el grafo retornará a `end` / `END`, deteniendo el bucle infinito exitosamente.
