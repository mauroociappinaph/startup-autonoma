## Exploration: Sentinel SSE Verification (#143)

### Current State
The core logic for emitting `SECURITY_ANALYSIS` events via the `EventBus` and formatting them for SSE in `GraphFormatter` is already implemented. However, it was done without a TDD approach, resulting in zero test coverage. The system is emitting events, but we have no automated way to verify they are correct or to prevent regressions as the security logic evolves.

### Affected Areas
- `backend/src/nodes/mirror/aduana_sentinel_node.ts` — Implements the security analysis and event emission. Needs verification that events are emitted correctly with the expected payload.
- `backend/src/helpers/graphFormatter.ts` — Formats graph updates into `StreamEvent` for the frontend. Needs verification that security updates are correctly yielded.
- `backend/src/tests/aduana_sentinel_node.test.ts` [NEW] — Will contain the unit tests for the sentinel node.
- `backend/src/tests/graphFormatter.test.ts` [NEW] — Will contain the unit tests for the SSE formatter.

### Approaches
1. **Verification-Only (TDD Retroactive)** — Implement the missing tests to verify existing logic and ensure robustness (e.g., handling edge cases like missing `trace_id`).
   - Pros: Completes the missing "Verification" phase of the original feature; minimal code changes to stable logic.
   - Cons: Doesn't add new security features (though none were requested).
   - Effort: Low

### Recommendation
Proceed with **Option 1**. The priority is to establish a testing baseline for the security flow to satisfy the project's quality standards and finalize the issue #143.

### Risks
- **Incomplete Mocks**: The sentinel node relies on `LLMService` and `EventBus`. Mocks must be precise to avoid false positives/negatives.
- **SSE Connection Leaks**: While testing formatter is safe, verifying the full SSE flow might require careful resource management in Jest.

### Ready for Proposal
Yes — The codebase is in a state where adding these tests is straightforward and will immediately add value by verifying the security perimeter.
