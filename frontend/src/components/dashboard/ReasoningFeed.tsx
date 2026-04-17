"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { type AgentThought } from "@/types/index";

interface ReasoningFeedProps {
  thoughts: AgentThought[];
  isStreaming: boolean;
}

export const ReasoningFeed: React.FC<ReasoningFeedProps> = ({ thoughts, isStreaming }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thoughts, isStreaming]);

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
          Reasoning Stream
        </h3>
        {isStreaming && (
          <Badge variant="outline" className="text-[9px] bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse">
            LIVE
          </Badge>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
      >
        <AnimatePresence initial={false}>
          {thoughts.length === 0 && !isStreaming ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-40"
            >
              <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                <div className="w-2 h-2 bg-white/20 rounded-full"></div>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest italic">Awaiting instructions...</p>
            </motion.div>
          ) : (
            thoughts.map((thought, index) => (
              <motion.div
                key={`${thought.time}-${index}`}
                initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`group p-4 rounded-xl border transition-all duration-300 ${
                  thought.isPartial 
                    ? "bg-blue-500/5 border-blue-500/20 glow-blue" 
                    : "bg-white/5 border-white/5 hover:bg-white/[0.08]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`text-[9px] px-2 py-0 h-4 font-black uppercase rounded-sm ${
                        thought.agent === "CEO" ? "bg-blue-600 text-white" :
                        thought.agent === "SOFTWARE_CHIEF" ? "bg-purple-600 text-white" :
                        thought.agent === "BUSINESS_CHIEF" ? "bg-orange-600 text-white" :
                        thought.agent === "ERROR" ? "bg-red-600 text-white" :
                        "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {thought.agent}
                    </Badge>
                    {thought.isPartial && (
                      <span className="flex gap-1">
                        <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                    [{thought.time}]
                  </span>
                </div>
                
                <p className={`text-[12px] leading-relaxed tracking-tight ${
                  thought.isPartial ? "text-blue-100 font-medium" : "text-slate-300"
                }`}>
                  {thought.text}
                  {thought.isPartial && (
                    <motion.span 
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-1.5 h-3 ml-1 bg-blue-400 align-middle"
                    />
                  )}
                </p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
