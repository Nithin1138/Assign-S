import React, { useState } from 'react';
import { 
  Quote, 
  Plus, 
  Search, 
  Book, 
  Globe, 
  FileText,
  Trash2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface CitationPanelProps {
  citations?: any[];
  onAdd?: (citation: any) => void;
}

const CitationPanel: React.FC<CitationPanelProps> = ({ citations = [], onAdd }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [format, setFormat] = useState<'APA' | 'MLA' | 'Chicago'>('APA');

  const formats = ['APA', 'MLA', 'Chicago'];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)]">
      <div className="p-6 border-b border-[var(--border-main)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--text-main)] rounded-lg flex items-center justify-center text-[var(--bg-card)]">
              <Quote size={16} />
            </div>
            <h3 className="font-bold text-[var(--text-main)]">Citations</h3>
          </div>
          <button 
            className="p-2 hover:bg-[var(--bg-app)] rounded-lg text-[var(--text-muted)] transition-all"
            title="Add Citation"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search & Format */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sources..."
              className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl pl-9 pr-4 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-main)]/5 focus:border-[var(--text-main)] transition-all"
            />
          </div>
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl text-[10px] font-bold text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-all">
              {format}
              <ChevronDown size={12} />
            </button>
            <div className="absolute right-0 top-full mt-1 w-24 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-20">
              {formats.map(f => (
                <button 
                  key={f}
                  onClick={() => setFormat(f as any)}
                  className="w-full text-left px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] hover:bg-[var(--bg-app)] first:rounded-t-xl last:rounded-b-xl"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {citations.length > 0 ? (
          citations.map((citation, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-main)] group transition-all hover:shadow-md hover:border-[var(--text-main)]/20"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-[var(--text-muted)]" />
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Web Source</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="p-1.5 hover:bg-[var(--bg-card)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all shadow-sm">
                    <ExternalLink size={12} />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded-lg text-[var(--text-muted)] hover:text-red-500 transition-all shadow-sm">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <p className="text-xs font-bold text-[var(--text-main)] mb-1 leading-relaxed">The Impact of AI on Academic Writing</p>
              <p className="text-[10px] text-[var(--text-muted)] italic mb-3">Smith, J. (2024). Journal of Digital Education.</p>
              <button className="w-full py-2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-[10px] font-bold text-[var(--text-muted)] hover:bg-[var(--text-main)] hover:text-[var(--bg-card)] hover:border-[var(--text-main)] transition-all shadow-sm">
                Insert Citation
              </button>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 px-4 border-2 border-dashed border-[var(--border-main)] rounded-3xl">
            <Book size={32} className="text-[var(--border-main)] mx-auto mb-4" />
            <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
              No citations added yet. Use the search or add manually to manage your references.
            </p>
            <button className="mt-6 px-6 py-2.5 bg-[var(--text-main)] text-[var(--bg-card)] rounded-xl text-xs font-bold hover:shadow-xl transition-all">
              Find Sources
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitationPanel;
