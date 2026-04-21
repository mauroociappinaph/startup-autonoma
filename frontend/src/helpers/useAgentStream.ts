import { useState, useCallback, useRef, useEffect } from "react";
import { type AgentThought } from "@/types/index";
import { parseAgentThought } from "./xmlParser";

/**
 * Hook para manejar el streaming de pensamientos desde el backend.
 */
export function useAgentStream() {
  const [thoughts, setThoughts] = useState<AgentThought[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState<string | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string>("default-thread");
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [iterations, setIterations] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  
  const eventSourceRef = useRef<EventSource | null>(null);

  const processEvent = useCallback((data: AgentThought) => {
    if (data.error) {
      setThoughts(prev => [...prev, { agent: "ERROR", text: data.error as string, time: new Date().toLocaleTimeString() }]);
      setIsStreaming(false);
      setIsWaiting(false);
      setActiveNode(null);
      return false;
    }
    
    if (data.text) {
      const parsed = parseAgentThought(data.text);
      data.thought = parsed.thought;
      data.plan_steps = parsed.plan;
      data.verification = parsed.verification;
    }

    if (data.activeNode) setActiveNode(data.activeNode);
    if (data.plan && data.plan.length > 0) setCurrentPlan(data.plan);
    if (data.completedSteps && data.completedSteps.length > 0) {
      setCompletedSteps(prev => Array.from(new Set([...prev, ...data.completedSteps!])));
    }
    if (data.executiveSummary) setExecutiveSummary(data.executiveSummary);
    if (data.isWaiting) setIsWaiting(true);
    if (data.threadId) setCurrentThreadId(data.threadId);
    if (data.token_usage) {
      setTotalTokens(prev => prev + (data.token_usage?.total || 0));
    }
    if (data.iteration_count !== undefined) {
      setIterations(prev => prev + (data.iteration_count || 0));
    }
    if (data.total_cost_usd !== undefined) {
      setTotalCost(prev => prev + (data.total_cost_usd || 0));
    }
    
    setThoughts(prev => {
      let next: AgentThought[];
      
      // Si es un token parcial, lo acumulamos en el último pensamiento si coincide el agente
      if (data.isPartial) {
        const last = prev[prev.length - 1];
        if (last && last.isPartial && last.agent === data.agent) {
          const updated = { ...last, text: last.text + data.text };
          next = [...prev.slice(0, -1), updated];
        } else {
          next = [...prev, { ...data, time: new Date().toLocaleTimeString() }];
        }
      } else {
        // Si es un mensaje completo, verificamos si hay un parcial previo del mismo agente para reemplazarlo
        const last = prev[prev.length - 1];
        if (last && last.isPartial && last.agent === data.agent) {
          next = [...prev.slice(0, -1), data];
        } else {
          next = [...prev, data];
        }
      }

      // Aplicar límite de historia (State Bloat protection)
      const limit = 100;
      return next.length > limit ? next.slice(-limit) : next;
    });

    return true;
  }, []);

  const startStream = useCallback((prompt: string) => {
    setIsStreaming(true);
    setIsWaiting(false);
    setThoughts([]);
    setActiveNode("mirror");
    setCurrentPlan([]);
    setCompletedSteps([]);
    setExecutiveSummary(null);
    setTotalTokens(0);
    setIterations(0);
    setTotalCost(0);

    const eventSource = new EventSource(`/api/agents/stream?prompt=${encodeURIComponent(prompt)}&threadId=${currentThreadId}`);
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
      setIsStreaming(false);
    });

    eventSource.onerror = (err) => {
      console.error("❌ EventSource error:", err);
      eventSource.close();
      eventSourceRef.current = null;
      setIsStreaming(false);
    };
  }, [currentThreadId, processEvent]);

  // Limpieza global de conexiones al desmontar el hook
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        console.log("🧹 Cerrando conexión de stream por desmontaje");
        eventSourceRef.current.close();
      }
    };
  }, []);

  /**
   * Envía la aprobación para continuar el plan.
   */
  const approvePlan = useCallback(async () => {
    setIsStreaming(true);
    setIsWaiting(false);

    try {
      const response = await fetch('/api/agents/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: currentThreadId, status: 'approved' })
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
              setIsStreaming(false);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error al aprobar:', error);
      setThoughts(prev => [...prev, { agent: "ERROR", text: "Error en la aprobación del plan.", time: new Date().toLocaleTimeString() }]);
      setIsStreaming(false);
    }
  }, [currentThreadId, processEvent]);

  /**
   * Rechaza el plan con feedback.
   */
  const rejectPlan = useCallback(async (feedback: string) => {
    setIsStreaming(true);
    setIsWaiting(false);

    try {
      const response = await fetch('/api/agents/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: currentThreadId, status: 'rejected', feedback })
      });

      if (!response.ok) throw new Error('Fallo en el rechazo');
      // Similar al approve, procesamos el stream de retorno al CEO
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
            if (line.startsWith('event: end')) setIsStreaming(false);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error al rechazar:', error);
      setIsStreaming(false);
    }
  }, [currentThreadId, processEvent]);

  /**
   * Retrocede el estado a un checkpoint.
   */
  const rewind = useCallback(async (checkpointId: string) => {
    try {
      const response = await fetch('/api/agents/rewind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: currentThreadId, checkpointId })
      });
      if (response.ok) {
        // Recargar la página o resetear el estado local
        window.location.reload(); 
      }
    } catch (error) {
      console.error('❌ Error en rewind:', error);
    }
  }, [currentThreadId]);

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
    threadId: currentThreadId
  };
}
