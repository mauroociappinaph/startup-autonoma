# Tasks - Issue #217 Agent Sandbox

- [ ] **Phase 1: Foundation**
    - [ ] Audit `docker-compose.yml` to ensure `startup-sandbox` is correctly defined.
    - [ ] Update `backend/src/services/sandboxService.ts` with timeouts and basic safety checks.
- [ ] **Phase 2: Tooling**
    - [ ] Create `backend/src/tools/platform/terminal_tool.ts`.
    - [ ] Register `terminal_tool` in `backend/src/tools/index.ts`.
- [ ] **Phase 3: Integration**
    - [ ] Update `Software Chief` prompts to encourage use of the new sandboxed terminal.
    - [ ] Verify `test_runner` still works through the updated service.
- [ ] **Phase 4: Verification**
    - [ ] Test command isolation (trying to access host files).
    - [ ] Test timeout enforcement.
    - [ ] Test resource limits (optional, via docker stats).
