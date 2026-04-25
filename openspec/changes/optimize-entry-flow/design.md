# Design: Entry Flow Optimization

## Architecture Decisions

### 1. Model Tiering
- **AduanaSentinel**: Downgrade from `reasoning` to `fast`.
  - Rationale: Most prompt injections are recognizable by smaller models. Latency is the priority here.
- **Mirror**: Deprecated as a mandatory node.
  - Rationale: Sequential LLM calls are the main bottleneck. CEO can absorb intent refinement.

### 2. Graph Routing
- Change the conditional edge from `aduana_sentinel`.
- New mapping: `is_malicious ? "security_blocked" : "circuit_breaker"`.
- This removes `mirror` from the critical path.

### 3. CEO Context
- The CEO prompt will be updated to prioritize `state.original_prompt` or the last message from the user.
- Remove references to `refined_prompt` since it will no longer be populated by the Mirror node.

## Component Changes

### `aduana_sentinel_node.ts`
- Update `LLMService.getStructuredData` config.
- Simplify system prompt to reduce token count and processing time.

### `graph/index.ts`
- Update `addConditionalEdges` for `aduana_sentinel`.
- Update `START` -> `aduana_sentinel`.

### `nodes/ceo.ts`
- Update System Prompt to be self-sufficient in intent analysis.
- Remove `refined_prompt` usage logic.

## Verification Plan
- Use `src/test-run.ts` to measure the new latencies.
- Ensure security blocking still works with a test malicious prompt.
- Ensure CEO plans correctly without the Mirror's help.
