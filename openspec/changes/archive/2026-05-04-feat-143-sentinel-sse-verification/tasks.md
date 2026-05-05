# Tasks: Sentinel SSE Verification (#143)

## Phase 1: Sentinel Node Testing (RED/GREEN)
- [x] 1.1 Create `backend/src/tests/aduana_sentinel_node.test.ts` with mocks for `LLMService`, `EventBus`, and `SacredLogger`.
- [x] 1.2 Implement Scenario 1 (Clean Prompt): Verify state update and `SECURITY_ANALYSIS` event emission.
- [x] 1.3 Implement Scenario 2 (Malicious Prompt): Verify `is_malicious: true` and `decision: "block"` in the event.
- [x] 1.4 Implement Scenario 3 (LLM Error): Verify `SacredLogger.error` call and conservative `pass` fallback.
- [x] 1.5 Execute tests and verify failures (RED) - *Note: passed because ESM mocks were fixed.*
- [x] 1.6 Fix any gaps in `backend/src/nodes/mirror/aduana_sentinel_node.ts` to achieve GREEN status.

## Phase 2: Graph Formatter Testing
- [x] 2.1 Create `backend/src/tests/graphFormatter.test.ts`.
- [x] 2.2 Implement test for standard node update (verify first `yield`).
- [x] 2.3 Implement test for security update (verify second `yield` when `is_malicious` is present).
- [x] 2.4 Verify formatting of `security_report` in the SSE payload.

## Phase 3: Integration & Finalization
- [x] 3.1 Run full test suite: `npm run test`.
- [x] 3.2 Update `AGENTS.md` and `task.md` if necessary to reflect implementation details.
- [x] 3.3 Prepare changes for merge to `develop`.
