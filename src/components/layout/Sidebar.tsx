"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  CheckCircle,
  Brain,
  Settings,
  Zap,
  TrendingUp
} from "lucide-react";
import { getProfile } from "@/lib/api";
import type { Profile } from "@/types";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "New Decision", href: "/new", icon: PlusCircle, highlight: true },
  { name: "My Decisions", href: "/decisions", icon: BookOpen },
  { name: "P&L Analysis", href: "/pl", icon: TrendingUp },
  { name: "Outcome Review", href: "/review", icon: CheckCircle },
  { name: "Pattern Mirror", href: "/mirror", icon: Brain },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setProfile(data.profile);
      } catch (err) {
        console.error("Failed to load profile in sidebar", err);
      }
    }
    loadProfile();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-[260px] flex flex-col" style={{ background: "#0A0A14", borderRight: "1px solid var(--color-tx-border)" }}>
      {/* Logo Section */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[rgba(0,255,148,0.1)] flex items-center justify-center">
            <Zap className="w-5 h-5 text-tx-primary" />
          </div>
          <span className="font-syne font-bold text-xl text-white">TradeoffX</span>
        </Link>
        <p className="text-[10px] text-tx-text-muted uppercase tracking-widest pl-11">Decision Intelligence</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.name} href={item.href} className="block relative group">
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-[rgba(0,255,148,0.08)] text-tx-primary font-medium"
                    : "text-tx-text-secondary hover:text-white hover:bg-tx-glass",
                  item.highlight && !isActive && "text-tx-primary hover:text-tx-primary drop-shadow-[0_0_8px_rgba(0,255,148,0.3)]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-tx-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive || item.highlight ? "text-tx-primary" : "", "group-hover:scale-110")} />
                <span className="font-inter text-sm">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <Link href="/settings" className="p-4 border-t border-tx-border block">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-tx-glass transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-tx-secondary flex items-center justify-center flex-shrink-0 shadow-glow-purple overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-syne font-bold text-sm">
                {profile ? getInitials(profile.full_name) : "--"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile?.full_name || "Loading..."}</p>
            <p className="text-xs text-tx-text-secondary truncate">
              {profile ? `Member since ${new Date(profile.member_since).getFullYear()}` : "TradeoffX Citizen"}
            </p>
          </div>
          <Settings className="w-4 h-4 text-tx-text-muted group-hover:text-white transition-colors" />
        </div>
      </Link>
    </div>
  );
}
