import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Palette,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
  HelpCircle,
  LifeBuoy,
  Shield,
  MessageSquare,
  Check,
  Layout as GlassIcon,
  Sparkles,
  Zap,
  ShieldCheck,
  Globe,
  Bell
} from 'lucide-react';
import clsx from 'clsx';
import { AppLayout as Layout } from '../app/layout/AppLayout';
import { useAuth } from '../features/auth/context/AuthContext';
import { updateUserProfile, UserProfile } from '../shared/services/db';
import toast from 'react-hot-toast';

const THEMES = [
  { id: 'light', label: 'Ivory Light', icon: Sun, desc: 'Pure white clarity', bg: 'bg-[#FBFBFA]', text: 'text-[#1C1917]', border: 'border-[#E7E5E4]' },
  { id: 'dark', label: 'Onyx Dark', icon: Moon, desc: 'Scholarly focus', bg: 'bg-[#08080A]', text: 'text-[#FDFDFC]', border: 'border-[#1E1E22]' },
  { id: 'midnight', label: 'Midnight', icon: Zap, desc: 'Deep blue depth', bg: 'bg-[#020617]', text: 'text-[#E2E8F0]', border: 'border-[#1E293B]' },
  { id: 'nord', label: 'Nordic', icon: Globe, desc: 'Frosty arctic vibe', bg: 'bg-[#2E3440]', text: 'text-[#D8DEE9]', border: 'border-[#4C566A]' },
];

const SettingsPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab ] = useState<'interface' | 'support'>('interface');
  
  const currentTheme = profile?.preferences?.theme || 'light';
  const isGlassEnabled = profile?.preferences?.glassmorphism ?? false;

  const handleThemeChange = async (themeId: string) => {
    if (!user) return;
    try {
      const updatedPrefs = {
        ...(profile?.preferences || {}),
        theme: themeId as any
      };
      await updateUserProfile(user.uid, { preferences: updatedPrefs } as UserProfile);
      await refreshProfile();
      
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark', 'midnight', 'nord', 'coffee', 'emerald', 'rose', 'amber');
      if (themeId !== 'system') {
        root.classList.add(themeId);
      }
      toast.success(`Theme updated to ${themeId}`);
    } catch (err) {
      toast.error('Failed to update theme');
    }
  };

  const toggleGlass = async () => {
    if (!user) return;
    try {
      const updatedPrefs = {
        ...(profile?.preferences || {}),
        glassmorphism: !isGlassEnabled
      };
      await updateUserProfile(user.uid, { preferences: updatedPrefs } as UserProfile);
      await refreshProfile();
      toast.success('Glass effects updated');
    } catch (err) {
      toast.error('Failed to update glass effects');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--bg-app)] pb-32">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-8 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="flex flex-col gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div>
                  <h1 className="text-6xl font-black text-[var(--text-main)] tracking-tighter uppercase leading-none">
                    Preferences
                  </h1>
                  <p className="text-[var(--text-muted)] font-bold text-xl mt-2 flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-500" />
                    Customize your scholarly environment
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-16 p-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2rem] w-fit shadow-sm">
            {[
              { id: 'interface', label: 'Interface', icon: Palette },
              { id: 'support', label: 'Support', icon: LifeBuoy },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "px-8 py-3.5 font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] transition-all flex items-center gap-3 relative overflow-hidden group",
                  activeTab === tab.id 
                    ? "text-[var(--bg-card)] bg-[var(--text-main)] shadow-lg" 
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]"
                )}
              >
                <tab.icon size={16} strokeWidth={3} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-[var(--text-main)] -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-8">
          <AnimatePresence mode="wait">
            {activeTab === 'interface' ? (
              <motion.div
                key="interface"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-12 gap-12"
              >
                {/* Left Column: Themes */}
                <div className="col-span-12 lg:col-span-8 space-y-12">
                  <section className={clsx(
                    "p-10 rounded-[3.5rem] border border-[var(--border-main)] shadow-2xl transition-all duration-500",
                    isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                  )}>
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--text-main)]/5 rounded-2xl">
                          <Palette className="text-[var(--text-main)]" size={28} />
                        </div>
                        <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">Visual Themes</h2>
                      </div>
                      <div className="px-5 py-2 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        {THEMES.length} Presets Available
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {THEMES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleThemeChange(t.id)}
                          style={{
                            backgroundColor: t.id === 'light' ? '#FBFBFA' : t.id === 'dark' ? '#08080A' : t.id === 'midnight' ? '#020617' : '#2E3440',
                          }}
                          className={clsx(
                            "group relative flex items-center gap-6 p-10 rounded-[2.5rem] border-2 transition-all duration-500 text-left overflow-hidden",
                            "backdrop-blur-md bg-opacity-80",
                            currentTheme === t.id
                              ? "border-[var(--text-main)] shadow-[0_0_40px_rgba(0,0,0,0.1)] scale-[1.02] ring-4 ring-[var(--text-main)]/10"
                              : "border-transparent hover:scale-[1.01]"
                          )}
                        >
                          <div className={clsx(
                            "w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center transition-all duration-700 shadow-lg group-hover:rotate-[360deg]",
                            t.text,
                            "bg-white/10 backdrop-blur-sm border border-white/10"
                          )}>
                            <t.icon size={24} strokeWidth={2.5} />
                          </div>
                          
                          <div className="flex flex-col gap-1 min-w-0">
                            <h4 className={clsx(
                              "font-black uppercase tracking-widest text-sm transition-colors",
                              t.text
                            )}>
                              {t.label}
                            </h4>
                            <p className={clsx(
                              "text-[10px] font-bold uppercase truncate opacity-50",
                              t.text
                            )}>
                              {t.desc}
                            </p>
                          </div>

                          {currentTheme === t.id && (
                            <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[var(--text-main)] flex items-center justify-center text-[var(--bg-card)] shadow-xl animate-in zoom-in spin-in-90 duration-500">
                              <Check size={16} strokeWidth={4} />
                            </div>
                          )}

                          {/* Glass Effect Highlight */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </button>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Right Column: Experience */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                  <section className={clsx(
                    "p-10 rounded-[3.5rem] border border-[var(--border-main)] shadow-xl flex flex-col h-full",
                    isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                  )}>
                    <div className="mb-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-2xl">
                          <GlassIcon className="text-blue-500" size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase">Immersion</h3>
                      </div>
                      <p className="text-[var(--text-muted)] font-medium text-sm leading-relaxed mb-10">
                        Enable glassmorphism for enhanced interface depth.
                      </p>
                    </div>

                    <div className="mt-auto pt-6 border-t border-[var(--border-main)] border-dashed">
                      <button
                        onClick={toggleGlass}
                        className={clsx(
                          "w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-4 group relative overflow-hidden",
                          isGlassEnabled 
                            ? "bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]" 
                            : "bg-[var(--text-main)] text-[var(--bg-card)] hover:scale-[1.02]"
                        )}
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          {isGlassEnabled ? 'Neural Glass Active' : 'Enable Neural Glass'}
                          {isGlassEnabled ? <Check size={18} strokeWidth={3} /> : <Zap size={18} fill="currentColor" />}
                        </span>
                        {isGlassEnabled && (
                          <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                          />
                        )}
                      </button>
                    </div>
                  </section>

                  {/* Experience Section End */}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="support"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={clsx(
                  "p-12 md:p-20 rounded-[5rem] border border-[var(--border-main)] shadow-2xl overflow-hidden relative",
                  isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                )}
              >
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-[var(--text-main)] text-[var(--bg-card)] rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-6">
                        <HelpCircle size={40} />
                      </div>
                      <div>
                        <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase leading-none">Support Protocols</h2>
                        <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px] mt-2">v.2.4.0 Technical Infrastructure</p>
                      </div>
                    </div>
                    
                    <div className="flex -space-x-4">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-[var(--bg-card)] bg-[var(--bg-app)] flex items-center justify-center font-black text-xs text-[var(--text-main)] shadow-xl">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                      <div className="w-12 h-12 rounded-full border-4 border-[var(--bg-card)] bg-[var(--text-main)] flex items-center justify-center font-black text-xs text-[var(--bg-card)] shadow-xl">
                        +8
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { label: 'Knowledge Base', icon: HelpCircle, desc: 'Scholarly documentation and FAQ archives.', color: 'bg-blue-500', link: 'Documentation' },
                      { label: 'Technical Core', icon: LifeBuoy, desc: 'Hardware and server-side latency diagnostic support.', color: 'bg-purple-500', link: 'Infrastructure' },
                      { label: 'Security Codex', icon: Shield, desc: 'End-to-end encryption and data governance rules.', color: 'bg-emerald-500', link: 'Compliance' },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        className="group relative p-10 rounded-[4rem] bg-[var(--bg-app)] border-2 border-transparent hover:border-[var(--text-main)] transition-all flex flex-col items-start gap-8 hover:shadow-2xl hover:-translate-y-2 text-left"
                      >
                        <div className={clsx("w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500", item.color)}>
                          <item.icon size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h4 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-2">{item.label}</h4>
                          <p className="text-xs text-[var(--text-muted)] font-semibold leading-relaxed uppercase opacity-80">{item.desc}</p>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-opacity">
                          Open {item.link} <ChevronRight size={14} />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-20 p-12 bg-gradient-to-br from-[var(--text-main)] to-[#44403C] rounded-[4rem] text-[var(--bg-card)] flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden group">
                    <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10 text-center lg:text-left">
                      <div className="w-24 h-24 rounded-[2rem] bg-white text-[#1C1917] flex items-center justify-center shadow-2xl animate-pulse">
                        <MessageSquare size={44} />
                      </div>
                      <div>
                        <h4 className="text-3xl font-black uppercase tracking-tighter leading-none mb-3">Live Terminal Support</h4>
                        <p className="text-[var(--bg-card)]/60 font-bold uppercase tracking-widest text-xs">Architectural specialists on standby 24/7/365.</p>
                      </div>
                    </div>
                    <button className="px-12 py-7 bg-white text-[#1C1917] rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative z-10">
                      Establish Secure Connection
                    </button>
                    
                    {/* Decorative Blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
