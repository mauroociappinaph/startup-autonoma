# Propuesta: Limpieza Idempotente del Estado del CEO (Issue #151)

## Intención
Solucionar el bucle infinito causado cuando el nodo CEO decide finalizar el flujo (`next_step === "finish"`) pero el LLM deja residuos en el estado (como `delegated_to`), lo que engaña a las aristas condicionales y re-inyecta al grafo en un ciclo sin fin.

## Alcance (Scope)
- **Modificación:** `backend/src/nodes/ceo.ts`.
- **Modificación (Precaución):** `backend/src/graph/state.ts` (si es necesario modificar el reducer para asegurar que `undefined` anula la clave).
- **No incluido:** No se modificarán las aristas del grafo directamente, ya que el comportamiento de la arista condicional del CEO es correcto si el estado está verdaderamente limpio.

## Enfoque Arquitectónico

Se implementará una limpieza explícita de estado dentro del `ceo_node.ts`. Cuando `response.next_step === 'finish'`, el código forzará las siguientes actualizaciones, ignorando silenciosamente si el LLM alucinó valores contradictorios:

```typescript
const isFinishing = response.next_step === "finish";

const updates: Partial<AgentStateType> = {
  ...metricsUpdate,
  executive_summary: response.analysis,
  // Limpieza estricta e idempotente
  active_chief: isFinishing ? undefined : (response.delegated_to as "software_chief" | "business_chief" | "operations_chief" | undefined),
  next_node: isFinishing ? undefined : state.next_node, 
  plan: isFinishing ? [] : state.plan,
  messages: state.messages.concat([...])
};
```

Adicionalmente, se revisará `state.ts` para verificar que el reducer de `next_node` y `active_chief` procese correctamente `undefined` en lugar de ignorar la actualización por usar el objeto original. En LangGraph.js, la forma más segura de vaciar un valor de tipo cadena si `undefined` es problemático es enviar el string vacío `""` o mantener `undefined` y asegurar que la lógica de routing trate `""` o `undefined` como valores falsos. 

Como TypeScript evalúa `!state.active_chief` como verdadero si es `undefined`, enviaremos explícitamente `undefined` y nos aseguraremos de que las llamadas al reducer no lo filtren.
