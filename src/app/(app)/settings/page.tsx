"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Trash2, Check, Zap, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

type Tab = "Profile" | "Preferences" | "Account";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fullName, setFullName] = useState("");
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/profile");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load profile");
        setProfile(json.profile);
        setFullName(json.profile.full_name || "");
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update profile");
      setProfile(json.profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-tx-primary animate-spin" />
        <p className="text-tx-text-secondary font-syne">Loading your preferences...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-12 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-syne text-4xl font-bold mb-2">Settings</h1>
        <p className="text-tx-text-secondary">Manage your account, preferences, and data.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left Nav */}
        <motion.div variants={itemVariants} className="space-y-2">
          {(["Profile", "Preferences", "Account"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200",
                activeTab === tab
                  ? "bg-tx-card text-tx-primary border border-tx-primary/30 shadow-[0_0_15px_rgba(0,255,148,0.05)]"
                  : "text-tx-text-secondary hover:text-white hover:bg-tx-bg"
              )}
            >
              {tab}
            </button>
          ))}

          <div className="pt-8 mt-8 border-t border-tx-border">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-tx-text-secondary hover:text-tx-danger hover:bg-tx-danger/10 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </motion.div>

        {/* Right Content */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <AnimatePresence mode="wait">
            {/* ── Profile ── */}
            {activeTab === "Profile" && (
              <motion.section
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-8 glass-card p-8"
              >
                <div>
                  <h2 className="font-syne text-xl font-bold mb-1">Your Profile</h2>
                  <p className="text-sm text-tx-text-secondary">How you appear to yourself (and nobody else).</p>
                </div>

                <div className="flex items-center gap-6 pb-6 border-b border-tx-border/50">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-tx-secondary to-tx-primary flex items-center justify-center shadow-glow-purple flex-shrink-0">
                    <span className="text-[#08080F] font-syne font-bold text-2xl">
                      {fullName?.substring(0, 2).toUpperCase() || profile?.email?.substring(0, 2).toUpperCase() || "TX"}
                    </span>
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-tx-accent/10 text-tx-accent border border-tx-accent/30 rounded-full text-xs font-medium mb-2 inline-block">
                      Member since Day 1 🔥
                    </span>
                    <p className="text-sm text-tx-text-muted mt-1">Avatar auto-generated from initials.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-tx-text-secondary mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-tx-bg border border-tx-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-tx-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-tx-text-secondary mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profile?.email || ""}
                      readOnly
                      className="w-full bg-tx-bg/50 border border-tx-border/30 rounded-xl px-4 py-3 text-tx-text-muted cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-tx-card border border-tx-border hover:border-tx-primary hover:text-tx-primary text-white rounded-xl transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-glow active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  {success && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-tx-primary text-sm flex items-center gap-2">
                      <Check className="w-4 h-4" /> Changes saved
                    </motion.div>
                  )}
                </div>
                {error && <p className="text-tx-danger text-sm">{error}</p>}
              </motion.section>
            )}

            {/* ── Preferences ── */}
            {activeTab === "Preferences" && (
              <motion.section
                key="prefs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-8 glass-card p-8"
              >
                <div>
                  <h2 className="font-syne text-xl font-bold mb-1">App Preferences</h2>
                  <p className="text-sm text-tx-text-secondary">Customize your TradeoffX workflow.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-tx-text-secondary mb-3">Default Asset Type</label>
                    <select className="w-full bg-tx-bg border border-tx-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-tx-primary appearance-none cursor-pointer">
                      <option>Stock</option>
                      <option>Mutual Fund</option>
                      <option>Crypto</option>
                      <option>Gold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-tx-text-secondary mb-3">Review Reminder Frequency</label>
                    <select className="w-full bg-tx-bg border border-tx-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-tx-primary appearance-none cursor-pointer">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Off</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-tx-border/50 space-y-4">
                  <h3 className="text-sm font-medium text-white mb-4">Notifications</h3>
                  <label className="flex justify-between items-center cursor-pointer group">
                    <span className="text-sm text-tx-text-secondary group-hover:text-white transition-colors">Email me weekly Pattern Mirror reports</span>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-tx-bg border border-tx-border rounded-full peer peer-checked:bg-tx-primary peer-checked:border-tx-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-tx-text-muted peer-checked:after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </div>
                  </label>
                  <label className="flex justify-between items-center cursor-pointer group">
                    <span className="text-sm text-tx-text-secondary group-hover:text-white transition-colors">Alert me if I make a FOMO trade</span>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-tx-bg border border-tx-border rounded-full peer peer-checked:bg-tx-primary peer-checked:border-tx-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-tx-text-muted peer-checked:after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </div>
                  </label>
                </div>
              </motion.section>
            )}

            {/* ── Account ── */}
            {activeTab === "Account" && (
              <motion.section
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Pro Plan */}
                <div className="glass-card p-8 border-tx-accent/30 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-tx-accent opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-syne font-bold text-2xl text-tx-accent mb-1 flex items-center gap-2">
                        <Zap className="w-6 h-6" /> TradeoffX Pro
                      </h3>
                      <p className="text-white font-medium">₹99/month</p>
                    </div>
                    <span className="px-3 py-1 bg-tx-bg border border-tx-border text-tx-text-secondary rounded-full text-xs">
                      Current Plan: {profile?.plan === "pro" ? "Pro ✨" : "Free"}
                    </span>
                  </div>
                  <ul className="space-y-3 text-sm text-tx-text-secondary mb-8">
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-tx-accent" /> Log unlimited trades (Free is capped at 50/mo)</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-tx-accent" /> Advanced behavioral DNA profiling</li>
                    <li className="flex items-center gap-3"><Check className="w-4 h-4 text-tx-accent" /> Export to CSV &amp; Excel</li>
                  </ul>
                  <button className="px-8 py-4 bg-tx-accent hover:bg-yellow-400 text-[#08080F] font-syne font-bold rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(255,184,0,0.2)] hover:shadow-[0_0_25px_rgba(255,184,0,0.4)] active:scale-95">
                    Upgrade to Pro →
                  </button>
                </div>

                {/* Danger Zone */}
                <div className="glass-card p-8 border-tx-danger/20">
                  <h3 className="font-syne text-xl font-bold text-tx-danger mb-2 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" /> Danger Zone
                  </h3>
                  <p className="text-sm text-tx-text-secondary mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-tx-bg border border-tx-border hover:border-white text-tx-text-secondary hover:text-white rounded-xl transition-all text-sm active:scale-95">
                      <Download className="w-4 h-4" /> Export my data
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-tx-danger/10 border border-tx-danger/30 hover:bg-tx-danger hover:text-white text-tx-danger rounded-xl transition-all text-sm active:scale-95">
                      <Trash2 className="w-4 h-4" /> Delete account
                    </button>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
