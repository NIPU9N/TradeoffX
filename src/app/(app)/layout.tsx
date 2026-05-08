import { Sidebar } from "@/components/layout/Sidebar";
import { ModeProvider } from "@/context/ModeContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModeProvider>
      <Sidebar />
      <main className="ml-[260px] min-h-screen p-8 relative">
        {children}
      </main>
    </ModeProvider>
  );
}
