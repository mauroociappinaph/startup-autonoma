"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useAgentStream } from "@/hooks/useAgentStream";


// Nuevos componentes modulares
import {
  OrchestrationGraph,
  ReasoningFeed,
  CommandBar,
  StrategyCard,
  SystemHealth,
  FinancialTicker,
  HITLPanel,
  StatusIndicators,
  BudgetControl,
  LiveSequenceDiagram
} from "@/components/dashboard";
import { useAgentStore } from "@/store/useAgentStore";

/**
 * Dashboard de Mission Control
 */
export default function Dashboard() {
  const {
    startStream,
    approvePlan,
    rejectPlan,
    rewind
  } = useAgentStream();
  const { isWaiting } = useAgentStore();
  const [activeTab, setActiveTab] = React.useState<"topology" | "traces">("topology");

  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-black text-white">
      {/* Ticker Financiero (Fixed Top) */}
      <div className="flex-none">
        <FinancialTicker />
      </div>
      
      {/* Área de Trabajo Principal */}
      <main className="flex-1 flex flex-col min-h-0 p-6 pt-0 relative">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">

          {/* Panel Izquierdo: VISUALIZACIÓN (3/4) */}
          <div className="lg:col-span-3 flex flex-col min-h-0 bg-white/[0.02] rounded-3xl relative border border-white/5 shadow-2xl overflow-hidden">
            {/* Tab Switcher */}
            <div className="absolute top-6 right-6 z-20 flex bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/10 pointer-events-auto">
              <button
                onClick={() => setActiveTab("topology")}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === "topology" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-white/40 hover:text-white/70"}`}
              >
                Topology
              </button>
              <button
                onClick={() => setActiveTab("traces")}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === "traces" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-white/40 hover:text-white/70"}`}
              >
                Traces
              </button>
            </div>

            <div className="w-full h-full relative">
              {activeTab === "topology" ? (
                <OrchestrationGraph />
              ) : (
                <LiveSequenceDiagram />
              )}
            </div>

            <StatusIndicators />
          </div>

          {/* Panel Derecho: Estrategia y Métricas (1/4) */}
          <aside className="flex flex-col gap-4 min-h-0 lg:col-span-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="glass rounded-2xl p-4 border border-white/5 flex-none">
              <SystemHealth />
            </div>

            <div className="flex-none">
              <BudgetControl />
            </div>

            <div className="flex flex-col gap-4">
              <StrategyCard />
              <ReasoningFeed />
            </div>
          </aside>

        </div>

        {/* Barra de Comandos (Fixed Bottom Area) */}
        <div className="flex-none w-full max-w-4xl mx-auto pt-6 pb-2">
          <CommandBar onSend={startStream} />
        </div>
      </main>

      {/* Overlay de Interrupción (HITL) */}
      <AnimatePresence>
        {isWaiting && (
          <HITLPanel
            onApprove={approvePlan}
            onReject={rejectPlan}
            onRewind={rewind}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
