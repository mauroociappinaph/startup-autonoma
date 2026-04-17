"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, ListTodo, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StrategyCardProps {
  summary: string;
  plan: string[];
  completedSteps: string[];
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ summary, plan, completedSteps }) => {
  const isCompleted = (step: string) => completedSteps.includes(step);

  return (
    <div className="flex flex-col h-full bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 bg-white/2 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Target size={14} className="text-white/40" />
          Mission Strategy
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence mode="wait">
          {!summary ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center p-8 text-center text-[10px] text-muted-foreground italic space-y-4"
            >
              <div className="opacity-20 animate-pulse">
                <ListTodo size={40} />
              </div>
              <p className="uppercase tracking-widest font-black">No active mission protocol</p>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Executive Summary */}
              <div className="relative group">
                <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-blue-500/30"></div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-black uppercase text-blue-400 tracking-wider">Análisis CEO</span>
                  <Info size={10} className="text-blue-500/50" />
                </div>
                <p className="text-[12px] text-slate-200 leading-relaxed font-medium italic">
                  &quot;{summary}&quot;
                </p>
              </div>

              {/* Action Plan */}
              {plan.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[9px] font-black uppercase text-white/40 tracking-wider flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      Protocolo de Ejecución
                    </span>
                    <Badge variant="outline" className="text-[8px] bg-white/5 px-2 py-0 h-4 border-white/10">
                      {completedSteps.length}/{plan.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {plan.map((step, idx) => (
                      <motion.div 
                        key={step}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                          isCompleted(step) 
                            ? "bg-white/[0.04] border-white/10" 
                            : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-1.5 h-1.5 rounded-full shadow-lg ${
                            isCompleted(step) ? "bg-emerald-400" : "bg-slate-600 animate-pulse"
                          }`}></div>
                          <span className={`capitalize text-[11px] font-bold truncate tracking-tight transition-all duration-300 ${
                            isCompleted(step) ? "text-emerald-400/60 line-through" : "text-slate-300"
                          }`}>
                            {step.replace(/_/g, " ")}
                          </span>
                        </div>
                        {isCompleted(step) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-emerald-500/20 p-1 rounded-md"
                          >
                            <Check size={10} className="text-emerald-400" strokeWidth={4} />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
