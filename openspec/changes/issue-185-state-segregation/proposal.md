# Proposal - State Segregation (#185)

## Goal
Implement domain-specific state segregation in `AgentStateType` and `AgentAnnotation` to decouple global orchestration from domain-specific data (Business, Software, Operations).

## Current Problem
The global `AgentStateType` contains top-level fields for specific domains (e.g., `lead_gen_payload`, `qualified_leads`). This violates the principle of separation of concerns and makes the state object harder to maintain as new domains are added.

## Proposed Changes

### 1. Refactor `AgentStateType` in `@startup/shared`
Move domain-specific fields into dedicated sub-objects.

```typescript
export interface AgentStateType {
  // --- Global / Core ---
  project_context?: ProjectContext;
  original_prompt: string;
  refined_prompt: string;
  messages: BaseMessage[];
  trace_id?: string;
  reasoning?: string;
  executive_summary: string;
  iteration_count: number;
  token_usage: { total: number; prompt: number; completion: number };
  total_cost_usd?: number;
  max_budget_reached?: boolean;
  retry_count: number;
  active_chief?: string;
  next_node?: string;
  last_recorded_tokens?: number;
  is_mission_approved?: boolean;
  is_malicious?: boolean;
  threat_level?: string;
  security_report?: string;
  last_diagram?: string;
  
  // --- New Domain Segregation ---
  business?: {
    lead_gen_payload?: { niche: string; location?: string; limit: number };
    qualified_leads?: any[];
    market_research?: string;
  };

  software?: {
    impact_analysis?: any;
    current_files?: string[];
  };

  operations?: {
    infra_report?: string;
  };

  [key: string]: unknown;
}
```

### 2. Update `AgentAnnotation` in `backend`
Define the new structure in LangGraph and implement deep-merge reducers for domain objects to prevent accidental overwrites.

### 3. Update Nodes
Refactor `BusinessChief`, `SoftwareChief`, and `OperationsChief` (if exists) to use the new nested paths.

## Risks
- **Breaking Changes**: All existing tests and nodes relying on `state.lead_gen_payload` will break until refactored.
- **Deep Merging**: LangGraph reducers must be carefully implemented to handle nested object updates correctly.

## Verification Plan
- **Unit Tests**: Update `state_reducers.test.ts` to verify deep merging of domain contexts.
- **Integration Tests**: Run `business_chief.test.ts` and `software_chief.test.ts` to ensure end-to-end functionality.
