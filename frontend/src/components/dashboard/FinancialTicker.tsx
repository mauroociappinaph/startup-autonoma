"use client";

import React from "react";
import { DollarSign, TrendingUp, Clock, Globe } from "lucide-react";

import { useAgentStore } from "@/store/useAgentStore";

export const FinancialTicker: React.FC = () => {
  const { totalCost, isStreaming } = useAgentStore();
  return (
    <div className="w-full bg-black/40 backdrop-blur-md border-b border-white/5 py-1 px-6 flex items-center justify-between overflow-hidden relative group">
      {/* Luz de estado lateral (sutil) */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-colors duration-500 ${isStreaming ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-white/10"}`} />

      <div className="flex items-center gap-8 overflow-x-auto no-scrollbar py-1">
        
        {/* Metric: INVESTMENT */}
        <div className="flex items-center gap-3 min-w-fit">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <DollarSign size={12} className="text-amber-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-black text-amber-500/50 tracking-[0.2em] leading-none mb-1">Mission Investment</span>
            <span className="text-xs font-mono font-black text-white leading-none tracking-wider">
              {totalCost.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} <span className="text-[8px] text-white/30 ml-0.5">USD</span>
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/5" />

        {/* Metric: SYSTEM STATUS */}
        <div className="flex items-center gap-3 min-w-fit">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Globe size={12} className="text-blue-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-black text-blue-500/50 tracking-[0.2em] leading-none mb-1">Network Status</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-black text-white tracking-widest leading-none">Global Ready</span>
              <div className={`w-1 h-1 rounded-full ${isStreaming ? "bg-blue-500 animate-pulse" : "bg-white/20"}`} />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/5" />

        {/* Metric: AGENT EFFICIENCY */}
        <div className="flex items-center gap-3 min-w-fit">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <TrendingUp size={12} className="text-emerald-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-black text-emerald-500/50 tracking-[0.2em] leading-none mb-1">Efficiency</span>
            <span className="text-[10px] uppercase font-black text-white tracing-widest leading-none tracking-wider italic">Optimal Peak</span>
          </div>
        </div>
      </div>

      {/* Timestamp / Real-time clock */}
      <div className="hidden md:flex items-center gap-2 text-white/20">
        <Clock size={12} />
        <span className="text-[9px] font-mono tracking-tighter uppercase font-bold">UTC {new Date().getHours()}:00</span>
      </div>

      {/* Decorative scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
    </div>
  );
};
