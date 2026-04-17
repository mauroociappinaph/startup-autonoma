"use client";

import React from "react";
import { Terminal as TerminalIcon } from "lucide-react";

export default function TerminalPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 text-center">
      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl">
        <TerminalIcon size={48} className="text-white/20" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-white uppercase tracking-[0.2em] italic">Live Terminal</h1>
        <p className="text-sm text-muted-foreground font-medium max-w-md">
          Acceso directo de baja latencia al kernel de la startup. 
          Despliegue de logs en tiempo real y ejecución de comandos raw.
        </p>
      </div>
      <div className="mt-8 px-6 py-3 rounded-full bg-blue-500/10 border border-blue-500/20">
         <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Próximamente en Fase C</span>
      </div>
    </div>
  );
}
