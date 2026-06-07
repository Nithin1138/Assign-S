import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  SearchCode,
  BookOpen,
  GraduationCap,
  Book,
  Edit3,
  Zap,
  Search,
  X,
  ChevronRight,
  Play,
  Layout as LayoutIcon,
  Trash2,
  Clock,
  RefreshCw,
  Plus,
  Save,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import {
  getUserTemplates,
  deleteTemplate,
  saveAsTemplate,
  subscribeToUserTemplates,
  Document as Assignment
} from '../../../shared/services/db';
import { AppLayout as Layout } from '../../../app/layout/AppLayout';
import Aurora from '../../editor/components/Aurora';
import clsx from 'clsx';

const TemplateCard = ({
  template,
  onPreview,
  onUse,
  onDelete,
  isGlassEnabled
}: {
  template: any,
  onPreview: () => void,
  onUse: () => void,
  onDelete?: () => void,
  isGlassEnabled?: boolean
}) => {
  const Icon = template.icon || FileText;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative h-[300px] flex flex-col overflow-visible rounded-[2.2rem]"
    >
      {/* Premium Orbiting Border Effect */}
      <div className="absolute -inset-[1px] rounded-[2.5rem] bg-gradient-to-br from-[var(--border-main)] via-[var(--border-main)] to-[var(--border-main)] opacity-100 transition-opacity duration-500 group-hover:bg-[var(--text-main)] group-hover:opacity-20" />

      <div className="absolute -inset-[2px] rounded-[2.6rem] opacity-0 blur-md transition-all duration-700 group-hover:opacity-40"
        style={{ background: `linear-gradient(45deg, var(--accent-main), transparent, var(--accent-main))` }} />

      {/* Main Card Body */}
      <div className={clsx(
        "relative flex h-full flex-col overflow-hidden p-7 transition-all duration-500 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)]",
        isGlassEnabled ? "glass-card border-none" : "clay-card bg-[var(--bg-card)]/80 border border-[var(--border-main)]"
      )}>

        {/* Decorative elements */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-[var(--accent-main)] opacity-[0.02] blur-3xl transition-opacity duration-700 group-hover:opacity-[0.08]" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--bg-app)] text-[var(--text-main)] shadow-inner ring-1 ring-[var(--border-main)] transition-all duration-500 group-hover:bg-[var(--text-main)] group-hover:text-[var(--bg-card)] group-hover:rotate-[8deg] group-hover:scale-105">
              <Icon size={28} strokeWidth={1.5} />
            </div>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="group/delete rounded-full p-3 text-[var(--text-muted)] transition-all duration-300 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={20} className="transition-transform group-hover/delete:scale-110" />
              </button>
            )}
          </div>

          <div className="min-h-0 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-60">Protocol</p>
                <div className="h-px w-6 bg-[var(--border-main)]" />
              </div>
              <h3 className="line-clamp-2 text-2xl font-black leading-tight tracking-[-0.02em] text-[var(--text-main)] transition-colors group-hover:text-[var(--accent-main)]">
                {template.title || template.name}
              </h3>
            </div>
            <p className="line-clamp-2 text-base font-medium leading-relaxed text-[var(--text-muted)] opacity-70">
              {template.description || `Specialized structure for ${template.topic || 'academic synthesis'}.`}
            </p>
          </div>

          {template.updatedAt && (
            <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-40">
              <Clock size={10} strokeWidth={3} />
              <span>Edited {new Date(template.updatedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="relative z-10 mt-auto flex shrink-0 items-center justify-between gap-4 pt-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUse();
            }}
            className="clay-btn flex flex-1 items-center justify-center gap-3 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.03] active:scale-95 cursor-pointer"
          >
            <Play size={14} className="fill-current" /> Use Template
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            title="Inspect Architecture"
            className="clay-btn-light flex h-14 w-14 shrink-0 items-center justify-center backdrop-blur-sm hover:scale-[1.03] active:scale-95 cursor-pointer"
          >
            <LayoutIcon size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const TemplatesPage = () => {
  const { user, profile, offlineUid } = useAuth();
  const isGlassEnabled = profile?.preferences?.glassmorphism ?? false;
  const navigate = useNavigate();
  const [userTemplates, setUserTemplates] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Assignment | null>(null);
  const [previewMode, setPreviewMode] = useState<'structure' | 'document'>('structure');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const standardTemplates = [
    {
      id: 'essay',
      title: 'Standard Essay',
      icon: FileText,
      sections: [{ id: '1', title: 'Introduction', content: '' }, { id: '2', title: 'Background', content: '' }, { id: '3', title: 'Main Argument', content: '' }, { id: '4', title: 'Counter-Argument', content: '' }, { id: '5', title: 'Conclusion', content: '' }],
      description: 'Classic 5-paragraph essay structure.',
      topic: 'General Academic Writing',
      tone: 'formal'
    },
    {
      id: 'report',
      title: 'Lab Report',
      icon: SearchCode,
      sections: [{ id: '1', title: 'Abstract', content: '' }, { id: '2', title: 'Introduction', content: '' }, { id: '3', title: 'Methodology', content: '' }, { id: '4', title: 'Results', content: '' }, { id: '5', title: 'Discussion', content: '' }, { id: '6', title: 'Conclusion', content: '' }, { id: '7', title: 'References', content: '' }],
      description: 'Scientific report structure for experiments.',
      topic: 'Science & Research',
      tone: 'formal'
    },
    {
      id: 'case-study',
      title: 'Case Study',
      icon: BookOpen,
      sections: [{ id: '1', title: 'Executive Summary', content: '' }, { id: '2', title: 'Introduction', content: '' }, { id: '3', title: 'Case Overview', content: '' }, { id: '4', title: 'Analysis', content: '' }, { id: '5', title: 'Recommendations', content: '' }, { id: '6', title: 'Conclusion', content: '' }],
      description: 'Business or medical case study analysis.',
      topic: 'Business & Medicine',
      tone: 'formal'
    },
    {
      id: 'literature-review',
      title: 'Literature Review',
      icon: BookOpen,
      sections: [{ id: '1', title: 'Introduction', content: '' }, { id: '2', title: 'Thematic Analysis', content: '' }, { id: '3', title: 'Methodological Review', content: '' }, { id: '4', title: 'Research Gaps', content: '' }, { id: '5', title: 'Conclusion', content: '' }],
      description: 'Comprehensive review of existing research.',
      topic: 'Academic Research',
      tone: 'formal'
    },
    {
      id: 'research-proposal',
      title: 'Research Proposal',
      icon: GraduationCap,
      sections: [{ id: '1', title: 'Introduction', content: '' }, { id: '2', title: 'Literature Review', content: '' }, { id: '3', title: 'Methodology', content: '' }, { id: '4', title: 'Timeline', content: '' }, { id: '5', title: 'Expected Results', content: '' }, { id: '6', title: 'References', content: '' }],
      description: 'Plan for future research projects.',
      topic: 'Research Planning',
      tone: 'formal'
    },
    {
      id: 'annotated-bibliography',
      title: 'Annotated Bibliography',
      icon: Book,
      sections: [{ id: '1', title: 'Introduction', content: '' }, { id: '2', title: 'Source 1 Citation & Summary', content: '' }, { id: '3', title: 'Source 2 Citation & Summary', content: '' }, { id: '4', title: 'Source 3 Citation & Summary', content: '' }, { id: '5', title: 'Conclusion', content: '' }],
      description: 'Evaluative summaries of sources.',
      topic: 'Bibliography',
      tone: 'formal'
    },
    {
      id: 'reflective-journal',
      title: 'Reflective Journal',
      icon: Edit3,
      sections: [{ id: '1', title: 'Introduction', content: '' }, { id: '2', title: 'Experience Description', content: '' }, { id: '3', title: 'Critical Reflection', content: '' }, { id: '4', title: 'Action Plan', content: '' }, { id: '5', title: 'Conclusion', content: '' }],
      description: 'Critical reflection on learning.',
      topic: 'Self-Reflection',
      tone: 'formal'
    },
    {
      id: 'critical-analysis',
      title: 'Critical Analysis',
      icon: Zap,
      sections: [{ id: '1', title: 'Introduction', content: '' }, { id: '2', title: 'Summary of Work', content: '' }, { id: '3', title: 'Critical Evaluation', content: '' }, { id: '4', title: 'Supporting Evidence', content: '' }, { id: '5', title: 'Conclusion', content: '' }],
      description: 'In-depth evaluation of a text or work.',
      topic: 'Critical Thinking',
      tone: 'formal'
    }
  ];

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const uid = user?.uid || offlineUid;
    if (!uid) return;

    setRefreshing(true);
    const unsubscribe = subscribeToUserTemplates(uid, (tpls) => {
      setUserTemplates(tpls as Assignment[]);
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  }, [user, offlineUid]);

  const fetchTemplates = () => {
    // This is now handled by subscription re-validation in background
    // but we can manually trigger if needed through a refetch
    if (user) {
      setRefreshing(true);
      getUserTemplates(user.uid).then(tpls => {
        setUserTemplates(tpls);
        setRefreshing(false);
      });
    }
  };


  const handleUseTemplate = (template: any) => {
    navigate('/generate', { state: { template } });
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteTemplate(user.uid, templateId);
      toast.success('Template deleted');
      fetchTemplates(); // Correctly update the UI list
    } catch (err) {
      toast.error('Failed to delete template');
    }
  };

  const filteredStandardTemplates = standardTemplates.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.topic.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(t => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'my-templates') return false;
    return t.topic.toLowerCase().includes(activeCategory.toLowerCase());
  });

  const filteredUserTemplates = userTemplates.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.topic.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(t => {
    if (activeCategory === 'all' || activeCategory === 'my-templates') return true;
    return (t.topic || 'General').toLowerCase().includes(activeCategory.toLowerCase());
  });

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden bg-[var(--bg-app)] selection:bg-[var(--accent-main)] selection:text-[var(--bg-card)]">
        {/* Immersive Background Layers */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.18]">
          <Aurora
            colorStops={['#F5F5F0', '#E4E3E0', '#F5F5F0']}
            speed={0.15}
            amplitude={1.2}
          />
        </div>

        {/* Noise Overlay for Texture */}
        <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }} />

        {/* Sophisticated Grid Overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-[2] opacity-[0.25]"
          style={{
            backgroundImage: `linear-gradient(to right, var(--border-main) 1px, transparent 1px), linear-gradient(to bottom, var(--border-main) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(circle at 50% 0%, black, transparent 85%)'
          }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 mx-auto max-w-7xl px-3 py-2 md:px-8 md:py-6"
        >
          <header className="mb-10 flex flex-col lg:flex-row lg:items-start justify-between gap-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl space-y-4 pt-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-main)]">Research Repository</span>
                  <div className="h-px w-8 bg-[var(--accent-main)] opacity-30" />
                </div>
                <h1 className="text-5xl font-black leading-[0.9] tracking-[-0.04em] text-[var(--text-main)] sm:text-7xl md:text-8xl">
                  Academic{' '}
                  <span className="relative inline-block italic font-serif text-[var(--text-muted)]">
                    Blueprints
                  </span>
                </h1>
              </div>

              <p className="max-w-xl text-lg font-medium leading-relaxed text-[var(--text-muted)] lg:text-xl opacity-70">
                Precision-engineered foundations for high-impact scholarship.
                Choose a structure designed to maximize analytical clarity.
              </p>
            </motion.div>

            <div className="flex flex-col gap-6 lg:items-end w-full lg:max-w-md group/search lg:pt-14">
              {/* Vertical Action Suite - Search First, Action Last */}
              <div className="relative w-full">
                <div className="absolute -inset-1 rounded-[2.2rem] bg-gradient-to-r from-[var(--accent-main)] via-[var(--accent-main)]/20 to-[var(--accent-main)] opacity-0 blur-xl transition-all duration-700 group-focus-within/search:opacity-30 group-hover/search:opacity-15" />
                <div className="absolute inset-0 rounded-[1.8rem] bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />

                <div className="clay-card relative z-20 flex items-center gap-3 bg-[var(--bg-card)]/80 p-2 pl-6 pr-2 backdrop-blur-3xl transition-all duration-500 border border-[var(--border-main)]">
                  <Search className="h-4 w-4 text-[var(--text-muted)] transition-all duration-500 group-focus-within/search:text-[var(--text-main)] group-focus-within/search:rotate-90" />
                  <input
                    type="search"
                    placeholder="Search blueprints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="clay-input flex-1 bg-transparent border-none shadow-none py-3 px-0 text-sm font-bold tracking-tight text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)]/40 focus:bg-transparent focus:shadow-none"
                  />
                  <button
                    onClick={fetchTemplates}
                    disabled={refreshing}
                    className={clsx(
                      "clay-btn-light flex h-10 w-10 items-center justify-center rounded-xl transition-all cursor-pointer",
                      refreshing && "animate-spin"
                    )}
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              {/* Stats Suite - Below Search */}
              <div className="clay-card flex items-center gap-3 p-1 bg-[var(--bg-card)]/40 border border-[var(--border-main)] rounded-2xl backdrop-blur-xl max-w-fit shadow-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 border-r border-[var(--border-main)]">
                  <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-40">Architectures</span>
                  <span className="text-sm font-black text-[var(--text-main)]">{userTemplates.length}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <div className={clsx("w-2 h-2 rounded-full", refreshing ? "bg-amber-400 animate-pulse" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]")} />
                  <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">{refreshing ? 'Syncing' : 'Synced'}</span>
                </div>
              </div>

              {/* Action Button - Below Stats */}
              <button
                onClick={() => setIsCreating(true)}
                className="clay-btn-violet group relative flex w-full lg:w-auto items-center justify-center gap-3 px-8 py-4 font-black uppercase tracking-widest text-[10px] overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-black/10 cursor-pointer"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-amber-500/40 blur-xl scale-150 rotate-12 -translate-y-1/2" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-indigo-400 via-transparent to-amber-400" />
                <Plus size={16} className="relative z-10" />
                <span className="relative z-10">Create Template</span>
              </button>
            </div>
          </header>

          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className="h-[320px] animate-pulse rounded-[2.5rem] border border-[var(--border-main)] bg-[var(--bg-card)]/40 backdrop-blur-md"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Unified & Immersive Filter Suite */}
              <div className="clay-card flex flex-wrap items-center p-1.5 bg-[var(--bg-card)]/35 border border-[var(--border-main)] backdrop-blur-xl max-w-fit shadow-sm">
                {[
                  { id: 'all', label: 'All', count: userTemplates.length + standardTemplates.length },
                  { id: 'my-templates', label: 'Mine', count: userTemplates.length },
                  { id: 'shared', label: 'Shared', count: 0 },
                  { id: 'academic', label: 'Academic', count: userTemplates.filter(t => (t.topic || '').toLowerCase().includes('academic')).length + standardTemplates.filter(t => (t.topic || '').toLowerCase().includes('academic')).length },
                  { id: 'research', label: 'Research', count: userTemplates.filter(t => (t.topic || '').toLowerCase().includes('research')).length + standardTemplates.filter(t => (t.topic || '').toLowerCase().includes('research')).length },
                  { id: 'business', label: 'Business', count: userTemplates.filter(t => (t.topic || '').toLowerCase().includes('business')).length + standardTemplates.filter(t => (t.topic || '').toLowerCase().includes('business')).length },
                  { id: 'creative', label: 'Creative', count: userTemplates.filter(t => (t.topic || '').toLowerCase().includes('creative')).length + standardTemplates.filter(t => (t.topic || '').toLowerCase().includes('creative')).length },
                  { id: 'technical', label: 'Technical', count: userTemplates.filter(t => (t.topic || '').toLowerCase().includes('technical')).length + standardTemplates.filter(t => (t.topic || '').toLowerCase().includes('technical')).length }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={clsx(
                      "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-500",
                      activeCategory === cat.id ? "text-[var(--bg-card)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    )}
                  >
                    {activeCategory === cat.id && (
                      <motion.div
                        layoutId="activeFilterGlow"
                        className="absolute inset-0 bg-[var(--accent-main)] shadow-xl shadow-[var(--accent-main)]/20 rounded-full"
                        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">{cat.label}</span>
                    <span className={clsx("relative z-10 opacity-40 text-[8px]", activeCategory === cat.id && "text-[var(--bg-card)] opacity-60")}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {(filteredUserTemplates.length > 0 || filteredStandardTemplates.length > 0) ? (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-10"
                  >

                    {filteredUserTemplates.length > 0 && (
                      <section>
                        <div className="mb-8 flex items-center gap-6">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--bg-card)] text-[10px] font-black tracking-widest text-[var(--text-main)] shadow-sm ring-1 ring-[var(--border-main)]">
                              01
                            </span>
                            <h2 className="whitespace-nowrap text-sm font-black uppercase tracking-[0.4em] text-[var(--text-main)]">
                              Personal Archives
                            </h2>
                          </div>
                          <div className="h-[2px] flex-1 bg-gradient-to-r from-[var(--border-main)] via-[var(--text-main)]/10 to-transparent" />
                        </div>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                          {filteredUserTemplates.map((template, idx) => (
                            <motion.div
                              key={template.id}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.08, duration: 0.5 }}
                            >
                              <TemplateCard
                                template={template}
                                onPreview={() => {
                                  setPreviewTemplate(template);
                                  setPreviewMode('structure');
                                }}
                                onUse={() => handleUseTemplate(template)}
                                onDelete={() => handleDeleteTemplate(template.id)}
                                isGlassEnabled={isGlassEnabled}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </section>
                    )}

                    <section>
                      <div className="mb-14 flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--bg-card)] text-[10px] font-black tracking-widest text-[var(--accent-main)] shadow-sm ring-1 ring-[var(--border-main)]">
                            {filteredUserTemplates.length > 0 ? '02' : '01'}
                          </span>
                          <h2 className="whitespace-nowrap text-sm font-black uppercase tracking-[0.4em] text-[var(--text-main)]">
                            Standard Foundations
                          </h2>
                        </div>
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-[var(--border-main)] via-[var(--accent-main)]/15 to-transparent" />
                      </div>
                      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {filteredStandardTemplates.map((template, idx) => (
                          <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04, duration: 0.5 }}
                          >
                            <TemplateCard
                              template={template as any}
                              onPreview={() => {
                                setPreviewTemplate(template as any);
                                setPreviewMode('structure');
                              }}
                              onUse={() => handleUseTemplate(template)}
                              isGlassEnabled={isGlassEnabled}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  </motion.div>
                ) : (
                  activeCategory === 'shared' ? (
                    <div className="mx-auto max-w-2xl py-24 text-center">
                      <div className="group mx-auto mb-10 flex h-32 w-32 items-center justify-center rounded-full bg-[var(--bg-app)] ring-1 ring-[var(--border-main)] shadow-inner transition-transform duration-500 hover:scale-110">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-[var(--text-muted)] opacity-40">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <line x1="19" y1="8" x2="19" y2="14" />
                          <line x1="16" y1="11" x2="22" y2="11" />
                        </svg>
                      </div>
                      <h3 className="mb-3 text-3xl font-black tracking-tight text-[var(--text-main)]">No Shared Architectures</h3>
                      <p className="text-lg font-medium text-[var(--text-muted)]">No blueprint architectures have been shared with your workspace yet.</p>
                    </div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mx-auto max-w-2xl rounded-[3rem] border-2 border-dashed border-[var(--border-main)] bg-[var(--bg-card)]/50 py-24 text-center backdrop-blur-xl shadow-2xl shadow-black/5"
                    >
                      <div className="group mx-auto mb-10 flex h-32 w-32 items-center justify-center rounded-full bg-[var(--bg-app)] ring-1 ring-[var(--border-main)] shadow-inner transition-transform duration-500 hover:scale-110">
                        <Search size={48} className="text-[var(--text-muted)] opacity-30 transition-opacity group-hover:opacity-60" />
                      </div>
                      <h3 className="mb-3 text-3xl font-black tracking-tight text-[var(--text-main)]">No architectures found</h3>
                      <p className="text-lg font-medium text-[var(--text-muted)]">Try adjusting your search terms or create a custom extraction.</p>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {previewTemplate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-2xl transition-all duration-500">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="clay-card group/modal relative flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden bg-[var(--bg-card)] border border-[var(--border-main)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-main)] p-10 bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-app)]/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Analysis Protocol</span>
                    <div className="h-1 w-1 shrink-0 rounded-full bg-[var(--accent-main)]/30" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent-main)]">{previewTemplate.topic || 'General'}</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-[var(--text-main)]">{previewTemplate.title || "Untitled Blueprint"}</h3>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center rounded-full border border-[var(--border-main)] bg-[var(--bg-app)]/50 p-0.5 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('structure')}
                      className={clsx(
                        'rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all duration-300',
                        previewMode === 'structure'
                          ? 'bg-[var(--text-main)] text-[var(--bg-card)] shadow-md'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      )}
                    >
                      Structure
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('document')}
                      className={clsx(
                        'rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all duration-300',
                        previewMode === 'document'
                          ? 'bg-[var(--text-main)] text-[var(--bg-card)] shadow-md'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      )}
                    >
                      AI Logic
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(null)}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-app)] text-[var(--text-muted)] transition-all duration-300 hover:bg-stone-900 hover:text-white hover:rotate-90"
                  >
                    <X size={28} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[var(--bg-app)]/50 p-8 pt-0">
                <div className="mx-auto max-w-xl space-y-10">
                  <div className="sticky top-0 z-20 -mx-8 bg-gradient-to-b from-[var(--bg-app)] to-transparent px-8 pb-6 pt-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-1 w-10 rounded-full bg-[var(--text-main)]" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-50">Protocol Map</span>
                    </div>
                  </div>

                  {(previewTemplate as any).metadataFields && Object.keys((previewTemplate as any).metadataFields).length > 0 && (
                    <div className="rounded-[2rem] border border-[var(--border-main)] bg-[var(--bg-card)] p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                      <div className="mb-6 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-main)]">Archived Metadata</span>
                        <div className="h-2 w-2 rounded-full bg-[var(--accent-main)] animate-pulse" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        {Object.entries((previewTemplate as any).metadataFields).map(([key, val]) => (
                          val && (
                            <div key={key} className="space-y-1.5 break-words">
                              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">{key.replace('_', ' ')}</span>
                              <span className="block text-xs font-bold text-[var(--text-main)] tracking-tight">{val as string}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {previewMode === 'structure' ? (
                      <>
                        {previewTemplate.sections?.map((section: any, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group/section relative flex items-start gap-4 rounded-[1.4rem] border border-[var(--border-main)] bg-[var(--bg-card)] p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[var(--text-main)]/20"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-app)] text-[9px] font-black text-[var(--text-main)] shadow-inner ring-1 ring-[var(--border-main)] group-hover/section:bg-[var(--text-main)] group-hover/section:text-[var(--bg-card)] transition-colors duration-300">
                              {idx + 1}
                            </div>
                            <div className="space-y-1 pt-0.5">
                              <h4 className="text-base font-bold tracking-tight text-[var(--text-main)]">{section.title || section}</h4>
                              <p className="font-serif text-[13px] leading-relaxed italic text-[var(--text-muted)] opacity-60">
                                {section.description || `Specialized synthesis protocol for ${section.title || section}.`}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative min-h-[500px] overflow-hidden rounded-[2.5rem] border border-[var(--border-main)] bg-white p-2 shadow-2xl"
                      >
                        {/* Paper Background with subtle lines if applicable */}
                        <div className="absolute inset-0 bg-[#fafafa]" />

                        <div
                          className="relative h-full w-full bg-white shadow-[0_30px_60px_rgba(0,0,0,0.1)] ring-1 ring-black/5"
                          style={{
                            padding: `${((previewTemplate as any).style?.margins?.top ?? 80) / 4}px ${((previewTemplate as any).style?.margins?.right ?? 80) / 4}px ${((previewTemplate as any).style?.margins?.bottom ?? 80) / 4}px ${((previewTemplate as any).style?.margins?.left ?? 80) / 4}px`,
                            fontFamily: (previewTemplate as any).style?.font_family || 'var(--font-main)',
                            textAlign: ((previewTemplate as any).style?.alignment as any) || 'left'
                          }}
                        >
                          <div className="space-y-8">
                            {/* Clean Dynamic Title */}
                            <div className="mb-14">
                              <h1 className="text-2xl font-black text-stone-900 tracking-tight leading-tight">
                                {previewTemplate.title || "Untitled Blueprint Architecture"}
                              </h1>
                            </div>

                            <div className="space-y-8">
                              {previewTemplate.sections?.map((section: any, idx: number) => {
                                const title = (section.title || section).toLowerCase();
                                let sampleText = `In the architectural framework of ${title}, this section orchestrates the primary cognitive synthesis required for a detailed analysis...`;
                                let isList = idx % 3 === 2;

                                if (title.includes('intro')) {
                                  sampleText = `SECTION ANALYSIS: This introduction identifies the core research questions and establishes a critical foundation for analyzing ${previewTemplate.topic || 'the subject matter'}. It acts as a cognitive gateway into the subsequent synthesis protocol.`;
                                } else if (title.includes('method') || title.includes('approach')) {
                                  sampleText = `PROCEDURAL FRAMEWORK: THE METHODOLOGY UTILIZED IN THIS STUDY INVOLVES A MULTI-PHASE SYSTEMATIC PROTOCOL FEATURING CROSS-PLATFORMDATA COLLECTION AND RIGOROUS ANALYTICAL WEIGHTING TO ENSURE ARCHITECTURAL INTEGRITY AND FULL REPRODUCIBILITY.`;
                                } else if (title.includes('conclu') || title.includes('summary')) {
                                  sampleText = `TERMINAL SYNTHESIS: THE PRIMARY HYPOTHESIS IS CONFIRMED THROUGH THE HOLISTIC EVALUATION OF ALL OBSERVED METRICS. THIS CONCLUSION PROVIDES THE FINAL ARCHITECTURAL SEAL ON THE STUDY, VALIDATING THE ENTIRE RESEARCH VECTOR AND OFFERING CLEAR INSIGHTS FOR FUTURE INVESTIGATIONS.`;
                                } else if (title.includes('problem') || title.includes('issue')) {
                                  sampleText = `CRITICAL CHALLENGES: The primary impediments discovered in this analysis include a lack of structural data and inconsistent procedural protocols. Key issues are listed below:`;
                                  isList = true;
                                } else if (title.includes('ref') || title.includes('biblio')) {
                                  sampleText = `[1] Doxio Architecture Series. (2025). Structural Data Synthesis.\n[2] Doe, R. (2024). Multi-Phase Methodology Protocols.\n[3] University of AI. (2023). Professional Document Foundations.`;
                                  isList = false;
                                } else if (title.includes('result') || title.includes('finding')) {
                                  sampleText = `ANALYTICAL RESULTS: EMPIRICAL EVIDENCE REVEALS A DRAMATIC CORRELATION WITHIN THE SENSORY DOMAINS. QUANTITATIVE FINDINGS CLEARLY INDICATE A SUCCESSFUL PROTOCOL EXECUTION.`;
                                } else if (title.includes('discussion')) {
                                  sampleText = `EVALUATIVE DISCUSSION: An in-depth evaluation of the findings suggests a non-linear relationship between the primary metrics. This analysis explores the deeper implications of the architectural data.`;
                                }

                                return (
                                  <div key={idx} className="space-y-3">
                                    <h4 className="text-[12px] font-black text-stone-900 tracking-tight uppercase">
                                      {idx + 1}. {section.title || section}
                                    </h4>
                                    <div className="space-y-2.5 text-[9px] leading-relaxed text-stone-500 font-medium opacity-80">
                                      {title.includes('ref') ? (
                                        <div className="space-y-2">
                                          {sampleText.split('\n').map((line, l) => <p key={l} className="tracking-tight">{line}</p>)}
                                        </div>
                                      ) : (
                                        <>
                                          <p className={clsx(
                                            (title.includes('method') || title.includes('conclu') || title.includes('result')) && "font-bold uppercase opacity-60 tracking-tight",
                                            "leading-relaxed"
                                          )}>
                                            {sampleText}
                                          </p>
                                          {isList && (
                                            <ul className="space-y-1.5 pl-4 list-disc marker:text-stone-300">
                                              <li>Primary analytical node configuration</li>
                                              <li>Secondary metric validation and weighting</li>
                                              <li>Cross-domain synthesis verification</li>
                                            </ul>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="mt-32 pt-8 border-t border-stone-100 flex justify-center items-center opacity-10">
                              <div className="h-1 w-12 rounded-full bg-stone-300" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-6 border-t border-[var(--border-main)] bg-gradient-to-t from-[var(--bg-app)] to-[var(--bg-card)] p-10">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="clay-btn-light flex items-center gap-3 px-12 py-5 font-black uppercase tracking-widest text-xs cursor-pointer"
                >
                  <ChevronRight size={18} className="rotate-180" /> Dismiss Preview
                </button>
                <button
                  type="button"
                  onClick={() => handleUseTemplate(previewTemplate)}
                  className="clay-btn-violet group flex items-center gap-4 px-16 py-5 font-black uppercase tracking-[0.2em] text-[10px] cursor-pointer"
                >
                  <Play size={16} className="transition-transform group-hover:scale-125 group-hover:translate-x-1" /> Use Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreateTemplateModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSuccess={() => {
          setIsCreating(false);
          fetchTemplates();
        }}
      />
    </Layout>
  );
};

const CreateTemplateModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sectionsText, setSectionsText] = useState('Introduction\nBody\nConclusion');
  const [topic, setTopic] = useState('General');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    try {
      const parsedSections = sectionsText
        .split('\n')
        .filter(s => s.trim())
        .map((s, i) => ({ id: String(i + 1), title: s.trim(), content: '' }));

      await saveAsTemplate(user.uid, {
        name: title,
        description,
        sections: parsedSections,
        topic,
        metadataFields: {},
        style: {}
      });

      toast.success('Architecture Archived');
      onSuccess();
      setTitle('');
      setDescription('');
      setSectionsText('Introduction\nBody\nConclusion');
      setTopic('General');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="clay-card relative w-full max-w-md bg-[var(--bg-card)] p-8 border border-[var(--border-main)]"
          >
            <button onClick={onClose} className="absolute right-6 top-6 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer">
              <X size={20} />
            </button>

            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--text-main)] text-[var(--bg-card)] shadow-lg shadow-black/10">
                <Plus size={20} />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-[var(--text-main)]">New Template</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] opacity-50 ml-1">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Lab Report"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="clay-input w-full px-5 py-3.5 text-sm font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] opacity-50 ml-1">Context/Description</label>
                <textarea
                  placeholder="What is this structure for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="clay-input w-full h-20 px-5 py-3.5 text-xs font-medium resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] opacity-50">Structural Units <span className="opacity-40 italic">(1 per line)</span></label>
                </div>
                <textarea
                  value={sectionsText}
                  onChange={(e) => setSectionsText(e.target.value)}
                  className="clay-input w-full h-32 px-5 py-3.5 font-mono text-xs font-medium"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="clay-btn-violet group relative w-full h-14 flex items-center justify-center gap-3 overflow-hidden text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                {saving ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <>
                    <Save size={14} />
                    <span>Archive Template</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TemplatesPage;
