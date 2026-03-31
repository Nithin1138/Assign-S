import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  BarChart3,
  BookOpen,
  Layout,
  Type
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface QualityAnalysisPanelProps {
  report?: string | null;
  onCheck?: () => void;
  loading?: boolean;
}

const QualityAnalysisPanel: React.FC<QualityAnalysisPanelProps> = ({ report, onCheck, loading }) => {
  // Mock scores for UI demonstration
  const scores = [
    { label: 'Grammar', score: 85, color: 'bg-emerald-500' },
    { label: 'Readability', score: 72, color: 'bg-blue-500' },
    { label: 'Structure', score: 90, color: 'bg-indigo-500' },
    { label: 'Tone', score: 65, color: 'bg-amber-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)]">
      <div className="p-6 border-b border-[var(--border-main)] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--text-main)] rounded-lg flex items-center justify-center text-[var(--bg-card)]">
              <CheckCircle2 size={16} />
            </div>
            <h3 className="font-bold text-[var(--text-main)]">Quality Analysis</h3>
          </div>
          <button 
            onClick={onCheck}
            disabled={loading}
            className="p-2 hover:bg-[var(--bg-app)] rounded-lg text-[var(--text-muted)] transition-all disabled:opacity-50"
          >
            <RefreshCw className={clsx(loading && "animate-spin")} size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        {/* Scores Grid */}
        <div className="grid grid-cols-2 gap-4">
          {scores.map((score) => (
            <div key={score.label} className="p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-main)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{score.label}</span>
                <span className="text-xs font-bold text-[var(--text-main)]">{score.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-[var(--border-main)]/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score.score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={clsx("h-full rounded-full", score.color)} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions / Report */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" />
            <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">Suggestions</h4>
          </div>

          {report ? (
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-sm text-amber-900 leading-relaxed">
                {report}
              </div>
              <button className="w-full flex items-center justify-center gap-2 p-3 bg-[var(--text-main)] text-[var(--bg-card)] rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
                Apply All Fixes
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="text-center py-12 px-4 border-2 border-dashed border-[var(--border-main)] rounded-3xl">
              <BarChart3 size={32} className="text-[var(--border-main)] mx-auto mb-4" />
              <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                Run a quality check to see detailed analysis and suggestions for improvement.
              </p>
              <button 
                onClick={onCheck}
                className="mt-6 px-6 py-2.5 bg-[var(--text-main)] text-[var(--bg-card)] rounded-xl text-xs font-bold hover:shadow-xl transition-all"
              >
                Start Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityAnalysisPanel;
