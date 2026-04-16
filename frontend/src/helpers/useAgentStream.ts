import { useState, useCallback } from "react";
import { type AgentThought } from "@/types/index.js";

/**
 * Hook para manejar el streaming de pensamientos desde el backend.
 */
export function useAgentStream() {
  const [thoughts, setThoughts] = useState<AgentThought[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = useCallback((prompt: string) => {
    setIsStreaming(true);
    setThoughts([]);

    const eventSource = new EventSource(`http://localhost:3001/api/agents/stream?prompt=${encodeURIComponent(prompt)}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        setThoughts(prev => [...prev, { agent: "ERROR", text: data.error, time: new Date().toLocaleTimeString() }]);
        eventSource.close();
        setIsStreaming(false);
        return;
      }
      
      setThoughts(prev => [...prev, data]);
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

    return () => {
      eventSource.close();
    };
  }, []);

  return { thoughts, isStreaming, startStream };
}
