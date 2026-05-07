# Specification: Sub-Graph Domain Isolation (Issue #213)

## Requirements
- **R1: Domain Segregation**: Every domain (Software, Business, Operations) must have its own internal graph.
- **R2: CEO Delegation**: The main graph should only see "Domain Entry Points" (The Chiefs).
- **R3: State Consistency**: Entering and exiting a sub-graph must preserve all relevant keys in `AgentStateType`.
- **R4: Recursive Reasoning**: Chiefs must be able to iterate with their workers internally without returning control to the CEO until the domain task is complete.

## Scenarios

### Scenario 1: Software Development Task
- **Given**: A user request for a code change.
- **When**: The CEO identifies it as a "Software" task.
- **Then**: The CEO delegates to the `software_domain` sub-graph.
- **And**: The `software_chief` coordinates with `git_worker` and `code_writer` inside the sub-graph.
- **And**: Control only returns to the CEO (or END) when the `software_chief` finishes the sub-flow.

### Scenario 2: Business Market Research
- **Given**: A request for market analysis.
- **When**: The CEO delegates to `business_domain`.
- **Then**: The `business_chief` manages the `researcher` and `ai_engine_worker` internally.
- **And**: The state updates are persisted via the shared checkpointer.
