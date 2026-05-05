# Proposal: Sentinel SSE Verification (#143)

## Intent
Validate the implementation of security event streaming (Sentinel SSE) using TDD-retroactive approach to satisfy the project's quality standards and ensure long-term stability of the security perimeter.

## Scope
### In Scope
- Creation of `backend/src/tests/aduana_sentinel_node.test.ts` to verify RF-1, RF-2, and RF-3.
- Creation of `backend/src/tests/graphFormatter.test.ts` to verify correct SSE formatting for security events.
- Full verification of existing scenarios (1, 2, 3) defined in `openspec/specs/security/sse-event/spec.md`.
- Integration into the `develop` branch after successful local test execution.

### Out of Scope
- Adding new security analysis rules.
- Modifying the frontend dashboard.
- Redesigning the EventBus architecture.

## Capabilities
### New Capabilities
None.

### Modified Capabilities
- `security/sse-event`: Closing the verification gap by adding automated tests for existing requirements.

## Approach
Implement unit tests using Jest, mocking `LLMService` and `EventBus` to simulate different security scenarios (clean prompt, injection attempt, service error). Use `expect(SacredLogger.error).toHaveBeenCalled()` for error validation.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `backend/src/tests/aduana_sentinel_node.test.ts` | New | Node logic validation |
| `backend/src/tests/graphFormatter.test.ts` | New | SSE format validation |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Inconsistent EventBus mocks | Low | Use a dedicated mock that captures calls by channel |
| Jest VM modules overhead | Low | Use the standard test command with experimental flag |

## Rollback Plan
Since this change only adds tests, rollback is as simple as deleting the new test files. No impact on production code is expected.

## Dependencies
- `jest`
- `@langchain/core` (for message types in tests)

## Success Criteria
- [ ] 100% pass rate for `aduana_sentinel_node.test.ts`.
- [ ] 100% pass rate for `graphFormatter.test.ts`.
- [ ] Pipeline passes with the new tests included.
