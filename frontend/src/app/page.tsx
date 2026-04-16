"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Button } from "@/components/ui/button.js";
import { useAgentStream } from "@/helpers/useAgentStream.js";
import { Send, Terminal } from "lucide-react";

/**
 * Dashboard de Mission Control con conexión real al backend.
 */
export default function Dashboard() {
  const [input, setInput] = useState("");
  const { thoughts, isStreaming, startStream } = useAgentStream();

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    startStream(input);
    setInput("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-180px)]">
      {/* Panel del Grafo e Input */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card className="flex-1 border-border/50 bg-card/30 flex flex-col relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Share2 size={16} className="text-blue-500" />
              Estado de Orquestación
            </CardTitle>
            <Badge variant="outline" className="font-mono bg-background/50">v2.1-sacred-laws</Badge>
          </CardHeader>
          
          <CardContent className="flex-1 flex items-center justify-center bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:30px_30px]">
            {/* Visualización del Grafo (Esquemática) */}
            <div className="flex flex-col items-center gap-8 scale-110">
              <div className="px-6 py-3 rounded-lg border border-primary bg-primary/10 shadow-[0_0_20px_rgba(255,255,255,0.1)] font-bold">
                Mirror Node
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="px-8 py-4 rounded-xl border border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)] text-blue-400 font-black text-xl">
                CEO Node
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="flex gap-12">
                 <div className="px-6 py-3 rounded-lg border border-border bg-card/50 font-bold text-muted-foreground">
                  Software Area
                </div>
                <div className="px-6 py-3 rounded-lg border border-border bg-card/50 font-bold text-muted-foreground">
                  Business Area
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Command Bar */}
        <Card className="border-border/50 bg-card/50 p-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ingresa una misión para la Startup (ej: 'Busca leads fintech en MX')..."
                className="w-full bg-background border border-border rounded-md py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <Button 
              onClick={handleSend} 
              disabled={isStreaming || !input.trim()}
              className="px-6 gap-2"
            >
              {isStreaming ? "Ejecutando..." : "Lanzar Misión"}
              <Send size={16} />
            </Button>
          </div>
        </Card>
      </div>

      {/* Thought Stream (Live) */}
      <Card className="border-border/50 bg-card/30 flex flex-col h-full overflow-hidden">
        <CardHeader className="border-b border-border/50 py-4">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Agent Reasoning Stream
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-hide">
          <div className="flex flex-col">
            {thoughts.length === 0 && !isStreaming && (
              <div className="p-8 text-center text-muted-foreground text-sm italic">
                Esperando comando para iniciar la orquestación...
              </div>
            )}
            {thoughts.map((t, i) => (
              <div key={i} className="p-5 border-b border-border/30 hover:bg-secondary/10 transition-colors animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={t.agent === "ERROR" ? "destructive" : "secondary"} className="text-[9px] px-2 py-0 h-4 font-black tracking-tighter">
                    {t.agent}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground font-mono">{t.time}</span>
                </div>
                <p className="text-[13px] leading-relaxed text-slate-300">
                  {t.text}
                </p>
              </div>
            ))}
            {isStreaming && (
              <div className="p-5 flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Procesando...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Iconos que faltaban importar
import { Share2 } from "lucide-react";
