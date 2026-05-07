"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAgentStore } from "@/store/useAgentStore";
import { RotateCcw, ShieldCheck, ShieldAlert, Gavel, Zap } from "lucide-react";

export const ReasoningFeed: React.FC = () => {
  const thoughts = useAgentStore(s => s.thoughts);
  const isStreaming = useAgentStore(s => s.isStreaming);
  const rewindTo = useAgentStore(s => s.rewindTo);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleRewind = async (checkpointId: string) => {
    if (window.confirm("¿Estás seguro de que querés retroceder el tiempo hasta este punto? Se perderán los pasos posteriores.")) {
      await rewindTo(checkpointId);
    }
  };

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
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth"
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
            thoughts.map((thought) => {
              // Si es un evento de seguridad detallado, usamos el renderizador profesional
              if (thought.security_audit) {
                return (
                  <motion.div
                    key={thought.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-xl shadow-xl overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Gavel className="w-16 h-16" />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Gavel className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Security Audit: Judgment Day</h4>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-tighter">Protocolo de Verificación Adversaria</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {/* Prosecutor Block */}
                      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                        <div className="flex items-center gap-1.5 mb-2">
                          <ShieldAlert className="w-3 h-3 text-red-500" />
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Prosecutor (Red Team)</span>
                        </div>
                        <p className="text-[11px] text-red-100/70 leading-snug italic">"{thought.security_audit.prosecutor}"</p>
                        <Badge variant="outline" className={`mt-2 text-[8px] h-4 ${thought.security_audit.prosecutor_is_injection ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                          {thought.security_audit.prosecutor_is_injection ? 'DETECTED' : 'CLEAR'}
                        </Badge>
                      </div>

                      {/* Defender Block */}
                      <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center gap-1.5 mb-2">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Defender (Blue Team)</span>
                        </div>
                        <p className="text-[11px] text-emerald-100/70 leading-snug italic">"{thought.security_audit.defender}"</p>
                        <Badge variant="outline" className={`mt-2 text-[8px] h-4 ${thought.security_audit.defender_is_injection ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {thought.security_audit.defender_is_injection ? 'FLAGGED' : 'SAFE'}
                        </Badge>
                      </div>
                    </div>

                    {/* Verdict Banner */}
                    <div className={`p-4 rounded-xl border space-y-3 ${
                      thought.security_audit.verdict === 'safe' 
                        ? 'bg-blue-600/10 border-blue-500/20 text-blue-100' 
                        : 'bg-red-600/10 border-red-500/20 text-red-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            thought.security_audit.verdict === 'safe' ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                          }`}>
                            {thought.security_audit.verdict === 'safe' ? <Zap className="w-4 h-4 text-white" /> : <ShieldAlert className="w-4 h-4 text-white" />}
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest block leading-none opacity-70">Security Verdict</span>
                            <span className="text-[14px] font-black tracking-tight">{thought.security_audit.verdict === 'safe' ? 'ACCESO PERMITIDO' : 'ACCESO BLOQUEADO'}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] border-white/20 uppercase">
                          {thought.agent}
                        </Badge>
                      </div>

                      {thought.security_audit.judge && (
                        <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                          <span className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground block mb-1">Judge Reasoning</span>
                          <p className="text-[11px] leading-relaxed italic opacity-90">
                            {thought.security_audit.judge}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[9px] font-mono opacity-50">
                        <span>THREAT_LEVEL: {(thought as any).threat_level || 'LOW'}</span>
                        <span>{thought.time}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                key={thought.id}
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
                  <div className="flex items-center gap-3">
                    {thought.checkpointId && !isStreaming && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                        onClick={() => handleRewind(thought.checkpointId!)}
                        title="Retroceder a este punto"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    )}
                    <span className="text-[9px] font-mono text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                      [{thought.time}]
                    </span>
                  </div>
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
                {(thought.thought || thought.plan_steps || thought.verification) && (
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
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
