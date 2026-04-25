# Tasks: Entry Flow Optimization

- [ ] **Phase 1: Sentinel Optimization**
  - [ ] Modify `backend/src/nodes/mirror/aduana_sentinel_node.ts` to use `type: "fast"`.
  - [ ] Simplify Sentinel prompt.
- [ ] **Phase 2: Graph Refactor**
  - [ ] Update `backend/src/graph/index.ts` to bypass `mirror` node.
  - [ ] Route `aduana_sentinel` directly to `circuit_breaker`.
- [ ] **Phase 3: CEO Hardening**
  - [ ] Update `backend/src/nodes/ceo.ts` prompt to remove Mirror references.
  - [ ] Ensure CEO uses `original_prompt` or messages.
- [ ] **Phase 4: Verification**
  - [ ] Run `npx tsx src/test-run.ts "Hola"` and verify latency < 1.5s for entry.
  - [ ] Test malicious prompt to ensure Sentinel still blocks.
  - [ ] Verify CEO can still delegate correctly.
