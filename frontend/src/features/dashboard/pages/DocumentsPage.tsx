import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Trash2,
  ChevronRight,
  Clock,
  Plus,
  X,
  Mail,
  Eye,
  Edit3,
  Users,
  Check,
  Send,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useAuth } from '../../auth/context/AuthContext';
import { AppLayout as Layout } from '../../../app/layout/AppLayout';
import { 
  getUserDocuments, 
  deleteDocument, 
  Document as Assignment,
  getSharedDocuments,
  getDocumentByShareCode,
  saveSharedDocument,
  generateShareCode
} from '../../../shared/services/db';
import Aurora from '../../editor/components/Aurora';

const DocumentsPage = () => {
  const { user, profile } = useAuth();
  const isGlassEnabled = profile?.preferences?.glassmorphism ?? false;
  const [myDocs, setMyDocs] = useState<Assignment[]>([]);
  const [sharedDocs, setSharedDocs] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my');
  const [shareCodeInput, setShareCodeInput] = useState('');
  const [isFindingCode, setIsFindingCode] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareDocId, setShareDocId] = useState<string | null>(null);
  const [shareType, setShareType] = useState<'view' | 'edit'>('view');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();

  const fetchDocs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [my, shared] = await Promise.all([
        getUserDocuments(user.uid),
        getSharedDocuments(user.uid)
      ]);
      setMyDocs(my as Assignment[]);
      setSharedDocs(shared as Assignment[]);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      toast.error('Failed to sync archives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [user]);

  const currentDocs = activeTab === 'my' ? myDocs : sharedDocs;

  const filteredDocs = currentDocs.filter(d =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.topic && d.topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(user.uid, id);
      if (activeTab === 'my') {
        setMyDocs(prev => prev.filter(d => d.id !== id));
      } else {
        setSharedDocs(prev => prev.filter(d => d.id !== id));
      }
      toast.success('Document deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleShareClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShareDocId(id);
    setIsGenerating(true);
    try {
      const code = await generateShareCode(id);
      setGeneratedCode(code);
    } catch (err) {
      toast.error('Failed to prepare shared archive');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendInvite = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!shareDocId || !shareEmail.trim()) return;
    
    if (!emailRegex.test(shareEmail.trim())) {
      toast.error('Please enter a valid scholarly mail');
      return;
    }

    setIsSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      toast.success(`Scholarly invitation dispatched to ${shareEmail}`);
      setShareDocId(null);
      setShareEmail('');
      setGeneratedCode(null);
    } catch (err) {
      toast.error('Dispatch failed');
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast.success('Access code copied to clipboard');
    }
  };

  const handleAccessShared = async () => {
    if (!shareCodeInput.trim() || !user) return;
    setIsFindingCode(true);
    try {
      const doc = await getDocumentByShareCode(shareCodeInput.trim());
      if (doc) {
        if (window.confirm(`Found: "${doc.title}". Save to your shared archives?`)) {
          await saveSharedDocument(shareCodeInput.trim());
          toast.success('Document saved to your shared archives');
          setShareCodeInput('');
          fetchDocs();
        }
      } else {
        toast.error('Invalid or expired share code');
      }
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setIsFindingCode(false);
    }
  };

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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 p-3 md:pt-4 md:pb-12 md:px-8 max-w-7xl mx-auto"
        >
          <header className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-[var(--text-main)] mb-4 tracking-tighter leading-none">
                Your <span className="italic font-serif text-[var(--text-muted)]">Archives</span>
              </h1>
              
              {/* High-Fidelity Tab Switcher */}
              <div className="inline-flex items-center p-1.5 bg-[var(--bg-card)]/40 border border-[var(--border-main)] rounded-[1.5rem] backdrop-blur-xl">
                <button
                  onClick={() => setActiveTab('my')}
                  className={clsx(
                    "relative flex items-center gap-2.5 px-6 py-2.5 rounded-[1.1rem] transition-all duration-500",
                    activeTab === 'my' ? "text-[var(--bg-card)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  )}
                >
                  {activeTab === 'my' && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute inset-0 bg-[var(--text-main)] shadow-xl rounded-[1.1rem]"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <FileText size={16} className="relative z-10" />
                  <span className="relative z-10 text-sm font-bold tracking-tight">My Documents</span>
                </button>

                <button
                  onClick={() => setActiveTab('shared')}
                  className={clsx(
                    "relative flex items-center gap-2.5 px-6 py-2.5 rounded-[1.1rem] transition-all duration-500",
                    activeTab === 'shared' ? "text-[var(--bg-card)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  )}
                >
                  {activeTab === 'shared' && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute inset-0 bg-[var(--text-main)] shadow-xl rounded-[1.1rem]"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4 relative z-10"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span className="relative z-10 text-sm font-bold tracking-tight">Shared with me</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-[450px]">
              {activeTab === 'shared' ? (
                <div className="relative flex items-center">
                   <input
                    type="text"
                    placeholder="Enter Shared Code..."
                    value={shareCodeInput}
                    onChange={(e) => setShareCodeInput(e.target.value.toUpperCase())}
                    className="w-full pl-6 pr-32 py-5 rounded-[2rem] border-2 border-[var(--text-main)]/20 focus:border-[var(--text-main)] outline-none transition-all bg-[var(--bg-card)]/80 backdrop-blur-xl text-lg font-black tracking-widest shadow-sm uppercase placeholder:normal-case placeholder:font-medium placeholder:tracking-normal"
                  />
                  <button
                    onClick={handleAccessShared}
                    disabled={isFindingCode || !shareCodeInput.trim()}
                    className="absolute right-2 px-6 py-3 bg-[var(--text-main)] text-[var(--bg-card)] rounded-full font-bold text-sm tracking-tight shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {isFindingCode ? 'Finding...' : 'Access'}
                  </button>
                </div>
              ) : (
                <div className="relative w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={22} />
                  <input
                    type="text"
                    placeholder="Search archives..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-8 py-5 rounded-[2rem] border-2 border-[var(--border-main)] focus:border-[var(--text-main)] outline-none transition-all bg-[var(--bg-card)]/80 backdrop-blur-xl text-lg font-medium shadow-sm"
                  />
                </div>
              )}
            </div>
          </header>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[250px] bg-[var(--bg-card)] animate-pulse rounded-[2.5rem] border border-[var(--border-main)]" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeTab === 'my' && (
                  <motion.div
                    whileHover={{ y: -5 }}
                    onClick={() => navigate('/generate')}
                    className="group border-2 border-dashed border-[var(--border-main)] rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[var(--text-main)] transition-all bg-[var(--bg-card)]/30 h-72"
                  >
                    <div className="w-16 h-16 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[var(--text-main)] group-hover:text-[var(--bg-card)] transition-all">
                      <Plus size={32} />
                    </div>
                    <span className="font-bold text-lg text-[var(--text-muted)] group-hover:text-[var(--text-main)]">New Assignment</span>
                  </motion.div>
                )}

                {activeTab === 'shared' && sharedDocs.length === 0 && (
                  <div className="col-span-full py-32 text-center">
                    <div className="w-24 h-24 bg-[var(--bg-card)] rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-[var(--border-main)] shadow-inner">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-[var(--text-muted)] opacity-40">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="16" y1="11" x2="22" y2="11" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-black tracking-tight text-[var(--text-main)] mb-2">No Shared Architectures</h3>
                    <p className="text-lg font-medium text-[var(--text-muted)]">Enter a share code to discover scholarly blueprints from your peers.</p>
                  </div>
                )}

                {filteredDocs.map((doc, idx) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * idx }}
                    onClick={() => navigate(`/editor/${doc.id}`)}
                    className="group relative h-72 flex flex-col overflow-visible rounded-[2.5rem] cursor-pointer"
                  >
                    {/* Premium Orbiting Border Effect */}
                    <div className="absolute -inset-[1px] rounded-[2.8rem] bg-gradient-to-br from-[var(--border-main)] via-[var(--border-main)] to-[var(--border-main)] opacity-100 transition-opacity duration-500 group-hover:bg-[var(--text-main)] group-hover:opacity-20" />
                    <div className="absolute -inset-[2px] rounded-[2.9rem] opacity-0 blur-md transition-all duration-700 group-hover:opacity-40"
                      style={{ background: `linear-gradient(45deg, var(--accent-main), transparent, var(--accent-main))` }} />

                    <div className={clsx(
                      "relative flex h-full flex-col overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)]",
                      isGlassEnabled ? "glass-card border-none" : "bg-[var(--bg-card)] shadow-[0_10px_40px_rgba(0,0,0,0.03)] ring-1 ring-[var(--border-main)]"
                    )}>
                      {/* Decorative elements */}
                      <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-[var(--accent-main)] opacity-[0.02] blur-3xl transition-opacity duration-700 group-hover:opacity-[0.08]" />

                      <div className="flex items-start justify-between mb-8 z-10">
                        <div className="w-14 h-14 bg-[var(--bg-app)] text-[var(--text-main)] rounded-2xl flex items-center justify-center group-hover:bg-[var(--text-main)] group-hover:text-[var(--bg-card)] group-hover:rotate-[8deg] group-hover:scale-105 transition-all duration-500 shadow-sm ring-1 ring-[var(--border-main)]">
                          <FileText size={28} />
                        </div>
                        <div className="flex items-center gap-2">
                          {activeTab === 'my' && (
                            <button
                              onClick={(e) => handleShareClick(doc.id, e)}
                              className="p-3 text-[var(--text-muted)] hover:text-[var(--accent-main)] hover:bg-[var(--accent-main)]/10 rounded-xl transition-all z-20 tooltip"
                              title="Share Document"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                <polyline points="16 6 12 2 8 6" />
                                <line x1="12" y1="2" x2="12" y2="15" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(doc.id, e)}
                            className="p-3 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all z-20"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>

                      <div className="z-10 flex flex-col h-full">
                        <h3 className="text-2xl font-bold text-[var(--text-main)] mb-3 line-clamp-2 leading-tight tracking-tight group-hover:text-[var(--accent-main)] transition-colors">
                          {doc.title || "Untitled Assignment"}
                        </h3>

                        <div className="mt-auto pt-6 flex items-center gap-4 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest border-t border-[var(--border-main)]/50">
                          <div className="flex items-center gap-2">
                            <Clock size={12} strokeWidth={3} />
                            {new Date(doc.updatedAt).toLocaleDateString()}
                          </div>
                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredDocs.length === 0 && searchTerm && (
                <div className="text-center py-32">
                  <p className="text-2xl font-medium text-[var(--text-muted)]">No documents found matching your search.</p>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Premium Share Modal */}
        {shareDocId && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
            onClick={() => setShareDocId(null)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight">Share Document</h2>
                  <p className="text-xs text-[var(--text-muted)] font-medium">Configure access layers for your peers</p>
                </div>
                <button
                  onClick={() => setShareDocId(null)}
                  className="p-2 hover:bg-[var(--bg-app)] rounded-full transition-colors text-[var(--text-muted)]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'view', title: 'View Only', icon: Eye, desc: 'Read-only access' },
                    { id: 'edit', title: 'Editor', icon: Edit3, desc: 'Full colab access' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setShareType(type.id as any)}
                      className={clsx(
                        "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all group",
                        shareType === type.id 
                          ? "border-[var(--text-main)] bg-[var(--bg-app)] shadow-lg" 
                          : "border-[var(--border-main)] hover:border-[var(--text-main)]/30"
                      )}
                    >
                      <div className={clsx(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        shareType === type.id ? "bg-[var(--text-main)] text-[var(--bg-card)] shadow-md" : "bg-[var(--bg-app)] text-[var(--text-muted)] group-hover:text-[var(--text-main)]"
                      )}>
                        <type.icon size={24} />
                      </div>
                      <div className="text-center">
                        <span className={clsx("text-sm font-bold block", shareType === type.id ? "text-[var(--text-main)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-main)]")}>
                          {type.title}
                        </span>
                        <p className="text-[9px] text-[var(--text-muted)] mt-1 uppercase tracking-widest font-black">{type.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-[var(--border-main)]">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] px-1">
                      Secure Access Code
                    </label>
                    <div className="relative group">
                      <div className="w-full pl-6 pr-2 py-2 rounded-2xl bg-[var(--bg-app)] border-2 border-[var(--border-main)] flex items-center justify-between shadow-inner h-[4.5rem] overflow-hidden">
                        {isGenerating ? (
                          <div className="flex items-center gap-2 text-[var(--text-muted)] italic text-sm pl-4">
                            <div className="w-4 h-4 border-2 border-[var(--text-muted)]/20 border-t-[var(--text-muted)] rounded-full animate-spin" />
                            Synchronizing archives...
                          </div>
                        ) : (
                          <>
                            <span className="text-2xl font-black tracking-[0.35em] text-[var(--text-main)] font-mono pl-2">
                              {generatedCode || '--------'}
                            </span>
                            <button
                              onClick={copyToClipboard}
                              className="h-full px-8 bg-[var(--text-main)] text-[var(--bg-card)] rounded-xl font-black text-xs hover:bg-[var(--text-main)]/90 transition-all active:scale-95 shadow-lg"
                            >
                              COPY
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] px-1">
                      Recipient scholarly Mail (Optional)
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--text-main)] transition-colors" size={18} />
                      <input
                        type="email"
                        placeholder="peer@institution.edu"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[var(--bg-app)] border-2 border-[var(--border-main)] focus:border-[var(--text-main)] outline-none transition-all font-medium text-[var(--text-main)] shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {shareEmail.trim() && (
                  <button
                    onClick={handleSendInvite}
                    disabled={isSending || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shareEmail.trim())}
                    className="w-full py-5 bg-[var(--text-main)] text-[var(--bg-card)] rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed mt-4 h-16"
                  >
                    {isSending ? (
                      <div className="w-6 h-6 border-2 border-[var(--bg-card)]/30 border-t-[var(--bg-card)] rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={20} />
                        <span className="tracking-tight text-lg">Send Scholarly Invitation</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DocumentsPage;
