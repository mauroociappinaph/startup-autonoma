# Specification - State Segregation (#185)

## Requirements

### R1: Global State Purity
The root level of `AgentStateType` must only contain fields related to orchestration, telemetry, and common metadata. All domain-specific fields must be moved to sub-objects.

### R2: Domain Contexts
The following sub-contexts must be initialized:
- `business`: For market research, lead generation, and sales logic.
- `software`: For code analysis, technical planning, and testing results.
- `operations`: For infrastructure, security audits, and deployment status.

### R3: Atomic Updates
Reducers must support partial updates to domain objects without wiping existing data within that domain (Deep Merge).

## Scenarios

### Scenario 1: Business Chief updates lead gen info
- **Given** a state with an empty `business` context.
- **When** the `BusinessChief` returns an update with `business: { lead_gen_payload: { niche: 'AI' } }`.
- **Then** the state should reflect the new payload within the `business` object.

### Scenario 2: Concurrent domain updates (Deep Merge)
- **Given** a state with `business: { qualified_leads: [...] }`.
- **When** a node updates `business: { market_research: '...' }`.
- **Then** the `business` object must contain BOTH `qualified_leads` and `market_research`.

## Acceptance Criteria
- [ ] `AgentStateType` in `@startup/shared` is refactored.
- [ ] `AgentAnnotation` in `backend/src/graph/state.ts` is updated with domain annotations and reducers.
- [ ] `BusinessChief` is refactored to use `state.business`.
- [ ] All tests in `backend/src/tests/` pass.
