# Especificación Funcional: Limpieza Idempotente del Estado del CEO (Issue #151)

## Requerimientos

### 1. Limpieza de Estado (Idempotencia)
- Cuando el CEO decida finalizar (`next_step === "finish"`), el sistema debe garantizar que las variables de control de enrutamiento se eliminen, independientemente de la respuesta cruda del LLM.
- **Variables a limpiar:**
  - `active_chief`: Debe ser `undefined`.
  - `next_node`: Debe ser `undefined`.
  - `plan`: Debe limpiarse (arreglo vacío `[]`).

### 2. Tolerancia a Alucinaciones
- Si el LLM retorna `next_step: "finish"` pero, por alucinación o contexto previo, retorna también `delegated_to: "software_chief"`, la aplicación debe ignorar el campo `delegated_to` y priorizar la limpieza del estado.

### 3. Impacto en el Enrutamiento (Graph Routing)
- Al enviar `undefined` en las variables de control, las aristas condicionales de `ceo` y `circuit_breaker` deben evaluar el estado correctamente como vacío y enrutar el flujo al nodo especial `END`, deteniendo el LangGraph.

### Casos de Uso
1. **Delegación Estándar:** `next_step: "delegate"`, `delegated_to: "software_chief"`. El nodo CEO actualiza `active_chief: "software_chief"`.
2. **Finalización Limpia:** `next_step: "finish"`, `delegated_to: null`. El nodo CEO actualiza `active_chief: undefined`.
3. **Finalización con Alucinación:** `next_step: "finish"`, `delegated_to: "software_chief"`. El nodo CEO ignora la alucinación y actualiza `active_chief: undefined`.
