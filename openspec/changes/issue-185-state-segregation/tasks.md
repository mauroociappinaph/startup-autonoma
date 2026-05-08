# Tasks - State Segregation (#185)

- [x] **Infrastructure & Types**
    - [x] Define `BusinessContext`, `SoftwareContext`, and `OperationsContext` in `packages/shared/src/types/AgentState.types.ts`.
    - [x] Update `AgentStateType` to include new domain fields.
    - [x] Implement `domainReducer` and update `AgentAnnotation` in `backend/src/graph/state.ts`.

- [x] **Node Refactoring (Phase 1: Business)**
    - [x] Update `BusinessChief` to read/write from `state.business`.
    - [x] Update `LeadQualificationSkill` (if it uses state directly) to expect the new structure.

- [x] **Node Refactoring (Phase 2: Software)**
    - [x] Update `SoftwareChief` to use `state.software`.
    - [x] Move `last_impact_analysis` (if applicable) to the software context.

- [x] **Cleanup & Finalization**
    - [x] Remove deprecated `lead_gen_payload` and `qualified_leads` from the root of `AgentStateType`.
    - [x] Remove deprecated fields from `AgentAnnotation`.

- [x] **Verification**
    - [x] Update `backend/src/tests/state_reducers.test.ts` to cover deep merging.
    - [x] Run full integration suite (`npm test`).
