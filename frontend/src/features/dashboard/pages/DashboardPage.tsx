import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Zap,
  Search,
  Plus,
  LayoutDashboard,
  ChevronRight,
  ArrowRight,
  Clock,
  GraduationCap,
  BookOpen,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import { getUserDocuments, Document as Assignment } from '../../../shared/services/db';
import { AppLayout as Layout } from '../../../app/layout/AppLayout';
import Aurora from '../../editor/components/Aurora';

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const isGlassEnabled = profile?.preferences?.glassmorphism ?? false;
  const [recentDocs, setRecentDocs] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleReauth = () => {
      navigate('/login');
    };
    window.addEventListener('auth_required', handleReauth);
    return () => window.removeEventListener('auth_required', handleReauth);
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    getUserDocuments(user.uid).then((docs) => {
      setRecentDocs(docs.slice(0, 8) as Assignment[]);
      setLoading(false);
    }).catch(err => {
      if (err.message !== 'Unauthorized') {
        console.error("Failed to load documents:", err);
      }
      setLoading(false);
    });
  }, [user]);

  const stats = [
    { label: 'Total Projects', value: recentDocs.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+2 this week' },
    { label: 'Words Crafted', value: recentDocs.reduce((acc, doc) => acc + (doc.content?.split(/\s+/).length || 0), 0).toLocaleString(), icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Top 5% scholar' },
    { label: 'Efficiency', value: '94%', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'AI optimized' },
  ];

  const filteredDocs = recentDocs.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden bg-[var(--bg-app)]">
        {/* Immersive Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <Aurora
            colorStops={['#F5F5F0', '#E4E3E0', '#F5F5F0']}
            speed={0.2}
            amplitude={0.8}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto py-7 px-3 lg:px-7 space-y-10">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-[0.2em]"
            >
              <div className="w-8 h-[1px] bg-[var(--border-main)]" />
              Academic Workspace
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-main)] tracking-tight">
              Welcome, <span className="text-[var(--text-muted)] font-medium">{profile?.displayName?.split(' ')[0] || 'Scholar'}</span>.
            </h1>
          </div>

          <div className="flex justify-end md:w-fit">
            <button
              onClick={() => toast('No unread notifications', { icon: '📭' })}
              className="relative flex items-center gap-3 px-8 py-4 rounded-[1.5rem] border border-[var(--border-main)] hover:border-[var(--text-main)] transition-all bg-[var(--bg-card)]/40 backdrop-blur-xl shadow-sm text-[var(--text-main)] group"
            >
              <div className="relative">
                <Bell size={20} className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
                {/* Red indicator dot for unread */}
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-card)] shadow-sm animate-pulse" />
              </div>
              <span className="font-bold text-sm tracking-tight uppercase tracking-[0.1em]">Notifications</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            {/* Hero Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group overflow-hidden rounded-[2.5rem] bg-stone-950 p-10 md:p-14 text-white shadow-2xl"
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <Aurora colorStops={['#FFFFFF', '#444444', '#FFFFFF']} speed={0.2} />
              </div>

              <div className="relative z-10 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                  <Sparkles size={12} className="text-amber-400" />
                  Next-Gen Academic Writing
                </div>
                <div className="space-y-4 max-w-xl">
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                    Transform your <span className="italic font-serif text-amber-400">research</span> into excellence.
                  </h2>
                  <p className="text-lg text-stone-400 leading-relaxed font-medium">
                    Your AI-powered workspace is ready. Start a new assignment or continue where you left off with enhanced research tools.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <button
                    onClick={() => navigate('/generate')}
                    className="px-8 py-4 bg-white text-stone-900 rounded-2xl font-bold hover:bg-stone-50 transition-all flex items-center gap-2 shadow-xl active:scale-95"
                  >
                    <Plus size={20} /> Create New Project
                  </button>
                  <button
                    onClick={() => navigate('/templates')}
                    className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <LayoutDashboard size={18} /> Browse Templates
                  </button>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[140%] bg-gradient-to-br from-amber-500/20 via-indigo-500/10 to-transparent rounded-full blur-[100px] animate-pulse" />
              </div>
            </motion.div>

            {/* Stats Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={clsx(
                    "p-8 rounded-[2rem] border border-[var(--border-main)] transition-all group",
                    isGlassEnabled ? "glass-card border-none" : "bg-[var(--bg-card)] shadow-sm hover:shadow-xl hover:border-[var(--accent-main)]/20"
                  )}
                >
                  <div className="space-y-4">
                    <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                      <stat.icon size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-[var(--text-main)] tracking-tight">{stat.value}</p>
                        <span className="text-[10px] font-bold text-emerald-500">{stat.trend}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Documents Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-[var(--accent-main)] rounded-full" />
                  <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Recent Documents</h2>
                </div>
                <button
                  onClick={() => navigate('/documents')}
                  className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors flex items-center gap-1 uppercase tracking-widest"
                >
                  View Library <ChevronRight size={14} />
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-64 bg-[var(--bg-card)] rounded-[2.5rem] animate-pulse border border-[var(--border-main)]" />
                  ))}
                </div>
              ) : filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredDocs.map((doc, idx) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * idx }}
                      onClick={() => navigate(doc.isPersonal ? `/editor/personal/${doc.id}` : `/editor/${doc.id}`)}
                      className={clsx(
                        "group cursor-pointer p-8 rounded-[2.5rem] border border-[var(--border-main)] transition-all relative overflow-hidden flex flex-col h-64",
                        isGlassEnabled ? "glass-card border-none" : "bg-[var(--bg-card)] shadow-sm hover:shadow-2xl hover:border-[var(--accent-main)]/20"
                      )}
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <div className="w-12 h-12 bg-[var(--accent-main)] text-[var(--bg-card)] rounded-full flex items-center justify-center shadow-xl">
                          <ArrowRight size={20} />
                        </div>
                      </div>

                      <div className="flex-1 space-y-6">
                        <div className="w-16 h-16 bg-[var(--bg-app)] rounded-2xl flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[var(--accent-main)] group-hover:text-[var(--bg-card)] transition-all duration-300">
                          <FileText size={32} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-[var(--text-main)] line-clamp-1 mb-2 tracking-tight">{doc.title}</h3>
                          <div className="flex items-center gap-2 text-[var(--text-muted)]">
                            <Clock size={14} />
                            <p className="text-xs font-bold uppercase tracking-widest">
                              {doc.updatedAt && !isNaN(new Date(doc.updatedAt).getTime())
                                ? format(new Date(doc.updatedAt), 'MMM d, h:mm a')
                                : doc.createdAt && !isNaN(new Date(doc.createdAt).getTime())
                                  ? format(new Date(doc.createdAt), 'MMM d, h:mm a')
                                  : 'RECENT'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[var(--bg-app)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                          {doc.topic || 'Academic'}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-[var(--bg-app)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                          {doc.tone || 'Formal'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center bg-[var(--bg-card)] rounded-[3rem] border border-dashed border-[var(--border-main)]">
                  <div className="w-24 h-24 bg-[var(--bg-app)] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm text-[var(--text-muted)]">
                    <FileText size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-main)]">Your library is empty</h3>
                  <p className="text-[var(--text-muted)] font-medium mt-3 max-w-xs mx-auto leading-relaxed">
                    Start your academic journey by creating your first AI-assisted assignment.
                  </p>
                  <button
                    onClick={() => navigate('/generate')}
                    className="mt-10 px-10 py-5 bg-[var(--accent-main)] text-[var(--bg-card)] rounded-2xl font-bold hover:scale-105 transition-all shadow-2xl active:scale-95 flex items-center gap-2 mx-auto"
                  >
                    <Plus size={20} /> Create First Project
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-10">
            {/* Academic Insights / Tip of the Day */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <GraduationCap size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight">Academic Insight</h3>
                  <p className="text-indigo-100 text-sm leading-relaxed font-medium">
                    "A well-structured bibliography is the foundation of academic integrity. Use our AI to organize your sources efficiently."
                  </p>
                </div>
                <button className="text-xs font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors">
                  Learn More
                </button>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            </div>

            {/* Suggested Templates Mini-List */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight">Popular Templates</h3>
              <div className="space-y-3">
                {[
                  { title: 'Literature Review', icon: BookOpen, color: 'text-blue-500' },
                  { title: 'Research Proposal', icon: GraduationCap, color: 'text-amber-500' },
                  { title: 'Critical Analysis', icon: Zap, color: 'text-indigo-500' }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => navigate('/templates')}
                    className={clsx(
                      "w-full p-4 rounded-2xl border border-[var(--border-main)] flex items-center justify-between transition-all group",
                      isGlassEnabled ? "glass-card border-none" : "bg-[var(--bg-card)] hover:border-[var(--accent-main)]/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx("w-10 h-10 rounded-xl bg-[var(--bg-app)] flex items-center justify-center", item.color)}>
                        <item.icon size={20} />
                      </div>
                      <span className="font-bold text-[var(--text-main)] text-sm">{item.title}</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default DashboardPage;
