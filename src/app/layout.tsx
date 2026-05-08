import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ 
  subsets: ["latin"], 
  variable: "--font-dm-sans" 
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono"
});

export const metadata: Metadata = {
  title: "TradeoffX | The Why Behind Every Trade",
  description: "The Missing Layer Between You And Better Returns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} ${ibmPlexMono.variable} font-sans antialiased bg-[#0a0a0a] text-[#f0f0f0]`}
        suppressHydrationWarning
      >
        <main className="min-h-screen relative">
          {children}
        </main>
      </body>
    </html>
  );
}
