import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon, Camera, Save, RefreshCw,
  Calendar as CalendarIcon, ChevronRight, ChevronLeft,
  Activity, LogOut, X, Flame, Trophy, Zap,
  Github, Linkedin, Globe, Plus, FileText,
  TrendingUp, Hash, BookOpen, Star, Target,
  GraduationCap, MapPin, Check, Award, Edit3, Search
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/context/AuthContext';
import {
  getUserProfile, updateUserProfile, subscribeToUserDocuments,
  UserProfile, Document
} from '../shared/services/db';
import { signOut } from '../shared/services/auth';
import { AppLayout as Layout } from '../app/layout/AppLayout';
import AvatarModal from '../shared/components/AvatarModal';
import Aurora from '../features/editor/components/Aurora';

// ─── Extended Profile Type ───────────────────────────────────────────────────
type ExtendedProfile = Partial<UserProfile & {
  bio: string;
  skills: string[];
  socialLinks: { github?: string; linkedin?: string; website?: string };
  weeklyGoal: number;
}>;

// ─── Animated Counter Hook ───────────────────────────────────────────────────
const useAnimatedCounter = (target: number, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

// ─── Streak Calculator ───────────────────────────────────────────────────────
const calculateStreak = (docs: Document[]): number => {
  if (!docs.length) return 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const uniqueDays = new Set(
    docs.map(d => { const x = new Date(d.createdAt); x.setHours(0, 0, 0, 0); return x.getTime(); })
  );
  let streak = 0;
  let check = new Date(today);
  if (!uniqueDays.has(check.getTime())) {
    check.setDate(check.getDate() - 1);
    if (!uniqueDays.has(check.getTime())) return 0;
  }
  while (uniqueDays.has(check.getTime())) { streak++; check.setDate(check.getDate() - 1); }
  return streak;
};

// ─── Achievement System ──────────────────────────────────────────────────────
interface Achievement { id: string; icon: React.ReactNode; label: string; desc: string; unlocked: boolean; }
const getAchievements = (docs: number, streak: number, words: number, weekMax: number): Achievement[] => [
  { id: 'first', icon: <Star size={14} />, label: 'First Step', desc: 'Created your first doc', unlocked: docs >= 1 },
  { id: 'writer', icon: <FileText size={14} />, label: 'Writer', desc: '10 documents created', unlocked: docs >= 10 },
  { id: 'prolific', icon: <BookOpen size={14} />, label: 'Prolific', desc: '50 documents created', unlocked: docs >= 50 },
  { id: 'century', icon: <Trophy size={14} />, label: 'Century', desc: '100 documents created', unlocked: docs >= 100 },
  { id: 'fire3', icon: <Flame size={14} />, label: 'On Fire', desc: '3-day streak', unlocked: streak >= 3 },
  { id: 'fire7', icon: <Zap size={14} />, label: 'Dedicated', desc: '7-day streak', unlocked: streak >= 7 },
  { id: 'words', icon: <Hash size={14} />, label: 'Word Weaver', desc: '10,000 words written', unlocked: words >= 10000 },
  { id: 'sprint', icon: <Target size={14} />, label: 'Sprint', desc: '5 docs in one week', unlocked: weekMax >= 5 },
];

// ─── Week Picker ─────────────────────────────────────────────────────────────
const WeekPicker = ({
  selectedDate, onSelect, onClose
}: { selectedDate: Date; onSelect: (m: Date) => void; onClose: () => void }) => {
  const [viewMonth, setViewMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const days = useMemo(() => {
    const start = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const end = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
    const arr: { date: Date; current: boolean }[] = [];
    const pad = (start.getDay() + 6) % 7;
    for (let i = 0; i < pad; i++) { const d = new Date(start); d.setDate(d.getDate() - (pad - i)); arr.push({ date: d, current: false }); }
    for (let i = 1; i <= end.getDate(); i++) arr.push({ date: new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i), current: true });
    for (let i = 1; i <= 42 - arr.length; i++) { const d = new Date(end); d.setDate(d.getDate() + i); arr.push({ date: d, current: false }); }
    return arr;
  }, [viewMonth]);

  const isSameWeek = (a: Date, b: Date) => {
    const mon = (d: Date) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); x.setHours(0, 0, 0, 0); return x.getTime(); };
    return mon(a) === mon(b);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="absolute top-full right-0 mt-4 z-50 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2.5rem] shadow-2xl p-6 w-80">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">
          {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="flex gap-1">
          <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} className="p-2 hover:bg-[var(--bg-app)] rounded-full transition-colors"><ChevronLeft size={14} /></button>
          <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} className="p-2 hover:bg-[var(--bg-app)] rounded-full transition-colors"><ChevronRight size={14} /></button>
          <button onClick={onClose} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-full ml-1 transition-colors"><X size={14} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="text-center text-[9px] font-black text-[var(--text-muted)] p-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const sel = isSameWeek(d.date, selectedDate);
          return (
            <button key={i}
              onClick={() => { const m = new Date(d.date); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); onSelect(m); onClose(); }}
              className={clsx('h-9 flex items-center justify-center text-[10px] font-bold rounded-xl transition-all',
                !d.current && 'opacity-20',
                sel ? 'bg-[var(--text-main)] text-white' : 'hover:bg-[var(--bg-app)]')}>
              {d.date.getDate()}
            </button>
          );
        })}
      </div>
      <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-center mt-5">Click any day to select that week</p>
    </motion.div>
  );
};

