import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/helpers/utils";
import { LayoutDashboard, Share2, Database, Settings, Rocket } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Startup Autónoma | Control Panel",
  description: "Sistema de orquestación de agentes inteligentes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-background text-foreground h-screen overflow-hidden")} suppressHydrationWarning>
        <div className="flex h-full">
          {/* Sidebar */}
          <aside className="w-64 bg-card border-r border-border p-6 flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg text-primary-foreground">
                <Rocket size={20} />
              </div>
              <span className="font-extrabold text-xl tracking-tighter">Startup.ai</span>
            </div>

            <nav className="flex flex-col gap-2">
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-md bg-secondary text-primary font-medium transition-colors">
                <LayoutDashboard size={18} />
                Dashboard
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
                <Share2 size={18} />
                Grafo
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
                <Database size={18} />
                Memoria
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-md text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors mt-auto">
                <Settings size={18} />
                Ajustes
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col">
            <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-card/50 backdrop-blur-sm">
              <h1 className="font-bold text-lg">Mission Control</h1>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sistemas Online
              </div>
            </header>

            <section className="flex-1 p-8 overflow-y-auto">
              {children}
            </section>
          </main>
        </div>
      </body>
    </html>
  );
}
