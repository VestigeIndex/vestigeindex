import React, { Suspense, lazy, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider, useApp } from "./context/AppContext";
import PriceTicker from "./components/PriceTicker";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Admin from "./pages/Admin";
import { PersonalDashboard } from "./components/PersonalDashboard";
import { SwapAdvanced } from "./components/SwapAdvanced";
import { APP_VERSION } from "./lib/constants";

const Marketplace = lazy(() => import("./pages/Marketplace"));
const Swap = lazy(() => import("./pages/Swap"));
const Bridge = lazy(() => import("./pages/Bridge"));
const Indices = lazy(() => import("./pages/Indices"));
const News = lazy(() => import("./pages/News"));
const Tools = lazy(() => import("./pages/Tools"));
const Community = lazy(() => import("./pages/Community"));
const Manifesto = lazy(() => import("./pages/Manifesto"));

type Page = "marketplace" | "dashboard" | "swap-pro" | "swap" | "bridge" | "indices" | "news" | "tools" | "community" | "manifesto";

function AppShell() {
  const { adminPanelOpen, setAdminPanelOpen, handleVersionClick } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>("marketplace");

  const pageComponents: Record<Page, React.ReactNode> = {
    marketplace: <Marketplace />,
    dashboard: <PersonalDashboard />,
    "swap-pro": <SwapAdvanced />,
    swap: <Swap />,
    bridge: <Bridge />,
    indices: <Indices />,
    news: <News />,
    tools: <Tools />,
    community: <Community />,
    manifesto: <Manifesto />,
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(88,140,255,0.14),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(52,211,153,0.08),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.03),_transparent_22%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />

      <Sidebar currentPage={currentPage} onNavigate={(page) => setCurrentPage(page as Page)} />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <PriceTicker />
        <Header />

        <main className="flex-1 overflow-auto px-4 pb-4 pt-4 md:px-6">
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-border/70 bg-card/70 backdrop-blur-xl">
                <span className="text-sm text-muted-foreground">Loading workspace...</span>
              </div>
            }
          >
            {pageComponents[currentPage]}
          </Suspense>
        </main>

        <footer className="flex shrink-0 items-center justify-between border-t border-border/80 px-6 py-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          <span>Vestige Index | Decentralized. Transparent. Sovereign.</span>
          <button onClick={handleVersionClick} className="transition-colors hover:text-foreground">
            v{APP_VERSION}
          </button>
        </footer>
      </div>

      {adminPanelOpen && <Admin onClose={() => setAdminPanelOpen(false)} />}
    </div>
  );
}

function AppProviders() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default function App() {
  return <AppProviders />;
}
