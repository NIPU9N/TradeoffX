"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { ModeProvider } from "@/context/ModeContext";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

function AppContent({ children }: { children: React.ReactNode }) {
  const { collapsed, setMobileOpen } = useSidebar();
  return (
    <>
      <Sidebar />
      <div className="md:hidden flex items-center p-4 bg-[#0A0A14] border-b border-[#222] sticky top-0 z-30">
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 mr-3 text-tx-text-secondary hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 font-syne font-bold text-white">
          <div className="w-8 h-8 rounded-lg bg-tx-primary/10 flex items-center justify-center">
            <span className="text-tx-primary">⚡</span>
          </div>
          TradeoffX
        </div>
      </div>
      <main
        className={cn(
          "min-h-screen p-4 md:p-8 relative transition-all duration-300 ease-in-out",
          collapsed ? "md:ml-[72px]" : "md:ml-[260px]"
        )}
      >
        {children}
      </main>
    </>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModeProvider>
      <SidebarProvider>
        <AppContent>{children}</AppContent>
      </SidebarProvider>
    </ModeProvider>
  );
}
