# Specification: Human-in-the-Loop Gateways (#104)

## Functional Requirements

### 1. Interruption Flow
- The system MUST pause execution when a "Strategic Chief" (`ceo`, `operations_chief`) completes a task that requires authorization.
- The system MUST persist the state at the point of interruption using the `SimpleRedisSaver`.

### 2. Approval Logic
- Given a paused execution, when the user sends an `approved` status:
    - The system MUST set `is_mission_approved` to `true`.
    - The system MUST resume execution from the last node.
- Given a paused execution, when the user sends a `rejected` status with feedback:
    - The system MUST set `is_mission_approved` to `false`.
    - The system MUST inject a `HumanMessage` with the feedback.
    - The system MUST resume execution, ensuring it returns to the `ceo` node for re-evaluation.

### 3. Frontend Visualization
- The Dashboard MUST detect when the graph is in a "Waiting" state via SSE events.
- The `HITLPanel` MUST be displayed with clear "Authorize" and "Reject" actions.
- The "Rewind" feature MUST allow selecting any past checkpoint and restoring the system state to that point.

## Non-Functional Requirements
- **Latency**: The transition between approval and resumption SHOULD be under 500ms (excluding LLM processing).
- **Resilience**: The system MUST recover the "Waiting" state even after a server or client restart, provided the `threadId` is preserved.

## Acceptance Criteria
1. Agent stops at CEO -> UI shows "Authorization Required".
2. User clicks "Authorize" -> Agent proceeds to the next node.
3. User clicks "Reject" with "Use Python instead" -> Agent generates a new plan using the AI Engine.
4. User selects a past step in History and clicks "Rewind" -> The UI updates to show the state of that step.
