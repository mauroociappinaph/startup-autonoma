# Proposal: Fix CEO Infinite Loop

## Intent

Eliminar el bucle infinito en la lógica de decisión del CEO y el Software Chief que ocurre principalmente en tareas de documentación. El problema es causado por reducers de estado que impiden la limpieza de campos de control y prompts excesivamente rígidos que no verifican el historial de ejecución.

## Scope

### In Scope
- Corregir los reducers de `active_chief` y `next_node` en `backend/src/graph/state.ts` para permitir valores `undefined`.
- Refinar el prompt del CEO en `backend/src/nodes/ceo.ts` para que sea condicional al progreso real en el historial.
- Implementar la limpieza de `active_chief` en `backend/src/nodes/chiefs/software_chief.ts` cuando una tarea se completa.
- Mejorar el feedback del `DocumentationWorker` para que sea reconocido inequívocamente como una finalización de tarea.

### Out of Scope
- Implementar un sistema de escritura de archivos real en el `DocumentationWorker` (se mantiene el simulacro pero con mejor reporte por ahora, para no extender el scope del fix de urgencia).
- Modificar el `CircuitBreaker` (su funcionamiento es correcto, solo detecta el síntoma).

## Capabilities

### Modified Capabilities
- `reasoning/agent-orchestration`: Mejorar la resiliencia de la delegación y evitar ciclos redundantes.

## Approach

1. **Estado "Limpiable"**: Cambiar `next ?? prev` por `next` en los reducers críticos del estado de LangGraph. Esto permitirá que los nodos "apaguen" a los Chiefs cuando ya no sean necesarios.
2. **Razonamiento Contextual**: Inyectar una instrucción en el CEO para que valide si la intención del usuario ya fue satisfecha en mensajes previos antes de volver a delegar el mismo dominio.
3. **Explosión de Chief**: Asegurar que al retornar `complete`, el Software Chief envíe `active_chief: undefined`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/graph/state.ts` | Modified | Cambio de reducers para `active_chief` y `next_node`. |
| `backend/src/nodes/ceo.ts` | Modified | Refactor de prompt para evitar delegaciones redundantes. |
| `backend/src/nodes/chiefs/software_chief.ts` | Modified | Limpieza de `active_chief` al finalizar misión. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Regresión en navegación de grafos | Low | Verificar que los tests de negocio sigan pasando. |
| CEO deja de delegar por falso positivo de completitud | Med | Usar un prompt que exija evidencia de éxito en el historial. |

## Rollback Plan

Revertir los cambios en `state.ts` y restaurar los prompts originales de `ceo.ts`.

## Success Criteria

- [ ] El test `test-full-autonomy.ts` completa la misión de documentación en menos de 5 iteraciones totales.
- [ ] El `active_chief` se limpia correctamente en el estado tras la finalización de la tarea.
- [ ] No se alcanza el límite del Circuit Breaker (20 iteraciones).
