import { useState, useCallback } from "react";
import { type AgentThought } from "@/types/index";

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

  const processEvent = useCallback((data: AgentThought) => {
    if (data.error) {
      setThoughts(prev => [...prev, { agent: "ERROR", text: data.error as string, time: new Date().toLocaleTimeString() }]);
      setIsStreaming(false);
      setIsWaiting(false);
      setActiveNode(null);
      return false;
    }
    
    if (data.activeNode) setActiveNode(data.activeNode);
    if (data.plan && data.plan.length > 0) setCurrentPlan(data.plan);
    if (data.completedSteps && data.completedSteps.length > 0) {
      setCompletedSteps(prev => Array.from(new Set([...prev, ...data.completedSteps!])));
    }
    if (data.executiveSummary) setExecutiveSummary(data.executiveSummary);
    if (data.isWaiting) setIsWaiting(true);
    if (data.threadId) setCurrentThreadId(data.threadId);
    
    setThoughts(prev => {
      // Si es un token parcial, lo acumulamos en el último pensamiento si coincide el agente
      if (data.isPartial) {
        const last = prev[prev.length - 1];
        if (last && last.isPartial && last.agent === data.agent) {
          const updated = { ...last, text: last.text + data.text };
          return [...prev.slice(0, -1), updated];
        }
        return [...prev, { ...data, time: new Date().toLocaleTimeString() }];
      } 
      
      // Si es un mensaje completo, verificamos si hay un parcial previo del mismo agente para reemplazarlo
      const last = prev[prev.length - 1];
      if (last && last.isPartial && last.agent === data.agent) {
        return [...prev.slice(0, -1), data];
      }
      
      return [...prev, data];
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

    const eventSource = new EventSource(`/api/agents/stream?prompt=${encodeURIComponent(prompt)}&threadId=${currentThreadId}`);

    eventSource.onmessage = (event) => {
      try {
        const rawData = event.data;
        if (rawData === "execution_complete") return;
        
        const data = JSON.parse(rawData) as AgentThought;
        if (!processEvent(data)) {
          eventSource.close();
        }
      } catch (e) {
        console.error("❌ Error parseando stream:", e);
      }
    };

    eventSource.addEventListener("end", () => {
      console.log("🏁 Stream finalizado");
      eventSource.close();
      setIsStreaming(false);
    });

    eventSource.onerror = (err) => {
      console.error("❌ EventSource error:", err);
      eventSource.close();
      setIsStreaming(false);
    };

    return () => eventSource.close();
  }, [currentThreadId, processEvent]);

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
        body: JSON.stringify({ threadId: currentThreadId })
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

  return { 
    thoughts, 
    isStreaming, 
    isWaiting,
    startStream, 
    approvePlan,
    activeNode, 
    currentPlan, 
    completedSteps, 
    executiveSummary,
    threadId: currentThreadId
  };
}
