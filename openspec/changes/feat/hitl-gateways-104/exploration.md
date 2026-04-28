# Exploration: Human-in-the-Loop Gateways Integration (#104)

## Context
The "Autonomous Startup" requires human approval for critical operations (e.g., deployments, budget exceeded, significant strategy changes). The backend graph already includes `interruptAfter` and `interruptBefore` configuration, and the frontend has a `HITLPanel` component. However, the end-to-end integration is incomplete.

## Findings

### 1. Backend: AgentController.approve
- **Current State**: The `approve` method in `AgentController` receives `threadId`, `status`, and `feedback` from the request body.
- **Bug**: It calls `GraphService.resumeAgent(String(threadId))` without passing the `status` or `feedback` arguments.
- **Impact**: Rejections with feedback are treated as simple approvals (or ignore the feedback), and the `is_mission_approved` state isn't correctly updated in the graph.

### 2. Backend: GraphService.resumeAgent
- **Current State**: Supports `status` and `feedback`. Correcty uses `graph.updateState` to inject `HumanMessage` for rejections.
- **Verification**: Needs to ensure that injecting a `HumanMessage` correctly resets the `next` nodes of the graph to trigger the `ceo` node again.

### 3. Frontend: HITLPanel & useAgentStream
- **Current State**: `HITLPanel` is a high-fidelity component with Approve/Reject/History/Rewind buttons.
- **Integration**: `useAgentStream` calls `agentService.respondToPlan`, which fetches `/api/agents/approve`.
- **Latency**: The use of SSE in the `approve` endpoint is correct to provide real-time updates as the graph resumes.

### 4. Graph Configuration
- **Current State**: `interruptAfter: ["ceo", "operations_chief"]`.
- **Observation**: The `software_chief` and `business_chief` do not have interrupts. This is correct as per current laws (only strategic/infra decisions need approval).

## Proposed Fixes
1. Update `AgentController.approve` to pass `status` and `feedback` to `GraphService.resumeAgent`.
2. Verify that `GraphService.resumeAgent` correctly updates the state so the graph doesn't enter an infinite loop of interrupts.
3. Ensure the `HITLPanel` correctly displays the `executive_summary` of the plan that caused the interrupt.

## Conclusion
The technical foundation is solid. The missing piece is the "glue" in the controller and verifying the state transition during rejection.
