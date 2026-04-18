"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Zap, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HITLPanelProps {
  isOpen: boolean;
  threadId: string;
  activeNode: string | null;
  onApprove: () => void;
  onReject: (feedback: string) => void;
  onRewind: (checkpointId: string) => void;
}

export const HITLPanel: React.FC<HITLPanelProps> = ({ 
  isOpen, 
  threadId, 
  activeNode, 
  onApprove, 
  onReject, 
  onRewind 
}) => {
  const [feedback, setFeedback] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [mode, setMode] = useState<'decision' | 'history'>('decision');

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/agents/history/${threadId}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("Error fetching history:", e);
    } finally {
      setLoadingHistory(false);
    }
  }, [threadId]);

  useEffect(() => {
    if (isOpen && mode === 'history') {
      fetchHistory();
    }
  }, [isOpen, mode, fetchHistory]);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-2xl w-full glass rounded-[2.5rem] overflow-hidden border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <ShieldAlert className="text-blue-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest italic">Mission Control Authorization</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Waiting at: <span className="text-blue-400">{activeNode}</span></p>
            </div>
          </div>
          <div className="flex gap-2">
             <Button 
                variant={mode === 'decision' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setMode('decision')}
                className="rounded-full px-4 text-[10px] h-8 font-black uppercase tracking-widest"
             >
                Action
             </Button>
             <Button 
                variant={mode === 'history' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setMode('history')}
                className="rounded-full px-4 text-[10px] h-8 font-black uppercase tracking-widest"
             >
                History
             </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-white/10">
          <AnimatePresence mode="wait">
            {mode === 'decision' ? (
              <motion.div 
                key="decision"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="space-y-4 text-center">
                  <p className="text-[14px] text-slate-300 leading-relaxed font-medium">
                    The autonomous core has identified a critical decision point. 
                    Review the current strategy in the background feed and choose how to proceed.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4 hover:bg-white/[0.05] transition-colors group">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-400" size={20} />
                      <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">Green Light</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Proceed with the proposed plan without modification.</p>
                    <Button 
                      onClick={onApprove}
                      className="w-full bg-white text-black hover:bg-white/90 font-black h-12 rounded-xl uppercase tracking-widest text-[11px] group-hover:scale-[1.02] transition-transform"
                    >
                      Authorize Execution
                    </Button>
                  </div>

                  <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4 hover:bg-white/[0.05] transition-colors group">
                    <div className="flex items-center gap-3">
                      <XCircle className="text-red-400" size={20} />
                      <span className="text-[11px] font-black uppercase tracking-widest text-red-400">Red Light / Feedback</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">Stop current cycle and inject new instructions.</p>
                    <textarea 
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Enter instruction change..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[11px] text-white focus:outline-none focus:border-blue-500/50 min-h-[80px]"
                    />
                    <Button 
                      disabled={!feedback}
                      onClick={() => onReject(feedback)}
                      variant="outline"
                      className="w-full border-white/10 hover:bg-white/5 font-black h-12 rounded-xl uppercase tracking-widest text-[11px]"
                    >
                      Reject & Redraw Plan
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic flex items-center gap-2">
                     <RotateCcw size={12} /> Temporal Checkpoints
                   </h4>
                   <Badge variant="outline" className="text-[9px] border-white/10 opacity-50">{history.length} points</Badge>
                </div>

                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-40">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/30 animate-spin" />
                    <span className="text-[9px] uppercase font-black tracking-widest">Scanning History...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item, idx) => (
                      <div 
                        key={item.id} 
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all flex items-center justify-between group"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-blue-400">#{item.id?.substring(0, 8)}</span>
                            <Badge className="text-[8px] h-4 bg-white/5 border-white/10 text-slate-400">STEP {history.length - idx}</Badge>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 italic max-w-sm">
                            {item.values?.executive_summary || "Checkpoint preserved state"}
                          </p>
                        </div>
                        <Button 
                          onClick={() => onRewind(item.id)}
                          variant="ghost" 
                          size="sm" 
                          className="rounded-full h-8 px-4 text-[9px] font-black uppercase tracking-widest border border-white/5 hover:bg-white text-black opacity-0 group-hover:opacity-100 transition-all"
                        >
                          Rewind Here
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/[0.01] border-t border-white/5 flex justify-center">
           <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.3em] flex items-center gap-2">
             <Zap size={10} fill="currentColor" /> Autonomous Startup Ecosystem v3.0
           </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
