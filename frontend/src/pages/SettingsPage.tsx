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
  X,
  Type,
  Layout as GlassIcon
} from 'lucide-react';
import clsx from 'clsx';
import { AppLayout as Layout } from '../app/layout/AppLayout';
import { useAuth } from '../features/auth/context/AuthContext';
import { updateUserProfile, UserProfile } from '../shared/services/db';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab ] = useState<'aesthetics' | 'support'>('aesthetics');
  
  const currentTheme = profile?.preferences?.theme || 'light';
  const currentFont = profile?.preferences?.fontFamily || 'sans';
  const isGlassEnabled = profile?.preferences?.glassmorphism ?? false;
  const accentColor = profile?.preferences?.accentColor || '#1C1917';

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
      root.classList.remove('light', 'dark', 'midnight', 'nord', 'coffee');
      root.classList.add(themeId);
      toast.success(`Theme updated to ${themeId}`);
    } catch (err) {
      toast.error('Failed to update theme');
    }
  };

  const handleFontChange = async (font: 'sans' | 'serif' | 'mono') => {
    if (!user) return;
    try {
      const updatedPrefs = {
        ...(profile?.preferences || {}),
        fontFamily: font
      };
      await updateUserProfile(user.uid, { preferences: updatedPrefs } as UserProfile);
      await refreshProfile();
      toast.success(`Font updated to ${font}`);
    } catch (err) {
      toast.error('Failed to update font');
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
      <div className="min-h-screen bg-[var(--bg-app)] pb-20">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--text-main)] flex items-center justify-center text-[var(--bg-card)] shadow-xl">
                <Settings size={24} />
              </div>
              <h1 className="text-5xl font-black text-[var(--text-main)] tracking-tighter uppercase">Scholar Settings</h1>
            </div>
            <p className="text-[var(--text-muted)] font-medium text-lg max-w-2xl">
              Configure your digital workspace, interface aesthetics, and access technical support protocols.
            </p>
          </motion.div>

          <div className="flex gap-4 mt-12 border-b border-[var(--border-main)] pb-px">
            {['aesthetics', 'support'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={clsx(
                  "px-8 py-4 font-black uppercase tracking-widest text-xs transition-all relative",
                  activeTab === tab ? "text-[var(--text-main)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--text-main)] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6">
          <AnimatePresence mode="wait">
            {activeTab === 'aesthetics' ? (
              <motion.div
                key="aesthetics"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12"
              >
                {/* Theme Selection */}
                <div className={clsx(
                  "p-12 rounded-[4rem] border border-[var(--border-main)]",
                  isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                )}>
                  <div className="flex items-center gap-4 mb-10">
                    <Palette className="text-[var(--text-muted)]" size={32} />
                    <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">Interface Theme</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { id: 'light', label: 'Light', icon: Sun, desc: 'Pure white clarity', color: 'bg-white' },
                      { id: 'dark', label: 'Onyx Dark', icon: Moon, desc: 'Scholarly focus', color: 'bg-[#0C0A09]' },
                      { id: 'system', label: 'System', icon: Monitor, desc: 'OS appearance', color: 'bg-gradient-to-br from-white to-[#0C0A09]' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleThemeChange(t.id)}
                        className={clsx(
                          "group relative p-8 rounded-[2.5rem] border-4 transition-all duration-500 text-left overflow-hidden",
                          currentTheme === t.id
                            ? "border-[var(--text-main)] bg-[var(--text-main)]/5 shadow-2xl scale-[1.02]"
                            : "border-transparent bg-[var(--bg-app)]/50 hover:bg-[var(--bg-app)] hover:scale-[1.02]"
                        )}
                      >
                        <div className={clsx("w-full h-24 rounded-2xl mb-6 shadow-inner border border-white/5", t.color)} />
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={clsx("font-black uppercase tracking-widest text-sm", currentTheme === t.id ? "text-[var(--text-main)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-main)]")}>{t.label}</h4>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase mt-1">{t.desc}</p>
                          </div>
                          {currentTheme === t.id && (
                            <div className="w-8 h-8 rounded-full bg-[var(--text-main)] flex items-center justify-center text-[var(--bg-card)] shadow-lg">
                              <Check size={16} />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography & Glass */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className={clsx(
                    "p-12 rounded-[4rem] border border-[var(--border-main)]",
                    isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                  )}>
                    <div className="flex items-center gap-4 mb-8">
                      <Type className="text-[var(--text-muted)]" size={28} />
                      <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase">Typography</h3>
                    </div>
                    <div className="space-y-4">
                      {(['sans', 'serif', 'mono'] as const).map((font) => (
                        <button
                          key={font}
                          onClick={() => handleFontChange(font)}
                          className={clsx(
                            "w-full p-6 rounded-3xl border-2 flex items-center justify-between transition-all",
                            currentFont === font ? "border-[var(--text-main)] bg-[var(--text-main)]/5" : "border-transparent bg-[var(--bg-app)] hover:bg-[var(--text-main)]/5"
                          )}
                        >
                          <span className={clsx("font-bold text-lg", font === 'sans' ? 'font-sans' : font === 'serif' ? 'font-serif' : 'font-mono')}>
                            AssingMate Academic ({font})
                          </span>
                          {currentFont === font && <Check size={18} className="text-[var(--text-main)]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={clsx(
                    "p-12 rounded-[4rem] border border-[var(--border-main)] flex flex-col justify-between",
                    isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                  )}>
                    <div>
                      <div className="flex items-center gap-4 mb-8">
                        <GlassIcon className="text-[var(--text-muted)]" size={28} />
                        <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase">Transparency</h3>
                      </div>
                      <p className="text-[var(--text-muted)] font-medium mb-12">Enable glassmorphism effects across the neural interface for a more immersive, deep-layered experience.</p>
                    </div>
                    
                    <button
                      onClick={toggleGlass}
                      className={clsx(
                        "w-full py-8 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-xl",
                        isGlassEnabled 
                          ? "bg-green-500 text-white" 
                          : "bg-[var(--text-main)] text-[var(--bg-card)]"
                      )}
                    >
                      {isGlassEnabled ? 'Glass Effects Active' : 'Enable Glass Effects'}
                      {isGlassEnabled ? <Check size={24} /> : <GlassIcon size={24} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="support"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className={clsx(
                  "p-16 rounded-[5rem] border border-[var(--border-main)]",
                  isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                )}>
                  <div className="flex items-center gap-4 mb-12">
                    <HelpCircle className="text-[var(--text-muted)]" size={32} />
                    <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">Assistance Protocols</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { label: 'Help Center', icon: HelpCircle, desc: 'Common Q&A archive', color: 'bg-blue-500' },
                      { label: 'Support Terminal', icon: LifeBuoy, desc: 'Direct secure link', color: 'bg-purple-500' },
                      { label: 'Privacy Codex', icon: Shield, desc: 'Data protection policy', color: 'bg-emerald-500' },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        className="group relative p-10 rounded-[3rem] bg-[var(--bg-app)] border border-transparent hover:border-[var(--text-main)] transition-all flex flex-col items-start gap-6 hover:shadow-2xl hover:-translate-y-2"
                      >
                        <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform", item.color)}>
                          <item.icon size={32} />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xl font-black text-[var(--text-main)] tracking-tighter uppercase">{item.label}</h4>
                          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">{item.desc}</p>
                        </div>
                        <ChevronRight className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                      </button>
                    ))}
                  </div>

                  <div className="mt-16 p-10 bg-[var(--bg-app)] rounded-3xl border border-dashed border-[var(--border-main)] flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6 text-center md:text-left">
                      <div className="w-16 h-16 rounded-full bg-[var(--text-main)] flex items-center justify-center text-[var(--bg-card)] shadow-lg">
                        <MessageSquare size={32} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-[var(--text-main)] tracking-tight">Need dedicated assistance?</h4>
                        <p className="text-[var(--text-muted)] font-medium">Our architecture specialist are available for 24/7 support.</p>
                      </div>
                    </div>
                    <button className="px-10 py-5 bg-[var(--text-main)] text-[var(--bg-card)] rounded-[2rem] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
                      Open Support Ticket
                    </button>
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
