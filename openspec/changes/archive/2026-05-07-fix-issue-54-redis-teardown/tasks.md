# Tasks - Issue 54 Redis Teardown

- [x] **Phase 1: Analysis & Reproduction**
    - [x] Identify affected test files.
    - [x] Reproduce the hang using `detectOpenHandles`.
- [x] **Phase 2: Implementation**
    - [x] Update `backend/src/db/redis.ts` (if needed, to expose better status).
    - [x] Update `backend/src/tests/jest.setup.ts` with global env injection.
    - [x] Create `backend/src/tests/jest.teardown.ts` for global `afterAll`.
    - [x] Update `backend/jest.config.js` to integrate setup and teardown.
- [x] **Phase 3: Verification**
    - [x] Run full test suite with `--detectOpenHandles`.
    - [x] Verify clean exit in CI environment (local simulation).
- [x] **Phase 4: Documentation**
    - [x] Update `AGENTS.md` with the new test convention.
