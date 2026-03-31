import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Quote, 
  StickyNote,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Editor } from '@tiptap/react';

// Sub-panels (to be implemented)
import SectionAIPanel from './SectionAIPanel';
import QualityAnalysisPanel from './QualityAnalysisPanel';
import CitationPanel from './CitationPanel';
import NotesPanel from './NotesPanel';
import DocumentOutlinePanel from './DocumentOutlinePanel';

interface RightPanelProps {
  editor: Editor | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  aiLoading?: boolean;
  onAiAction?: (task: any) => void;
  qualityReport?: string | null;
  onCheckQuality?: () => void;
  citations?: any[];
  onAddCitation?: (citation: any) => void;
  notes?: string;
  onUpdateNotes?: (notes: string) => void;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  isMobile?: boolean;
}

export type TabType = 'ai' | 'quality' | 'citations' | 'notes' | 'outline';

const RightPanel: React.FC<RightPanelProps> = ({
  editor,
  isOpen,
  setIsOpen,
  aiLoading,
  onAiAction,
  qualityReport,
  onCheckQuality,
  citations = [],
  onAddCitation,
  notes = "",
  onUpdateNotes,
  activeTab: externalActiveTab,
  onTabChange,
  isMobile = false
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<TabType>('ai');
  const activeTab = externalActiveTab || internalActiveTab;

  const handleTabChange = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const tabs = [
    { id: 'ai', icon: Sparkles, label: 'AI' },
    { id: 'outline', icon: List, label: 'Outline' },
    { id: 'quality', icon: CheckCircle2, label: 'Quality' },
    { id: 'citations', icon: Quote, label: 'Citations' },
    { id: 'notes', icon: StickyNote, label: 'Notes' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isMobile ? '100%' : (isOpen ? 360 : 0) }}
      className={clsx(
        "bg-[var(--bg-card)]/80 backdrop-blur-xl h-full flex flex-col relative z-20 shadow-2xl shadow-[var(--text-main)]/5",
        isOpen && !isMobile ? "border-l border-[var(--border-main)]" : "border-l-0"
      )}
    >
      {/* Toggle Button - Minimalist & Elegant */}
      {!isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => !isOpen && setIsOpen(true)}
          className={clsx(
            "absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-20 bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-main)] border-r-0 rounded-l-2xl flex items-center justify-center shadow-xl z-30 transition-all hover:bg-[var(--bg-card)] group",
            !isOpen && "opacity-40 hover:opacity-100 -left-4"
          )}
          title={isOpen ? "Close Assistant" : "Open Assistant"}
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-0.5 h-6 bg-[var(--bg-app)] rounded-full group-hover:bg-[var(--border-main)] transition-colors" />
            {isOpen ? (
              <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
            ) : (
              <ChevronLeft size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
            )}
            <div className="w-0.5 h-6 bg-[var(--bg-app)] rounded-full group-hover:bg-[var(--border-main)] transition-colors" />
          </div>
        </button>
      )}

      <div className={clsx(
        "flex-1 flex flex-col overflow-hidden",
        isMobile ? "w-full" : "w-[360px]"
      )}>
        {/* Tab Navigation - Refined & Aesthetic */}
        <div className="flex border-b border-[var(--border-main)] bg-[var(--bg-card)]/40 sticky top-0 z-10 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)}
                className={clsx(
                  "flex-1 min-w-[72px] flex flex-col items-center gap-1.5 py-4 transition-all duration-300 relative group",
                  isActive 
                    ? "text-[var(--text-main)]" 
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]/50"
                )}
              >
                <Icon size={18} className={clsx("transition-transform duration-300", isActive && "scale-110")} />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em]">{tab.label}</span>
                
                {isActive && (
                  <motion.div 
                    layoutId="active-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-main)] mx-4 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'ai' && (
                <SectionAIPanel 
                  editor={editor} 
                  loading={aiLoading} 
                  onAction={onAiAction} 
                />
              )}
              {activeTab === 'outline' && (
                <DocumentOutlinePanel 
                  editor={editor} 
                />
              )}
              {activeTab === 'quality' && (
                <QualityAnalysisPanel 
                  report={qualityReport} 
                  onCheck={onCheckQuality} 
                  loading={aiLoading}
                />
              )}
              {activeTab === 'citations' && (
                <CitationPanel 
                  citations={citations} 
                  onAdd={onAddCitation} 
                />
              )}
              {activeTab === 'notes' && (
                <NotesPanel 
                  notes={notes} 
                  onUpdate={onUpdateNotes} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};

export default RightPanel;
