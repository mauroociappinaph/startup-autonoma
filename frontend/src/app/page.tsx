"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Button } from "@/components/ui/button.js";

/**
 * Dashboard principal de la Startup Autónoma.
 * Punto de control para monitorear el grafo y los agentes.
 */
export default function Dashboard() {
  const [thoughts, setThoughts] = useState([
    { agent: "MIRROR", text: "Analizando intención del usuario...", time: "12:00:01", status: "success" },
    { agent: "CEO", text: "Plan estratégico inicial: Fase de Investigación.", time: "12:00:05", status: "default" },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setThoughts(prev => [...prev, { 
        agent: "BUSINESS_CHIEF", 
        text: "Delegando búsqueda de leads al AI Engine.", 
        time: new Date().toLocaleTimeString(),
        status: "default"
      }]);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Panel del Grafo */}
      <Card className="lg:col-span-2 border-border/50 bg-card/30 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Orquestación en Tiempo Real
          </CardTitle>
          <Badge variant="outline" className="font-mono">langgraph_v2.0</Badge>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center relative bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:20px_20px]">
          <div className="flex flex-col items-center gap-6">
            <div className="px-6 py-3 rounded-lg border border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-emerald-500 font-bold">
              Mirror Node
            </div>
            <div className="h-10 w-px bg-gradient-to-b from-emerald-500 to-border"></div>
            <div className="px-6 py-3 rounded-lg border border-border bg-card font-bold text-muted-foreground">
              CEO Node
            </div>
            <div className="h-10 w-px bg-border"></div>
            <div className="flex gap-8">
               <div className="px-6 py-3 rounded-lg border border-border bg-card font-bold text-muted-foreground">
                Software Chief
              </div>
              <div className="px-6 py-3 rounded-lg border border-border bg-card font-bold text-muted-foreground">
                Business Chief
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thought Stream */}
      <Card className="border-border/50 bg-card/30 flex flex-col">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Thought Stream
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="flex flex-col divide-y divide-border/50">
            {thoughts.map((t, i) => (
              <div key={i} className="p-4 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-blue-400 font-mono tracking-widest uppercase">
                    [{t.agent}]
                  </span>
                  <span className="text-[10px] text-muted-foreground">{t.time}</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-200">
                  {t.text}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
        <div className="p-4 border-top border-border/50 mt-auto">
          <Button variant="outline" className="w-full text-xs" size="sm">
            Ver Logs Completos
          </Button>
        </div>
      </Card>
    </div>
  );
}
