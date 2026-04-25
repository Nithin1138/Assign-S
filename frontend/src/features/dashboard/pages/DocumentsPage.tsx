import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Trash2,
  ChevronRight,
  Clock,
  Plus,
  Bell,
  X,
  Mail,
  Eye,
  Edit3,
  Users,
  Check,
  Send,
  Copy,
  UserMinus,
  RefreshCw,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useAuth } from '../../auth/context/AuthContext';
import { AppLayout as Layout } from '../../../app/layout/AppLayout';
import { 
  deleteDocument, 
  Document as Assignment,
  getSharedDocuments,
  subscribeToUserDocuments,
  subscribeToSharedDocuments,
  getDocumentByShareCode,
  saveSharedDocument,
  generateShareCode,
  getDocumentAccess,
  updateDocumentAccess,
  getPendingShareRequests,
  respondToShareRequest
} from '../../../shared/services/db';
import Aurora from '../../editor/components/Aurora';

const DocumentsPage = () => {
  const { user, profile, offlineUid } = useAuth();
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
  const [modalTab, setModalTab] = useState<'share' | 'manage'>('share');
  const [accessList, setAccessList] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isRequestsExpanded, setIsRequestsExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const uid = user?.uid || offlineUid;
    console.log("[DocumentsPage] Current UID:", uid);
    if (!uid) return;
    
    setLoading(true);

    // Subscribe to personal documents with instant cache return
    const unsubDocs = subscribeToUserDocuments(uid, (docs) => {
      console.log("[DocumentsPage] Received MyDocs:", docs.length);
      setMyDocs(docs as Assignment[]);
      setLoading(false); 
    });

    // Subscribe to shared documents with instant cache return
    const unsubShared = subscribeToSharedDocuments(uid, (docs) => {
      console.log("[DocumentsPage] Received SharedDocs:", docs.length);
      setSharedDocs(docs as Assignment[]);
      setLoading(false);
    });

    return () => {
      unsubDocs();
      unsubShared();
    };
  }, [user, offlineUid]);

  useEffect(() => {
    const handleReauth = () => {
      toast.error("Session expired. Please log in again.");
      navigate('/login');
    };
    window.addEventListener('auth_required', handleReauth);
    return () => window.removeEventListener('auth_required', handleReauth);
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'shared' && user) {
      fetchPendingRequests();
    }
  }, [activeTab, user]);

  const fetchPendingRequests = async () => {
    const requests = await getPendingShareRequests();
    setPendingRequests(requests);
  };

  const handleRespondToRequest = async (shareId: number, status: 'accepted' | 'rejected') => {
    const ok = await respondToShareRequest(shareId, status);
    if (ok) {
      toast.success(`Request ${status === 'accepted' ? 'accepted' : 'rejected'}`);
      setPendingRequests(prev => prev.filter(r => r.id !== shareId));
      if (status === 'accepted') {
        const shared = await getSharedDocuments(user!.uid);
        setSharedDocs(shared as Assignment[]);
      }
    } else {
      toast.error('Failed to respond to request');
    }
  };

  const isMergingEnabled = profile?.preferences?.mergeDocuments ?? true;
  const currentDocs = activeTab === 'my' ? myDocs : sharedDocs;

  const filteredDocs = currentDocs.filter(d => {
    // If merging is disabled, hide "isPersonal" docs on this page
    if (!isMergingEnabled && d.isPersonal) return false;

    return d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.topic && d.topic.toLowerCase().includes(searchTerm.toLowerCase()));
  });

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
    setModalTab('share');
    setIsGenerating(true);
    try {
      const [code, accessData] = await Promise.all([
        generateShareCode(id),
        getDocumentAccess(id)
      ]);
      setGeneratedCode(code);
      setAccessList(accessData);
    } catch (err) {
      toast.error('Failed to load sharing details');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendInvite = async () => {
    const isValid = shareEmail.trim().length >= 3;
    if (!shareDocId || !shareEmail.trim()) return;
    
    if (!isValid) {
      toast.error('Please enter a valid Mail or User ID');
      return;
    }

    setIsSending(true);
    try {
      const role = shareType === 'edit' ? 'edit' : 'view';
      const ok = await updateDocumentAccess(shareDocId, shareEmail.trim(), role);
      if (ok) {
        toast.success(`Scholarly invitation dispatched to ${shareEmail}`);
        setShareEmail('');
        
        // Refresh the access list so the new user shows up
        const accessData = await getDocumentAccess(shareDocId);
        setAccessList(accessData);
        // Switch to manage tab so they see the result!
        setModalTab('manage');
      } else {
        toast.error('User not found. Please verify their Mail or ID.');
      }
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

  const handleUpdateAccess = async (targetUserId: string, newPermission: string) => {
    if (!shareDocId) return;
    try {
      const ok = await updateDocumentAccess(shareDocId, targetUserId, newPermission);
      if (ok) {
        setAccessList(prev => 
          newPermission === 'remove' 
            ? prev.filter(a => a.user_id !== targetUserId)
            : prev.map(a => a.user_id === targetUserId ? { ...a, permission: newPermission } : a)
        );
        toast.success(newPermission === 'remove' ? 'Access removed' : 'Permissions updated');
      } else {
        toast.error('Failed to update access');
      }
    } catch (err) {
      toast.error('Failed to update access');
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
          // The subscription handles the state update automatically if we trigger a re-fetch or manual state update
          const shared = await getSharedDocuments(user.uid);
          setSharedDocs(shared as Assignment[]);
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

            <div className="flex flex-col gap-6 w-full lg:w-[480px]">
              {activeTab === 'shared' ? (
                <>
                  {/* Recent Requests Section */}
                  <AnimatePresence>
                    {pendingRequests.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                      >
                         <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                            Recent Requests
                          </label>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {pendingRequests.length} Pending
                          </span>
                        </div>

                        <div 
                          className={clsx(
                            "relative transition-all duration-500",
                            isRequestsExpanded || pendingRequests.length === 1 ? "space-y-2" : "h-[72px]"
                          )}
                          onClick={() => pendingRequests.length > 1 && setIsRequestsExpanded(!isRequestsExpanded)}
                        >
                          {pendingRequests.map((req, idx) => {
                            const isStacked = !isRequestsExpanded && pendingRequests.length > 1;
                            const stackIdx = pendingRequests.length - 1 - idx; // Newest (at end of array) on top? 
                            // Actually, let's assume the array is newest first (based on backend order)
                            // If index 0 is newest:
                            const offsetIdx = idx; 
                            
                            return (
                              <motion.div
                                key={req.id}
                                layout
                                initial={false}
                                animate={{
                                  y: isStacked ? offsetIdx * 8 : 0,
                                  scale: isStacked ? 1 - offsetIdx * 0.04 : 1,
                                  zIndex: pendingRequests.length - idx,
                                  opacity: isStacked && offsetIdx > 2 ? 0 : 1,
                                }}
                                className={clsx(
                                  "flex items-center justify-between p-3 bg-[var(--bg-card)]/60 border border-[var(--border-main)] rounded-2xl backdrop-blur-md shadow-sm transition-all",
                                  isStacked ? "absolute inset-x-0 top-0 cursor-pointer hover:bg-[var(--bg-card)]/80" : "relative hover:shadow-md",
                                  !isStacked && "group"
                                )}
                              >
                                <div className="flex items-center gap-3 min-w-0 pr-2">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--text-main)]/5 to-[var(--text-main)]/10 flex items-center justify-center shrink-0">
                                    <FileText size={18} className="text-[var(--text-main)]" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-[var(--text-main)] truncate leading-tight">
                                      {req.document_title}
                                    </p>
                                    <p className="text-[10px] font-medium text-[var(--text-muted)] truncate">
                                      from {req.granter_name}
                                    </p>
                                  </div>
                                </div>

                                <AnimatePresence>
                                  {(!isStacked || idx === 0) && (
                                    <motion.div 
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 10 }}
                                      className="flex items-center gap-1.5 shrink-0"
                                      onClick={(e) => isStacked && e.stopPropagation()} // Prevent expansion when clicking buttons if stacked
                                    >
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); }}
                                        className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--text-main)]/5 rounded-lg transition-all"
                                        title="View Details"
                                      >
                                        <Info size={16} />
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleRespondToRequest(req.id, 'rejected'); }}
                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                        title="Reject"
                                      >
                                        <XCircle size={18} />
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleRespondToRequest(req.id, 'accepted'); }}
                                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                        title="Accept"
                                      >
                                        <CheckCircle2 size={18} />
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative flex items-center group">
                   <input
                    type="text"
                    placeholder="Enter Shared Code..."
                    value={shareCodeInput}
                    onKeyDown={(e) => e.key === 'Enter' && handleAccessShared()}
                    onChange={(e) => setShareCodeInput(e.target.value.toUpperCase())}
                    className="w-full pl-6 pr-20 py-5 rounded-[2rem] border-2 border-[var(--text-main)]/10 focus:border-[var(--text-main)] outline-none transition-all bg-[var(--bg-card)]/40 backdrop-blur-xl text-lg font-black tracking-widest shadow-sm uppercase placeholder:normal-case placeholder:font-medium placeholder:tracking-normal group-hover:border-[var(--text-main)]/30"
                  />
                  <button
                    onClick={handleAccessShared}
                    disabled={isFindingCode || !shareCodeInput.trim()}
                    className="absolute right-2 px-6 py-3 bg-[var(--text-main)] text-[var(--bg-card)] rounded-full font-bold text-sm tracking-tight shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center"
                    title="Access Shared Archive"
                  >
                    {isFindingCode ? <RefreshCw size={18} className="animate-spin" /> : 'ACCESS'}
                  </button>
                </div>
                </>
              ) : (
                <div className="relative w-full group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--text-main)] transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Search your library..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-[var(--bg-card)]/40 border-2 border-[var(--text-main)]/10 rounded-[2.2rem] focus:border-[var(--text-main)] outline-none transition-all shadow-sm hover:shadow-md text-[var(--text-main)] placeholder:text-[var(--text-muted)] font-medium group-hover:border-[var(--text-main)]/30"
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
                    onClick={() => navigate(doc.isPersonal ? `/editor/personal/${doc.id}` : `/editor/${doc.id}`)}
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
                          
                          {isMergingEnabled && doc.isPersonal && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--accent-main)]/5 text-[var(--accent-main)] rounded-full border border-[var(--accent-main)]/10">
                              <div className="w-1 h-1 rounded-full bg-[var(--accent-main)] animate-pulse" />
                              Personal
                            </div>
                          )}

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
              <div className="flex items-center justify-between mb-6">
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

              <div className="flex border-b border-[var(--border-main)] mb-6">
                <button
                  className={clsx("flex-1 pb-3 text-sm font-bold border-b-2 transition-all", modalTab === 'share' ? "border-[var(--text-main)] text-[var(--text-main)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]")}
                  onClick={() => setModalTab('share')}
                >
                  Share Link
                </button>
                <button
                  className={clsx("flex-1 pb-3 text-sm font-bold border-b-2 transition-all", modalTab === 'manage' ? "border-[var(--text-main)] text-[var(--text-main)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]")}
                  onClick={() => setModalTab('manage')}
                >
                  Manage Access ({accessList.length})
                </button>
              </div>

              <div className="relative min-h-[350px]">
                <AnimatePresence mode="wait">
                  {modalTab === 'share' ? (
                    <motion.div
                      key="share"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6 absolute inset-0"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                            Secure Access Code
                          </label>
                          <span className="text-[9px] font-bold text-[var(--text-muted)] bg-[var(--bg-app)] px-2 py-0.5 rounded-full">
                            View-only access
                          </span>
                        </div>
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

                      <div className="space-y-4">
                        <div className="flex bg-[var(--bg-app)] p-1.5 rounded-2xl border border-[var(--border-main)] relative shadow-inner">
                          {[
                            { id: 'view', title: 'Viewer', icon: Eye },
                            { id: 'edit', title: 'Editor', icon: Edit3 }
                          ].map((type) => (
                            <button
                              key={type.id}
                              onClick={() => setShareType(type.id as any)}
                              className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative z-10",
                                shareType === type.id 
                                  ? "text-[var(--text-main)]" 
                                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                              )}
                            >
                              {shareType === type.id && (
                                <motion.div
                                  layoutId="activeShareType"
                                  className="absolute inset-0 bg-[var(--bg-card)] rounded-xl shadow-md border border-[var(--border-main)]/50"
                                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                />
                              )}
                              <span className="relative z-20 flex items-center gap-2">
                                <type.icon size={16} />
                                {type.title}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] px-1">
                            Mail or User ID
                          </label>
                          <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--text-main)] transition-colors" size={18} />
                            <input
                              type="text"
                              placeholder="peer@institution.edu"
                              value={shareEmail}
                              onChange={(e) => setShareEmail(e.target.value)}
                              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[var(--bg-app)] border-2 border-[var(--border-main)] focus:border-[var(--text-main)] outline-none transition-all font-medium text-[var(--text-main)] shadow-inner"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleSendInvite}
                        disabled={isSending || shareEmail.trim().length < 3}
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
                    </motion.div>
                  ) : (
                    <motion.div
                      key="manage"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 max-h-[350px] overflow-y-auto pr-2 absolute inset-0 scrollbar-hide pb-10"
                    >
                      {accessList.length === 0 ? (
                        <div className="py-12 text-center text-[var(--text-muted)] flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-[var(--bg-app)] mb-3 flex items-center justify-center">
                            <UserMinus size={20} />
                          </div>
                          <p className="font-bold">No users have gained access yet</p>
                          <p className="text-xs">Share your code for others to access this document.</p>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {accessList.map((access, i) => (
                            <motion.div
                              key={access.user_id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center justify-between p-3.5 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-main)] shadow-sm hover:shadow-md hover:border-[var(--text-muted)]/30 transition-all group"
                            >
                              <div className="flex items-center gap-3 w-4/5">
                                <div className="w-10 h-10 rounded-full bg-[var(--border-main)] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                  <img src={`https://picsum.photos/seed/${access.user_id}/100/100`} className="w-full h-full object-cover" alt="User" />
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                  <p className="text-sm font-bold text-[var(--text-main)] truncate" title={access.name}>{access.name}</p>
                                  <span className="text-[10px] font-bold text-[var(--text-muted)] truncate block" title={access.email}>{access.email}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <select 
                                  className="text-[10px] uppercase tracking-wider font-black bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:border-[var(--text-main)]/50 transition-colors"
                                  value={access.permission}
                                  onChange={(e) => handleUpdateAccess(access.user_id, e.target.value)}
                                >
                                  <option value="view">Viewer</option>
                                  <option value="edit">Editor</option>
                                </select>
                                <button 
                                  onClick={() => handleUpdateAccess(access.user_id, 'remove')}
                                  className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                  title="Remove access"
                                >
                                  <X size={16} strokeWidth={3} />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </div>

        {/* Request Details Modal */}
        <AnimatePresence>
          {selectedRequest && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedRequest(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-sm bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-main)] shadow-2xl overflow-hidden p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[var(--text-main)]">Request Details</h3>
                  <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-[var(--bg-app)] rounded-full transition-colors">
                    <X size={20} className="text-[var(--text-muted)]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-main)]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Document</p>
                    <p className="font-bold text-[var(--text-main)]">{selectedRequest.document_title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-main)]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Owner</p>
                      <p className="font-bold text-[var(--text-main)] truncate">{selectedRequest.granter_name}</p>
                    </div>
                    <div className="p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-main)]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Access</p>
                      <p className="font-bold text-[var(--text-main)] uppercase">{selectedRequest.permission}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-main)]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Sent Time</p>
                    <p className="font-bold text-[var(--text-main)]">
                      {new Date(selectedRequest.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => {
                      handleRespondToRequest(selectedRequest.id, 'rejected');
                      setSelectedRequest(null);
                    }}
                    className="flex-1 py-4 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleRespondToRequest(selectedRequest.id, 'accepted');
                      setSelectedRequest(null);
                    }}
                    className="flex-1 py-4 bg-[var(--text-main)] text-[var(--bg-card)] rounded-xl font-bold hover:opacity-90 transition-all"
                  >
                    Accept
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Layout>
    );
  };

export default DocumentsPage;
