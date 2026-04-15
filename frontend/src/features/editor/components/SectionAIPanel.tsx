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
  Trash2,
  Image as ImageIcon,
  Paperclip,
  Mic
} from 'lucide-react';
import { Editor } from '@tiptap/react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { SamHead } from './SamRobot';

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
  const [isRecording, setIsRecording] = useState(false);
  const [previewResponse, setPreviewResponse] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (type: 'image' | 'file') => {
    if (type === 'image') imageInputRef.current?.click();
    else fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this file or add it to the prompt context
      console.log(`File selected: ${file.name}`);
      // For now, we'll just add a visual cue in the prompt if empty
      if (!prompt) setPrompt(`[Attached ${file.name}] `);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setIsRecording(true);
      };
      
      recognition.onend = () => {
        console.log("Speech recognition ended");
        setIsRecording(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        // Alert common errors for the user
        if (event.error === 'not-allowed') {
          alert("Microphone access denied. Please enable it in browser settings.");
        }
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Speech transcript:", transcript);
        setPrompt(prev => prev + (prev ? " " : "") + transcript);
      };

      recognition.start();
    } catch (err) {
      console.error("Error initializing speech recognition:", err);
      setIsRecording(false);
    }
  };

  const aiActions = [
    { id: 'improve', label: 'Improve', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'expand', label: 'Expand', icon: Maximize2, color: 'text-stone-600', bg: 'bg-stone-50' },
    { id: 'shorten', label: 'Shorten', icon: Minimize2, color: 'text-stone-600', bg: 'bg-stone-50' },
    { id: 'rewrite', label: 'Rewrite', icon: RefreshCw, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'summarize', label: 'Summarize', icon: Check, color: 'text-stone-900', bg: 'bg-stone-100' },
    { id: 'bullet_points', label: 'Bullets', icon: Plus, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  const handleAction = async (id: string, customPrompt?: string) => {
    if (onAction) {
      const p = customPrompt || prompt;
      setCurrentPrompt(p);
      
      // Extract full document context for better generation
      const fullDocContext = editor?.getText() || "";
      
      // Trigger AI with full context
      onAction({ 
        id, 
        prompt: p, 
        context: fullDocContext 
      });
      
      setPreviewResponse(null); // Clear previous while generating
      
      // For this demo/workflow, we provide the response for review
      // The actual response logic would come from onAction
      if (p.toLowerCase().includes('generate') || p.length >= 3 || id !== 'custom') {
        setTimeout(() => {
          // Capitalize first letter of prompt for heading
          const heading = p.charAt(0).toUpperCase() + p.slice(1);
          const mockResponse = id === 'bullet_points' 
            ? `## ${heading}\n\n• Analysis of the primary data points discovered during the research phase.\n• Correlation with existing literature and methodology findings.\n• Synthesis of findings relative to the project's overall hypothesis.\n• Evaluation of statistical significance and research impact.`
            : `## ${heading}\n\nBased on the comprehensive analysis of the available methodology and experimental data, the ${p.toLowerCase()} demonstrates a high degree of correlation with the initial research hypothesis. This section has been synthesized using the complete context of your document to ensure professional continuity and depth, focusing on technical precision and scholarly impact as established in the current project structure.`;
          setPreviewResponse(mockResponse);
        }, 1500);
      }
      
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

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Preview Area - Floating above input */}
      <AnimatePresence>
        {previewResponse && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="px-4 pb-0 z-20"
          >
            <div className="bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl p-4 shadow-2xl border-stone-200/50 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-main)]/50 pb-2">
                <span className="text-[10px] font-bold text-stone-900 uppercase tracking-widest flex items-center gap-2">
                  <SamHead size={14} className="rounded-md" /> Sam's Draft
                </span>
                <button 
                  onClick={() => setPreviewResponse(null)}
                  className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              
              <div className="text-[11px] text-[var(--text-main)] leading-relaxed max-h-[320px] overflow-y-auto pr-2 no-scrollbar hover:no-scrollbar whitespace-pre-wrap font-medium">
                {previewResponse}
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-[var(--border-main)]/50">
                <button 
                  onClick={() => {
                    insertResponse(previewResponse);
                    // Add to history now that it's inserted
                    const newItem: AIHistoryItem = {
                      id: Math.random().toString(36).substr(2, 9),
                      prompt: currentPrompt,
                      response: previewResponse,
                      timestamp: Date.now(),
                      type: 'ai_request'
                    };
                    setHistory(prev => [newItem, ...prev].slice(0, 20));
                    setPreviewResponse(null);
                  }}
                  className="flex-1 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-bold shadow-lg shadow-stone-900/10 hover:bg-stone-800 active:scale-95 transition-all"
                >
                  Insert In Document
                </button>
                <button 
                  onClick={() => handleAction('custom', currentPrompt)}
                  className="px-4 py-2 border border-[var(--border-main)] rounded-xl text-[10px] font-bold text-[var(--text-main)] hover:bg-[var(--bg-card)] active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ask AI Input - Fixed at Bottom */}
      <div className="p-4 border-t border-[var(--border-main)] bg-[var(--bg-card)]">
        {/* Hidden File Inputs */}
        <input 
          type="file" 
          ref={imageInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />

        <div className="flex flex-col bg-[var(--bg-app)]/50 border border-[var(--border-main)] rounded-[1.5rem] p-1.5 transition-all focus-within:border-[var(--text-main)]/30 focus-within:shadow-xl focus-within:shadow-[var(--text-main)]/5 relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Ask AI to write anything..."}
            className={clsx(
              "w-full bg-transparent border-none p-3 pb-0 text-sm placeholder:text-[var(--text-muted)] focus:outline-none min-h-[50px] resize-none transition-colors",
              isRecording ? "text-stone-900 animate-pulse" : "text-[var(--text-main)]"
            )}
          />
          
          <div className="flex items-center justify-between px-1 pb-1">
            <div className="flex items-center gap-0.5">
              <button 
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] rounded-full transition-all group" 
                title="Upload Image"
                onClick={() => handleFileUpload('image')}
              >
                <ImageIcon size={14} className="group-hover:scale-110 transition-transform" />
              </button>
              <button 
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] rounded-full transition-all group" 
                title="Attach File"
                onClick={() => handleFileUpload('file')}
              >
                <Paperclip size={14} className="group-hover:scale-110 transition-transform" />
              </button>
              <button 
                className={clsx(
                  "p-1.5 rounded-full transition-all group",
                  isRecording ? "text-indigo-500 bg-indigo-50" : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]"
                )}
                title={isRecording ? "Stop Recording" : "Voice Input"}
                onClick={toggleRecording}
              >
                <Mic size={14} className={clsx("transition-transform", isRecording ? "scale-125" : "group-hover:scale-110")} />
              </button>
            </div>
            
            <button 
              onClick={() => handleAction('custom')}
              disabled={loading || !prompt.trim() || isRecording}
              className="flex items-center gap-2 px-4 py-1.5 bg-stone-900 text-white rounded-full font-bold transition-all disabled:opacity-50 active:scale-95 group shadow-md"
            >
              <Send size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span className="text-[9px] uppercase tracking-widest">Generate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionAIPanel;
