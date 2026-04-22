"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { type AgentThought } from "@/types/index";

import { useAgentStore } from "@/store/useAgentStore";

export const ReasoningFeed: React.FC = () => {
  const { thoughts, isStreaming } = useAgentStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thoughts, isStreaming]);

  return (
    <div className="flex flex-col h-full bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 bg-white/2 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group p-4 rounded-xl border transition-all duration-300 ${
                  thought.isPartial 
                    ? "bg-white/[0.05] border-white/20" 
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
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

                {/* Renderizado de Bloques Estructurados v2.1 (Pattern from Elite Leaks) */}
                {(!thought.isPartial && (thought.thought || thought.plan_steps || thought.verification)) && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-white/10">
                    {thought.thought && (
                      <div className="bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter block mb-1">Theoretical Analysis</span>
                        <p className="text-[11px] text-blue-100/80 italic leading-snug">{thought.thought}</p>
                      </div>
                    )}
                    {thought.plan_steps && (
                      <div className="bg-purple-500/5 p-3 rounded-lg border border-purple-500/10">
                        <span className="text-[9px] font-black text-purple-400 uppercase tracking-tighter block mb-1">Execution Plan</span>
                        <p className="text-[11px] text-purple-100/80 leading-snug whitespace-pre-line">{thought.plan_steps}</p>
                      </div>
                    )}
                    {thought.verification && (
                      <div className="bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                        <span className="text-[9px] font-black text-green-400 uppercase tracking-tighter block mb-1">Verification Bias</span>
                        <p className="text-[11px] text-green-100/80 leading-snug">{thought.verification}</p>
                      </div>
                    )}
                  </div>
                )}

                {thought.reasoning && !thought.isPartial && !thought.thought && thought.reasoning !== thought.text && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                      <span className="text-blue-400/50 not-italic font-black mr-1">REASONING:</span> 
                      {thought.reasoning}
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
