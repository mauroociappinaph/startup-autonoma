"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { motion } from "framer-motion";
import { Cpu, Zap, Shield, Network, Database, Terminal, TestTube } from "lucide-react";
import { type AgentNodeData } from "@startup/shared";
import { useAgentStore } from "@/store/useAgentStore";

const iconMap = {
  mirror: <Shield size={14} />,
  ceo: <Network size={14} />,
  chief: <Cpu size={14} />,
  researcher: <Terminal size={12} />,
  git_worker: <Terminal size={12} />,
  test_runner: <TestTube size={12} />,
  ai_engine_worker: <Zap size={12} />,
  persistence_worker: <Database size={12} />,
};

export const CustomAgentNode = memo(({ data }: NodeProps<Node<AgentNodeData>>) => {
  const { label, isActive, type, agentId } = data;
  const nodeStats = useAgentStore(s => s.nodeStats[agentId] || {});

  const getIcon = () => {
    if (type === "worker") return iconMap[agentId as keyof typeof iconMap] || <Terminal size={12} />;
    return iconMap[type as keyof typeof iconMap];
  };

  const isHighLatency = (nodeStats.last_latency || 0) > 500;

  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-white/20 border-none" />

      <motion.div
        animate={{
          scale: isActive ? 1.05 : 1,
          borderColor: isActive
            ? (isHighLatency ? "#ef4444" : "rgba(255, 255, 255, 0.4)")
            : "rgba(255, 255, 255, 0.1)",
        }}
        className={`px-4 py-2.5 rounded-xl border flex flex-col gap-2 min-w-[160px] transition-all duration-500 shadow-2xl ${
          isActive
            ? "bg-white/[0.08] backdrop-blur-xl border-white/40 ring-1 ring-white/20"
            : "bg-white/[0.02] backdrop-blur-md border-white/10 opacity-60"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${isActive ? "bg-white/10 text-white" : "text-muted-foreground"}`}>
            {getIcon()}
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 leading-none mb-1">
              {type}
            </span>
            <span className={`text-[12px] font-semibold tracking-tight ${isActive ? "text-white" : "text-muted-foreground"}`}>
              {label}
            </span>
          </div>
        </div>

        {nodeStats.last_latency && (
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
            <span className="text-[8px] font-mono text-muted-foreground/40 uppercase">
              {nodeStats.last_model.split("-").pop()}
            </span>
            <span className={`text-[9px] font-mono font-bold ${isHighLatency ? "text-red-400" : "text-blue-400"}`}>
              {Math.round(nodeStats.last_latency)}ms
            </span>
          </div>
        )}

        {isActive && (
          <motion.div
            layoutId="node-active-indicator"
            className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
          />
        )}
      </motion.div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-white/20 border-none" />
    </div>
  );
});

CustomAgentNode.displayName = "CustomAgentNode";
