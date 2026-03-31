import React, { useState, useEffect } from 'react';
import { 
  StickyNote, 
  Trash2, 
  Plus, 
  Save, 
  RefreshCw,
  Search,
  ChevronDown,
  Layout,
  FileText
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface NotesPanelProps {
  notes?: string;
  onUpdate?: (notes: string) => void;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ notes = "", onUpdate }) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const handleSave = () => {
    if (onUpdate) {
      setIsSaving(true);
      onUpdate(localNotes);
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)]">
      <div className="p-6 border-b border-[var(--border-main)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--text-main)] rounded-lg flex items-center justify-center text-[var(--bg-card)]">
              <StickyNote size={16} />
            </div>
            <h3 className="font-bold text-[var(--text-main)]">Scratchpad</h3>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="p-2 hover:bg-[var(--bg-app)] rounded-lg text-[var(--text-muted)] transition-all disabled:opacity-50"
              title="Save Notes"
            >
              {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            </button>
            <button 
              onClick={() => setLocalNotes("")}
              className="p-2 hover:bg-red-50 rounded-lg text-[var(--text-muted)] hover:text-red-500 transition-all"
              title="Clear Notes"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        <div className="relative h-full min-h-[400px]">
          <textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder="Write your ideas, research notes, or scratchpad content here. This won't be part of the final document..."
            className="w-full h-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-3xl p-6 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-main)]/5 focus:border-[var(--text-main)] transition-all resize-none leading-relaxed"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-main)] rounded-full shadow-sm">
            <div className={clsx(
              "w-1.5 h-1.5 rounded-full",
              isSaving ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
            )} />
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              {isSaving ? "Saving..." : "Synced"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layout size={16} className="text-[var(--text-muted)]" />
            <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">Quick Templates</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['Outline', 'Research', 'Draft', 'Feedback'].map(t => (
              <button 
                key={t}
                className="p-3 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl text-[10px] font-bold text-[var(--text-muted)] hover:border-[var(--text-main)] hover:bg-[var(--bg-app)] transition-all text-center shadow-sm"
              >
                {t} Template
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
