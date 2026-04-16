import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider, useApp } from "./context/AppContext";
import PriceTicker from "./components/PriceTicker";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Marketplace from "./pages/Marketplace";
import Indices from "./pages/Indices";
import News from "./pages/News";
import Tools from "./pages/Tools";
import Community from "./pages/Community";
import Manifesto from "./pages/Manifesto";
import Admin from "./pages/Admin";
import { APP_VERSION } from "./lib/constants";

const queryClient = new QueryClient();

type Page = "marketplace" | "indices" | "news" | "tools" | "community" | "manifesto";

function AppShell() {
  const { adminPanelOpen, setAdminPanelOpen, sidebarOpen, handleVersionClick } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>("marketplace");

  const pageComponents: Record<Page, React.ReactNode> = {
    marketplace: <Marketplace />,
    indices: <Indices />,
    news: <News />,
    tools: <Tools />,
    community: <Community />,
    manifesto: <Manifesto />,
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* Price Ticker */}
      <PriceTicker />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onNavigate={(p) => setCurrentPage(p as Page)} />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header />
          <main className="flex-1 overflow-auto">
            {pageComponents[currentPage]}
          </main>

          {/* Footer */}
          <footer className="border-t border-border px-6 py-2 flex items-center justify-between text-xs text-muted-foreground shrink-0">
            <span>VESTIGE INDEX — Descentralizado. Transparente. Soberano.</span>
            <button
              onClick={handleVersionClick}
              className="hover:text-foreground transition-colors select-none"
            >
              v{APP_VERSION}
            </button>
          </footer>
        </div>
      </div>

      {/* Admin panel */}
      {adminPanelOpen && <Admin onClose={() => setAdminPanelOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </QueryClientProvider>
  );
}
