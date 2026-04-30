import { useCallback, useRef, useEffect } from "react";
import { useAgentStore } from "@/store";
import { agentService, sseClient } from "@/api";
import { agentProcessor } from "@/services/agentProcessor";
import { type AgentThought } from "@/types/index";

/**
 * Hook orquestador para manejar el flujo de agentes.
 * Refactorizado para mayor estabilidad, desacoplamiento y mejor UX.
 */
export function useAgentStream() {
  // Selectores atómicos para evitar re-renders masivos (Optimización de Performance)
  const thoughts = useAgentStore(s => s.thoughts);
  const isStreaming = useAgentStore(s => s.isStreaming);
  const isWaiting = useAgentStore(s => s.isWaiting);
  const activeNode = useAgentStore(s => s.activeNode);
  const currentPlan = useAgentStore(s => s.currentPlan);
  const completedSteps = useAgentStore(s => s.completedSteps);
  const executiveSummary = useAgentStore(s => s.executiveSummary);
  const totalTokens = useAgentStore(s => s.totalTokens);
  const iterations = useAgentStore(s => s.iterations);
  const totalCost = useAgentStore(s => s.totalCost);
  const threadId = useAgentStore(s => s.threadId);

  // Acciones (no cambian, no necesitan selectores reactivos)
  const setThoughts = useAgentStore(s => s.setThoughts);
  const setIsStreaming = useAgentStore(s => s.setIsStreaming);
  const setIsWaiting = useAgentStore(s => s.setIsWaiting);
  const setActiveNode = useAgentStore(s => s.setActiveNode);
  const setCurrentPlan = useAgentStore(s => s.setCurrentPlan);
  const setCompletedSteps = useAgentStore(s => s.setCompletedSteps);
  const setExecutiveSummary = useAgentStore(s => s.setExecutiveSummary);
  const setThreadId = useAgentStore(s => s.setThreadId);
  const updateTelemetry = useAgentStore(s => s.updateTelemetry);
  const populateState = useAgentStore(s => s.populateState);
  const resetSession = useAgentStore(s => s.resetSession);

  // Objeto de acciones para el procesador (desacoplado del store global)
  const actions = {
    setThoughts,
    setIsStreaming,
    setIsWaiting,
    setActiveNode,
    setCurrentPlan,
    setCompletedSteps,
    setExecutiveSummary,
    setThreadId,
    updateTelemetry,
    resetSession
  };

  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = useCallback((prompt: string) => {
    // 3. Control de Leaks: Cerramos conexión previa si existe
    if (eventSourceRef.current) {
      console.log("♻️ Cerrando stream previo antes de iniciar uno nuevo");
      eventSourceRef.current.close();
    }

    resetSession();

    eventSourceRef.current = sseClient.connect(
      `/api/agents/stream?prompt=${encodeURIComponent(prompt)}&threadId=${threadId}`,
      {
        onData: (data) => agentProcessor.process(data as AgentThought, actions),
        onEnd: () => {
          console.log("🏁 Stream finalizado");
          setIsStreaming(false);
          eventSourceRef.current = null;
        },
        onError: (err) => {
          console.error("❌ EventSource error:", err);
          setIsStreaming(false);
          eventSourceRef.current = null;
        }
      }
    );
  }, [threadId, resetSession, setIsStreaming]);

  const approvePlan = useCallback(async () => {
    setIsStreaming(true);
    setIsWaiting(false);

    try {
      const reader = await agentService.respondToPlan({ 
        threadId, 
        status: 'approved' 
      });

      if (reader) {
        await sseClient.readStream(reader, {
          onData: (data) => agentProcessor.process(data as AgentThought, actions),
          onEnd: () => setIsStreaming(false),
          onError: (err) => {
            console.error('❌ Error en stream de aprobación:', err);
            setIsStreaming(false);
          }
        });
      }
    } catch (error) {
      console.error('❌ Error al aprobar:', error);
      agentProcessor.handleError("Error en la aprobación del plan.", actions);
    }
  }, [threadId, setIsStreaming, setIsWaiting]);

  const rejectPlan = useCallback(async (feedback: string) => {
    setIsStreaming(true);
    setIsWaiting(false);

    try {
      const reader = await agentService.respondToPlan({
        threadId,
        status: 'rejected',
        feedback
      });

      if (reader) {
        await sseClient.readStream(reader, {
          onData: (data) => agentProcessor.process(data as AgentThought, actions),
          onEnd: () => setIsStreaming(false),
          onError: (err) => {
            console.error('❌ Error en stream de rechazo:', err);
            setIsStreaming(false);
          }
        });
      }
    } catch (error) {
      console.error('❌ Error al rechazar:', error);
      setIsStreaming(false);
    }
  }, [threadId, setIsStreaming, setIsWaiting]);

  const rewind = useCallback(async (checkpointId: string) => {
    try {
      // 2. Eliminado window.location.reload() - UX de SPA real
      await agentService.rewind(threadId, checkpointId);
      
      // Recuperamos el estado del hilo después del rewind
      const { currentState } = await agentService.getHistory(threadId);
      if (currentState) {
        populateState(currentState);
      }
      
      console.log("⏪ Rewind completado y estado sincronizado");
    } catch (error) {
      console.error('❌ Error en rewind:', error);
    }
  }, [threadId, populateState]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    thoughts,
    isStreaming,
    isWaiting,
    startStream,
    approvePlan,
    rejectPlan,
    rewind,
    activeNode,
    currentPlan,
    completedSteps,
    executiveSummary,
    totalTokens,
    iterations,
    totalCost,
    threadId
  };
}
