"use client";

import React from "react";
import { motion } from "framer-motion";
import { Share2, Zap, Shield, Cpu, Github, TestTube, Database, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NodeProps {
  id: string;
  label: string;
  isActive: boolean;
  type: "root" | "chief" | "worker";
  icon?: React.ReactNode;
}

const Node: React.FC<NodeProps> = ({ label, isActive, type, icon }) => {
  const variants = {
    inactive: { scale: 1, opacity: 0.5, filter: "blur(2px)" },
    active: { 
      scale: 1.1, 
      opacity: 1, 
      filter: "blur(0px)",
      transition: { type: "spring" as const, stiffness: 300, damping: 20 }
    }
  };

  const getStyle = () => {
    switch (type) {
      case "root": return isActive ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 glow-emerald" : "border-white/10 bg-white/5 text-muted-foreground";
      case "chief": return isActive ? "border-blue-500 bg-blue-500/10 text-blue-400 glow-blue scale-110" : "border-white/10 bg-white/5 text-muted-foreground";
      case "worker": return isActive ? "border-primary bg-primary/20 text-primary-foreground font-bold shadow-lg" : "border-white/5 bg-white/2 text-muted-foreground opacity-50";
    }
  };

  return (
    <motion.div
      variants={variants}
      animate={isActive ? "active" : "inactive"}
      className={`relative px-4 py-2 rounded-lg border transition-all duration-500 flex items-center gap-3 ${getStyle()}`}
    >
      {icon && <div className={`${isActive ? "animate-pulse" : ""}`}>{icon}</div>}
      <span className={`text-[11px] uppercase tracking-tighter ${type === "chief" ? "font-black" : "font-medium"}`}>
        {label}
      </span>
      {isActive && (
        <motion.div 
          layoutId="active-glow"
          className="absolute -inset-1 rounded-lg bg-current opacity-10 blur-xl px-2"
        />
      )}
    </motion.div>
  );
};

interface OrchestrationGraphProps {
  activeNode: string | null;
}

export const OrchestrationGraph: React.FC<OrchestrationGraphProps> = ({ activeNode }) => {
  const isActive = (id: string) => activeNode === id;

  const workers = [
    { id: "researcher", label: "Researcher", icon: <Cpu size={14} /> },
    { id: "git_worker", label: "Git", icon: <Github size={14} /> },
    { id: "test_runner", label: "Tests", icon: <TestTube size={14} /> },
    { id: "ai_engine_worker", label: "AI Engine", icon: <Zap size={14} /> },
    { id: "persistence_worker", label: "DB", icon: <Database size={14} /> }
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-6 p-8 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"></div>

      <Node id="mirror" label="Mirror Introspección" isActive={isActive("mirror")} type="root" icon={<Shield size={16} />} />
      
      <div className="w-px h-10 bg-gradient-to-b from-emerald-500/50 to-blue-500/50 relative">
        {isActive("mirror") && <motion.div initial={{ y: 0 }} animate={{ y: 40 }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute -left-[1px] w-[3px] h-4 bg-emerald-400 blur-[1px]" />}
      </div>

      <Node id="ceo" label="CEO Strategist" isActive={isActive("ceo")} type="chief" icon={<Network size={18} />} />

      <div className="w-px h-10 bg-gradient-to-b from-blue-500/50 to-purple-500/50 relative">
        {isActive("ceo") && <motion.div initial={{ y: 0 }} animate={{ y: 40 }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -left-[1px] w-[3px] h-4 bg-blue-400 blur-[1px]" />}
      </div>

      <div className="flex gap-16 relative">
        <Node id="software_chief" label="Software Chief" isActive={isActive("software_chief")} type="chief" icon={<Cpu size={16} />} />
        <Node id="business_chief" label="Business Chief" isActive={isActive("business_chief")} type="chief" icon={<Zap size={16} />} />
      </div>

      {/* Workers Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 flex flex-wrap justify-center gap-4 max-w-2xl px-4"
      >
        {workers.map(worker => (
          <Node key={worker.id} {...worker} isActive={isActive(worker.id)} type="worker" />
        ))}
      </motion.div>

      {/* Header Info */}
      <div className="absolute top-4 left-4 flex items-center gap-4 z-10">
        <div className="flex items-center gap-2">
          <Share2 size={16} className="text-blue-500" />
          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground pt-0.5">Topology Matrix</span>
        </div>
        <Badge variant="outline" className="text-[9px] font-mono border-white/10 bg-black/20 text-blue-400/70 py-0 h-5 px-3">
          SECURE-PROTOCOL_v2
        </Badge>
      </div>
    </div>
  );
};
