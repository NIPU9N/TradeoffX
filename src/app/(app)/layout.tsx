import { Topbar } from "@/components/layout/Topbar";
import { ModeProvider } from "@/context/ModeContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModeProvider>
      <Topbar />
      <main className="min-h-screen pt-16 relative bg-[#0a0a0a]">
        {children}
      </main>
    </ModeProvider>
  );
}
