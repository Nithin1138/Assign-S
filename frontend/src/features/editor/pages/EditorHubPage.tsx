import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  FileUp,
  FileText,
  Clock,
  ChevronRight,
  Search,
  Sparkles,
  Zap,
  BookOpen,
  RefreshCw,
  Trash2,
  Calendar
} from 'lucide-react';
import { AppLayout as Layout } from '../../../app/layout/AppLayout';
import { useAuth } from '../../auth/context/AuthContext';
import {
  subscribeToEditorDocuments,
  Document as Assignment,
  createEditorDocument,
  deleteEditorDocument
} from '../../../shared/services/db';
import Aurora from '../components/Aurora';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

// Professional-grade Worker Configuration for PDF.js (Synchronized with v5.5.207)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs';

const EditorHubPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToEditorDocuments(user.uid, (docs) => {
      const mapped = docs.map((d: any) => ({
        ...d,
        id: String(d.id),
        title: d.title || 'Untitled Draft',
        updatedAt: d.updated_at || d.updatedAt || new Date().toISOString(),
        createdAt: d.created_at || d.createdAt || new Date().toISOString(),
        created_at: d.created_at,
        taskType: d.taskType || d.task_type || 'blank',
      }));
      setDocuments(mapped as Assignment[]);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const title = file.name.split('.')[0] || 'Uploaded Document';
    const extension = file.name.split('.').pop()?.toLowerCase();

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        let content = '';
        const arrayBuffer = reader.result as ArrayBuffer;

        if (extension === 'pdf') {
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          let text = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Sort items by Y (top to bottom) and then X (left to right)
            const items = (textContent.items as any[]).sort((a, b) => {
              if (Math.abs(a.transform[5] - b.transform[5]) > 2) {
                return b.transform[5] - a.transform[5];
              }
              return a.transform[4] - b.transform[4];
            });

            let lastY = -1;
            let lastX = -1;
            for (const item of items) {
              const currentY = item.transform[5];
              const currentX = item.transform[4];

              if (lastY !== -1 && Math.abs(currentY - lastY) > 2) {
                text += '\n';
                lastX = -1; // Reset X on new line
              }

              // Handle horizontal spacing and indentation
              if (lastX !== -1 && currentX > lastX + 1) {
                // If it's a significant gap, treat it as multiple spaces
                const gap = currentX - lastX;
                const docFontSize = item.transform[0] || 10;
                const spaces = Math.floor(gap / (docFontSize * 0.4));
                text += ' '.repeat(Math.max(1, spaces));
              }

              text += item.str;
              lastY = currentY;
              lastX = currentX + (item.width || 0);
            }
            text += '\n\n'; // Page break
          }
          content = text;
        } else if (extension === 'docx') {
          const options = {
            convertImage: mammoth.images.inline(function (imageElement: any) {
              return imageElement.read("base64").then(function (imageBuffer: string) {
                return {
                  src: "data:" + imageElement.contentType + ";base64," + imageBuffer
                };
              });
            }),
            styleMap: [
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh",
              "p[style-name='Heading 3'] => h3:fresh",
              "p[style-name='Title'] => h1:fresh"
            ]
          };
          const result = await mammoth.convertToHtml({ arrayBuffer }, options);
          content = result.value;
        } else {
          // Fallback for txt/md
          content = new TextDecoder().decode(arrayBuffer);
        }

        if (!content.trim()) {
          throw new Error('Could not extract content from file');
        }

        const doc = await createEditorDocument(user.uid, title, content, 'Academic', 'Imported Document', 'formal', 'upload');
        if (doc && doc.id) {
          toast.success('Document imported successfully');
          navigate(`/editor/personal/${doc.id}`);
        }
      } catch (err: any) {
        toast.error(`Import failed: ${err.message || 'Unknown error'}`);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const isMergingEnabled = profile?.preferences?.mergeDocuments ?? true;
  const filteredDocs = documents
    .filter(d =>
      (d.taskType === 'blank' || d.taskType === 'upload') &&
      d.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, isMergingEnabled ? 6 : 999);

  return (
    <Layout>
      <div className="relative min-h-screen bg-[var(--bg-app)] overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <Aurora colorStops={['#F5F5F0', '#E4E3E0', '#F5F5F0']} speed={0.2} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-24"
        >
          {/* Hero Section */}
          <header className="mb-16 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-main)]/10 text-[var(--accent-main)] rounded-full mb-6"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Editor Workspace</span>
            </motion.div>
            <h1 className="text-6xl lg:text-8xl font-black text-[var(--text-main)] tracking-tighter leading-none mb-6">
              Create <span className="italic font-serif text-[var(--text-muted)]">Without</span> Limits
            </h1>
            <p className="text-xl text-[var(--text-muted)] max-w-2xl font-medium leading-relaxed">
              Select a scholarly blueprint, upload your existing research, or start a fresh architecture from scratch.
            </p>
          </header>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {/* Start Blank */}
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/editor/personal/new')}
              className="group relative p-10 rounded-[3rem] bg-[var(--bg-card)] border border-[var(--border-main)] shadow-xl cursor-pointer overflow-hidden transition-all hover:border-[var(--text-main)]"
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[var(--accent-main)]/5 blur-3xl rounded-full transition-all group-hover:bg-[var(--accent-main)]/10" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[var(--text-main)] text-[var(--bg-card)] rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:rotate-12 transition-transform duration-500">
                  <Plus size={32} strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-black text-[var(--text-main)] mb-3 tracking-tight">Blank Document</h3>
                <p className="text-[var(--text-muted)] font-medium">Start a fresh scholarly architecture on a clean canvas.</p>
              </div>
            </motion.div>

            {/* Upload */}
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="group relative p-10 rounded-[3rem] bg-[var(--bg-card)] border border-[var(--border-main)] shadow-xl cursor-pointer overflow-hidden transition-all hover:border-[var(--text-main)]"
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full transition-all group-hover:bg-emerald-500/10" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:-rotate-12 transition-transform duration-500">
                  {isUploading ? <RefreshCw size={32} className="animate-spin" /> : <FileUp size={32} strokeWidth={3} />}
                </div>
                <h3 className="text-3xl font-black text-[var(--text-main)] mb-3 tracking-tight">Upload Research</h3>
                <p className="text-[var(--text-muted)] font-medium">Auto-ingest .docx, .pdf, or .txt archives into the editor.</p>
              </div>
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".docx,.pdf,.txt" />
            </motion.div>
          </div>

          {/* Recent Archives Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)]">
                  <Clock size={20} className="text-[var(--text-muted)]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Recent Archives</h2>
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Continue your scholarly work</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3 bg-[var(--bg-card)] px-4 py-2.5 rounded-full border border-[var(--border-main)] min-w-[300px] focus-within:border-[var(--text-main)] transition-all">
                <Search size={16} className="text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search your library..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm font-medium w-full text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 bg-[var(--bg-card)]/50 rounded-3xl animate-pulse border border-[var(--border-main)]" />
                ))}
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="py-20 text-center bg-[var(--bg-card)]/30 rounded-[3rem] border-2 border-dashed border-[var(--border-main)]">
                <FileText size={48} className="mx-auto text-[var(--text-muted)] opacity-20 mb-6" />
                <h4 className="text-xl font-black text-[var(--text-main)] mb-2">Your Archive is Empty</h4>
                <p className="text-[var(--text-muted)] font-medium">Start a new document or upload research to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocs.map((doc, idx) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/editor/personal/${doc.id}`)}
                    className="group p-6 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--text-main)] hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-[var(--bg-app)] rounded-xl flex items-center justify-center text-[var(--text-main)] group-hover:bg-[var(--text-main)] group-hover:text-[var(--bg-card)] transition-colors">
                        <FileText size={24} />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this document permanently?')) {
                              deleteEditorDocument(user!.uid, String(doc.id)).then(() => {
                                toast.success('Document deleted');
                                setDocuments(prev => prev.filter(d => d.id !== doc.id));
                              }).catch(() => toast.error('Failed to delete'));
                            }
                          }}
                          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete document"
                        >
                          <Trash2 size={16} />
                        </button>
                        <ChevronRight size={20} className="text-[var(--text-muted)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[var(--text-main)] line-clamp-2 leading-tight mb-3">{doc.title}</h4>
                      <div className="flex flex-col gap-1.5">
                        {(doc as any).created_at && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                            <Calendar size={12} />
                            Created {new Date((doc as any).created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Modified {new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        {isMergingEnabled && (
                          <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-[var(--accent-main)]/5 text-[var(--accent-main)] rounded-full border border-[var(--accent-main)]/10 w-fit">
                            <div className="w-1 h-1 rounded-full bg-[var(--accent-main)] animate-pulse" />
                            Personal Draft
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {isMergingEnabled && documents.length > 6 && (
              <div className="text-center pt-8">
                <button
                  onClick={() => navigate('/documents')}
                  className="px-8 py-4 rounded-2xl bg-[var(--text-main)] text-[var(--bg-card)] text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl"
                >
                  View Unified Library
                </button>
              </div>
            )}
          </section>
        </motion.div>
      </div>
    </Layout>
  );
};

export default EditorHubPage;
