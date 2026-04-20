import React from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { cn } from "../lib/utils";
import {
  BarChart3,
  TrendingUp,
  Newspaper,
  Wrench,
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface NavItem {
  key: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  page: string;
}

const navItems: NavItem[] = [
  { key: "marketplace", icon: BarChart3, page: "marketplace" },
  { key: "indices", icon: TrendingUp, page: "indices" },
  { key: "news", icon: Newspaper, page: "news" },
  { key: "tools", icon: Wrench, page: "tools" },
  { key: "community", icon: Users, page: "community" },
  { key: "manifesto", icon: BookOpen, page: "manifesto" },
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { lang, sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border z-40 sidebar-transition flex flex-col",
          sidebarOpen ? "w-56" : "w-14",
          "md:relative md:z-auto"
        )}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-sidebar-border h-14">
          {sidebarOpen && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded bg-foreground flex items-center justify-center shrink-0">
                <span className="text-background text-xs font-bold">V</span>
              </div>
              <span className="text-sm font-bold tracking-wide text-sidebar-foreground truncate">
                VESTIGE INDEX
              </span>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-7 h-7 rounded bg-foreground flex items-center justify-center mx-auto">
              <span className="text-background text-xs font-bold">V</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "text-sidebar-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-sidebar-accent",
              !sidebarOpen && "hidden"
            )}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Expand button when collapsed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="mx-auto mt-2 p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.page)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-left",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
                title={!sidebarOpen ? t(lang, item.key) : undefined}
              >
                <Icon size={16} className="shrink-0" />
                {sidebarOpen && (
                  <span className="truncate">{t(lang, item.key)}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Version */}
        <div className="px-3 py-3 border-t border-sidebar-border">
          {sidebarOpen && (
            <span className="text-xs text-muted-foreground">
              {t(lang, "version")} 1.0.0
            </span>
          )}
        </div>
      </aside>
    </>
  );
}
