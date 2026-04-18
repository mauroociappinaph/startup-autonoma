"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useAgentStream } from "@/helpers/useAgentStream";
import { Brain } from "lucide-react";

// Nuevos componentes modulares
import { OrchestrationGraph } from "@/components/dashboard/OrchestrationGraph";
import { ReasoningFeed } from "@/components/dashboard/ReasoningFeed";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { StrategyCard } from "@/components/dashboard/StrategyCard";
import { SystemHealth } from "@/components/dashboard/SystemHealth";
import { FinancialTicker } from "@/components/dashboard/FinancialTicker";
import { HITLPanel } from "@/components/dashboard/HITLPanel";

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
  } = useAgentStream();

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Ticker Financiero (Gap 6 - Premium Telemetry) */}
      <FinancialTicker totalCost={totalCost} isStreaming={isStreaming} />

      {/* Contenedor Principal con Padding */}
      <div className="flex-1 flex flex-col gap-6 p-6 min-h-0">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          
          {/* Panel Izquierdo: GRAFO (3/4) */}
          <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
            <div className="flex-1 bg-white/[0.02] rounded-3xl relative overflow-hidden border border-white/5 shadow-2xl">
              {/* HITL Gateway v3.0 */}
              <AnimatePresence>
                {isWaiting && (
                  <HITLPanel 
                    isOpen={isWaiting}
                    threadId={threadId}
                    activeNode={activeNode}
                    onApprove={approvePlan}
                    onReject={rejectPlan}
                    onRewind={rewind}
                  />
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
              <SystemHealth 
                totalTokens={totalTokens} 
                iterations={iterations} 
                totalCost={totalCost}
              />
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

      {/* Overlay de Interrupción (HITL) */}
      <HITLPanel 
        isOpen={isWaiting} 
        threadId={threadId} 
        activeNode={activeNode}
        onApprove={approvePlan}
        onReject={rejectPlan}
        onRewind={rewind}
      />
    </div>
  );
}
