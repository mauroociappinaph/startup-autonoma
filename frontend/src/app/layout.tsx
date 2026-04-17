"use client";

import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/helpers/utils";
import { 
  LayoutDashboard, 
  Terminal, 
  FolderTree, 
  History, 
  Settings, 
  Zap, 
  Github,
  Cpu 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const sidebarItems = [
  { icon: LayoutDashboard, label: "Mission Control", href: "/" },
  { icon: Terminal, label: "Live Terminal", href: "/terminal" },
  { icon: FolderTree, label: "Workspace", href: "/workspace" },
  { icon: History, label: "Mission Logs", href: "/logs" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-background text-foreground h-screen overflow-hidden selection:bg-white/10")} suppressHydrationWarning>
        <div className="flex h-full">
          {/* Sidebar Minimalista */}
          <aside className="w-64 border-r border-white/5 flex flex-col bg-black/20 backdrop-blur-md">
            <div className="p-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xl shadow-white/5 border border-white/20">
                <Zap size={18} fill="black" stroke="black" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-widest text-white uppercase italic pt-0.5 leading-none">Antigravity</h1>
                <p className="text-[8px] text-muted-foreground uppercase tracking-[0.3em] font-bold mt-1">Autonoma v3.0</p>
              </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 group",
                    pathname === item.href 
                      ? "bg-white/[0.05] text-white border border-white/5 shadow-xl" 
                      : "text-muted-foreground hover:text-white hover:bg-white/[0.02]"
                  )}
                >
                  <item.icon size={16} className={cn(
                    "transition-colors",
                    pathname === item.href ? "text-blue-500" : "text-muted-foreground/50 group-hover:text-white"
                  )} />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-6 border-t border-white/5">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                 <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">System Online</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-[10px] text-muted-foreground font-medium">Uptime</span>
                   <span className="text-[10px] text-white font-mono">14d 02h</span>
                 </div>
                 <Link href="https://github.com/mauroociappinaph/startup-autonoma" target="_blank" className="flex items-center justify-center gap-2 mt-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                    <Github size={12} className="text-white" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white">Source</span>
                 </Link>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col relative min-w-0">
            {/* Header / Superior Stats Bar */}
            <header className="h-14 border-b border-white/5 px-8 flex items-center justify-between bg-black/10 backdrop-blur-md">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Current Op:</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Idle_Sequence</span>
                  </div>
                  <div className="w-px h-4 bg-white/5" />
                  <div className="flex items-center gap-2">
                    <Cpu size={12} className="text-muted-foreground" />
                    <span className="text-[9px] font-medium text-muted-foreground">AG_CORE_V3.1</span>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                     {[1,2,3].map(i => (
                       <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-white">
                          A{i}
                       </div>
                     ))}
                     <div className="w-6 h-6 rounded-full border-2 border-background bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white">
                        +
                     </div>
                  </div>
               </div>
            </header>

            <section className="flex-1 p-8 overflow-y-auto min-h-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.03)_0%,_transparent_100%)]">
              {children}
            </section>
          </main>
        </div>
      </body>
    </html>
  );
}
