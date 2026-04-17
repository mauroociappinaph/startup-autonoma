import { useState, useCallback } from "react";
import { type AgentThought } from "@/types/index";

/**
 * Hook para manejar el streaming de pensamientos desde el backend.
 */
export function useAgentStream() {
  const [thoughts, setThoughts] = useState<AgentThought[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState<string | null>(null);

  const startStream = useCallback((prompt: string) => {
    setIsStreaming(true);
    setThoughts([]);
    setActiveNode("mirror");
    setCurrentPlan([]);
    setCompletedSteps([]);
    setExecutiveSummary(null);

    const eventSource = new EventSource(`/api/agents/stream?prompt=${encodeURIComponent(prompt)}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as AgentThought;
      if (data.error) {
        setThoughts(prev => [...prev, { agent: "ERROR", text: data.error as string, time: new Date().toLocaleTimeString() }]);
        eventSource.close();
        setIsStreaming(false);
        setActiveNode(null);
        return;
      }
      
      if (data.activeNode) {
        setActiveNode(data.activeNode);
      }

      if (data.plan && data.plan.length > 0) {
        setCurrentPlan(data.plan);
      }

      if (data.completedSteps && data.completedSteps.length > 0) {
        setCompletedSteps(prev => Array.from(new Set([...prev, ...data.completedSteps!])));
      }

      if (data.executiveSummary) {
        setExecutiveSummary(data.executiveSummary);
      }
      
      setThoughts(prev => [...prev, data]);
    };

    eventSource.addEventListener("end", () => {
      console.log("🏁 Stream finalizado");
      eventSource.close();
      setIsStreaming(false);
      setActiveNode(null);
    });

    eventSource.onerror = (err) => {
      console.error("❌ EventSource error:", err);
      eventSource.close();
      setIsStreaming(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { 
    thoughts, 
    isStreaming, 
    startStream, 
    activeNode, 
    currentPlan, 
    completedSteps, 
    executiveSummary 
  };
}
