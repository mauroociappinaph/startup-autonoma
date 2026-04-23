import { create } from "zustand";
import { type AgentState, type BackendAgentState } from "@startup/shared";

export const useAgentStore = create<AgentState>((set) => ({
  thoughts: [],
  isStreaming: false,
  isWaiting: false,
  activeNode: null,
  currentPlan: [],
  completedSteps: [],
  executiveSummary: null,
  threadId: "default-thread",
  totalTokens: 0,
  iterations: 0,
  totalCost: 0,

  setThoughts: (updater) => set((state) => ({ thoughts: updater(state.thoughts) })),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setIsWaiting: (isWaiting) => set({ isWaiting }),
  setActiveNode: (activeNode) => set({ activeNode }),
  setCurrentPlan: (currentPlan) => set({ currentPlan }),
  setCompletedSteps: (updater) => set((state) => ({ completedSteps: updater(state.completedSteps) })),
  setExecutiveSummary: (executiveSummary) => set({ executiveSummary }),
  setThreadId: (threadId) => set({ threadId }),

  updateTelemetry: (data: { tokens?: number; iterations?: number; cost?: number }) => set((state: AgentState) => ({
    totalTokens: state.totalTokens + (data.tokens || 0),
    iterations: state.iterations + (data.iterations || 0),
    totalCost: state.totalCost + (data.cost || 0),
  })),

  populateState: (state: BackendAgentState) => set({
    activeNode: state.active_chief || state.next_node || null,
    currentPlan: state.plan || [],
    completedSteps: state.completed_steps || [],
    executiveSummary: state.executive_summary || null,
    totalTokens: state.token_usage?.total || 0,
    iterations: state.iteration_count || 0,
    totalCost: state.total_cost_usd || 0,
  }),

  resetSession: () => set({
    thoughts: [],
    isStreaming: false,
    isWaiting: false,
    activeNode: "mirror",
    currentPlan: [],
    completedSteps: [],
    executiveSummary: null,
    totalTokens: 0,
    iterations: 0,
    totalCost: 0,
  }),
}));
