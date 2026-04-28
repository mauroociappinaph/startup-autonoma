# Proposal: Human-in-the-Loop Gateways Integration (#104)

## Objective
Enable a full control cycle where the user can approve, reject, or rewind the autonomous startup's state directly from the Dashboard.

## Proposed Changes

### Backend
1. **AgentController**:
    - Fix `approve` method to correctly extract `status` and `feedback` and pass them to `GraphService.resumeAgent`.
    - Ensure the response remains an SSE stream for continuity.
2. **GraphService**:
    - Enhance `resumeAgent` to handle the `is_mission_approved` flag correctly.
    - If `rejected`, ensure the `HumanMessage` is the last one in the list so the graph routes back to the CEO for re-planning.

### Frontend
1. **useAgentStream**:
    - Ensure `threadId` is consistently used for history and approval requests.
2. **HITLPanel**:
    - Verify that the `feedback` state is correctly sent to the backend.
    - Add visual feedback during the "Rewind" operation to show the state is being restored.

## Success Criteria
- The graph stops at `ceo` or `operations_chief`.
- The `HITLPanel` appears automatically in the dashboard.
- Clicking "Authorize" resumes the execution.
- Clicking "Reject" with feedback causes the agent to acknowledge the feedback and create a new plan.
- Rewind correctly restores the UI state to a previous point.

## Risks
- **Inconsistent State**: If the graph is resumed twice, it might cause duplicate executions. (Handled by checkpointer).
- **SSE Connection Loss**: If the browser refreshes during an interrupt, it must recover the "Waiting" state from the history.
