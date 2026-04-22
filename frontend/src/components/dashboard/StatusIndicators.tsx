"use client";

import React from "react";
import { useAgentStore } from "@/store/useAgentStore";

/**
 * Componente para visualizar el estado del procesamiento del Core y el ID del hilo actual.
 * Desacoplado para evitar re-renders innecesarios en el Dashboard principal.
 */
export const StatusIndicators: React.FC = () => {
  const { isStreaming, threadId } = useAgentStore();
  
  return (
    <div className="absolute bottom-8 left-8 flex items-center gap-4 pointer-events-none">
       <div className="flex gap-2 items-center px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
          <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "bg-white/20"}`} />
          <span className="text-[9px] uppercase font-black tracking-[0.2em] text-white/50">
            {isStreaming ? "Core processing active" : "Core idle"}
          </span>
       </div>
       {threadId && (
         <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-mono text-white/30 uppercase tracking-widest">
           UID: {threadId.substring(0, 8)}
         </div>
       )}
    </div>
  );
};
