# Design: Sentinel SSE Verification (#143)

## Technical Approach
Implement retroactive unit tests for the security event pipeline. The strategy involves isolating the `aduana_sentinel_node` and `GraphFormatter` logic using Jest mocks for external services (`LLMService`, `EventBus`, `SacredLogger`) to verify compliance with existing specifications.

## Architecture Decisions

### Decision: Mocking Strategy for EventBus
**Choice**: Use `jest.spyOn` on the `EventBus` import within the test.
**Alternatives considered**: Creating a full integration test with Redis.
**Rationale**: Unit tests should be fast and deterministic. Redis is not needed to verify that the node correctly *attempts* to publish the event.

### Decision: Simulated LLM Verdicts
**Choice**: Manual creation of `AduanaSentinelSchema` objects in mocks.
**Alternatives considered**: Using actual LLM calls (E2E).
**Rationale**: E2E tests are expensive and flaky for security logic verification. Deterministic mocks allow testing "prosecutor vs defender" contradictions reliably.

## Data Flow
```
AduanaSentinelNode ───> LLMService (Judgment Day)
        │
        ├───────────────> SacredLogger (Telemetry)
        │
        └───────────────> EventBus (SECURITY_ANALYSIS) ───> SSE Clients
```

## File Changes
| File | Action | Description |
|------|--------|-------------|
| `backend/src/tests/aduana_sentinel_node.test.ts` | Create | Unit tests for security analysis and event emission. |
| `backend/src/tests/graphFormatter.test.ts` | Create | Unit tests for SSE message formatting. |

## Interfaces / Contracts
Existing `SecurityAnalysisEvent` and `StreamEvent` interfaces will be used. No new contracts are required.

## Testing Strategy
| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `aduana_sentinel_node` | Verify LLM calls, EventBus publication, and state updates. |
| Unit | `GraphFormatter.formatUpdate` | Verify SSE payload generation for security updates. |

## Migration / Rollout
No migration required.
