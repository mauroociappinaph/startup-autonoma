"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Terminal, Zap, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommandBarProps {
  onSend: (input: string) => void;
  isStreaming: boolean;
  isWaiting: boolean;
}

export const CommandBar: React.FC<CommandBarProps> = ({ onSend, isStreaming, isWaiting }) => {
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
      className="p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Terminal size={18} className="text-blue-500 group-focus-within:animate-pulse" />
            <span className="w-px h-4 bg-white/10"></span>
            <Hash size={14} className="text-muted-foreground opacity-50" />
          </div>
          
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Introduce directiva de misión..."
            autoFocus
            className="w-full bg-transparent border-none rounded-xl py-4 pl-16 pr-4 text-sm font-medium focus:outline-none focus:ring-0 placeholder:text-muted-foreground/40 transition-all disabled:opacity-50"
            disabled={isWaiting}
          />
          
          <AnimatePresence>
            {input.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] uppercase font-black text-blue-400/50 pt-0.5 tracking-[0.2em]"
              >
                Ready to transmit
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isStreaming || !input.trim() || isWaiting}
          className={`h-[48px] px-8 rounded-xl gap-3 transition-all duration-500 active:scale-95 ${
            isStreaming 
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 glow-emerald" 
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 border border-blue-400/30"
          }`}
        >
          <span className="text-[11px] font-black uppercase tracking-wider">
            {isStreaming ? "Ejecutando" : "Lanzar Misión"}
          </span>
          {isStreaming ? (
            <div className="flex gap-0.5">
              <span className="w-1 h-1 bg-current rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          ) : (
            <Zap size={16} fill="white" className="drop-shadow-[0_0_8px_white]" />
          )}
        </Button>
      </div>
    </motion.div>
  );
};
