import { create } from "zustand";
import { type AgentThought } from "@/types/index";

interface AgentState {
  // Estado del Grafo
  thoughts: AgentThought[];
  isStreaming: boolean;
  isWaiting: boolean;
  activeNode: string | null;
  currentPlan: string[];
  completedSteps: string[];
  executiveSummary: string | null;
  threadId: string;
  
  // Telemetría
  totalTokens: number;
  iterations: number;
  totalCost: number;

  // Acciones (Setters)
  setThoughts: (updater: (prev: AgentThought[]) => AgentThought[]) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setIsWaiting: (isWaiting: boolean) => void;
  setActiveNode: (node: string | null) => void;
  setCurrentPlan: (plan: string[]) => void;
  setCompletedSteps: (updater: (prev: string[]) => string[]) => void;
  setExecutiveSummary: (summary: string | null) => void;
  setThreadId: (id: string) => void;
  
  updateTelemetry: (data: { tokens?: number; iterations?: number; cost?: number }) => void;
  resetSession: () => void;
}

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

  updateTelemetry: (data) => set((state) => ({
    totalTokens: state.totalTokens + (data.tokens || 0),
    iterations: state.iterations + (data.iterations || 0),
    totalCost: state.totalCost + (data.cost || 0),
  })),

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
