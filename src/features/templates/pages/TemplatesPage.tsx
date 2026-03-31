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
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import {
  getUserTemplates,
  deleteTemplate,
  Document as Assignment
} from '../../../shared/services/db';
import { AppLayout as Layout } from '../../../app/layout/AppLayout';
import Aurora from '../../editor/components/Aurora';
import clsx from 'clsx';

const TemplateCard = ({
  template,
  onPreview,
  onUse,
  onDelete
}: {
  template: any,
  onPreview: () => void,
  onUse: () => void,
  onDelete?: () => void
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
      <div className="relative flex h-full flex-col overflow-hidden rounded-[2.2rem] bg-[var(--bg-card)] p-7 shadow-[0_10px_40px_rgba(0,0,0,0.03)] ring-1 ring-[var(--border-main)] transition-all duration-500 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)]">

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

        <div className="relative z-10 mt-auto flex shrink-0 items-center gap-2.5 pt-4">
          <button
            onClick={onUse}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--text-main)] py-3.5 text-[10px] font-black uppercase tracking-widest text-[var(--bg-card)] shadow-xl transition-all duration-300 active:scale-95 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] group-hover:-translate-y-0.5"
          >
            <Play size={14} /> Use Template
          </button>
          <button
            onClick={onPreview}
            title="Inspect Architecture"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border-main)] bg-[var(--bg-app)] text-[var(--text-muted)] transition-all duration-300 hover:border-[var(--text-main)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] hover:shadow-lg active:scale-95"
          >
            <LayoutIcon size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const TemplatesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userTemplates, setUserTemplates] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<Assignment | null>(null);
  const [previewMode, setPreviewMode] = useState<'structure' | 'document'>('structure');
  const [searchTerm, setSearchTerm] = useState('');

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

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    const docs = await getUserTemplates(user.uid);
    setUserTemplates(docs);
    setRefreshing(false);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);


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
  );

  const filteredUserTemplates = userTemplates.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          className="relative z-10 mx-auto max-w-7xl px-6 py-8 md:px-12 md:py-12"
        >
          <header className="mb-20 flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl space-y-6"
            >

              <div className="space-y-2">
                <h1 className="text-5xl font-black leading-[0.9] tracking-[-0.04em] text-[var(--text-main)] sm:text-7xl md:text-8xl">
                  Academic{' '}
                  <span className="relative inline-block italic font-serif text-[var(--text-muted)]">
                    Blueprints
                    <svg className="absolute -bottom-2 left-0 w-full opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </span>
                </h1>
              </div>

              <p className="max-w-xl text-lg font-medium leading-relaxed text-[var(--text-muted)] lg:text-xl">
                Precision-engineered foundations for high-impact scholarship.
                Choose a structure designed to maximize analytical clarity.
              </p>
            </motion.div>

            <div className="flex w-full flex-col gap-10 lg:w-auto lg:items-end">
              <div className="flex flex-wrap items-center gap-8 justify-end">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-40 leading-none">Archived Architectures</span>
                    <span className="text-xl font-black text-[var(--text-main)] tracking-tighter">{userTemplates.length}</span>
                  </div>
                  <div className="h-8 w-px bg-[var(--border-main)]" />
                </div>

                {userTemplates.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-40 leading-none">Primary Cluster</span>
                      <span className="text-xl font-black text-[var(--text-main)] tracking-tighter italic font-serif">
                        {(() => {
                          const topics = userTemplates.map(t => t.topic || 'General');
                          return topics.reduce((a, b, i, arr) => (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b), topics[0]);
                        })()}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-[var(--border-main)] opacity-50" />
                  </div>
                )}

                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm">
                  <div className={clsx("w-2 h-2 rounded-full", refreshing ? "bg-amber-400 animate-pulse" : "bg-emerald-500")} />
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{refreshing ? 'Syncing...' : 'Database Synced'}</span>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-5 w-full group/search">
                <button
                  onClick={fetchTemplates}
                  disabled={refreshing}
                  type="button"
                  className={clsx(
                    'flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.8rem] border border-[var(--border-main)] bg-[var(--bg-card)]/50 backdrop-blur-xl transition-all duration-500 shadow-sm',
                    'text-[var(--text-muted)] hover:border-[var(--text-main)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] hover:shadow-xl active:scale-90 disabled:opacity-50'
                  )}
                  title="Sync Archives"
                >
                  <RefreshCw className={clsx('h-6 w-6 transition-transform duration-700 group-hover/search:rotate-180', refreshing && 'animate-spin')} />
                </button>

                <div className="relative w-full lg:w-[500px]">
                  {/* Premium Inner Glow & Shadow */}
                  <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-[var(--accent-main)] via-[var(--accent-main)]/20 to-[var(--accent-main)] opacity-0 blur-xl transition-all duration-700 group-focus-within/search:opacity-30 group-hover/search:opacity-15" />

                  <div className="absolute inset-0 rounded-[2.2rem] bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />

                  <div className="relative z-20 flex items-center gap-4 rounded-[2.2rem] border border-[var(--border-main)] bg-[var(--bg-card)]/80 p-3 pl-7 pr-3 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-3xl transition-all duration-500 hover:border-[var(--text-main)] group-focus-within/search:border-[var(--text-main)] group-focus-within/search:shadow-[0_40px_80px_rgba(0,0,0,0.1)]">
                    <Search
                      className="h-5 w-5 text-[var(--text-muted)] transition-all duration-500 group-focus-within/search:text-[var(--text-main)] group-focus-within/search:rotate-90 group-focus-within/search:scale-110"
                      aria-hidden
                    />
                    <input
                      type="search"
                      placeholder="Identify specific blueprint architecture..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent py-4 text-base font-bold tracking-tight text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)]/40"
                    />
                  </div>
                </div>
              </div>
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
            <div className="space-y-24">
              <AnimatePresence mode="wait">
                {(filteredUserTemplates.length > 0 || filteredStandardTemplates.length > 0) ? (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-24"
                  >
                    {filteredUserTemplates.length > 0 && (
                      <section>
                        <div className="mb-14 flex items-center gap-6">
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
                            />
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  </motion.div>
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
              className="group/modal relative flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-[3.5rem] border border-[var(--border-main)] bg-[var(--bg-card)] shadow-[0_40px_100px_rgba(0,0,0,0.15)]"
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
                                  sampleText = `[1] AssignMate Architecture Series. (2025). Structural Data Synthesis.\n[2] Doe, R. (2024). Multi-Phase Methodology Protocols.\n[3] University of AI. (2023). Professional Document Foundations.`;
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
                  className="flex items-center gap-3 px-12 py-5 font-black uppercase tracking-widest text-xs text-[var(--text-muted)] transition-all hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] rounded-2xl ring-1 ring-transparent hover:ring-[var(--border-main)]"
                >
                  <ChevronRight size={18} className="rotate-180" /> Dismiss Preview
                </button>
                <button
                  type="button"
                  onClick={() => handleUseTemplate(previewTemplate)}
                  className="group flex items-center gap-4 rounded-2xl bg-[var(--text-main)] px-16 py-5 font-black uppercase tracking-[0.2em] text-[10px] text-[var(--bg-card)] shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all hover:scale-105 active:scale-95"
                >
                  <Play size={16} className="transition-transform group-hover:scale-125 group-hover:translate-x-1" /> Use Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default TemplatesPage;
