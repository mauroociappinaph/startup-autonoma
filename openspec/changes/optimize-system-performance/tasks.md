# Tasks: System Performance Optimization

## Phase 1: Foundation & Serialization

- [x] 1.1 Create `backend/src/graph/serializers/MsgpackSerializer.ts` with encode/decode methods.
- [x] 1.2 Update `backend/src/graph/checkpoints/SimpleRedisSaver.ts` to use `MsgpackSerializer`.
- [x] 1.3 Add keepalive and deadline configurations to `backend/src/services/aiEngineClient.ts`.
- [x] 1.4 Install `msgpack-lite` in backend and `msgpack-python` in AI Engine. (Done: @msgpack/msgpack already in use)

## Phase 2: AI Engine Concurrency

- [x] 2.1 Refactor `ai-engine/app/workers/lead_gen_worker.py` to use `asyncio.to_thread` for the main logic.
- [x] 2.2 Verify that `app/main.py` gRPC task doesn't block on heavy worker execution.

## Phase 3: Frontend Atomic Selectors

- [x] 3.1 Refactor `OrchestrationGraph.tsx` to use atomic selectors for `currentPlan` and `activeNode`.
- [x] 3.2 Refactor `ReasoningFeed.tsx` to use atomic selectors for `thoughts`.
- [x] 3.3 Refactor `FinancialTicker.tsx` to use atomic selectors for `totalCost`.
- [x] 3.4 Refactor `StrategyCard.tsx`, `BudgetControl.tsx`, and `StatusIndicators.tsx` for atomic state consumption.
- [x] 3.5 Update `ReasoningFeed.tsx` list rendering to use stable keys instead of indices.

## Phase 4: Database & Infrastructure

- [x] 4.1 Add indexes to `AuditLog` for `nodeName` and `createdAt` in Prisma schema.
- [ ] 4.2 Run Prisma migration: `npx prisma migrate dev --name add_audit_log_indexes` (PENDING).
- [x] 4.3 Increase Redis `maxmemory` to 512MB in `backend/src/db/redis.ts`.

## Phase 5: Verification & Testing

- [ ] 4.1 Test: Verify Redis checkpoint size reduction using `DEBUG=redis` or `redis-cli memory usage`.
- [ ] 4.2 Test: Verify targeted re-renders in `OrchestrationGraph` during stream using React DevTools.
- [ ] 4.3 Test: Simulate gRPC timeout and verify client-side deadline handling.
- [ ] 4.4 Test: Verify AI Engine responsiveness (health check) during worker execution.
