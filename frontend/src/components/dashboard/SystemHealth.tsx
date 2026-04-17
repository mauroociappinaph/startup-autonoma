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

export const SystemHealth: React.FC = () => {
  const [metrics, setMetrics] = useState({
    latency: 24,
    cpu: 18,
    memory: 42,
    traffic: 5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        latency: Math.floor(20 + Math.random() * 15),
        cpu: Math.floor(15 + Math.random() * 20),
        memory: Math.floor(40 + Math.random() * 5),
        traffic: Math.floor(prev.traffic + Math.random() * 2) % 100
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Activity size={14} className="text-blue-500" />
          System Health
        </h3>
        <div className="flex items-center gap-1.5 py-1 px-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-black text-emerald-500 uppercase">Live Ops</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="Latency" value={metrics.latency} icon={<Zap size={12} />} unit="ms" />
        <Metric label="Node Load" value={metrics.cpu} icon={<Cpu size={12} />} unit="%" />
        <Metric label="Mem Cache" value={metrics.memory} icon={<Database size={12} />} unit="%" />
        <Metric label="Stream" value={metrics.traffic} icon={<Activity size={12} />} unit="%" />
      </div>

      <div className="mt-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-[9px] font-black uppercase text-blue-400 tracking-wider">AI Engine Status</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          gRPC tunnel operational. Payload verification active. 
        </p>
      </div>
    </div>
  );
};
