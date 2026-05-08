"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bell, Search, User } from "lucide-react";

export function Topbar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Decisions", href: "/decisions" },
    { name: "History", href: "/history" },
    { name: "Patterns", href: "/patterns" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#111111] border-b border-[#222222] z-50 px-8 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
          <span className="text-[#111] font-bold text-lg leading-none">TX</span>
        </div>
        <span className="text-[#f0f0f0] font-bold text-lg tracking-tight">TradeoffX</span>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-[#5a5a5a] hover:bg-white/[0.08] hover:text-[#f0f0f0]"
              )}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="text-[#5a5a5a] hover:text-white transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="text-[#5a5a5a] hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#ef4444] rounded-full border border-[#111]" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#222] border border-[#333] flex items-center justify-center cursor-pointer hover:border-white/20 transition-colors">
          <User className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </nav>
  );
}
