"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Cpu, Database, Zap } from "lucide-react";

interface MetricProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  unit: string;
}

const Metric: React.FC<MetricProps> = ({ label, value, icon, unit }) => (
  <div className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase font-bold tracking-widest pt-0.5">{label}</span>
      </div>
      <span className="text-[11px] font-mono font-medium text-white">{value}{unit}</span>
    </div>
    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className={`h-full ${value > 80 ? "bg-red-500" : value > 50 ? "bg-amber-500" : "bg-blue-500"} opacity-70`}
      />
    </div>
  </div>
);

interface SystemHealthProps {
  totalTokens?: number;
  iterations?: number;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ 
  totalTokens = 0, 
  iterations = 0 
}) => {
  const [metrics, setMetrics] = useState({
    latency: 24,
    cpu: 18, // Simulamos carga de CPU básica
    memory: 42,
  });

  // Límites definidos en el Circuit Breaker (Backend)
  const MAX_TOKENS = 100000;
  const MAX_ITERATIONS = 20;

  // Calculamos porcentajes de consumo para las barras de progreso
  const tokenPercent = Math.min((totalTokens / MAX_TOKENS) * 100, 100);
  const iterationPercent = Math.min((iterations / MAX_ITERATIONS) * 100, 100);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        latency: Math.floor(20 + Math.random() * 15),
        cpu: Math.floor(10 + Math.random() * 10),
        memory: Math.floor(38 + Math.random() * 5),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Activity size={14} className="text-blue-500" />
          Mission Telemetry
        </h3>
        <div className="flex items-center gap-1.5 py-1 px-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-black text-emerald-500 uppercase">Resilience Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric 
          label="Budget Use" 
          value={Number(tokenPercent.toFixed(1))} 
          icon={<Zap size={12} />} 
          unit="%" 
        />
        <Metric 
          label="Cycle Load" 
          value={Number(iterationPercent.toFixed(1))} 
          icon={<Cpu size={12} />} 
          unit="%" 
        />
        <Metric 
          label="Latency" 
          value={metrics.latency} 
          icon={<Activity size={12} />} 
          unit="ms" 
        />
        <Metric 
          label="Mem Cache" 
          value={metrics.memory} 
          icon={<Database size={12} />} 
          unit="%" 
        />
      </div>

      <div className="mt-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[9px] font-black uppercase text-blue-400 tracking-wider">Metrics Detail</span>
           </div>
           <span className="text-[8px] font-mono text-white/40 uppercase tracking-tighter">
             Limit: {MAX_TOKENS / 1000}k
           </span>
        </div>
        <div className="flex flex-col gap-1 text-[10px] font-medium text-slate-400">
           <div className="flex justify-between border-b border-white/5 pb-1">
             <span>Tokens:</span>
             <span className="text-white font-mono">{totalTokens.toLocaleString()}</span>
           </div>
           <div className="flex justify-between pt-1">
             <span>Steps:</span>
             <span className="text-white font-mono">{iterations} / {MAX_ITERATIONS}</span>
           </div>
        </div>
      </div>
    </div>
  );
};
