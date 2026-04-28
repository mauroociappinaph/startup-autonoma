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
  BudgetControl
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

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      {/* Ticker Financiero (Gap 6 - Premium Telemetry) */}
      <FinancialTicker />

      {/* Contenedor Principal con Padding */}
      <div className="flex-1 flex flex-col gap-6 p-6 min-h-0">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">

          {/* Panel Izquierdo: GRAFO (3/4) */}
          <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
            <div className="flex-1 bg-white/[0.02] rounded-3xl relative overflow-hidden border border-white/5 shadow-2xl">
              <OrchestrationGraph />

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
