"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { ModeProvider } from "@/context/ModeContext";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

function AppContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <>
      <Sidebar />
      <main
        className="min-h-screen p-8 relative transition-all duration-300 ease-in-out"
        style={{ marginLeft: collapsed ? "72px" : "260px" }}
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
