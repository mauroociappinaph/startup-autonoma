# Proposal: Optimize Entry Flow (Fast Sentinel & Bypass Mirror)

## Goal
Reduce the initial response latency by streamlining the entry flow.
The current flow has two sequential reasoning nodes (`AduanaSentinel` and `Mirror`) before reaching the `CEO`. 
We will switch the Sentinel to a fast model and bypass the Mirror node to achieve a ~60-70% reduction in startup time.

## Proposed Changes
1. **AduanaSentinel**:
   - Change `LLMService.getStructuredData` config from `type: "reasoning"` to `type: "fast"`.
   - Update prompt to be more concise.
2. **Mirror Node**:
   - Bypass this node in `backend/src/graph/index.ts`.
   - Connect `aduana_sentinel` directly to `circuit_breaker`.
3. **CEO Node**:
   - Update System Prompt to remove references to "Mirror Node".
   - Give the CEO responsibility for intent refinement if needed.
4. **Graph Configuration**:
   - Update `backend/src/graph/index.ts` to route `aduana_sentinel` (if not malicious) to `circuit_breaker` directly.

## Impact
- Startup latency reduced from ~3s to <1s (with Groq).
- Better UX: faster first thought.
- Reduced token costs.

## Risks
- Slightly lower security detection if the `fast` model misses complex prompt injections (unlikely with current 8B models).
- CEO might need to handle more ambiguity.
