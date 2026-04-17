"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentStream } from "@/helpers/useAgentStream";
import { Zap, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// Nuevos componentes modulares
import { OrchestrationGraph } from "@/components/dashboard/OrchestrationGraph";
import { ReasoningFeed } from "@/components/dashboard/ReasoningFeed";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { StrategyCard } from "@/components/dashboard/StrategyCard";

/**
 * Dashboard de Mission Control (v2.0 - Premium Edition)
 */
export default function Dashboard() {
  const { 
    thoughts, 
    isStreaming, 
    isWaiting,
    startStream, 
    approvePlan,
    activeNode, 
    currentPlan, 
    completedSteps,
    executiveSummary,
    threadId
  } = useAgentStream();

  return (
    <div className="relative h-full flex flex-col gap-6 overflow-hidden">
      {/* Visualización Principal y Sidebar */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Panel Izquierdo: GRAFO (3/4) */}
        <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
          <div className="flex-1 glass-dark rounded-2xl relative overflow-hidden group border-white/5 shadow-[0_0_40px_-15px_rgba(59,130,246,0.1)]">
            {/* Overlay de Espera (HITL v2 - Non-intrusive but Urgent) */}
            <AnimatePresence>
              {isWaiting && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="max-w-md w-full glass rounded-3xl p-8 border-blue-500/50 glow-blue flex flex-col items-center text-center gap-6"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <ShieldAlert size={40} className="text-blue-400" />
                      </div>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-blue-500 rounded-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Plan de Vuelo Listo</h3>
                      <p className="text-sm text-slate-400 font-medium">
                        El CEO ha finalizado el an&aacute;lisis estrat&eacute;gico. Se requiere validaci&oacute;n humana para iniciar el despliegue de los Workers.
                      </p>
                    </div>

                    <div className="w-full space-y-3">
                      <Button 
                        onClick={approvePlan} 
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-7 rounded-2xl gap-3 shadow-xl shadow-blue-900/40 transition-all active:scale-95 text-lg uppercase tracking-tight"
                      >
                        <Zap size={22} fill="white" />
                        Aprobar y Ejecutar
                      </Button>
                      <button className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold hover:text-white transition-colors py-2">
                        Rechazar y Modificar Intención
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <OrchestrationGraph activeNode={activeNode} />
            
            {/* Status indicators */}
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
               <div className="flex gap-1.5 items-center px-3 py-1.5 glass rounded-full ring-1 ring-white/10">
                  <div className={`w-2 h-2 rounded-full ${isStreaming ? "bg-emerald-500 animate-pulse" : "bg-blue-500"}`} />
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-300">
                    {isStreaming ? "Ejecución en vivo" : "Nodo en reposo"}
                  </span>
               </div>
               {threadId && (
                 <div className="px-3 py-1.5 glass rounded-full ring-1 ring-white/10 text-[9px] font-mono text-muted-foreground">
                   THREAD: {threadId.substring(0, 8)}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Estrategia y Feeds (1/4) */}
        <div className="hidden lg:flex flex-col gap-6 min-h-0">
          <div className="h-[40%] flex flex-col min-h-0">
            <StrategyCard 
              summary={executiveSummary || ""} 
              plan={currentPlan} 
              completedSteps={completedSteps} 
            />
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <ReasoningFeed 
              thoughts={thoughts} 
              isStreaming={isStreaming} 
            />
          </div>
        </div>
      </div>

      {/* Barra de Comandos (Fixed/Bottom) */}
      <div className="w-full max-w-5xl mx-auto pb-4">
        <CommandBar 
          onSend={startStream} 
          isStreaming={isStreaming} 
          isWaiting={isWaiting} 
        />
      </div>
    </div>
  );
}
