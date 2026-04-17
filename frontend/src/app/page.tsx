"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAgentStream } from "@/helpers/useAgentStream";
import { Send, Terminal, Share2, Check, Zap, AlertCircle } from "lucide-react";

/**
 * Dashboard de Mission Control con conexión real al backend.
 */
export default function Dashboard() {
  const [input, setInput] = useState("");
  const { 
    thoughts, 
    isStreaming, 
    isWaiting,
    startStream, 
    approvePlan,
    activeNode, 
    currentPlan, 
    completedSteps,
    executiveSummary 
  } = useAgentStream();

  const handleSend = () => {
    if (!input.trim() || isStreaming || isWaiting) return;
    startStream(input);
    setInput("");
  };

  const isActive = (node: string) => activeNode === node;
  const isCompleted = (step: string) => completedSteps.includes(step);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-180px)]">
      {/* Panel del Grafo e Input (3 columnas) */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <Card className="flex-1 border-border/50 bg-card/30 flex flex-col relative overflow-hidden">
          {/* Overlay de Espera (HITL) */}
          {isWaiting && (
            <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500">
              <div className="max-w-md w-full mx-4 p-8 rounded-2xl border border-blue-500/50 bg-card shadow-[0_0_50px_rgba(59,130,246,0.2)] flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                  <AlertCircle size={32} className="text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Estrategia Lista</h3>
                  <p className="text-sm text-slate-400">El CEO ha definido el plan de acción. Revisalo a la derecha y aprobá para que los Chief inicien la ejecución.</p>
                </div>
                <Button 
                  onClick={approvePlan} 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-xl gap-3 shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.02]"
                >
                  <Zap size={20} fill="currentColor" />
                  APROBAR Y EJECUTAR
                </Button>
                <button className="text-[10px] text-muted-foreground uppercase tracking-widest hover:text-white transition-colors">Modificar Intención</button>
              </div>
            </div>
          )}

          <CardHeader className="flex flex-row items-center justify-between z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Share2 size={16} className="text-blue-500" />
              Estado de Orquestación
            </CardTitle>
            <Badge variant="outline" className="font-mono bg-background/50 text-[10px]">v2.1-sacred-laws</Badge>
          </CardHeader>
          
          <CardContent className="flex-1 flex items-center justify-center bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:30px_30px]">
            {/* Visualización del Grafo (Dinámica) */}
            <div className="flex flex-col items-center gap-8 scale-110 transition-all duration-500">
              <div className={`px-6 py-3 rounded-lg border transition-all duration-300 ${
                isActive("mirror") 
                  ? "border-emerald-500 bg-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.4)] scale-110 text-emerald-400" 
                  : "border-border bg-card/50 text-muted-foreground"
              }`}>
                Mirror Node
              </div>
              
              <div className={`h-8 w-px transition-colors duration-300 ${isActive("mirror") || isActive("ceo") ? "bg-primary" : "bg-border"}`}></div>
              
              <div className={`px-8 py-4 rounded-xl border transition-all duration-500 font-black text-xl ${
                isActive("ceo")
                  ? "border-blue-500 bg-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-110 text-blue-400"
                  : "border-border bg-card/50 text-muted-foreground opacity-50"
              }`}>
                CEO Node
              </div>

              <div className={`h-8 w-px transition-colors duration-300 ${isActive("ceo") || isActive("software_chief") || isActive("business_chief") ? "bg-primary" : "bg-border"}`}></div>

              <div className="flex gap-12 relative">
                <div className={`px-6 py-3 rounded-lg border transition-all duration-300 font-bold ${
                  isActive("software_chief")
                    ? "border-purple-500 bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105 text-purple-400"
                    : "border-border bg-card/50 text-muted-foreground opacity-40"
                }`}>
                  Software Chief
                </div>
                
                <div className={`px-6 py-3 rounded-lg border transition-all duration-300 font-bold ${
                  isActive("business_chief")
                    ? "border-orange-500 bg-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-105 text-orange-400"
                    : "border-border bg-card/50 text-muted-foreground opacity-40"
                }`}>
                  Business Chief
                </div>
              </div>

              {/* Sección de Workers (Cajas Reales) */}
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {[
                  { id: "researcher", label: "Researcher", color: "emerald" },
                  { id: "git_worker", label: "Git Worker", color: "pink" },
                  { id: "test_runner", label: "Test Runner", color: "amber" },
                  { id: "ai_engine_worker", label: "AI Engine", color: "indigo" },
                  { id: "persistence_worker", label: "Persistence", color: "amber" }
                ].map(worker => (
                  <div key={worker.id} className={`px-3 py-1.5 rounded border text-[10px] font-bold transition-all duration-300 ${
                    isActive(worker.id) 
                      ? "border-primary bg-primary/20 shadow-[0_0:15px_rgba(16,185,129,0.4)] scale-110 text-primary-foreground" 
                      : "border-border bg-card/30 text-muted-foreground opacity-30"
                  }`}>
                    {worker.label}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Command Bar */}
        <Card className="border-border/50 bg-card/50 p-2 shadow-2xl">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Lanza un comando a la Startup..."
                className="w-full bg-background border border-border rounded-md py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                disabled={isWaiting}
              />
            </div>
            <Button 
              onClick={handleSend} 
              disabled={isStreaming || !input.trim() || isWaiting}
              className="px-6 gap-2"
            >
              {isStreaming ? "Ejecutando..." : "Lanzar Misión"}
              <Send size={16} />
            </Button>
          </div>
        </Card>
      </div>

      {/* Panel Lateral: Estrategia y Pensamientos (1 columna) */}
      <div className="flex flex-col gap-6 h-full overflow-hidden">
        {/* Estrategia Actual */}
        <Card className="border-border/50 bg-card/30 flex flex-col max-h-[40%] overflow-hidden shrink-0">
          <CardHeader className="py-3 px-4 border-b border-border/50 flex flex-row items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Estrategia Actual</CardTitle>
          </CardHeader>
          <CardContent className="p-4 overflow-y-auto">
            {executiveSummary ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-black text-blue-400 uppercase mb-1">Resumen</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed italic border-l-2 border-blue-500/30 pl-2">
                    {executiveSummary}
                  </p>
                </div>
                {currentPlan.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase mb-2">Plan de Acción</h4>
                    <div className="space-y-2">
                      {currentPlan.map((step: string, idx: number) => (
                        <div key={idx} className={`flex items-center justify-between gap-2 p-2 rounded border transition-all duration-300 ${
                          isCompleted(step) 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400/80" 
                            : "bg-background/50 border-border/50 text-slate-400"
                        }`}>
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className={`w-1 h-1 rounded-full shrink-0 ${isCompleted(step) ? "bg-emerald-500" : "bg-slate-600"}`}></div>
                            <span className={`capitalize text-[10px] truncate ${isCompleted(step) ? "line-through opacity-50" : ""}`}>
                              {step.replace("_", " ")}
                            </span>
                          </div>
                          {isCompleted(step) && <Check size={10} className="text-emerald-500 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[10px] text-muted-foreground italic text-center py-4">
                No hay estrategia activa...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Thought Stream (Live) */}
        <Card className="border-border/50 bg-card/30 flex flex-col flex-1 overflow-hidden min-h-0">
          <CardHeader className="border-b border-border/50 py-3 px-4">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Reasoning Stream
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-hide">
            <div className="flex flex-col">
              {thoughts.length === 0 && !isStreaming && (
                <div className="p-8 text-center text-muted-foreground text-[11px] italic">
                  Esperando comando...
                </div>
              )}
              {thoughts.map((t, i) => (
                <div key={i} className="p-4 border-b border-border/20 hover:bg-secondary/5 transition-colors animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant={t.agent === "ERROR" ? "destructive" : "outline"} className="text-[8px] px-1.5 py-0 h-3.5 font-bold uppercase">
                      {t.agent}
                    </Badge>
                    <span className="text-[8px] text-muted-foreground font-mono">{t.time}</span>
                  </div>
                  <p className="text-[11px] leading-snug text-slate-400">
                    {t.text}
                  </p>
                </div>
              ))}
              {isStreaming && (
                <div className="p-4 flex items-center gap-2 opacity-50">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
