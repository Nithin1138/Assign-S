import React from 'react';
import { 
  List, 
  Plus, 
  GripVertical, 
  Trash2, 
  ChevronRight,
  ChevronLeft,
  FileText,
  Layout
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { DocumentSection } from '../../../shared/services/db';

interface EditorSidebarProps {
  sections: DocumentSection[];
  activeSectionId: string | null;
  onSelectSection: (id: string) => void;
  onAddSection: () => void;
  onDeleteSection: (id: string) => void;
  onReorderSections: (newSections: DocumentSection[]) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile?: boolean;
  isTablet?: boolean;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({
  sections,
  activeSectionId,
  onSelectSection,
  onAddSection,
  onDeleteSection,
  onReorderSections,
  isOpen,
  setIsOpen,
  isMobile = false,
  isTablet = false
}) => {
  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isOpen ? 280 : (isTablet ? 80 : 0),
        x: (isMobile && !isOpen) ? -280 : 0
      }}
      className={clsx(
        "bg-[var(--bg-card)]/80 backdrop-blur-xl border-r border-[var(--border-main)] h-full flex flex-col z-50 shadow-2xl shadow-[var(--text-main)]/5",
        isMobile ? "fixed inset-y-0 left-0" : "relative"
      )}
    >
      <div className={clsx(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300",
        isOpen ? "w-[280px]" : (isTablet ? "w-[80px]" : "w-0")
      )}>
        <div className={clsx(
          "p-5 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-card)]/40 sticky top-0 z-10",
          !isOpen && isTablet && "justify-center"
        )}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--text-main)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--text-main)]/10 shrink-0">
              <Layout size={16} className="text-[var(--bg-card)]" />
            </div>
            {isOpen && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-[var(--text-main)] tracking-tight truncate">Structure</span>
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest truncate">Document Sections</span>
              </div>
            )}
          </div>
          {isOpen && (
            <div className="flex items-center gap-1">
              <button 
                onClick={onAddSection}
                className="p-2 hover:bg-[var(--accent-main)] hover:text-[var(--bg-card)] rounded-xl text-[var(--text-muted)] transition-all shadow-sm hover:shadow-md"
                title="Add Section"
              >
                <Plus size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-4">
          <Reorder.Group 
            axis="y" 
            values={sections} 
            onReorder={onReorderSections}
            className="space-y-3"
          >
            {sections.map((section) => (
              <Reorder.Item
                key={section.id}
                value={section}
                className={clsx(
                  "group flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden",
                  activeSectionId === section.id 
                    ? "bg-[var(--accent-main)] text-[var(--bg-card)] border-[var(--accent-main)] shadow-xl shadow-[var(--accent-main)]/20 scale-[1.02] z-10" 
                    : "bg-[var(--bg-card)]/50 text-[var(--text-muted)] border-[var(--border-main)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:shadow-lg hover:shadow-[var(--text-main)]/5",
                  !isOpen && isTablet && "justify-center p-3"
                )}
                onClick={() => onSelectSection(section.id)}
              >
                {activeSectionId === section.id && (
                  <motion.div 
                    layoutId="active-section-glow"
                    className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"
                  />
                )}
                
                {isOpen && (
                  <GripVertical 
                    size={14} 
                    className={clsx(
                      "cursor-grab active:cursor-grabbing transition-colors shrink-0",
                      activeSectionId === section.id ? "text-[var(--bg-card)]/50" : "text-[var(--text-muted)]/50 group-hover:text-[var(--text-muted)]"
                    )} 
                  />
                )}
                
                {isOpen ? (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate tracking-tight">{section.title || "Untitled Section"}</p>
                    <p className={clsx(
                      "text-[9px] font-medium uppercase tracking-widest mt-0.5",
                      activeSectionId === section.id ? "text-[var(--bg-card)]/70" : "text-[var(--text-muted)]/70"
                    )}>
                      Section {sections.indexOf(section) + 1}
                    </p>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-app)] flex items-center justify-center text-[10px] font-bold shrink-0 text-[var(--text-main)]">
                    {sections.indexOf(section) + 1}
                  </div>
                )}

                {isOpen && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSection(section.id);
                    }}
                    className={clsx(
                      "p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110",
                      activeSectionId === section.id ? "hover:bg-white/10 text-white" : "hover:bg-red-50 text-red-500"
                    )}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {sections.length === 0 && isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-4"
            >
              <div className="w-16 h-16 bg-[var(--bg-app)] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[var(--border-main)] shadow-inner">
                <FileText size={28} className="text-[var(--text-muted)]/30" />
              </div>
              <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Empty Canvas</p>
              <p className="text-[11px] text-[var(--text-muted)]/70 font-medium">Add a section to begin your masterpiece.</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Toggle Button - Minimalist & Elegant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "absolute left-full top-1/2 -translate-y-1/2 w-6 h-20 bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-main)] border-l-0 rounded-r-2xl flex items-center justify-center shadow-xl z-30 transition-all hover:bg-[var(--bg-card)] group",
          !isOpen && "opacity-40 hover:opacity-100",
          isMobile && "hidden"
        )}
        title={isOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-0.5 h-6 bg-[var(--bg-app)] rounded-full group-hover:bg-[var(--border-main)] transition-colors" />
          {isOpen ? (
            <ChevronLeft size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
          ) : (
            <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
          )}
          <div className="w-0.5 h-6 bg-[var(--bg-app)] rounded-full group-hover:bg-[var(--border-main)] transition-colors" />
        </div>
      </button>

      {/* Mobile Close Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </motion.aside>
  );
};

export default EditorSidebar;
