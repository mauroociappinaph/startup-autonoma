# Design - State Segregation (#185)

## Architecture Overview
The state management will transition from a flat structure to a hierarchical one. This reduces "prop drilling" of irrelevant fields to nodes and prepares the system for multiple simultaneous mission types.

## Implementation Details

### 1. Type Definitions (@startup/shared)
We will define interfaces for each domain and integrate them into `AgentStateType`.

```typescript
export interface BusinessContext {
  lead_gen_payload?: { niche: string; location?: string; limit: number };
  qualified_leads?: any[];
  market_research?: string;
}

export interface SoftwareContext {
  impact_analysis?: any;
  current_files?: string[];
}

export interface OperationsContext {
  infra_report?: string;
}
```

### 2. LangGraph Reducers (backend)
To support deep merging, we will use a custom reducer for the domain fields.

```typescript
const domainReducer = (prev: any, next: any) => ({
  ...(prev || {}),
  ...(next || {})
});

// In AgentAnnotation:
business: Annotation<BusinessContext | undefined>({
  reducer: domainReducer,
  default: () => undefined
}),
```

### 3. Migration Strategy
1. **Phase 1**: Add new fields to `AgentStateType` and `AgentAnnotation` WITHOUT removing old ones (Backward Compatibility).
2. **Phase 2**: Refactor `BusinessChief` to write to both old and new locations.
3. **Phase 3**: Refactor `BusinessChief` to only use new locations.
4. **Phase 4**: Remove old fields from `AgentStateType`.

## Affected Components
- `packages/shared/src/types/AgentState.types.ts`
- `backend/src/graph/state.ts`
- `backend/src/nodes/chiefs/business_chief.ts`
- `backend/src/helpers/index.ts` (if it touches these fields)

## Security Considerations
- Deep merging must be strictly typed to avoid injecting arbitrary keys into the domain objects.
