"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";
import { motion } from "framer-motion";
import { useAgentStore } from "@/store/useAgentStore";

mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "Inter, sans-serif",
});

/**
 * LiveSequenceDiagram: Renderiza el diagrama de secuencia en tiempo real.
 */
export const LiveSequenceDiagram: React.FC = () => {
  const lastDiagram = useAgentStore((s) => s.last_diagram);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastDiagram && containerRef.current) {
      containerRef.current.removeAttribute("data-processed");
      mermaid.contentLoaded();
      
      // Forzar re-renderizado si mermaid no lo detecta
      const renderDiagram = async () => {
        try {
          const { svg } = await mermaid.render("mermaid-diagram-svg", lastDiagram);
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        } catch (err) {
          console.error("Mermaid render error:", err);
        }
      };
      
      renderDiagram();
    }
  }, [lastDiagram]);

  if (!lastDiagram) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 opacity-50">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 animate-spin" />
        <span className="text-xs uppercase tracking-widest">Esperando traza de ejecución...</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full p-8 overflow-auto flex justify-center bg-black/20"
    >
      <div 
        ref={containerRef} 
        className="mermaid text-white min-w-full"
      >
        {lastDiagram}
      </div>
    </motion.div>
  );
};