// ─── Submission Graph ─────────────────────────────────────────────────────────
const SubmissionGraph = ({ data, goal }: { data: number[]; goal: number }) => {
  const max = Math.max(...data, goal, 1);
  const total = data.reduce((a, b) => a + b, 0);
  const trend = data[6] - data[0];
  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="relative mt-12">
      {/* Trend badge */}
      <div className="absolute -top-8 right-0 flex items-center gap-2">
        <span className={clsx('text-[9px] font-black px-3 py-1 rounded-full border flex items-center gap-1 transition-colors',
          trend > 0 ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
            : trend < 0 ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
              : 'text-[var(--text-muted)] bg-[var(--bg-card)] border-[var(--border-main)]')}>
          <TrendingUp size={10} className={trend < 0 ? 'rotate-180' : ''} />
          {trend > 0 ? 'Trending Up' : trend < 0 ? 'Trending Down' : 'Steady'}
        </span>
        <span className="text-[9px] font-black text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-1 rounded-full border border-[var(--border-main)]">
          {total} this week
        </span>
      </div>

      {/* Goal dashed line */}
      {goal > 0 && (
        <div className="absolute inset-x-0 pointer-events-none z-20"
          style={{ bottom: `calc(${(goal / max) * 100}% + 2.5rem)` }}>
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-dashed border-[var(--text-main)]/25" />
            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">Goal {goal}</span>
          </div>
        </div>
      )}

      <div className="flex items-end justify-between h-44 gap-3 md:gap-5 relative z-10">
        {data.map((val, i) => {
          const goalMet = goal > 0 && val >= goal;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-full flex-1 flex flex-col justify-end relative">
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 z-20">
                  <span className={clsx('text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm transition-colors',
                    val > 0 ? 'bg-[var(--text-main)] text-white' : 'text-[var(--text-muted)] opacity-30')}>
                    {val}
                  </span>
                </motion.div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((val / max) * 100, 2)}%` }}
                  transition={{ type: 'spring', damping: 15, stiffness: 100, delay: i * 0.05 }}
                  style={{ minHeight: '6px' }}
                  className={clsx('w-full rounded-t-2xl transition-all relative overflow-hidden',
                    goalMet
                      ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/20'
                      : val > 0
                        ? 'bg-gradient-to-t from-[var(--text-main)] to-[var(--text-muted)] group-hover:from-[var(--accent-main)] group-hover:to-[var(--text-main)] shadow-lg shadow-black/5'
                        : 'bg-[var(--text-main)]/5')}>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className={clsx('text-[10px] font-black uppercase tracking-tighter transition-colors',
                  val > 0 ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)] opacity-50')}>
                  {DAY_NAMES[i]}
                </span>
                {goalMet && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Skill Input ──────────────────────────────────────────────────────────────
const SkillInput = ({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) => {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim();
    if (t && !skills.includes(t) && skills.length < 10) { onChange([...skills, t]); setInput(''); }
  };
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Skills & Interests</label>
      <div className="flex flex-wrap gap-2 p-4 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-[2rem] min-h-[58px]">
        {skills.map(s => (
          <span key={s} className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-full text-[11px] font-bold text-[var(--text-main)] group">
            <Hash size={9} className="opacity-40" /> {s}
            <button onClick={() => onChange(skills.filter(x => x !== s))}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-500 ml-0.5"><X size={9} /></button>
          </span>
        ))}
        <div className="flex items-center gap-2 flex-1 min-w-[110px]">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
            placeholder="Add skill…"
            className="flex-1 bg-transparent outline-none text-[11px] font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40 min-w-0" />
          <button onClick={add} className="p-1.5 hover:bg-[var(--bg-card)] rounded-full transition-colors">
            <Plus size={11} className="text-[var(--text-muted)]" />
          </button>
        </div>
      </div>
      <p className="text-[9px] text-[var(--text-muted)] ml-1 opacity-50">Enter or comma to add · {10 - skills.length} remaining</p>
    </div>
  );
};

// ─── Recent Docs List ─────────────────────────────────────────────────────────
const RecentDocsList = ({ docs }: { docs: Document[] }) => {
  const recent = useMemo(() =>
    [...docs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [docs]);
  if (!recent.length) return (
    <div className="text-center py-8 opacity-30">
      <FileText size={22} className="mx-auto mb-2 text-[var(--text-muted)]" />
      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">No docs yet</p>
    </div>
  );
  return (
    <div className="space-y-1">
      {recent.map((doc, i) => (
        <motion.div key={(doc as any).id || i}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[var(--bg-app)] transition-colors group cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-[var(--bg-app)] border border-[var(--border-main)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--text-main)] transition-colors shadow-sm">
            <FileText size={12} className="text-[var(--text-muted)] group-hover:text-white transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-[var(--text-main)] truncate">{(doc as any).title || 'Untitled'}</p>
            <p className="text-[9px] text-[var(--text-muted)] opacity-60 mt-0.5">
              {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <ChevronRight size={12} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      ))}
    </div>
  );
};

// ─── Main ProfilePage ─────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, profile: userProfile, refreshProfile, offlineUid } = useAuth();
  const [activeTab, setActiveTab] = useState<'identity' | 'activity' | 'docs'>('identity');
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isEditingID, setIsEditingID] = useState(false);
  const [newCustomID, setNewCustomID] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedMonday, setSelectedMonday] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [profile, setProfile] = useState<ExtendedProfile>({ displayName: '', institution: '', fieldOfStudy: '' });
  const [editedProfile, setEditedProfile] = useState<ExtendedProfile>({});
  const [allDocs, setAllDocs] = useState<Document[]>([]);

  useEffect(() => {
    const uid = user?.uid || offlineUid;
    if (!uid) return;
    
    // Use the profile from AuthContext if available, otherwise fetch
    if (userProfile) {
      setProfile({ ...userProfile, displayName: userProfile.displayName || '' });
      setNewCustomID(userProfile.custom_id || '');
    } else {
      getUserProfile(uid).then(data => {
        if (data) {
          setProfile({ ...data, displayName: data.displayName || '' });
          setNewCustomID(data.custom_id || '');
        }
      });
    }
    return subscribeToUserDocuments(uid, setAllDocs);
  }, [user, userProfile, offlineUid]);

  const filteredDocs = useMemo(() => {
    if (!searchQuery) return allDocs;
    return allDocs.filter(d => 
      (d as any).title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allDocs, searchQuery]);

  const stats = useMemo(() => {
    const weekly = [0, 0, 0, 0, 0, 0, 0];
    const targetSun = new Date(selectedMonday);
    targetSun.setDate(targetSun.getDate() + 6);
    targetSun.setHours(23, 59, 59, 999);

    allDocs.forEach(doc => {
      const c = new Date(doc.createdAt);
      if (c >= selectedMonday && c <= targetSun) weekly[(c.getDay() + 6) % 7]++;
    });

    const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const topIdx = weekly.indexOf(Math.max(...weekly));
    const wordsCount = allDocs.reduce((acc, d) => acc + (d.content?.split(/\s+/).filter(Boolean).length || 0), 0);
    const streak = calculateStreak(allDocs);
    const weekTotal = weekly.reduce((a, b) => a + b, 0);

    return {
      docsCount: allDocs.length,
      wordsCount,
      weekly,
      peakDay: weekly[topIdx] > 0 ? `${DAY_NAMES[topIdx]}: ${weekly[topIdx]}` : 'N/A',
      rangeText: `${selectedMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${targetSun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      velocity: (allDocs.length / 4).toFixed(1),
      streak,
      weekTotal,
      avgWords: allDocs.length > 0 ? Math.round(wordsCount / allDocs.length) : 0,
    };
  }, [allDocs, selectedMonday]);

  const merged: ExtendedProfile = { ...profile, ...editedProfile };
  const accentColor = profile?.preferences?.accentColor || '#1C1917';
  const isGlassEnabled = profile?.preferences?.glassmorphism ?? false;
  const skills: string[] = merged.skills || [];
  const weeklyGoal: number = merged.weeklyGoal || 0;

  const achievements = useMemo(() =>
    getAchievements(stats.docsCount, stats.streak, stats.wordsCount, stats.weekTotal),
    [stats]);

  const animatedDocs = useAnimatedCounter(stats.docsCount);
  const animatedWords = useAnimatedCounter(stats.wordsCount);
  const animatedStreak = useAnimatedCounter(stats.streak);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updated = { ...profile, ...editedProfile };
      const result = await updateUserProfile(user.uid, updated as UserProfile);
      
      if (result && !result.error && !result.detail) {
        // Sync with server's state (including timestamps)
        setProfile({ ...result, displayName: result.displayName || '' });
        setEditedProfile({});
        await refreshProfile();
        toast.success('Profile saved!');
      } else {
        const errorMsg = Array.isArray(result?.detail) 
          ? result.detail.map((err: any) => err.msg).join(', ')
          : result?.detail || result?.error || 'Failed to save';
        toast.error(errorMsg);
      }
    } catch (err) { 
      toast.error('Connection error'); 
    }
    finally { setIsSaving(false); }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--bg-app)] pb-32">
        {/* Profile Hero */}
        <div className="max-w-7xl mx-auto px-8 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-end gap-10"
          >
            {/* Avatar Section */}
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-44 h-44 rounded-[3.5rem] bg-[var(--bg-card)] border-4 border-[var(--border-main)] shadow-2xl relative overflow-hidden group/avatar cursor-pointer ring-8 ring-[var(--text-main)]/5"
                onClick={() => setIsAvatarModalOpen(true)}
              >
                <div className="w-full h-full p-2">
                  <img
                    src={merged.photoURL || profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'guest'}`}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-[2.5rem]"
                  />
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                  <Edit3 className="text-white" size={32} />
                </div>
              </motion.div>
              <button 
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute top-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border border-[var(--border-main)] hover:scale-110 active:scale-95 transition-all z-20 group-hover:rotate-12"
              >
                <Edit3 size={16} className="text-[var(--text-main)]" />
              </button>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border border-[var(--border-main)] scale-0 animate-in zoom-in duration-500 delay-300 fill-mode-forwards">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Check size={16} strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Profile Info Summary */}
            <div className="flex-1 flex flex-col gap-6 text-center md:text-left">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-6xl font-black text-[var(--text-main)] tracking-tighter uppercase leading-[0.8]"
                >
                  {merged.displayName || 'Scholar'}
                </motion.h1>
                
                <div className="mt-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                    const lastUpdate = profile.custom_id_updated_at ? new Date(profile.custom_id_updated_at) : null;
                    const oneYearAgo = new Date();
                    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                    
                    if (lastUpdate && lastUpdate > oneYearAgo) {
                      const daysLeft = Math.ceil((lastUpdate.getTime() + (365 * 24 * 60 * 60 * 1000) - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      toast.error(`User ID can only be changed once a year. Please wait ${daysLeft} more days.`);
                      return;
                    }
                    setIsEditingID(true);
                  }}>
                    <span className="text-rose-500 font-black text-lg tracking-tight lowercase">
                      @{merged.custom_id || 'unclaimed_identity'}
                    </span>
                    {!isEditingID && (
                      <Edit3 size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  
                  <div className="h-4 w-[1px] bg-[var(--border-main)] hidden md:block" />
                  
                  <p className="text-[var(--text-muted)] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center md:justify-start gap-3">
                    <MapPin size={12} /> {merged.institution || 'Neutral Ground'} · {merged.fieldOfStudy || 'General Research'}
                  </p>
                </div>

                <AnimatePresence>
                  {isEditingID && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="mt-4 flex items-center gap-3"
                    >
                      <div className="flex items-center gap-1 border-b-2 border-rose-500 pb-1">
                        <span className="text-rose-500 font-black text-lg">@</span>
                        <input 
                          autoFocus
                          value={newCustomID}
                          onChange={e => setNewCustomID(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          className="bg-transparent border-none outline-none font-black text-lg text-[var(--text-main)] placeholder:text-[var(--text-muted)]/30 w-40"
                          placeholder="user_id"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              setEditedProfile({ ...editedProfile, custom_id: newCustomID });
                              setIsEditingID(false);
                            }
                            if (e.key === 'Escape') setIsEditingID(false);
                          }}
                        />
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            setEditedProfile({ ...editedProfile, custom_id: newCustomID });
                            setIsEditingID(false);
                          }}
                          className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-colors"
                        >
                          <Check size={18} strokeWidth={3} />
                        </button>
                        <button onClick={() => setIsEditingID(false)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors">
                          <X size={18} strokeWidth={3} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
                {[
                  { label: 'Documents', val: animatedDocs, icon: FileText },
                  { label: 'Words Written', val: animatedWords, icon: Hash },
                  { label: 'Day Streak', val: animatedStreak, icon: Flame, color: 'text-orange-500' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex flex-col md:items-start"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <s.icon size={12} className={clsx(s.color || 'text-[var(--text-muted)]')} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">{s.label}</span>
                    </div>
                    <span className="text-2xl font-black text-[var(--text-main)] tracking-tighter">{s.val.toLocaleString()}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex flex-col gap-3 min-w-[200px]">
              <button
                onClick={handleSave}
                disabled={isSaving || Object.keys(editedProfile).length === 0}
                className={clsx(
                  "w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 relative overflow-hidden group",
                  Object.keys(editedProfile).length > 0
                    ? "bg-[var(--text-main)] text-[var(--bg-card)] shadow-2xl hover:scale-105 active:scale-95"
                    : "bg-[var(--bg-app)] text-[var(--text-muted)] opacity-50 cursor-not-allowed border border-[var(--border-main)]"
                )}
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                {isSaving ? 'Verifying...' : 'Save'}
                {Object.keys(editedProfile).length > 0 && !isSaving && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                  />
                )}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => signOut()}
                  className="w-full h-11 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl flex items-center justify-center text-[var(--text-muted)] hover:text-rose-500 transition-colors gap-2 font-black text-[10px] uppercase tracking-widest"
                >
                  <LogOut size={14} /> Terminate Session
                </button>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between mt-16">
            <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2rem] w-fit shadow-sm overflow-hidden relative">
              {[
                { id: 'identity', label: 'Identity', icon: UserIcon },
                { id: 'activity', label: 'Activity', icon: Activity },
                { id: 'docs', label: 'Archive', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    "px-8 py-3.5 font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] transition-all flex items-center gap-3 relative z-10 group",
                    activeTab === tab.id
                      ? "text-[var(--bg-card)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  )}
                >
                  <tab.icon size={14} strokeWidth={3} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="active-profile-tab"
                      className="absolute inset-0 bg-[var(--text-main)] -z-10 rounded-[1.5rem] shadow-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Profile Search Option */}
            <div className="relative group w-full md:w-80">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-main)]" size={18} />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'docs' ? 'documents' : activeTab === 'activity' ? 'activity' : 'profile'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[1.8rem] text-sm font-bold text-[var(--text-main)] focus:border-[var(--text-main)] transition-all outline-none shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-8">
          <AnimatePresence mode="wait">
            {activeTab === 'identity' && (
              <motion.div
                key="identity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-12 gap-10"
              >
                {/* Personal Info */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                  <div className={clsx(
                    "p-12 rounded-[4rem] border border-[var(--border-main)] shadow-2xl space-y-10",
                    isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[var(--text-main)]/5 rounded-2xl">
                        <UserIcon className="text-[var(--text-main)]" size={24} />
                      </div>
                      <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase leading-none">Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Full Scholarly Name</label>
                        <input
                          type="text"
                          value={merged.displayName}
                          onChange={e => setEditedProfile({ ...editedProfile, displayName: e.target.value })}
                          className="w-full px-6 py-4 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl text-sm font-bold text-[var(--text-main)] focus:border-[var(--text-main)] transition-colors outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Primary Institution</label>
                        <input
                          type="text"
                          value={merged.institution}
                          onChange={e => setEditedProfile({ ...editedProfile, institution: e.target.value })}
                          className="w-full px-6 py-4 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl text-sm font-bold text-[var(--text-main)] focus:border-[var(--text-main)] transition-colors outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Field of Concentration</label>
                        <input
                          type="text"
                          value={merged.fieldOfStudy}
                          onChange={e => setEditedProfile({ ...editedProfile, fieldOfStudy: e.target.value })}
                          className="w-full px-6 py-4 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl text-sm font-bold text-[var(--text-main)] focus:border-[var(--text-main)] transition-colors outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Personal Research Goal</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={merged.weeklyGoal || ''}
                            onChange={e => setEditedProfile({ ...editedProfile, weeklyGoal: parseInt(e.target.value) || 0 })}
                            className="w-full px-6 py-4 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl text-sm font-bold text-[var(--text-main)] focus:border-[var(--text-main)] transition-colors outline-none"
                            placeholder="e.g. 5"
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Docs / Week</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Research Bio & Objectives</label>
                      <textarea
                        rows={4}
                        value={merged.bio}
                        onChange={e => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        className="w-full px-6 py-6 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-[2.5rem] text-sm font-bold text-[var(--text-main)] focus:border-[var(--text-main)] transition-colors outline-none resize-none"
                        placeholder="Tell the community about your expertise and scholarly focus…"
                      />
                    </div>

                    <div className="pt-4">
                      <SkillInput skills={skills} onChange={s => setEditedProfile({ ...editedProfile, skills: s })} />
                    </div>
                  </div>
                </div>

                {/* Social & Connections */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                  <div className={clsx(
                    "p-10 rounded-[3.5rem] border border-[var(--border-main)] shadow-xl h-full",
                    isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                  )}>
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3 bg-blue-500/10 rounded-2xl">
                        <Globe className="text-blue-500" size={20} />
                      </div>
                      <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase">Network Links</h3>
                    </div>

                    <div className="space-y-6">
                      {[
                        { id: 'github', label: 'GitHub Identity', icon: Github, placeholder: 'github.com/username' },
                        { id: 'linkedin', label: 'LinkedIn Profile', icon: Linkedin, placeholder: 'linkedin.com/in/username' },
                        { id: 'website', label: 'Digital Garden', icon: Globe, placeholder: 'https://scholar.me' },
                      ].map((social) => (
                        <div key={social.id} className="space-y-2">
                          <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">{social.label}</label>
                          <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--text-main)] transition-colors">
                              <social.icon size={16} />
                            </div>
                            <input
                              type="text"
                              value={merged.socialLinks?.[social.id as keyof typeof merged.socialLinks] || ''}
                              onChange={e => setEditedProfile({
                                ...editedProfile,
                                socialLinks: { ...merged.socialLinks, [social.id]: e.target.value }
                              })}
                              className="w-full pl-14 pr-6 py-4 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl text-xs font-bold text-[var(--text-main)] focus:border-[var(--text-main)] transition-colors outline-none"
                              placeholder={social.placeholder}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 p-8 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-[2.5rem] relative overflow-hidden group">
                      <Aurora colorStops={['#E5E7EB', '#CBD5E1', '#E5E7EB']} speed={0.05} />
                      <div className="relative z-10 flex flex-col items-center text-center gap-3">
                        <div className="w-12 h-12 bg-[var(--bg-card)] rounded-full flex items-center justify-center shadow-lg">
                          <Trophy className="text-amber-500" size={20} />
                        </div>
                        <p className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em]">Scholarly Status</p>
                        <p className="text-[var(--text-muted)] text-[9px] font-bold uppercase">Senior Researcher · v.2.4</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Engagement Graph */}
                <div className={clsx(
                  "p-12 rounded-[5rem] border border-[var(--border-main)] shadow-2xl overflow-hidden relative",
                  isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                )}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-500/10 rounded-2xl">
                        <Activity className="text-rose-500" size={24} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase leading-none">Research Velocity</h2>
                        <p className="text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest mt-2">Active Engagement Period</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className="flex items-center gap-4 px-6 py-3.5 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-full text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] hover:scale-102 transition-all shadow-sm group"
                      >
                        <CalendarIcon size={14} className="text-rose-500" />
                        {stats.rangeText}
                        <ChevronRight size={14} className={clsx('transition-transform', isCalendarOpen && 'rotate-90')} />
                      </button>

                      <AnimatePresence>
                        {isCalendarOpen && (
                          <WeekPicker
                            selectedDate={selectedMonday}
                            onSelect={setSelectedMonday}
                            onClose={() => setIsCalendarOpen(false)}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <SubmissionGraph data={stats.weekly} goal={weeklyGoal} />
                  
                  <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Weekly Peak', val: stats.peakDay, color: 'text-emerald-500' },
                      { label: 'Consistency', val: `${((stats.weekTotal / Math.max(weeklyGoal, 7)) * 100).toFixed(0)}%`, color: 'text-blue-500' },
                      { label: 'Velocity', val: `${stats.velocity} docs / mo`, color: 'text-purple-500' },
                      { label: 'Avg Length', val: `${stats.avgWords} words`, color: 'text-stone-500' },
                    ].map((m, i) => (
                      <div key={i} className="p-6 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-3xl">
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">{m.label}</p>
                        <p className={clsx("text-lg font-black tracking-tight", m.color)}>{m.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {achievements.map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={clsx(
                        "p-6 rounded-[2.5rem] border transition-all flex items-center gap-4 group",
                        a.unlocked 
                          ? "bg-[var(--bg-card)] border-[var(--border-main)] shadow-xl" 
                          : "bg-[var(--bg-app)] border-transparent opacity-40 grayscale"
                      )}
                    >
                      <div className={clsx(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        a.unlocked ? "bg-[var(--text-main)] text-[var(--bg-card)] shadow-lg group-hover:rotate-12" : "bg-stone-200 text-stone-500"
                      )}>
                        {a.icon}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[var(--text-main)] uppercase tracking-tight">{a.label}</p>
                        <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase leading-none mt-1">{a.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'docs' && (
              <motion.div
                key="docs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-10"
              >
                <div className="md:col-span-2">
                  <div className={clsx(
                    "p-12 rounded-[4rem] border border-[var(--border-main)] shadow-2xl",
                    isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                  )}>
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--text-main)]/5 rounded-2xl">
                          <BookOpen className="text-[var(--text-main)]" size={24} />
                        </div>
                        <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase leading-none">Research Archive</h2>
                      </div>
                      <span className="px-5 py-2 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        {allDocs.length} Documents Total
                      </span>
                    </div>

                    <RecentDocsList docs={filteredDocs} />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className={clsx(
                    "p-10 rounded-[3.5rem] border border-[var(--border-main)] shadow-xl",
                    isGlassEnabled ? "glass-card" : "bg-[var(--bg-card)]"
                  )}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-amber-500/10 rounded-2xl">
                        <Award className="text-amber-500" size={20} />
                      </div>
                      <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase">Certification</h3>
                    </div>
                    <p className="text-[var(--text-muted)] text-xs font-bold uppercase leading-relaxed mb-8 opacity-80">
                      You have reached the <span className="text-[var(--text-main)]">Pro Librarian</span> status with {stats.docsCount} validated research documents.
                    </p>
                    <div className="w-full h-2 bg-[var(--bg-app)] rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((stats.docsCount / 100) * 100, 100)}%` }}
                        className="h-full bg-amber-500"
                      />
                    </div>
                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">
                      {100 - stats.docsCount} docs to next rank
                    </p>
                  </div>
                  
                  <div className="p-10 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <Aurora colorStops={['#818CF8', '#4F46E5', '#818CF8']} speed={0.1} />
                    <div className="relative z-10">
                      <GraduationCap className="mb-6 opacity-40" size={32} />
                      <h4 className="text-2xl font-black uppercase tracking-tighter leading-none mb-2">AssignMate Lab</h4>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-8">Scholarly Beta Access Enabled</p>
                      <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">
                        View Lab Metrics
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={(url) => setEditedProfile({ ...editedProfile, photoURL: url })}
        currentAvatar={merged.photoURL || user?.photoURL || ''}
      />
    </Layout>
  );
};

export default ProfilePage;
