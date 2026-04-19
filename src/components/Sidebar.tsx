import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  Blocks,
  BookOpen,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Newspaper,
  Users,
  Wrench,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { cn } from "../lib/utils";

interface SidebarItem {
  key: string;
  label: string;
  eyebrow: string;
  icon: LucideIcon;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: "marketplace", label: "Marketplace", eyebrow: "Live markets", icon: LayoutDashboard },
  { key: "indices", label: "Indices", eyebrow: "Structured exposure", icon: Blocks },
  { key: "news", label: "News", eyebrow: "Macro + crypto", icon: Newspaper },
  { key: "tools", label: "Tools", eyebrow: "Execution layer", icon: Wrench },
  { key: "community", label: "Community", eyebrow: "Network", icon: Users },
  { key: "manifesto", label: "Manifesto", eyebrow: "Research", icon: BookOpen },
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <aside
      className={cn(
        "relative z-20 hidden border-r border-border/80 bg-sidebar/85 backdrop-blur-xl md:flex md:flex-col",
        sidebarOpen ? "w-72" : "w-24",
      )}
    >
      <div className="flex items-center justify-between border-b border-border/80 px-5 py-5">
        <div className={cn("min-w-0", !sidebarOpen && "hidden")}>
          <div className="text-[10px] uppercase tracking-[0.36em] text-muted-foreground">Institutional Terminal</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_30px_rgba(99,102,241,0.08)]">
              <BriefcaseBusiness className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <div className="font-display text-lg tracking-[0.16em] text-foreground">VESTIGE</div>
              <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Index Console</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-white/[0.03] text-muted-foreground transition-all hover:border-white/20 hover:text-foreground"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {SIDEBAR_ITEMS.map((item) => {
          const active = currentPage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all",
                active
                  ? "border-white/14 bg-white/[0.06] shadow-[0_0_32px_rgba(99,102,241,0.12)]"
                  : "border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.035]",
                !sidebarOpen && "justify-center px-0",
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all",
                  active
                    ? "border-white/15 bg-white/[0.08] text-foreground"
                    : "border-white/8 bg-white/[0.03] text-muted-foreground group-hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
              </div>

              {sidebarOpen && (
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{item.label}</div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {item.eyebrow}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border/80 p-4">
        <div className={cn("rounded-2xl border border-white/10 bg-white/[0.04] p-4", !sidebarOpen && "p-3")}>
          <div className={cn("text-[10px] uppercase tracking-[0.26em] text-muted-foreground", !sidebarOpen && "text-center")}>
            Live status
          </div>
          <div className={cn("mt-3 flex items-center gap-2", !sidebarOpen && "justify-center")}>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.8)]" />
            {sidebarOpen && <span className="text-sm text-foreground">Market feed active</span>}
          </div>
        </div>
      </div>
    </aside>
  );
}
