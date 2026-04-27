# Tasks: feat-143-sentinel-sse

## Batch 1 — Tipos y Contratos

- [ ] **T1** `packages/shared/src/types/AgentState.types.ts`
  - Agregar campo `threat_level?: "none" | "low" | "medium" | "high" | "critical"` junto a `is_malicious`

- [ ] **T2** `backend/src/types/stream.types.ts`
  - Agregar tipo `SecurityAnalysisEvent` (export)
  - Agregar `checkpointId?: string` a `StreamEvent`

## Batch 2 — Strict TDD: Tests (RED primero)

- [ ] **T3** `backend/src/tests/aduana_sentinel_node.test.ts` [NUEVO]
  - Escribir tests en RED:
    - `prompt limpio → emite SecurityAnalysisEvent con decision: "pass"`
    - `prompt malicioso → emite SecurityAnalysisEvent con decision: "block"`
    - `LLM falla → no emite, retorna is_malicious: false`
    - `trace_id undefined → emite con threadId: "unknown"`
    - `threat_level queda en el estado resultante`
  - Verificar que TODOS fallan antes de implementar

- [ ] **T4** `backend/src/tests/graphFormatter.test.ts` [NUEVO]
  - Escribir tests en RED:
    - `is_malicious: true → yield StreamEvent con agent: ADUANA_SENTINEL`
    - `is_malicious: false → yield StreamEvent con agent: ADUANA_SENTINEL`
    - `sin campo is_malicious → no yield de evento de seguridad`
  - Verificar que TODOS fallan antes de implementar

## Batch 3 — Implementación (GREEN)

- [ ] **T5** `backend/src/nodes/mirror/aduana_sentinel_node.ts`
  - Importar `EventBus` y `SecurityAnalysisEvent`
  - Construir y emitir `SecurityAnalysisEvent` antes de retornar `updates`
  - Agregar `threat_level` al objeto `updates`

- [ ] **T6** `backend/src/helpers/graphFormatter.ts`
  - Agregar segundo `yield` dentro de `formatUpdate()` para updates con `is_malicious`

## Batch 4 — Verificación y Cierre

- [ ] **T7** Ejecutar suite completa y verificar GREEN:
  ```bash
  cd backend && NODE_OPTIONS='--experimental-vm-modules' npx jest src/tests/aduana_sentinel_node.test.ts src/tests/graphFormatter.test.ts
  ```

- [ ] **T8** Verificar tipado:
  ```bash
  npm run check
  ```

- [ ] **T9** Ejecutar suite completa para confirmar que no se rompió nada:
  ```bash
  cd backend && NODE_OPTIONS='--experimental-vm-modules' npx jest --passWithNoTests
  ```

- [ ] **T10** Commit y merge a develop
  ```bash
  git add . && git commit -m "feat(aduana-sentinel): emit SECURITY_ANALYSIS SSE event (#143)"
  ```
