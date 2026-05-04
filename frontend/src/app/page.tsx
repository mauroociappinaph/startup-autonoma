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
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Ticker Financiero (Gap 6 - Premium Telemetry) */}
      <FinancialTicker />

      {/* Contenedor Principal con Padding */}
      <div className="flex-1 flex flex-col gap-6 p-6 min-h-0">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">

          {/* Panel Izquierdo: VISUALIZACIÓN (3/4) */}
          <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
            <div className="flex-1 bg-white/[0.02] rounded-3xl relative overflow-hidden border border-white/5 shadow-2xl flex flex-col">

              {/* Tab Switcher */}
              <div className="absolute top-6 right-6 z-20 flex bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10 pointer-events-auto">
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

              <div className="flex-1 relative">
                {activeTab === "topology" ? (
                  <OrchestrationGraph />
                ) : (
                  <LiveSequenceDiagram />
                )}
              </div>

              {/* Status indicators se manejarán internamente o mediante otro componente si fuera necesario */}
              <StatusIndicators />
            </div>
          </div>

          {/* Panel Derecho: Estrategia y Métricas (1/4) */}
          <div className="hidden lg:flex flex-col gap-4 min-h-0">
            <div className="glass rounded-2xl p-4 border border-white/5">
              <SystemHealth />
            </div>

            <BudgetControl />

            <div className="flex-1 flex flex-col min-h-0 gap-4">
              <div className="flex-[0.45] min-h-[180px]">
                <StrategyCard />
              </div>
              <div className="flex-[0.55] min-h-[250px]">
                <ReasoningFeed />
              </div>
            </div>
          </div>

        </div>

        {/* Barra de Comandos (Fixed/Bottom) */}
        <div className="w-full max-w-4xl mx-auto pb-6">
          <CommandBar onSend={startStream} />
        </div>
      </div>

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
