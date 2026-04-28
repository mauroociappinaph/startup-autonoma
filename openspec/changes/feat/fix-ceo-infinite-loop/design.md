# Design: Fix CEO Infinite Loop

## Technical Approach

La estrategia consiste en corregir la persistencia del estado de control y flexibilizar el razonamiento del CEO. Se atacarán tres frentes:
1. **Infraestructura de Estado**: Modificar los reducers de `active_chief` y `next_node` para permitir la limpieza de campos.
2. **Protocolo de Salida de Nodos**: Asegurar que los nodos Chief limpien su rastro al finalizar.
3. **Guardrails de Razonamiento**: Refactorizar el prompt del CEO para que priorice la evidencia de éxito sobre las reglas de delegación estáticas.

## Architecture Decisions

### Decision: Reemplazo de Reducers Nullish por Asignación Directa

**Choice**: Cambiar `next ?? prev` por `next` en los campos de control del grafo.
**Alternatives considered**: Usar un valor centinela como `"none"` o `"idle"`.
**Rationale**: El valor `undefined` es el estándar semántico en TypeScript y LangGraph para indicar ausencia de valor. Forzar un valor centinela ensuciaría los contratos de Zod.

### Decision: Inyección de "Progreso" en el Prompt del CEO

**Choice**: Añadir una instrucción explícita de "Check History for Success" en el System Message del CEO.
**Alternatives considered**: Crear un nodo intermedio de "Summary Creator".
**Rationale**: Inyectar la lógica en el CEO es más barato en términos de latencia y tokens que añadir un nodo extra al grafo.

## Data Flow

    CEO (Análisis de Historial) ──→ Software Chief
          ↑                            │
          │                            ↓
          └────── Circuit Breaker ←── DocumentationWorker (Mensaje de Éxito)
                      │
                 (Si next_node=undefined,
                  usa active_chief)

*Con el fix:* DocumentationWorker -> Circuit Breaker -> Software Chief -> (Limpia active_chief) -> Circuit Breaker -> CEO.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/src/graph/state.ts` | Modify | Cambiar reducers de `active_chief` y `next_node`. |
| `backend/src/nodes/ceo.ts` | Modify | Actualizar System Prompt con lógica de validación de éxito. |
| `backend/src/nodes/chiefs/software_chief.ts` | Modify | Añadir `active_chief: undefined` en el retorno de la rama `complete`. |

## Interfaces / Contracts

No se requieren cambios en las interfaces de `shared`, ya que el tipo `undefined` ya es soportado opcionalmente.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Integration | Loop de documentación | Ejecutar `npm run test:autonomy` y verificar que termine en < 5 iteraciones. |
| Unit | State Reducer | (Opcional) Test unitario de los reducers de LangGraph en `state.ts`. |

## Migration / Rollout

No migration required. El cambio es puramente de lógica de orquestación.

## Open Questions

- [ ] ¿Deberíamos también mejorar el `DocumentationWorker` para que sea real en este PR? 
    - *Decisión*: No, para mantener el fix atómico y rápido. Se hará en un feat posterior.
