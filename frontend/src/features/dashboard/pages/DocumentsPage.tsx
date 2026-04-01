import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Trash2,
  ChevronRight,
  Clock,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';
import { AppLayout as Layout } from '../../../app/layout/AppLayout';
import { getUserDocuments, deleteDocument, Document as Assignment } from '../../../shared/services/db';
import Aurora from '../../editor/components/Aurora';

const DocumentsPage = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    getUserDocuments(user.uid).then((data) => {
      setDocs(data as Assignment[]);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch documents:", err);
      setLoading(false);
    });
  }, [user]);

  const filteredDocs = docs.filter(d =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.topic && d.topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(user.uid, id);
      setDocs(prev => prev.filter(d => d.id !== id));
      toast.success('Document deleted');
    } catch (err) {
      toast.error('Failed to delete');
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
          className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto"
        >
          <header className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-[var(--text-main)] mb-4 tracking-tighter leading-none">
                Your <span className="italic font-serif text-[var(--text-muted)]">Archives</span>
              </h1>
              <p className="text-[var(--text-muted)] text-xl max-w-xl font-medium">
                Manage, refine, and evolve your academic workspace.
              </p>
            </div>

            <div className="relative w-full lg:w-[450px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={22} />
              <input
                type="text"
                placeholder="Search archives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-8 py-5 rounded-[2rem] border-2 border-[var(--border-main)] focus:border-[var(--text-main)] outline-none transition-all bg-[var(--bg-card)]/80 backdrop-blur-xl text-lg font-medium shadow-sm"
              />
            </div>
          </header>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[250px] bg-[var(--bg-card)] animate-pulse rounded-[2.5rem] border border-[var(--border-main)]" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                whileHover={{ y: -5 }}
                onClick={() => navigate('/generate')}
                className="group border-2 border-dashed border-[var(--border-main)] rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[var(--text-main)] transition-all bg-[var(--bg-card)]/30"
              >
                <div className="w-16 h-16 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[var(--text-main)] group-hover:text-[var(--bg-card)] transition-all">
                  <Plus size={32} />
                </div>
                <span className="font-bold text-lg text-[var(--text-muted)] group-hover:text-[var(--text-main)]">New Assignment</span>
              </motion.div>

              {filteredDocs.map((doc, idx) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/editor/${doc.id}`)}
                  className="group bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2.5rem] p-8 transition-all hover:shadow-xl cursor-pointer flex flex-col h-full overflow-hidden relative"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-14 h-14 bg-[var(--bg-app)] text-[var(--text-main)] rounded-2xl flex items-center justify-center group-hover:bg-[var(--text-main)] group-hover:text-[var(--bg-card)] transition-all shadow-sm">
                      <FileText size={28} />
                    </div>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="p-3 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <h3 className="text-2xl font-bold text-[var(--text-main)] mb-3 line-clamp-2 leading-tight">
                    {doc.title || "Untitled Assignment"}
                  </h3>

                  <div className="mt-auto pt-6 flex items-center gap-4 text-[var(--text-muted)] text-sm font-bold border-t border-[var(--border-main)]">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredDocs.length === 0 && (
            <div className="text-center py-32">
              <p className="text-2xl font-medium text-[var(--text-muted)]">No documents found matching your search.</p>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default DocumentsPage;
