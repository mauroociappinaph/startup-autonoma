"use client";

import React, { useEffect } from "react";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  ConnectionLineType,
  Edge,
  Node
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CustomAgentNode } from "./CustomAgentNode";
import { type AgentNodeData } from "@/types/index";
import { motion } from "framer-motion";

const nodeTypes = {
  agentNode: CustomAgentNode,
};

interface OrchestrationGraphProps {
  activeNode: string | null;
}

const initialNodes: Node<AgentNodeData>[] = [
  { 
    id: "mirror", 
    type: "agentNode", 
    position: { x: 250, y: 0 }, 
    data: { label: "Mirror Node", isActive: false, type: "mirror", agentId: "mirror" } 
  },
  { 
    id: "ceo", 
    type: "agentNode", 
    position: { x: 250, y: 100 }, 
    data: { label: "CEO strategist", isActive: false, type: "ceo", agentId: "ceo" } 
  },
  { 
    id: "software_chief", 
    type: "agentNode", 
    position: { x: 50, y: 200 }, 
    data: { label: "Software Chief", isActive: false, type: "chief", agentId: "software_chief" } 
  },
  { 
    id: "business_chief", 
    type: "agentNode", 
    position: { x: 450, y: 200 }, 
    data: { label: "Business Chief", isActive: false, type: "chief", agentId: "business_chief" } 
  },
  // Workers
  { id: "researcher", type: "agentNode", position: { x: -100, y: 350 }, data: { label: "Researcher", isActive: false, type: "worker", agentId: "researcher" } },
  { id: "git_worker", type: "agentNode", position: { x: 50, y: 350 }, data: { label: "Git Worker", isActive: false, type: "worker", agentId: "git_worker" } },
  { id: "test_runner", type: "agentNode", position: { x: 200, y: 350 }, data: { label: "Test Runner", isActive: false, type: "worker", agentId: "test_runner" } },
  { id: "ai_engine_worker", type: "agentNode", position: { x: 450, y: 350 }, data: { label: "AI Engine", isActive: false, type: "worker", agentId: "ai_engine_worker" } },
  { id: "persistence_worker", type: "agentNode", position: { x: 600, y: 350 }, data: { label: "Persistence", isActive: false, type: "worker", agentId: "persistence_worker" } },
];

const initialEdges: Edge[] = [
  { id: "e-m-c", source: "mirror", target: "ceo", animated: true, type: ConnectionLineType.SmoothStep },
  { id: "e-c-s", source: "ceo", target: "software_chief", animated: true, type: ConnectionLineType.SmoothStep },
  { id: "e-c-b", source: "ceo", target: "business_chief", animated: true, type: ConnectionLineType.SmoothStep },
  // Links to workers
  { id: "e-s-r", source: "software_chief", target: "researcher", animated: true },
  { id: "e-s-g", source: "software_chief", target: "git_worker", animated: true },
  { id: "e-s-t", source: "software_chief", target: "test_runner", animated: true },
  { id: "e-b-a", source: "business_chief", target: "ai_engine_worker", animated: true },
  { id: "e-b-p", source: "business_chief", target: "persistence_worker", animated: true },
];

export const OrchestrationGraph: React.FC<OrchestrationGraphProps> = ({ activeNode }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isActive: node.id === activeNode,
        },
      }))
    );
    
    setEdges((eds) => 
      eds.map((edge) => ({
        ...edge,
        animated: edge.source === activeNode || edge.target === activeNode,
        style: { stroke: (edge.source === activeNode || edge.target === activeNode) ? "#3b82f6" : "rgba(255,255,255,0.1)", strokeWidth: (edge.source === activeNode || edge.target === activeNode) ? 2 : 1 },
      }))
    );
  }, [activeNode, setNodes, setEdges]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        className="bg-transparent"
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background 
          color="#333" 
          gap={30} 
          size={1} 
          className="opacity-20"
        />
        <Controls className="!bg-black/40 !border-white/10 !fill-white" />
      </ReactFlow>
      
      {/* Topology Header */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-4 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
            <h1 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Topology Matrix v3</h1>
          </div>
          <span className="text-[9px] text-muted-foreground font-mono mt-1 opacity-40">INTERACTIVE_GRAPH_MODE :: ZOOM_DRAG_ENABLED</span>
        </motion.div>
      </div>
    </div>
  );
};
