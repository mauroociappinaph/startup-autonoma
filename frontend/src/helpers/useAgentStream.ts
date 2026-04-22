import { useCallback, useRef, useEffect } from "react";
import { type AgentThought } from "@/types/index";
import { parseAgentThought } from "./xmlParser";
import { useAgentStore } from "@/store/useAgentStore";

/**
 * Hook para manejar el streaming de pensamientos desde el backend.
 * Refactorizado para usar Zustand como State Manager Global.
 */
export function useAgentStream() {
  const store = useAgentStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  const processEvent = useCallback((data: AgentThought) => {
    if (data.error) {
      store.setThoughts(prev => [...prev, { agent: "ERROR", text: data.error as string, time: new Date().toLocaleTimeString() }]);
      store.setIsStreaming(false);
      store.setIsWaiting(false);
      store.setActiveNode(null);
      return false;
    }
    
    if (data.text) {
      const parsed = parseAgentThought(data.text);
      data.thought = parsed.thought;
      data.plan_steps = parsed.plan;
      data.verification = parsed.verification;
    }

    if (data.activeNode) store.setActiveNode(data.activeNode);
    if (data.plan && data.plan.length > 0) store.setCurrentPlan(data.plan);
    if (data.completedSteps && data.completedSteps.length > 0) {
      store.setCompletedSteps(prev => Array.from(new Set([...prev, ...data.completedSteps!])));
    }
    if (data.executiveSummary) store.setExecutiveSummary(data.executiveSummary);
    if (data.isWaiting) store.setIsWaiting(true);
    if (data.threadId) store.setThreadId(data.threadId);
    
    // Actualizar Telemetría vía Store
    store.updateTelemetry({
      tokens: data.token_usage?.total,
      iterations: data.iteration_count,
      cost: data.total_cost_usd
    });
    
    store.setThoughts(prev => {
      let next: AgentThought[];
      
      if (data.isPartial) {
        const last = prev[prev.length - 1];
        if (last && last.isPartial && last.agent === data.agent) {
          const updated = { ...last, text: last.text + data.text };
          next = [...prev.slice(0, -1), updated];
        } else {
          next = [...prev, { ...data, time: new Date().toLocaleTimeString() }];
        }
      } else {
        const last = prev[prev.length - 1];
        if (last && last.isPartial && last.agent === data.agent) {
          next = [...prev.slice(0, -1), data];
        } else {
          next = [...prev, data];
        }
      }

      const limit = 100;
      return next.length > limit ? next.slice(-limit) : next;
    });

    return true;
  }, [store]);

  const startStream = useCallback((prompt: string) => {
    store.resetSession();

    const eventSource = new EventSource(`/api/agents/stream?prompt=${encodeURIComponent(prompt)}&threadId=${store.threadId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const rawData = event.data;
        if (rawData === "execution_complete") return;
        
        const data = JSON.parse(rawData) as AgentThought;
        if (!processEvent(data)) {
          eventSource.close();
          eventSourceRef.current = null;
        }
      } catch (e) {
        console.error("❌ Error parseando stream:", e);
      }
    };

    eventSource.addEventListener("end", () => {
      console.log("🏁 Stream finalizado");
      eventSource.close();
      eventSourceRef.current = null;
      store.setIsStreaming(false);
    });

    eventSource.onerror = (err) => {
      console.error("❌ EventSource error:", err);
      eventSource.close();
      eventSourceRef.current = null;
      store.setIsStreaming(false);
    };
  }, [store, processEvent]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const approvePlan = useCallback(async () => {
    store.setIsStreaming(true);
    store.setIsWaiting(false);

    try {
      const response = await fetch('/api/agents/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: store.threadId, status: 'approved' })
      });

      if (!response.ok) throw new Error('Fallo en la aprobación');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const rawData = line.replace('data: ', '').trim();
              if (rawData === '"execution_complete"' || rawData === 'execution_complete') continue;
              
              try {
                const data = JSON.parse(rawData) as AgentThought;
                processEvent(data);
              } catch (e) {
                console.error("❌ Error parseando JSON en approve:", e, rawData);
              }
            }
            if (line.startsWith('event: end')) {
              store.setIsStreaming(false);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error al aprobar:', error);
      store.setThoughts(prev => [...prev, { agent: "ERROR", text: "Error en la aprobación del plan.", time: new Date().toLocaleTimeString() }]);
      store.setIsStreaming(false);
    }
  }, [store, processEvent]);

  const rejectPlan = useCallback(async (feedback: string) => {
    store.setIsStreaming(true);
    store.setIsWaiting(false);

    try {
      const response = await fetch('/api/agents/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: store.threadId, status: 'rejected', feedback })
      });

      if (!response.ok) throw new Error('Fallo en el rechazo');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const rawData = line.replace('data: ', '').trim();
              try {
                const data = JSON.parse(rawData) as AgentThought;
                processEvent(data);
              } catch (e) {}
            }
            if (line.startsWith('event: end')) store.setIsStreaming(false);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error al rechazar:', error);
      store.setIsStreaming(false);
    }
  }, [store, processEvent]);

  const rewind = useCallback(async (checkpointId: string) => {
    try {
      const response = await fetch('/api/agents/rewind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: store.threadId, checkpointId })
      });
      if (response.ok) {
        window.location.reload(); 
      }
    } catch (error) {
      console.error('❌ Error en rewind:', error);
    }
  }, [store.threadId]);

  return { 
    thoughts: store.thoughts, 
    isStreaming: store.isStreaming, 
    isWaiting: store.isWaiting,
    startStream, 
    approvePlan,
    rejectPlan,
    rewind,
    activeNode: store.activeNode, 
    currentPlan: store.currentPlan, 
    completedSteps: store.completedSteps, 
    executiveSummary: store.executiveSummary,
    totalTokens: store.totalTokens,
    iterations: store.iterations,
    totalCost: store.totalCost,
    threadId: store.threadId
  };
}
