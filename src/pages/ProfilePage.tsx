import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Sparkles,
  Camera,
  FileText,
  LayoutDashboard,
  Building,
  BookOpen,
  Save,
  Palette,
  Bell,
  Globe,
  LogOut,
  HelpCircle,
  LifeBuoy,
  Shield,
  ChevronRight,
  X,
  MessageSquare,
  Check,
  RefreshCw
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../features/auth/context/AuthContext';
import {
  getUserProfile,
  updateUserProfile,
  subscribeToUserDocuments,
  UserProfile
} from '../shared/services/db';
import { auth } from '../shared/services/firebase';
import { AppLayout as Layout } from '../app/layout/AppLayout';
import AvatarModal from '../shared/components/AvatarModal';
import Aurora from '../features/editor/components/Aurora';

const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isAestheticModalOpen, setIsAestheticModalOpen] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    displayName: user?.displayName || '',
    institution: '',
    fieldOfStudy: '',
    preferences: {
      emailNotifications: true,
      aiSuggestions: true,
      publicProfile: false,
      theme: 'light'
    }
  });
  const [stats, setStats] = useState({
    docsCount: 0,
    wordsCount: 0,
    templatesCount: 0
  });
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      const data = await getUserProfile(user.uid);
      if (data) {
        setProfile({
          ...data,
          displayName: data.displayName || user.displayName || '',
          preferences: data.preferences || {
            emailNotifications: true,
            aiSuggestions: true,
            publicProfile: false,
            theme: 'light'
          }
        });
      }
    };
    fetchProfileData();

    const unsubscribe = subscribeToUserDocuments(user.uid, (docs) => {
      const words = docs.reduce((acc, doc) => acc + (doc.content?.split(/\s+/).length || 0), 0);
      setStats({
        docsCount: docs.length,
        wordsCount: words,
        templatesCount: Math.floor(docs.length / 3)
      });
    });
    return unsubscribe;
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      const updated = { ...profile, ...editedProfile };
      await updateUserProfile(user.uid, updated as UserProfile);
      if (editedProfile.displayName) {
        await updateProfile(user, { displayName: editedProfile.displayName });
      }
      setProfile(updated);
      setEditedProfile({});
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSelect = async (url: string) => {
    if (!user || !profile) return;
    try {
      await updateProfile(user, { photoURL: url });
      await updateUserProfile(user.uid, { ...profile, photoURL: url } as UserProfile);
      setProfile(prev => prev ? { ...prev, photoURL: url } : null);
      toast.success('Avatar updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update avatar');
    }
  };

  const currentTheme = editedProfile.preferences?.theme ?? profile?.preferences?.theme ?? 'light';
  const accentColor = editedProfile.preferences?.accentColor ?? profile?.preferences?.accentColor ?? '#1C1917';
  const currentFont = editedProfile.preferences?.fontFamily ?? profile?.preferences?.fontFamily ?? 'sans';
  const isGlassEnabled = editedProfile.preferences?.glassmorphism ?? profile?.preferences?.glassmorphism ?? false;

  const handleThemePreview = (themeId: string) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...(prev.preferences || profile?.preferences || {}),
        theme: themeId as any
      }
    }));
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'midnight', 'emerald', 'rose', 'amber', 'nord', 'coffee');
    root.classList.add(themeId);
  };

  const handleAccentPreview = (color: string) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...(prev.preferences || profile?.preferences || {}),
        accentColor: color
      }
    }));
    window.document.documentElement.style.setProperty('--accent-main', color);
  };

  const handleFontPreview = (font: 'sans' | 'serif' | 'mono') => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...(prev.preferences || profile?.preferences || {}),
        fontFamily: font
      }
    }));
    const root = window.document.documentElement;
    root.classList.remove('font-sans', 'font-serif', 'font-mono');
    root.classList.add(`font-${font}`);
  };

  const handleGlassPreview = (enabled: boolean) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...(prev.preferences || profile?.preferences || {}),
        glassmorphism: enabled
      }
    }));
    if (enabled) {
      window.document.documentElement.classList.add('glass-enabled');
    } else {
      window.document.documentElement.classList.remove('glass-enabled');
    }
  };

  useEffect(() => {
    return () => {
      // Revert preview changes on unmount
      if (profile?.preferences) {
        const root = window.document.documentElement;

        // Revert theme
        root.classList.remove('light', 'dark', 'midnight', 'emerald', 'rose', 'amber', 'nord', 'coffee');
        root.classList.add(profile.preferences.theme || 'light');

        // Revert font
        root.classList.remove('font-sans', 'font-serif', 'font-mono');
        root.classList.add(`font-${profile.preferences.fontFamily || 'sans'}`);

        // Revert glass
        if (profile.preferences.glassmorphism) {
          root.classList.add('glass-enabled');
        } else {
          root.classList.remove('glass-enabled');
        }

        // Revert accent
        if (profile.preferences.accentColor) {
          root.style.setProperty('--accent-main', profile.preferences.accentColor);
        } else {
          root.style.removeProperty('--accent-main');
        }
      }
    };
  }, [profile]);

  if (!user || !profile) return null;

  const profileCompleteness = [
    profile.displayName,
    profile.institution,
    profile.fieldOfStudy,
    profile.photoURL || user.photoURL
  ].filter(Boolean).length * 25;

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--bg-app)] pb-32 font-sans overflow-x-hidden">
        {/* Immersive Hero Section */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[var(--text-main)]">
            <div className="absolute inset-0 opacity-40">
              <Aurora colorStops={[accentColor, '#000000', accentColor]} speed={0.05} />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--text-main)]/50 to-[var(--text-main)]" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="mb-16 relative"
            >
              <div className="relative group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="w-56 h-56 md:w-72 md:h-72 rounded-[5rem] bg-[var(--bg-card)] p-2 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] cursor-pointer overflow-hidden border-8 border-white/10 relative"
                  onClick={() => setIsAvatarModalOpen(true)}
                >
                  {profile?.photoURL || user.photoURL ? (
                    <img
                      src={profile?.photoURL || user.photoURL || ''}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-[4.5rem] transition-transform duration-1000 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--bg-app)] flex items-center justify-center rounded-[4.5rem]">
                      <UserIcon size={100} className="text-[var(--text-muted)]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-md">
                    <Camera size={48} className="text-white mb-2" />
                    <span className="text-white text-xs font-black uppercase tracking-widest">Update Avatar</span>
                  </div>
                </motion.div>

                {/* Profile Completeness Ring */}
                <svg className="absolute -inset-6 w-[calc(100%+3rem)] h-[calc(100%+3rem)] -rotate-90 pointer-events-none">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeDasharray="100 100"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 100 - profileCompleteness }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>

                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8, type: 'spring' }}
                  className="absolute -bottom-2 -right-2 w-20 h-20 bg-[var(--text-main)] text-[var(--bg-card)] rounded-3xl flex items-center justify-center shadow-2xl border-4 border-[var(--text-main)] rotate-12"
                >
                  <Sparkles size={32} />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/60 font-black uppercase tracking-[0.4em] text-[10px]">Active Scholar</span>
              </div>

              <h1 className="text-8xl md:text-[12rem] font-black text-white tracking-tighter leading-[0.85] uppercase">
                {profile?.displayName?.split(' ')[0] || 'Creator'}
              </h1>

              <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[var(--text-muted)] text-lg md:text-2xl font-medium italic serif">
                <span>{profile?.fieldOfStudy || 'Visionary Explorer'}</span>
                <div className="w-2 h-2 rounded-full bg-[var(--border-main)]" />
                <span>{profile?.institution || 'Global Academy'}</span>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[var(--bg-app)] to-transparent" />
        </section>

        <div className="max-w-7xl mx-auto px-6 -mt-40 relative z-30">
          {/* Advanced Bento Stats */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={clsx(
                "md:col-span-8 p-16 rounded-[5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-[var(--border-main)] flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group",
                isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
              )}
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--bg-app)] rounded-full -mr-48 -mt-48 transition-transform duration-700 group-hover:scale-110" />
              <div className="relative z-10 space-y-4 text-center md:text-left">
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.5em]">Global Impact</span>
                <h3 className="text-5xl font-black text-[var(--text-main)] tracking-tight leading-none">Knowledge Production</h3>
                <p className="text-[var(--text-muted)] font-medium max-w-xs">Your contribution to the collective intelligence through AI-augmented research.</p>
              </div>
              <div className="relative z-10 flex items-baseline gap-4">
                <span className="text-[10rem] font-black text-[var(--text-main)] tracking-tighter leading-none">{stats.docsCount}</span>
                <div className="flex flex-col">
                  <span className="text-[var(--text-muted)] font-black text-xs uppercase tracking-widest">Units</span>
                  <span className="text-[var(--text-main)] font-black text-xl uppercase tracking-tighter">Total</span>
                </div>
              </div>
            </motion.div>

            <div className="md:col-span-4 grid grid-rows-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-[var(--text-main)] p-12 rounded-[4rem] shadow-2xl text-[var(--bg-card)] flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl">
                    <FileText size={28} />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black tracking-tighter">{(stats.wordsCount / 1000).toFixed(1)}k</p>
                    <p className="text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest">Lexicon</p>
                  </div>
                </div>
                <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-[0.2em] relative z-10">Words Written</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={clsx(
                  "p-12 rounded-[4rem] shadow-xl border border-[var(--border-main)] flex flex-col justify-between group",
                  isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--bg-app)] flex items-center justify-center group-hover:bg-[var(--text-main)] group-hover:text-[var(--bg-card)] transition-all duration-500">
                    <LayoutDashboard size={28} />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black tracking-tighter text-[var(--text-main)]">{stats.templatesCount}</p>
                    <p className="text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest">Frameworks</p>
                  </div>
                </div>
                <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-[0.2em]">Templates Used</p>
              </motion.div>
            </div>
          </div>

          {/* Main Content Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Left Column: Settings */}
            <div className="lg:col-span-8 space-y-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={clsx(
                  "p-16 rounded-[5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.04)] border border-[var(--border-main)] relative overflow-hidden",
                  isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                  <div>
                    <h2 className="text-5xl font-black text-[var(--text-main)] tracking-tighter uppercase">Identity</h2>
                    <p className="text-[var(--text-muted)] font-medium mt-2">Manage your public presence and academic credentials.</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-12 py-6 bg-[var(--text-main)] text-[var(--bg-card)] rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl shadow-stone-900/40 disabled:opacity-50 flex items-center justify-center gap-4 text-sm"
                  >
                    {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                    Save
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.5em] ml-6">Full Name</label>
                    <div className="relative group">
                      <div className="absolute left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[var(--bg-app)] flex items-center justify-center text-[var(--text-muted)] group-focus-within:bg-[var(--text-main)] group-focus-within:text-[var(--bg-card)] transition-all duration-500">
                        <UserIcon size={20} />
                      </div>
                      <input
                        type="text"
                        value={editedProfile.displayName ?? profile?.displayName ?? ''}
                        onChange={e => setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full pl-24 pr-10 py-8 bg-[var(--bg-app)] border-4 border-transparent focus:border-[var(--accent-main)]/10 focus:bg-[var(--bg-card)] rounded-[3rem] transition-all outline-none font-bold text-xl text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.5em] ml-6">Institution</label>
                    <div className="relative group">
                      <div className="absolute left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[var(--bg-app)] flex items-center justify-center text-[var(--text-muted)] group-focus-within:bg-[var(--text-main)] group-focus-within:text-[var(--bg-card)] transition-all duration-500">
                        <Building size={20} />
                      </div>
                      <input
                        type="text"
                        value={editedProfile.institution ?? profile?.institution ?? ''}
                        onChange={e => setEditedProfile(prev => ({ ...prev, institution: e.target.value }))}
                        className="w-full pl-24 pr-10 py-8 bg-[var(--bg-app)] border-4 border-transparent focus:border-[var(--accent-main)]/10 focus:bg-[var(--bg-card)] rounded-[3rem] transition-all outline-none font-bold text-xl text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                        placeholder="Stanford University"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.5em] ml-6">Field of Study / Professional Role</label>
                    <div className="relative group">
                      <div className="absolute left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[var(--bg-app)] flex items-center justify-center text-[var(--text-muted)] group-focus-within:bg-[var(--text-main)] group-focus-within:text-[var(--bg-card)] transition-all duration-500">
                        <BookOpen size={20} />
                      </div>
                      <input
                        type="text"
                        value={editedProfile.fieldOfStudy ?? profile?.fieldOfStudy ?? ''}
                        onChange={e => setEditedProfile(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                        className="w-full pl-24 pr-10 py-8 bg-[var(--bg-app)] border-4 border-transparent focus:border-[var(--accent-main)]/10 focus:bg-[var(--bg-card)] rounded-[3rem] transition-all outline-none font-bold text-xl text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                        placeholder="Quantum Computing Researcher"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={clsx(
                  "p-16 rounded-[5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.04)] border border-[var(--border-main)] relative overflow-hidden group",
                  isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                )}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-main)]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[var(--accent-main)]/10 transition-all duration-1000" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                  <div>
                    <h2 className="text-5xl font-black text-[var(--text-main)] tracking-tighter uppercase">Aesthetics</h2>
                    <p className="text-[var(--text-muted)] font-medium mt-2">Personalize your neural interface and visual experience.</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAestheticModalOpen(true)}
                    className="px-10 py-5 bg-[var(--bg-app)] text-[var(--text-main)] border-2 border-[var(--border-main)] rounded-[2rem] font-black uppercase tracking-widest hover:border-[var(--accent-main)] transition-all flex items-center gap-3"
                  >
                    <Palette size={20} />
                    Configure
                  </motion.button>
                </div>

                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                  <div className="p-6 bg-[var(--bg-app)]/50 rounded-3xl border border-[var(--border-main)]">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Theme</p>
                    <p className="text-sm font-bold text-[var(--text-main)] capitalize">{currentTheme}</p>
                  </div>
                  <div className="p-6 bg-[var(--bg-app)]/50 rounded-3xl border border-[var(--border-main)]">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Accent</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
                      <p className="text-sm font-bold text-[var(--text-main)] uppercase">{accentColor}</p>
                    </div>
                  </div>
                  <div className="p-6 bg-[var(--bg-app)]/50 rounded-3xl border border-[var(--border-main)]">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Font</p>
                    <p className="text-sm font-bold text-[var(--text-main)] capitalize">{currentFont}</p>
                  </div>
                  <div className="p-6 bg-[var(--bg-app)]/50 rounded-3xl border border-[var(--border-main)]">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Glass</p>
                    <p className="text-sm font-bold text-[var(--text-main)]">{isGlassEnabled ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Preferences & Account */}
            <div className="lg:col-span-4 space-y-12">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={clsx(
                  "p-10 rounded-[4rem] shadow-xl border border-[var(--border-main)]",
                  isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                )}
              >
                <h2 className="text-2xl font-black tracking-tighter uppercase mb-8 text-[var(--text-main)]">Preferences</h2>
                <div className="space-y-4">
                  {[
                    { id: 'emailNotifications', label: 'Neural Alerts', desc: 'Sync updates.', icon: Bell },
                    { id: 'aiSuggestions', label: 'Cognitive Flow', desc: 'AI writing.', icon: Sparkles },
                    { id: 'publicProfile', label: 'Global Node', desc: 'Network broadcast.', icon: Globe }
                  ].map((pref) => (
                    <div key={pref.id} className="p-6 bg-[var(--bg-app)] rounded-[2rem] group hover:bg-[var(--accent-main)] transition-all duration-500 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-main)] shadow-sm group-hover:scale-110 transition-transform">
                          <pref.icon size={20} />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-[var(--text-main)] group-hover:text-white transition-colors">{pref.label}</h4>
                          <p className="text-[9px] text-[var(--text-muted)] group-hover:text-stone-400 font-medium uppercase tracking-widest">{pref.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const currentPrefs = editedProfile.preferences || profile?.preferences || {
                            emailNotifications: true,
                            aiSuggestions: true,
                            publicProfile: false,
                            theme: 'light'
                          };
                          const currentVal = currentPrefs[pref.id as keyof typeof currentPrefs];

                          setEditedProfile(prev => ({
                            ...prev,
                            preferences: {
                              ...currentPrefs,
                              [pref.id]: !currentVal
                            }
                          }));
                        }}
                        className={clsx(
                          "w-10 h-5 rounded-full p-1 transition-all duration-700 relative",
                          (editedProfile.preferences?.[pref.id as keyof NonNullable<UserProfile['preferences']>] ?? profile?.preferences?.[pref.id as keyof NonNullable<UserProfile['preferences']>] ?? false)
                            ? "bg-green-500"
                            : "bg-[var(--border-main)] group-hover:bg-white/10"
                        )}
                      >
                        <motion.div
                          animate={{ x: (editedProfile.preferences?.[pref.id as keyof NonNullable<UserProfile['preferences']>] ?? profile?.preferences?.[pref.id as keyof NonNullable<UserProfile['preferences']>] ?? false) ? 20 : 0 }}
                          className="w-3 h-3 bg-white rounded-full shadow-2xl"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-stone-950 p-16 rounded-[5rem] shadow-2xl text-white relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-[120px] group-hover:bg-white/10 transition-all duration-1000" />
                <div className="relative z-10">
                  <h2 className="text-4xl font-black tracking-tighter uppercase mb-12">Account</h2>
                  <div className="space-y-8">
                    <div className="p-8 bg-white/5 rounded-[3rem] border border-white/5">
                      <p className="text-stone-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Authenticated Identity</p>
                      <p className="text-xl font-bold truncate">{user.email}</p>
                    </div>

                    <div className="space-y-4">
                      <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => auth.signOut()}
                        className="w-full py-8 bg-white text-stone-950 rounded-[3rem] font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl"
                      >
                        <LogOut size={24} />
                        Logout
                      </motion.button>

                      <button className="w-full py-6 text-stone-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">
                        Security Protocols & Logs
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Horizontal Assistance Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={clsx(
              "mt-12 p-10 rounded-[4rem] shadow-xl border border-[var(--border-main)]",
              isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
            )}
          >
            <h2 className="text-2xl font-black tracking-tighter uppercase mb-8 text-[var(--text-main)]">Assistance & Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Help Center', icon: HelpCircle, desc: 'Common Q&A', onClick: () => setIsHelpModalOpen(true) },
                { label: 'Support Terminal', icon: LifeBuoy, desc: 'Contact us', onClick: () => window.location.href = 'mailto:support@example.com' },
                { label: 'Privacy Codex', icon: Shield, desc: 'Data policy', onClick: () => { } },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-6 rounded-3xl bg-[var(--bg-app)] hover:bg-[var(--accent-main)] transition-all group border border-transparent hover:border-[var(--border-main)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-muted)] group-hover:bg-white group-hover:text-[var(--accent-main)] transition-all">
                      <item.icon size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[var(--text-main)] group-hover:text-white text-base">{item.label}</p>
                      <p className="text-[10px] text-[var(--text-muted)] group-hover:text-white/70 font-medium uppercase tracking-widest">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Help Q&A Modal */}
        <AnimatePresence>
          {isHelpModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsHelpModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={clsx(
                  "relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[3rem] border border-[var(--border-main)] p-10 shadow-2xl",
                  isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                )}
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">Help Center</h2>
                  <button onClick={() => setIsHelpModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-6">
                  {[
                    { q: "How do I generate an assignment?", a: "Navigate to the 'Generate' page, select a template or upload your own, and follow the steps to provide topic and context." },
                    { q: "Can I edit my generated documents?", a: "Yes, all generated assignments are saved in your 'Documents' page. You can click on any document to open it in our full-featured editor." },
                    { q: "How do I change the interface theme?", a: "Go to your Profile page and click 'Configure' in the Aesthetics section to customize themes, colors, and fonts." },
                    { q: "Is my data secure?", a: "We use enterprise-grade encryption and secure authentication protocols to ensure your data remains private and protected." }
                  ].map((qa, i) => (
                    <div key={i} className="p-6 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-main)]">
                      <h4 className="font-bold text-[var(--text-main)] mb-2">Q: {qa.q}</h4>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">A: {qa.a}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-8 border-t border-[var(--border-main)] flex justify-center">
                  <button
                    onClick={() => window.location.href = 'mailto:support@example.com'}
                    className="flex items-center gap-2 text-sm font-bold text-[var(--accent-main)] hover:underline"
                  >
                    <MessageSquare size={16} /> Still need help? Contact Support
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Aesthetic Customization Modal */}
        <AnimatePresence>
          {isAestheticModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAestheticModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={clsx(
                  "relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[4rem] border border-[var(--border-main)] p-12 shadow-2xl",
                  isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                )}
              >
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase">Visual Configuration</h2>
                    <p className="text-[var(--text-muted)] font-medium">Preview and apply your interface preferences.</p>
                  </div>
                  <button
                    onClick={() => setIsAestheticModalOpen(false)}
                    className="w-12 h-12 rounded-full bg-[var(--bg-app)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-12">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-[var(--text-main)] tracking-tight uppercase">Theme Presets</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: 'light', label: 'Classic', color: 'bg-[#FBFBFA]', border: 'border-stone-200' },
                        { id: 'dark', label: 'Onyx', color: 'bg-[#0C0A09]', border: 'border-stone-800' },
                        { id: 'midnight', label: 'Midnight', color: 'bg-[#020617]', border: 'border-slate-800' },
                        { id: 'emerald', label: 'Emerald', color: 'bg-[#022C22]', border: 'border-emerald-800' },
                        { id: 'rose', label: 'Velvet', color: 'bg-[#450A0A]', border: 'border-rose-900' },
                        { id: 'amber', label: 'Amber', color: 'bg-[#451A03]', border: 'border-amber-900' },
                        { id: 'nord', label: 'Nordic', color: 'bg-[#2E3440]', border: 'border-slate-700' },
                        { id: 'coffee', label: 'Coffee', color: 'bg-[#1A120B]', border: 'border-stone-900' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleThemePreview(t.id)}
                          className={clsx(
                            "group relative p-4 rounded-3xl border-4 transition-all duration-300 text-left overflow-hidden",
                            currentTheme === t.id
                              ? "border-[var(--text-main)] bg-[var(--bg-app)]"
                              : "border-transparent bg-[var(--bg-app)]/50 hover:bg-[var(--bg-app)]"
                          )}
                        >
                          <div className={clsx("w-full aspect-video rounded-xl mb-2 shadow-inner border", t.color, t.border)} />
                          <span className={clsx(
                            "text-[10px] font-black uppercase tracking-widest transition-colors",
                            currentTheme === t.id ? "text-[var(--text-main)]" : "text-[var(--text-muted)]"
                          )}>
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h3 className="text-xl font-black text-[var(--text-main)] tracking-tight uppercase">Accent Palette</h3>
                      <div className="flex flex-wrap gap-3 items-center">
                        {[
                          { name: 'Default', value: '#1C1917' },
                          { name: 'Royal', value: '#4F46E5' },
                          { name: 'Emerald', value: '#10B981' },
                          { name: 'Rose', value: '#F43F5E' },
                          { name: 'Amber', value: '#F59E0B' },
                          { name: 'Violet', value: '#8B5CF6' },
                          { name: 'Sky', value: '#0EA5E9' },
                        ].map((color) => (
                          <button
                            key={color.value}
                            onClick={() => handleAccentPreview(color.value)}
                            className={clsx(
                              "w-10 h-10 rounded-xl border-4 transition-all duration-300",
                              accentColor === color.value ? "border-[var(--text-main)] scale-110" : "border-transparent"
                            )}
                            style={{ backgroundColor: color.value }}
                          />
                        ))}
                        <div className="relative group">
                          <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => handleAccentPreview(e.target.value)}
                            className="w-10 h-10 rounded-xl border-4 border-transparent cursor-pointer opacity-0 absolute inset-0 z-10"
                          />
                          <div className={clsx(
                            "w-10 h-10 rounded-xl border-4 flex items-center justify-center transition-all duration-300",
                            !['#1C1917', '#4F46E5', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6', '#0EA5E9'].includes(accentColor)
                              ? "border-[var(--text-main)] scale-110"
                              : "border-dashed border-[var(--border-main)]"
                          )} style={{ backgroundColor: !['#1C1917', '#4F46E5', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6', '#0EA5E9'].includes(accentColor) ? accentColor : 'transparent' }}>
                            <Palette size={16} className="text-[var(--text-muted)]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xl font-black text-[var(--text-main)] tracking-tight uppercase">Typography</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { id: 'sans', label: 'Modern Sans', font: 'font-sans' },
                          { id: 'serif', label: 'Elegant Serif', font: 'font-serif' },
                          { id: 'mono', label: 'Technical Mono', font: 'font-mono' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            onClick={() => handleFontPreview(f.id as any)}
                            className={clsx(
                              "flex items-center justify-between p-4 rounded-2xl border-4 transition-all",
                              currentFont === f.id ? "border-[var(--text-main)] bg-[var(--bg-app)]" : "border-transparent bg-[var(--bg-app)]/50"
                            )}
                          >
                            <span className={clsx("font-bold", f.font)}>{f.label}</span>
                            {currentFont === f.id && <Check size={16} className="text-[var(--accent-main)]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-[var(--border-main)]">
                    <button
                      onClick={() => handleGlassPreview(!isGlassEnabled)}
                      className="flex items-center gap-4 group"
                    >
                      <div className={clsx(
                        "w-12 h-6 rounded-full p-1 transition-all duration-300 relative",
                        isGlassEnabled ? "bg-[var(--accent-main)]" : "bg-[var(--border-main)]"
                      )}>
                        <motion.div
                          animate={{ x: isGlassEnabled ? 24 : 0 }}
                          className="w-4 h-4 bg-white rounded-full"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[var(--text-main)] uppercase">Glassmorphism</p>
                        <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-widest">Enable blurred interface</p>
                      </div>
                    </button>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setIsAestheticModalOpen(false)}
                        className="px-8 py-4 text-[var(--text-muted)] font-black uppercase tracking-widest text-xs hover:text-[var(--text-main)] transition-colors"
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          handleSave();
                          setIsAestheticModalOpen(false);
                        }}
                        className="px-10 py-4 bg-[var(--text-main)] text-[var(--bg-card)] rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl"
                      >
                        Apply Changes
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AvatarModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          onSelect={handleAvatarSelect}
          currentAvatar={profile?.photoURL || user.photoURL || ''}
        />
      </div>
    </Layout>
  );
};

export default ProfilePage;
