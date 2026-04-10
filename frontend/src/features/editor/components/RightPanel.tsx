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
      animate={{ width: isMobile ? '100%' : (isOpen ? 350 : 0) }}
      className={clsx(
        "bg-[var(--bg-card)]/80 backdrop-blur-xl h-full flex flex-col relative z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.02)]",
        isOpen && !isMobile ? "" : "border-l-0"
      )}
    >
      {/* Toggle Button - Immersive & Functional */}
      {!isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            "absolute top-1/2 -translate-y-1/2 w-8 h-24 bg-white/90 backdrop-blur-2xl border border-black/5 border-r-0 rounded-l-[2rem] flex items-center justify-center z-50 transition-all duration-500 hover:w-9 group",
            isOpen ? "-left-8" : "-left-8 shadow-[-20px_0_40px_rgba(0,0,0,0.08)]"
          )}
          title={isOpen ? "Close Assistant" : "Open Assistant"}
        >
          <div className="flex flex-col items-center justify-center w-full h-full">
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-stone-400 group-hover:text-stone-900 transition-colors"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </motion.div>
          </div>
        </button>
      )}

      <motion.div 
        animate={{ 
          x: isMobile ? 0 : (isOpen ? 0 : 40), 
          opacity: isMobile ? 1 : (isOpen ? 1 : 0) 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={clsx(
          "flex-1 flex flex-col overflow-hidden",
          isMobile ? "w-full" : "w-[350px]"
        )}
      >
        {/* Tab Navigation - Refined & Aesthetic */}
        <div className="flex bg-[var(--bg-card)]/40 sticky top-0 z-10 overflow-x-auto no-scrollbar">
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
      </motion.div>
    </motion.aside>
  );
};

export default RightPanel;
