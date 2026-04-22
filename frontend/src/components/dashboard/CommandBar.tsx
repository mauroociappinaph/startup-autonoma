"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Zap, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAgentStore } from "@/store/useAgentStore";

interface CommandBarProps {
  onSend: (input: string) => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({ onSend }) => {
  const { isStreaming, isWaiting } = useAgentStore();
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim() || isStreaming || isWaiting) return;
    onSend(input);
    setInput("");
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="p-1 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative"
    >
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Terminal size={18} className="text-white/40 group-focus-within:text-blue-500 transition-colors" />
            <span className="w-px h-4 bg-white/10"></span>
            <Hash size={14} className="text-muted-foreground opacity-50" />
          </div>
          
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Introduce directiva de misión..."
            autoFocus
            className="w-full bg-transparent border-none rounded-xl py-4 pl-16 pr-4 text-sm font-medium focus:outline-none focus:ring-0 placeholder:text-muted-foreground/30 transition-all disabled:opacity-50"
            disabled={isWaiting}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isStreaming || !input.trim() || isWaiting}
          className={`h-[48px] px-8 rounded-xl gap-3 transition-all duration-500 active:scale-95 ${
            isStreaming 
              ? "bg-white/10 text-white border border-white/20" 
              : "bg-white text-black hover:bg-white/90 shadow-xl shadow-white/5 border border-white/10"
          }`}
        >
          <span className="text-[11px] font-black uppercase tracking-wider">
            {isStreaming ? "Ejecutando" : "Lanzar Misión"}
          </span>
          {!isStreaming && <Zap size={16} fill="black" />}
        </Button>
      </div>
    </motion.div>
  );
};
