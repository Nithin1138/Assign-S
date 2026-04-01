import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  ChevronDown, 
  Zap,
  Check,
  Plus,
  ArrowRight,
  Maximize2,
  Minimize2,
  History,
  Trash2
} from 'lucide-react';
import { Editor } from '@tiptap/react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface SectionAIPanelProps {
  editor: Editor | null;
  loading?: boolean;
  onAction?: (task: any) => void;
}

interface AIHistoryItem {
  id: string;
  prompt: string;
  response: string;
  timestamp: number;
  type: string;
}

const SectionAIPanel: React.FC<SectionAIPanelProps> = ({ editor, loading, onAction }) => {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<AIHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const aiActions = [
    { id: 'improve', label: 'Improve', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'expand', label: 'Expand', icon: Maximize2, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'shorten', label: 'Shorten', icon: Minimize2, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'rewrite', label: 'Rewrite', icon: RefreshCw, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'summarize', label: 'Summarize', icon: Check, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'bullet_points', label: 'Bullets', icon: Plus, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  const handleAction = async (id: string, customPrompt?: string) => {
    if (onAction) {
      const currentPrompt = customPrompt || prompt;
      // In a real app, we'd wait for the response from onAction
      // For now, we'll simulate adding to history if onAction was successful
      onAction({ id, prompt: currentPrompt });
      
      // We'll need a way to get the response back to show in history
      // For this demo, let's assume we add to history
      const newItem: AIHistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        prompt: currentPrompt || id,
        response: "Simulated AI response for " + (currentPrompt || id),
        timestamp: Date.now(),
        type: id
      };
      setHistory(prev => [newItem, ...prev].slice(0, 20));
      if (customPrompt === undefined) setPrompt("");
    }
  };

  const insertResponse = (text: string) => {
    if (editor) {
      editor.chain().focus().insertContent(text).run();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] relative">
      <div className="p-6 border-b border-[var(--border-main)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--text-main)] rounded-lg flex items-center justify-center text-[var(--bg-card)]">
              <Sparkles size={16} />
            </div>
            <h3 className="font-bold text-[var(--text-main)]">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={clsx(
                "p-2 rounded-lg transition-all",
                showHistory ? "bg-[var(--text-main)] text-[var(--bg-card)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)]"
              )}
              title="Interaction History"
            >
              <History size={16} />
            </button>
            {loading && <RefreshCw className="animate-spin text-[var(--text-muted)]" size={16} />}
          </div>
        </div>

        {/* Selection Indicator */}
        {editor && (
          <div className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200",
            editor.state.selection.empty 
              ? "bg-[var(--bg-app)] border-[var(--border-main)] text-[var(--text-muted)]" 
              : "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm"
          )}>
            <div className={clsx(
              "w-1.5 h-1.5 rounded-full",
              editor.state.selection.empty ? "bg-[var(--border-main)]" : "bg-emerald-500 animate-pulse"
            )} />
            <span className="text-[10px] font-bold uppercase tracking-wider truncate">
              {editor.state.selection.empty 
                ? "Full Section Mode" 
                : `Selection: ${editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ').trim().slice(0, 20)}...`
              }
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar relative">
        <AnimatePresence mode="wait">
          {showHistory ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest">Recent Activity</h4>
                <button 
                  onClick={() => setHistory([])}
                  className="text-[10px] font-bold text-[var(--text-muted)] hover:text-red-500 uppercase tracking-widest transition-colors"
                >
                  Clear All
                </button>
              </div>

              {history.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-[var(--bg-app)] rounded-full flex items-center justify-center mx-auto text-[var(--text-muted)]">
                    <History size={24} />
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">No recent interactions yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-main)] space-y-3 group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">{item.type}</p>
                          <p className="text-xs text-[var(--text-main)] font-medium line-clamp-2">{item.prompt}</p>
                        </div>
                        <button 
                          onClick={() => setHistory(prev => prev.filter(h => h.id !== item.id))}
                          className="p-1 text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => insertResponse(item.response)}
                          className="flex-1 py-2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--text-main)] transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={12} /> Re-insert
                        </button>
                        <button 
                          onClick={() => handleAction(item.type, item.prompt)}
                          className="flex-1 py-2 bg-[var(--text-main)] text-[var(--bg-card)] rounded-xl text-[10px] font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--text-main)]/10"
                        >
                          <RefreshCw size={12} /> Re-run
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3">
                {aiActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      disabled={loading}
                      className={clsx(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border border-[var(--border-main)] transition-all duration-200 hover:shadow-lg hover:border-[var(--text-main)]/20 group",
                        action.bg
                      )}
                    >
                      <div className={clsx("p-2 rounded-xl bg-[var(--bg-card)] shadow-sm group-hover:scale-110 transition-transform", action.color)}>
                        <Icon size={18} />
                      </div>
                      <span className="text-xs font-bold text-[var(--text-main)]/70">{action.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Prompt Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Custom Instruction</label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Rewrite this to be more persuasive' or 'Add a counter-argument'..."
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl p-4 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-main)]/5 focus:border-[var(--text-main)] transition-all min-h-[120px] resize-none"
                  />
                  <button 
                    onClick={() => handleAction('custom')}
                    disabled={loading || !prompt.trim()}
                    className="absolute bottom-3 right-3 p-2 bg-[var(--text-main)] text-[var(--bg-card)] rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>

              {/* Output Preview Area */}
              <div className="p-4 bg-[var(--bg-app)] rounded-2xl border border-dashed border-[var(--border-main)]">
                <p className="text-[10px] text-[var(--text-muted)] text-center italic">AI responses will appear here for your review before insertion.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SectionAIPanel;
