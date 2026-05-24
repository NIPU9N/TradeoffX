"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, DEVELOPER_EMAILS } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  CheckCircle,
  Brain,
  Settings,
  Zap,
  TrendingUp,
  GitCompare,
  Gamepad2,
  DollarSign,
  BarChart3,
  Wallet,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { getProfile } from "@/lib/api";
import type { Profile } from "@/types";
import { useState, useEffect } from "react";
import { useMode } from "@/context/ModeContext";
import { useSidebar } from "@/context/SidebarContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { mode, setMode, isPractice } = useMode();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

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

  const handleModeSwitch = (newMode: "real" | "practice") => {
    if (newMode === mode) return;
    setMode(newMode);
    if (newMode === "practice") {
      setToastMessage("Practice Mode on. Zero risk. Full learning. 🎮");
    } else {
      setToastMessage("Real Money Mode. This counts. Think before you trade. 💰");
    }
    setTimeout(() => setToastMessage(null), 4000);
    router.refresh();
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const navItems: {
    name: string;
    href: string;
    icon: React.ElementType;
    highlight?: boolean;
    pro?: boolean;
    watchlist?: boolean;
    badge?: string;
  }[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "New Decision", href: "/new", icon: PlusCircle, highlight: true },
    { name: "My Decisions", href: "/decisions", icon: BookOpen },
    { name: "P&L Analysis", href: "/pl", icon: BarChart3 },
    ...(isPractice ? [{ name: "Practice Portfolio", href: "/practice", icon: Wallet }] : []),
    ...(isPractice ? [{ name: "Strategy Builder", href: "/options", icon: TrendingUp, badge: "Options" }] : []),
    { name: "Watchlist", href: "/watchlist", icon: Eye, watchlist: true },
    { name: "Outcome Review", href: "/review", icon: CheckCircle },
    { name: "Pattern Mirror", href: "/mirror", icon: Brain },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>
      <motion.div
        className={cn(
          "fixed top-0 left-0 h-screen flex flex-col z-40 overflow-hidden transition-transform duration-300 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "#0A0A14", borderRight: "1px solid var(--color-tx-border)" }}
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {/* Logo + Toggle Row */}
        <div className="p-4 pb-3 flex items-center justify-between flex-shrink-0">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden"
              >
                <Link href="/" className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-tx-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-tx-primary" />
                  </div>
                  <span className="font-syne font-bold text-xl text-white whitespace-nowrap">TradeoffX</span>
                </Link>
                <p className="text-[10px] text-tx-text-muted uppercase tracking-widest pl-11 whitespace-nowrap">
                  Decision Intelligence
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-tx-primary/10 flex items-center justify-center mx-auto">
              <Zap className="w-5 h-5 text-tx-primary" />
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <div className={cn("px-3 mb-2 flex", collapsed ? "justify-center" : "justify-end")}>
          <button
            onClick={toggleCollapsed}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-tx-text-muted hover:text-white hover:bg-tx-glass transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Mode Toggle */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className="px-4 pb-4 flex-shrink-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex bg-tx-card rounded-xl p-1 border border-tx-border relative overflow-hidden">
                <div className="w-1/2 relative z-10">
                  <button
                    onClick={() => handleModeSwitch("practice")}
                    className={cn(
                      "w-full py-2 flex items-center justify-center gap-2 text-xs font-bold font-syne rounded-lg transition-colors duration-300",
                      isPractice ? "text-[#08080F]" : "text-tx-text-secondary hover:text-white"
                    )}
                  >
                    <Gamepad2 className="w-3.5 h-3.5" /> Practice
                  </button>
                </div>
                <div className="w-1/2 relative z-10">
                  <button
                    onClick={() => handleModeSwitch("real")}
                    className={cn(
                      "w-full py-2 flex items-center justify-center gap-2 text-xs font-bold font-syne rounded-lg transition-colors duration-300",
                      !isPractice ? "text-[#08080F]" : "text-tx-text-secondary hover:text-white"
                    )}
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Real Money
                  </button>
                </div>
                <motion.div
                  layoutId="modeBackground"
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-tx-primary rounded-lg z-0"
                  animate={{ left: isPractice ? "4px" : "calc(50% + 2px)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.name : undefined}
                className="block relative group"
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300",
                    collapsed ? "justify-center" : "",
                    isActive
                      ? "bg-tx-primary/10 text-tx-primary font-medium"
                      : "text-tx-text-secondary hover:text-white hover:bg-tx-glass",
                    item.highlight && !isActive && "text-tx-primary hover:text-tx-primary drop-shadow-[0_0_8px_rgba(255,255,255,0.12)]",
                    item.watchlist && !isActive && (isPractice ? "hover:text-tx-primary" : "hover:text-yellow-400")
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-tx-primary rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
                      isActive ? "text-tx-primary" : "",
                      item.highlight && !isActive ? "text-tx-primary" : "",
                      item.watchlist && !isActive ? (isPractice ? "text-tx-primary" : "text-yellow-400") : ""
                    )}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        className="font-inter text-sm flex-1 whitespace-nowrap overflow-hidden"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && item.badge && (
                    <span className="text-[8px] uppercase tracking-widest font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-sm flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                  {!collapsed && item.pro && (
                    <span className="text-[9px] uppercase tracking-wider font-bold bg-[#FFB800]/20 text-[#FFB800] px-1.5 py-0.5 rounded-sm flex-shrink-0">
                      PRO
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Profile Footer */}
        <Link href="/settings" className="p-3 border-t border-tx-border block flex-shrink-0">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl hover:bg-tx-glass transition-colors cursor-pointer group",
            collapsed && "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-tx-secondary flex items-center justify-center flex-shrink-0 shadow-glow-purple overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-syne font-bold text-xs">
                  {profile ? getInitials(profile.full_name) : "--"}
                </span>
              )}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <p className="text-sm font-medium text-white truncate">{profile?.full_name || "Loading..."}</p>
                  <p className="text-xs text-tx-text-secondary truncate">
                    {profile ? `Member since ${new Date(profile.member_since).getFullYear()}` : "TradeoffX Citizen"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <Settings className="w-4 h-4 text-tx-text-muted group-hover:text-white transition-colors flex-shrink-0" />
            )}
          </div>
        </Link>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl glass-card border border-tx-primary/30 flex items-center gap-3 max-w-md w-full"
            style={{ boxShadow: isPractice ? "0 0 30px rgba(0,255,148,0.15)" : "0 0 30px rgba(78,168,255,0.15)" }}
          >
            <div className="w-2 h-10 rounded-full bg-tx-primary" />
            <p className="text-sm font-medium text-white leading-relaxed">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
