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
import { SystemHealth } from "@/components/dashboard/SystemHealth";

/**
 * Dashboard de Mission Control (v3.0 - Minimalist & Interactive)
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
      {/* Visualización Principal y Sidebar de Métricas */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Panel Izquierdo: GRAFO (3/4) */}
        <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
          <div className="flex-1 bg-white/[0.02] rounded-3xl relative overflow-hidden border border-white/5 shadow-2xl">
            {/* Overlay de Espera (HITL v3 - Super Minimal) */}
            <AnimatePresence>
              {isWaiting && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xl flex items-center justify-center p-6"
                >
                  <motion.div 
                    initial={{ scale: 0.98, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="max-w-md w-full glass rounded-3xl p-10 border-white/20 flex flex-col items-center text-center gap-8 shadow-[0_0_50px_rgba(255,255,255,0.05)]"
                  >
                    <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20">
                      <ShieldAlert size={32} className="text-blue-500" />
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-black text-white uppercase tracking-widest italic">Awaiting Authorization</h3>
                      <p className="text-[13px] text-slate-400 font-medium leading-relaxed">
                        The CEO Strategist has finalized the mission protocol. 
                        Please review the strategy and authorize the execution cycle.
                      </p>
                    </div>

                    <div className="w-full space-y-4 pt-4 border-t border-white/5">
                      <Button 
                        onClick={approvePlan} 
                        className="w-full bg-white text-black hover:bg-white/90 font-black py-8 rounded-2xl gap-3 transition-all active:scale-95 text-base uppercase tracking-widest shadow-xl shadow-white/5"
                      >
                        <Zap size={18} fill="black" />
                        Authorize Mission
                      </Button>
                      <button className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-bold hover:text-white transition-colors">
                        Modify INTENT_PROMPT
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <OrchestrationGraph activeNode={activeNode} />
            
            {/* Status indicators */}
            <div className="absolute bottom-8 left-8 flex items-center gap-4">
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
          </div>
        </div>

        {/* Panel Derecho: Estrategia y Métricas (1/4) */}
        <div className="hidden lg:flex flex-col gap-6 min-h-0">
          <div className="glass rounded-2xl p-4 border border-white/5">
            <SystemHealth />
          </div>
          
          <div className="flex-1 flex flex-col min-h-0 gap-6">
            <div className="h-[45%]">
              <StrategyCard 
                summary={executiveSummary || ""} 
                plan={currentPlan} 
                completedSteps={completedSteps} 
              />
            </div>
            <div className="flex-1">
              <ReasoningFeed 
                thoughts={thoughts} 
                isStreaming={isStreaming} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Comandos (Fixed/Bottom) */}
      <div className="w-full max-w-4xl mx-auto pb-6">
        <CommandBar 
          onSend={startStream} 
          isStreaming={isStreaming} 
          isWaiting={isWaiting} 
        />
      </div>
    </div>
  );
}
