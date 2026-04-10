import React from 'react';
import { 
  FileText, 
  Layers, 
  RefreshCw, 
  MousePointer2,
} from 'lucide-react';
import clsx from 'clsx';

interface EditorStatusBarProps {
  wordCount: number;
  charCount: number;
  pageCount: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onShowWordCount?: () => void;
}

const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  wordCount,
  charCount,
  pageCount,
  zoom,
  onZoomChange,
  onShowWordCount
}) => {
  return (
    <div className="h-10 bg-[var(--bg-card)] border-t border-[var(--border-main)] flex items-center px-4 justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest z-30 sticky bottom-0 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        <button 
          onClick={onShowWordCount}
          className="flex items-center gap-2 hover:text-[var(--text-main)] transition-all"
        >
          <FileText size={14} className="text-[var(--text-muted)]" />
          <span className="hidden xs:inline">Words:</span> <span className="text-[var(--text-main)]">{wordCount}</span>
        </button>
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-[var(--text-muted)]" />
          <span className="hidden xs:inline">Pages:</span> <span className="text-[var(--text-main)]">{pageCount}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <MousePointer2 size={14} className="text-[var(--text-muted)]" />
          Chars: <span className="text-[var(--text-main)]">{charCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 border-l border-[var(--border-main)] pl-4 sm:pl-6">
          <div className="hidden md:flex items-center gap-1 mr-2">
            {[50, 100, 150].map((step) => (
              <button
                key={step}
                onClick={() => onZoomChange(step)}
                className={clsx(
                  "px-2 py-1 rounded-md transition-all text-[9px] font-black tracking-tighter",
                  zoom === step 
                    ? "bg-[var(--text-main)] text-[var(--bg-card)] shadow-lg" 
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)]"
                )}
              >
                {step}%
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline text-[var(--text-muted)] text-[9px]">Zoom</span>
            <div className="relative flex items-center group">
              <input 
                type="range" 
                min="50" 
                max="200" 
                step="5"
                value={zoom} 
                onChange={(e) => onZoomChange(parseInt(e.target.value))}
                className="w-20 sm:w-32 h-1.5 bg-[var(--bg-app)] rounded-full appearance-none cursor-pointer accent-[var(--text-main)] hover:bg-[var(--border-main)]/20 transition-all"
              />
            </div>
            <span className="text-[var(--text-main)] min-w-[35px] sm:min-w-[40px] text-right font-black tabular-nums">{zoom}%</span>
          </div>
          
          <button 
            onClick={() => onZoomChange(100)}
            className="p-1.5 hover:bg-[var(--bg-app)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all group shrink-0"
            title="Reset Zoom"
          >
            <RefreshCw size={14} className="group-active:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorStatusBar;
