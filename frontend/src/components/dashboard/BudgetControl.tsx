"use client";

import React, { useState } from "react";
import { Wallet, ShieldAlert, Edit3, Check, X } from "lucide-react";
import { useAgentStore } from "@/store/useAgentStore";

export const BudgetControl: React.FC = () => {
  const totalCost = useAgentStore(s => s.totalCost);
  const maxUsdBudget = useAgentStore(s => s.maxUsdBudget);
  const setMaxUsdBudget = useAgentStore(s => s.setMaxUsdBudget);
  const [isEditing, setIsEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState(maxUsdBudget.toString());

  const progress = Math.min((totalCost / maxUsdBudget) * 100, 100);
  const isCritical = progress >= 90;
  const isWarning = progress >= 75;

  const handleSave = () => {
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val > 0) {
      setMaxUsdBudget(val);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group transition-all duration-500 hover:border-white/10 shadow-2xl">
      {/* Background Glow */}
      <div className={`absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[80px] transition-colors duration-1000 ${
        isCritical ? "bg-red-500/20" : isWarning ? "bg-amber-500/20" : "bg-emerald-500/10"
      }`} />

      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border transition-colors duration-500 ${
            isCritical ? "bg-red-500/10 border-red-500/20 text-red-500" : 
            isWarning ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : 
            "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
          }`}>
            <Wallet size={18} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-white/90 uppercase tracking-widest">Financial Guard</h3>
            <p className="text-[10px] text-white/40 font-medium">Real-time budget enforcement</p>
          </div>
        </div>

        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/60 transition-all"
          >
            <Edit3 size={14} />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={handleSave} className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 transition-colors">
              <Check size={14} />
            </button>
            <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-md bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 z-10">
        <div className="flex justify-between items-end px-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter">Current Spending</span>
            <span className={`text-xl font-mono font-black tracking-tighter ${isCritical ? "text-red-500" : "text-white"}`}>
              ${totalCost.toFixed(4)}
            </span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter">Limit</span>
            {isEditing ? (
              <input 
                type="text" 
                value={tempBudget}
                onChange={(e) => setTempBudget(e.target.value)}
                className="w-20 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-right text-sm font-mono text-white focus:outline-none focus:border-amber-500/50"
                autoFocus
              />
            ) : (
              <span className="text-sm font-mono font-bold text-white/60">${maxUsdBudget.toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
              isCritical ? "bg-gradient-to-r from-red-600 to-red-400" :
              isWarning ? "bg-gradient-to-r from-amber-600 to-amber-400" :
              "bg-gradient-to-r from-emerald-600 to-emerald-400"
            }`}
            style={{ width: `${progress}%` }}
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
          </div>
        </div>

        <div className="flex justify-between items-center px-1">
          <span className={`text-[9px] font-black uppercase tracking-widest ${
            isCritical ? "text-red-500 animate-pulse" : isWarning ? "text-amber-500" : "text-emerald-500/60"
          }`}>
            {isCritical ? "Critical Exhaustion" : isWarning ? "Budget Warning" : "Safe Zone"}
          </span>
          <span className="text-[10px] font-mono text-white/20">{progress.toFixed(1)}%</span>
        </div>
      </div>

      {isCritical && (
        <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 z-10 animate-in fade-in slide-in-from-bottom-2">
          <ShieldAlert size={16} className="text-red-500 shrink-0" />
          <p className="text-[9px] text-red-500/80 font-bold uppercase leading-tight tracking-tight">
            Circuit breaker engaged. Next iteration will be blocked unless limit is raised.
          </p>
        </div>
      )}
    </div>
  );
};
