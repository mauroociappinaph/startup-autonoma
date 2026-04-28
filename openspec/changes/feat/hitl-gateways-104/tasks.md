# Tasks: feat(hitl-gateways-104)

## Phase 1: Backend Fixes
- [ ] **T1** Refactor `AgentController.approve` in `backend/src/controllers/agentController.ts`:
    - Pass `status` and `feedback` to `GraphService.resumeAgent`.
    - Clean up unused/placeholder logic.
- [ ] **T2** Verify `GraphService.resumeAgent` in `backend/src/services/graphService.ts`:
    - Ensure `is_mission_approved` is correctly set.
    - Ensure `HumanMessage` injection works for rejections.

## Phase 2: Frontend Integration
- [ ] **T3** Verify `useAgentStream` and `agentService` connection:
    - Ensure `threadId` is persistent.
- [ ] **T4** UI Polish:
    - Ensure the `executiveSummary` is visible in the `HITLPanel` during pause.
    - Add a "Processing..." state to the buttons after clicking to prevent double submits.

## Phase 3: Verification
- [ ] **T5** Manual test:
    - Trigger a CEO plan.
    - Approve it.
    - Verify workers start.
- [ ] **T6** Manual test:
    - Trigger a CEO plan.
    - Reject it with feedback.
    - Verify CEO replans based on feedback.
- [ ] **T7** Manual test:
    - Use the History panel to Rewind to a previous step.
    - Verify the UI state updates correctly.
