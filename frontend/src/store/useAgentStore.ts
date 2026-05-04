import { create } from "zustand";
import { type AgentState, type BackendAgentState } from "@/types";
import { agentService } from "@/api/agents";

export const useAgentStore = create<AgentState>((set, get) => ({
  thoughts: [],
  isStreaming: false,
  isWaiting: false,
  activeNode: null,
  currentPlan: [],
  completedSteps: [],
  executiveSummary: null,
  threadId: "default-thread",
  projectId: null,
  last_diagram: null,
  nodeStats: {},
  totalTokens: 0,
  iterations: 0,
  totalCost: 0,
  maxUsdBudget: 10.0,

  setThoughts: (updater) => set((state) => ({ thoughts: updater(state.thoughts) })),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setIsWaiting: (isWaiting) => set({ isWaiting }),
  setActiveNode: (activeNode) => set({ activeNode }),
  setCurrentPlan: (currentPlan) => set({ currentPlan }),
  setCompletedSteps: (updater) => set((state) => ({ completedSteps: updater(state.completedSteps) })),
  setExecutiveSummary: (executiveSummary) => set({ executiveSummary }),
  setThreadId: (threadId) => set({ threadId }),
  
  setMaxUsdBudget: async (maxUsdBudget) => {
    const { projectId } = get();
    if (projectId) {
      await agentService.updateProjectBudget(projectId, maxUsdBudget);
    }
    set({ maxUsdBudget });
  },

  updateTelemetry: (data: { tokens?: number; iterations?: number; cost?: number }) => set((state: AgentState) => ({
    totalTokens: state.totalTokens + (data.tokens || 0),
    iterations: state.iterations + (data.iterations || 0),
    totalCost: state.totalCost + (data.cost || 0),
  })),

  fetchNodeStats: async () => {
    const { projectId } = get();
    if (!projectId) return;
    try {
      const stats = await agentService.getNodeTelemetry(projectId);
      set({ nodeStats: stats });
    } catch (error) {
      console.error("Error fetching node stats:", error);
    }
  },

  populateState: (state: BackendAgentState) => {
    set({
      activeNode: state.active_chief || state.next_node || null,
      currentPlan: state.plan || [],
      completedSteps: state.completed_steps || [],
      executiveSummary: state.executive_summary || null,
      totalTokens: state.token_usage?.total || 0,
      iterations: state.iteration_count || 0,
      totalCost: state.total_cost_usd || 0,
      maxUsdBudget: state.project_context?.maxUsdBudget || 10.0,
      projectId: state.project_context?.projectId || null,
      last_diagram: state.last_diagram || get().last_diagram,
    });
    // Si hay un projectId nuevo, fetch stats
    if (state.project_context?.projectId) {
      get().fetchNodeStats();
    }
  },

  resetSession: () => set({
    thoughts: [],
    isStreaming: false,
    isWaiting: false,
    activeNode: "mirror",
    currentPlan: [],
    completedSteps: [],
    executiveSummary: null,
    last_diagram: null,
    totalTokens: 0,
    iterations: 0,
    totalCost: 0,
    maxUsdBudget: 10.0,
    projectId: null,
  }),

  loadHistory: async (threadId: string) => {
    try {
      const { history, currentState } = await agentService.getHistory(threadId);
      
      // Convertir el historial a pensamientos (formato simplificado para el feed)
      // En una implementación real, el backend podría devolverlos ya formateados
      // Por ahora, usamos el currentState para repoblar lo visual.
      if (currentState) {
        get().populateState(currentState);
      }
      
      set({ threadId });
    } catch (error) {
      console.error("Error loading history:", error);
    }
  },

  rewindTo: async (checkpointId: string) => {
    const { threadId, thoughts } = get();
    try {
      set({ isWaiting: true });
      await agentService.rewind(threadId, checkpointId);
      
      // Limpiar pensamientos que ocurrieron después de este checkpoint
      const checkpointIndex = thoughts.findIndex(t => t.checkpointId === checkpointId);
      if (checkpointIndex !== -1) {
        set({ thoughts: thoughts.slice(0, checkpointIndex + 1) });
      }

      // Recargar el estado actual desde el backend para asegurar consistencia
      const { currentState } = await agentService.getHistory(threadId);
      if (currentState) {
        get().populateState(currentState);
      }
    } catch (error) {
      console.error("Error in rewind:", error);
    } finally {
      set({ isWaiting: false });
    }
  },
}));
