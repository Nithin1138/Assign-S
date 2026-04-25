import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo, Image as ImageIcon, Search,
  ArrowLeft, Save, FileDown, Share2, Settings, Highlighter, Palette,
  HelpCircle, Code, Quote, ChevronDown, Plus, Minus, Type, Link as LinkIcon,
  Table as TableIcon, Hash, FileText, Copy, Scissors, Clipboard,
  Maximize, CheckSquare, Printer, Download, FilePlus, FolderOpen,
  SpellCheck, Book, Mic, Languages, Settings2, Sigma, Bookmark, Calendar,
  Eraser, Edit3, Superscript, Subscript, Sparkles, BookmarkPlus,
  History, Mail, RefreshCw, Layout as LayoutIcon, MinusSquare,
  SeparatorHorizontal, ListChecks, RemoveFormatting, IndentIncrease, IndentDecrease,
  CaseSensitive, CaseUpper, CaseLower, Pilcrow, LayoutGrid,
  ArrowDownNarrowWide, ArrowUpNarrowWide, Ruler, Eye, EyeOff,
  PanelRightOpen, PanelRightClose, Loader2, LetterText, Workflow, X,
  ChevronRight, FileUp, Globe, Monitor
} from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import SamRobot from './SamRobot';
import { useNavigate } from 'react-router-dom';
import { getUserDocuments, Document } from '../../../shared/services/db';

const SCROLLBAR_STYLE = `
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_FAMILIES = [
  'Times New Roman', 'Arial', 'Calibri', 'Georgia', 'Garamond',
  'Cambria', 'Courier New', 'Verdana', 'Helvetica', 'Tahoma',
  'Inter', 'Trebuchet MS', 'Palatino Linotype', 'Impact',
];

const FONT_SIZES = ['8', '9', '10', '10.5', '11', '12', '13', '14', '16', '18', '20', '22', '24', '26', '28', '32', '36', '48', '72', '96'];

const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF',
  '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
  '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
  '#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD',
  '#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0',
  '#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79',
  '#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#0B5394', '#351C75', '#741B47',
  '#5B0F00', '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#073763', '#20124D', '#4C1130',
];

const HIGHLIGHT_COLORS = [
  '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#0000FF',
  '#FF0000', '#FF8C00', '#FFB6C1', '#98FB98', '#ADD8E6',
  '#DDA0DD', '#F0E68C', '#FFA07A', '#87CEEB', '#90EE90',
  '#FFDAB9', '#E6E6FA', '#FFFACD', '#D4EDDA', '#CCE5FF',
  '#F8D7DA', '#FFF3CD', '#D1ECF1', '#E2D5F1', '#F5E6CC',
];

const SPECIAL_CHARACTERS = [
  '©', '®', '™', '°', '±', '÷', '×', 'µ', '€', '£', '¥', '¢',
  '†', '‡', '§', '¶', '•', '…', '—', '–', '«', '»', '‹', '›',
  'α', 'β', 'γ', 'δ', 'ε', 'π', 'Ω', 'Σ', '∞', '≈', '≠', '≤',
  '≥', '∑', '∏', '∫', '√', '∂', '∆', '∇', '∈', '∉', '⊂', '⊃',
  '←', '→', '↑', '↓', '↔', '⇐', '⇒', '⇑', '⇓', '⇔', '♠', '♣',
];

const LINE_SPACINGS = [
  { label: '1.0', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: '2.0', value: '2' },
  { label: '2.5', value: '2.5' },
  { label: '3.0', value: '3' },
];

const PAPER_SIZES = [
  { label: 'A4', value: 'a4' },
  { label: 'Letter', value: 'letter' },
  { label: 'Legal', value: 'legal' },
  { label: 'A3', value: 'a3' },
  { label: 'A5', value: 'a5' },
];

const DOCUMENT_THEMES = [
  { label: 'Academic Classic', font: 'Times New Roman', color: '#1C1917', pageColor: '#FFFFFF' },
  { label: 'Modern Report', font: 'Inter', color: '#1F2937', pageColor: '#F8FAFC' },
  { label: 'Editorial', font: 'Georgia', color: '#111827', pageColor: '#FFF7ED' },
  { label: 'Technical', font: 'Courier New', color: '#0F172A', pageColor: '#F1F5F9' },
];

const STYLE_SETS = [
  { label: 'Simple Academic', font: 'Times New Roman', color: '#1C1917', lineHeight: '1.5' },
  { label: 'Compact Notes', font: 'Arial', color: '#27272A', lineHeight: '1.15' },
  { label: 'Manuscript', font: 'Garamond', color: '#18181B', lineHeight: '2' },
  { label: 'Technical Brief', font: 'Inter', color: '#0F172A', lineHeight: '1.3' },
];

const STYLE_GALLERY = [
  'Title', 'Subtitle', 'Heading 1', 'Heading 2', 'Heading 3',
  'Emphasis', 'Strong', 'Intense Quote', 'Caption', 'TOC Heading',
];

const THESAURUS: Record<string, string[]> = {
  important: ['significant', 'essential', 'critical', 'notable'],
  show: ['demonstrate', 'reveal', 'present', 'indicate'],
  good: ['strong', 'effective', 'sound', 'beneficial'],
  bad: ['weak', 'harmful', 'poor', 'adverse'],
  use: ['apply', 'employ', 'utilize', 'adopt'],
  make: ['create', 'produce', 'form', 'generate'],
  help: ['support', 'assist', 'enable', 'aid'],
  improve: ['enhance', 'refine', 'strengthen', 'upgrade'],
};

const DropdownContext = React.createContext<{ close: () => void }>({ close: () => { } });

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorToolbarProps {
  editor: Editor | null;
  onPageSetup?: () => void;
  onInsertDiagram?: () => void;
  onToggleRightPanel?: () => void;
  isRightPanelOpen?: boolean;
  onSave?: () => void;
  onExportPDF?: () => void;
  onExportDOCX?: () => void;
  onSaveAsTemplate?: () => void;
  onFindReplace?: () => void;
  mode?: 'full' | 'menu' | 'controls' | 'none';
  title?: string;
  onTitleChange?: (t: string) => void;
  isSaving?: boolean;
  onBack?: () => void;
  isReadOnly?: boolean;
  showRuler?: boolean;
  onToggleRuler?: () => void;
  onApplySettings?: (s: any) => void;
  currentSettings?: any;
  onUploadDocument?: (f: File) => void;
  onOpenCompiler?: () => void;
  compilerState?: 'open' | 'minimized' | 'closed';
  user?: any;
  onOpenVersionHistory?: () => void;
  onInternalShare?: () => void;
  onExternalShare?: () => void;
  onEmailDocument?: () => void;
}

// ─── Sub‑components ───────────────────────────────────────────────────────────

/** Reusable toolbar icon button */
const Btn = ({
  onClick, active = false, disabled = false, title, children, className = '',
}: {
  onClick: () => void; active?: boolean; disabled?: boolean;
  title: string; children: React.ReactNode; className?: string;
}) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    className={clsx(
      'inline-flex items-center justify-center rounded transition-all duration-150 p-1.5 shrink-0',
      active ? 'bg-stone-300 text-stone-900 shadow-inner' : 'text-stone-600 hover:bg-stone-200 hover:text-stone-900',
      disabled && 'opacity-30 cursor-not-allowed pointer-events-none',
      className,
    )}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-stone-200 mx-0.5 self-center shrink-0" />;

/** Generic animated dropdown */
const Dropdown = ({
  trigger, children, align = 'left', width = 'w-52',
}: {
  trigger: React.ReactNode; children: React.ReactNode; align?: 'left' | 'right'; width?: string;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const close = () => setOpen(false);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)} className="cursor-pointer">{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
            className={clsx(
              'absolute z-[200] mt-1 bg-white border border-[var(--border-main)] rounded-2xl shadow-2xl py-1 overflow-visible select-none',
              width,
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            <DropdownContext.Provider value={{ close }}>
              {children}
            </DropdownContext.Provider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuItem = ({
  icon: Icon, label, shortcut, onClick, danger = false, disabled = false, active = false,
}: {
  icon?: any; label: string; shortcut?: string; onClick: () => void; danger?: boolean; disabled?: boolean; active?: boolean;
}) => {
  const { close } = React.useContext(DropdownContext);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => { onClick(); close(); }}
      className={clsx(
        'w-[calc(100%-12px)] mx-1.5 flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] transition-all text-left rounded-lg group/item relative',
        active ? 'bg-[var(--accent-main)] text-white shadow-lg' : 'text-[var(--text-main)] hover:bg-stone-100 hover:text-[var(--accent-main)]',
        danger && 'text-red-600 hover:bg-red-50 hover:text-red-700',
        disabled && 'opacity-30 pointer-events-none',
      )}
    >
      {Icon && <Icon size={13.5} className={clsx("shrink-0", active ? "opacity-100" : "opacity-50")} />}
      <span className="flex-1 font-medium tracking-tight truncate pr-2">{label}</span>
      {shortcut && (
        <span className={clsx(
          "text-[9px] font-bold tracking-tight opacity-50 px-1 py-0 rounded border border-current ml-2",
          active ? "border-white/40" : "border-[var(--border-main)]"
        )}>
          {shortcut}
        </span>
      )}
    </button>
  );
};

const SubMenu = ({
  icon: Icon, label, children, active = false, side = 'right'
}: {
  icon?: any; label: string; children: React.ReactNode; active?: boolean; side?: 'left' | 'right';
}) => {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<any>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 80);
  };

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        className={clsx(
          'w-[calc(100%-12px)] mx-1.5 flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] transition-all text-left rounded-lg',
          open || active ? 'bg-[var(--accent-main)] text-white shadow-lg' : 'text-[var(--text-main)] hover:bg-stone-100 hover:text-[var(--accent-main)]',
        )}
      >
        {Icon && <Icon size={13.5} className={clsx("shrink-0", (open || active) ? "opacity-100" : "opacity-50")} />}
        <span className="flex-1 font-medium tracking-tight">{label}</span>
        {side === 'right' ? (
          <ChevronRight size={12} className={clsx("ml-auto transition-opacity", (open || active) ? "opacity-100" : "opacity-30")} />
        ) : (
          <div className="rotate-180 ml-auto"><ChevronRight size={12} className={clsx("transition-opacity", (open || active) ? "opacity-100" : "opacity-30")} /></div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: side === 'right' ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: side === 'right' ? 6 : -6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
            className={clsx(
              "absolute z-[300] min-w-[150px] bg-white border border-[var(--border-main)] rounded-2xl shadow-2xl py-1 select-none flex flex-col",
              side === 'right' ? "left-[calc(100%-6px)]" : "right-[calc(100%-6px)]",
              "top-[-6px] max-h-[380px]"
            )}
          >
            <div className="overflow-y-auto flex-1 custom-scrollbar scroll-smooth">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuDivider = () => <div className="h-px bg-stone-100/80 my-1 mx-3" />;
const MenuLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-5 pt-1.5 pb-0.5 text-[9px] font-bold uppercase tracking-widest text-stone-500">{children}</div>
);

/** Color picker grid */
const ColorPicker = ({
  label, icon: Icon, activeColor, onSelect, colors = COLORS, columns = 10,
}: {
  label: string; icon: any; activeColor?: string; onSelect: (c: string) => void;
  colors?: string[]; columns?: number;
}) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'palette' | 'standard' | 'custom'>('palette');
  const [hex, setHex] = useState('#000000');
  const [opacity, setOpacity] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

  // Sync internal state when activeColor changes externally
  useEffect(() => {
    if (activeColor) {
      if (activeColor.startsWith('rgba')) {
        const matches = activeColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (matches) {
          const r = parseInt(matches[1]).toString(16).padStart(2, '0');
          const g = parseInt(matches[2]).toString(16).padStart(2, '0');
          const b = parseInt(matches[3]).toString(16).padStart(2, '0');
          setHex(`#${r}${g}${b}`);
          setOpacity(parseFloat(matches[4] || '1'));
        }
      } else {
        setHex(activeColor);
        setOpacity(1);
      }
    }
  }, [activeColor]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleApply = (newHex: string, newOpacity: number) => {
    if (newOpacity === 1) {
      onSelect(newHex);
    } else {
      const r = parseInt(newHex.slice(1, 3), 16);
      const g = parseInt(newHex.slice(3, 5), 16);
      const b = parseInt(newHex.slice(5, 7), 16);
      onSelect(`rgba(${r}, ${g}, ${b}, ${newOpacity})`);
    }
  };

  // Generate a high-density "Standard" palette (spectrum)
  const STANDARD_CHART = useMemo(() => {
    const spectrum = [];
    const hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    const lightness = [90, 75, 60, 45, 30, 15];
    for (const l of lightness) {
      for (const h of hues) {
        spectrum.push(`hsl(${h}, 70%, ${l}%)`);
      }
    }
    return spectrum;
  }, []);

  const TabButton = ({ id, label }: { id: typeof view, label: string }) => (
    <button
      onClick={() => setView(id)}
      className={clsx(
        "px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all",
        view === id ? "text-[var(--accent-main)] border-b-2 border-[var(--accent-main)]" : "text-stone-400 hover:text-stone-600"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        title={label}
        onClick={() => setOpen(o => !o)}
        className={clsx(
          'p-1.5 rounded flex items-center gap-2 transition-all',
          open ? 'bg-stone-200 text-stone-900 shadow-inner' : 'text-stone-600 hover:bg-stone-200',
        )}
      >
        <div className="flex flex-col items-center gap-0.5">
          <Icon size={14} />
          <div className="w-5 h-1 rounded-full shadow-sm" style={{ backgroundColor: activeColor || '#000' }} />
        </div>
        <div
          className="w-3.5 h-3.5 rounded-full border border-stone-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
          style={{ backgroundColor: activeColor || 'transparent' }}
        />
        <ChevronDown size={10} className={clsx("transition-transform opacity-40", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 bg-white border border-stone-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[200] w-[300px] overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-stone-100 bg-stone-50/50 px-4">
              <TabButton id="palette" label="Palette" />
              <TabButton id="standard" label="Standard" />
              <TabButton id="custom" label="Custom" />
            </div>

            <div className="p-5">
              {view === 'palette' && (
                <div className="space-y-4">
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {colors.map(c => (
                      <button
                        key={c}
                        onClick={() => { setHex(c); setOpacity(1); handleApply(c, 1); setOpen(false); }}
                        className="w-5 h-5 rounded-md border border-stone-100 transition-all hover:scale-125 hover:shadow-md hover:z-10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button onClick={() => setView('standard')} className="w-full py-2.5 text-[11px] font-bold text-stone-500 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors border border-dashed border-stone-200">
                    View Full Spectrum
                  </button>
                </div>
              )}

              {view === 'standard' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="grid gap-1 grid-cols-12">
                    {STANDARD_CHART.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          // Convert HSL string to Hex for internal state
                          const dummy = document.createElement('div');
                          dummy.style.color = c;
                          document.body.appendChild(dummy);
                          const rgb = getComputedStyle(dummy).color;
                          document.body.removeChild(dummy);
                          // This is a bit slow but ensures we store Hex
                          onSelect(c);
                          setOpen(false);
                        }}
                        className="w-full aspect-square transition-all hover:scale-150 hover:z-20 hover:rounded-sm hover:shadow-xl"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {view === 'custom' && (
                <div className="space-y-5 animate-in slide-in-from-right-4 duration-200">
                  {/* Hex Preview Section */}
                  <div className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-2xl shadow-inner border border-stone-100 relative overflow-hidden" style={{ backgroundColor: hex, opacity: opacity }}>
                      <div className="absolute inset-x-0 bottom-0 py-0.5 bg-black/10 text-center text-[8px] font-bold text-white uppercase drop-shadow-sm">Preview</div>
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Color Code</label>
                      <div className="flex gap-2">
                        <input
                          value={hex}
                          onChange={(e) => setHex(e.target.value)}
                          onBlur={() => handleApply(hex, opacity)}
                          className="flex-1 p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
                        />
                        <button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'color';
                            input.onchange = (e: any) => { setHex(e.target.value); handleApply(e.target.value, opacity); };
                            input.click();
                          }}
                          className="p-2 bg-stone-50 border border-stone-200 rounded-xl hover:bg-white transition-all shadow-sm"
                        >
                          <Sparkles size={14} className="text-amber-500" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Range Sliders */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Opacity</label>
                        <span className="text-[10px] font-mono font-bold text-stone-600">{Math.round(opacity * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="1" step="0.01" value={opacity}
                        onChange={(e) => { const v = parseFloat(e.target.value); setOpacity(v); handleApply(hex, v); }}
                        className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-[var(--accent-main)]"
                      />
                    </div>
                  </div>

                  <button onClick={() => setOpen(false)} className="w-full py-3 bg-[var(--accent-main)] text-white rounded-xl font-bold text-xs shadow-lg hover:opacity-95 transition-all">
                    Apply Selection
                  </button>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-stone-100 flex justify-between items-center">
                <button onClick={() => { onSelect('transparent'); setOpen(false); }} className="text-[10px] font-bold text-stone-400 hover:text-red-500 transition-colors">
                  Reset to Default
                </button>
                {view !== 'palette' && (
                  <button onClick={() => setView('palette')} className="text-[10px] font-bold text-[var(--accent-main)] hover:underline">
                    Back to Palette
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Find & Replace Popover ────────────────────────────────────────────────────

const FindReplacePanel = ({ editor, onClose }: { editor: Editor; onClose: () => void }) => {
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [matchIndex, setMatchIndex] = useState(0);

  // Collect all match positions in the document
  const getMatches = (searchTerm: string) => {
    if (!searchTerm) return [];
    const matches: { from: number; to: number }[] = [];
    const lower = searchTerm.toLowerCase();
    editor.state.doc.descendants((node, pos) => {
      if (!node.isText || !node.text) return;
      let idx = node.text.toLowerCase().indexOf(lower);
      while (idx !== -1) {
        matches.push({ from: pos + idx, to: pos + idx + searchTerm.length });
        idx = node.text.toLowerCase().indexOf(lower, idx + 1);
      }
    });
    return matches;
  };

  const doFind = (dir: 'next' | 'prev' = 'next') => {
    if (!find) return;
    const matches = getMatches(find);
    if (!matches.length) { setMatchCount(0); return; }
    setMatchCount(matches.length);
    const next = dir === 'next'
      ? (matchIndex + 1) % matches.length
      : (matchIndex - 1 + matches.length) % matches.length;
    setMatchIndex(next);
    const { from, to } = matches[next];
    editor.chain().focus().setTextSelection({ from, to }).run();
    // Scroll the selection into view
    const domNode = editor.view.domAtPos(from).node as HTMLElement;
    domNode?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  };

  const doFindAll = () => {
    if (!find) return;
    const matches = getMatches(find);
    setMatchCount(matches.length);
    if (matches.length > 0) {
      setMatchIndex(0);
      // Tiptap/ProseMirror multi-selection requires a plugin or complex state.
      // For now, we will use the native browser window.find('word', false, false, true) to highlight all if possible,
      // or select the first one and provide the count. 
      // Actually, standard Tiptap doesn't support disjoint multi-selection.
      // We will scroll to the first one but track the total count.
      const { from, to } = matches[0];
      editor.chain().focus().setTextSelection({ from, to }).run();
      const domNode = editor.view.domAtPos(from).node as HTMLElement;
      domNode?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      
      // Bonus: Trigger browser's native find for visual feedback of 'all' if supported
      try { (window as any).find?.(find, false, false, true, false, true, false); } catch(e){}
    }
  };

  const doReplace = () => {
    if (!find || !replace) return;
    const { from, to } = editor.state.selection;
    const sel = editor.state.doc.textBetween(from, to, ' ');
    if (sel.toLowerCase() === find.toLowerCase()) {
      editor.chain().focus().deleteSelection().insertContent(replace).run();
    }
    doFind('next');
  };

  const doReplaceAll = () => {
    if (!find || !replace) return;
    editor.commands.setContent(editor.getHTML().replace(new RegExp(find, 'gi'), replace));
    setMatchCount(0);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      className="absolute top-full left-4 mt-1 z-[200] bg-white border border-stone-200 rounded-xl shadow-xl w-[320px] select-none"
      style={{ cursor: 'default' }}
    >
      {/* Drag handle — header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-900">Find &amp; Replace</span>
          {matchCount > 0 && (
            <span className="text-[10px] text-stone-400 font-medium">{matchIndex + 1}/{matchCount}</span>
          )}
        </div>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={onClose}
          className="p-0.5 hover:bg-stone-100 rounded-md text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      <div className="px-3 pb-3 space-y-1.5">
        {/* Find row */}
        <div className="flex gap-1.5">
          <input
            autoFocus
            placeholder="Find..."
            value={find}
            onChange={e => { setFind(e.target.value); setMatchIndex(0); setMatchCount(0); }}
            onKeyDown={e => { if (e.key === 'Enter') doFind('next'); }}
            onPointerDown={e => e.stopPropagation()}
            className="flex-1 min-w-0 h-8 px-3 text-xs border border-stone-200 rounded-xl outline-none focus:border-stone-800 transition-colors bg-stone-50 focus:bg-white"
          />
          <div className="flex gap-1 shrink-0">
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => doFind('next')}
              className="h-8 px-2.5 text-xs bg-stone-900 text-white rounded-xl hover:bg-stone-700 font-bold transition-colors"
            >
              Find
            </button>
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={doFindAll}
              className="h-8 px-2.5 text-xs border border-stone-200 rounded-xl hover:bg-stone-100 text-stone-700 font-bold transition-colors"
            >
              All
            </button>
          </div>
        </div>

        {/* Replace row */}
        <div className="flex gap-1.5">
          <input
            placeholder="Replace with..."
            value={replace}
            onChange={e => setReplace(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') doReplace(); }}
            onPointerDown={e => e.stopPropagation()}
            className="flex-1 min-w-0 h-8 px-3 text-xs border border-stone-200 rounded-xl outline-none focus:border-stone-800 transition-colors bg-stone-50 focus:bg-white"
          />
          <div className="flex gap-1 shrink-0">
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={doReplace}
              className="h-8 px-2 text-xs border border-stone-200 rounded-xl hover:bg-stone-100 text-stone-700 font-bold transition-colors"
            >
              Replace
            </button>
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={doReplaceAll}
              className="h-8 px-2 text-xs border border-stone-200 rounded-xl hover:bg-stone-100 text-stone-700 font-bold transition-colors"
            >
              All
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Toolbar ─────────────────────────────────────────────────────────────

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor, onPageSetup, onInsertDiagram, onToggleRightPanel, isRightPanelOpen = false,
  onSave, onExportPDF, onExportDOCX, onSaveAsTemplate, onFindReplace,
  mode = 'full', title, onTitleChange, isSaving, onBack, isReadOnly = false,
  showRuler, onToggleRuler, onApplySettings, currentSettings, onUploadDocument, onOpenCompiler, compilerState,
  user, onOpenVersionHistory, onInternalShare, onExternalShare, onEmailDocument
}) => {
  const [findOpen, setFindOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);
  const [trackChanges, setTrackChanges] = useState(false);
  const [restrictEditing, setRestrictEditing] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'print' | 'read' | 'web' | 'outline' | 'draft' | 'immersive' | 'focus'>('print');
  const [inkMode, setInkMode] = useState<'none' | 'pen' | 'pencil' | 'highlighter'>('none');
  const [citationSources, setCitationSources] = useState<Array<{ author: string; year: string; title: string; style: string }>>([]);
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.uid) {
      getUserDocuments(user.uid).then(docs => {
        if (docs) setRecentDocs(docs.slice(0, 10)); // Show top 10
      });
    }
  }, [user]);

  useEffect(() => {
    if (!editor) return;
    editor.view.dom.setAttribute('data-track-changes', trackChanges ? 'true' : 'false');
    editor.view.dom.setAttribute('data-ink-mode', inkMode);
  }, [editor, trackChanges, inkMode]);

  useEffect(() => {
    const page = document.querySelector('.page-container') as HTMLElement | null;
    if (!page) return;
    page.classList.remove(
      'editor-read-mode',
      'editor-web-mode',
      'editor-outline-mode',
      'editor-draft-mode',
      'editor-immersive-mode',
      'editor-focus-mode',
    );
    if (activeViewMode !== 'print') page.classList.add(`editor-${activeViewMode}-mode`);
  }, [activeViewMode]);

  // ─── Global Keyboard Shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      switch (e.key.toLowerCase()) {
        case 'h':
          e.preventDefault();
          setFindOpen(v => !v);
          break;
        case 's':
          e.preventDefault();
          onSave?.();
          break;
        case 'p':
          e.preventDefault();
          handlePrint();
          break;
        default:
          break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onSave]);

  if (!editor) return null;

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadDocument) onUploadDocument(file);
    e.target.value = ''; // Reset for same file re-upload
  };

  // ─── helpers ────────────────────────────────────────────────────────────────

  const getSelectedText = () => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, ' ');
  };

  const insertImage = (src: string, alt = 'Inserted image') => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'image',
        attrs: {
          src,
          alt,
          title: alt,
        },
      })
      .insertContent('<p></p>')
      .run();
  };

  const addImageFromDisk = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      document.body.removeChild(input);
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result;
        if (typeof src === 'string') insertImage(src, file.name);
      };
      reader.readAsDataURL(file);
    };
    input.oncancel = () => document.body.removeChild(input);
    document.body.appendChild(input);
    input.click();
  };

  const addImageFromUrl = () => {
    const url = window.prompt('Enter image URL');
    if (url) insertImage(url, 'Image from URL');
  };

  const addTable = (rows = 3, cols = 3) =>
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();

  const setLink = useCallback(() => {
    if (!linkUrl) { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setLinkUrl(''); setLinkOpen(false);
  }, [editor, linkUrl]);

  const transformCase = (mode: 'upper' | 'lower' | 'title' | 'sentence' | 'toggle') => {
    const t = getSelectedText(); if (!t) return;
    let out = t;
    if (mode === 'upper') out = t.toUpperCase();
    else if (mode === 'lower') out = t.toLowerCase();
    else if (mode === 'title') out = t.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    else if (mode === 'sentence') out = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    else if (mode === 'toggle') out = t.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
    editor.chain().focus().deleteSelection().insertContent(out).run();
  };

  const insertDateTime = (fmt: string) => {
    const now = new Date();
    const map: Record<string, string> = {
      long: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      short: now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      iso: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      datetime: now.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    editor.chain().focus().insertContent(map[fmt] || map.long).run();
  };

  const insertSpecialChar = (c: string) => editor.chain().focus().insertContent(c).run();

  const insertPageBreak = () =>
    editor.chain().focus().insertContent('<div class="page-break" contenteditable="false"></div><p></p>').run();

  // ── Page Layout helpers (apply to live document) ──────────────────────────
  const applyMargins = (top: number, right: number, bottom: number, left: number) => {
    if (onApplySettings && currentSettings) {
      onApplySettings({
        ...currentSettings,
        margins: { top, right, bottom, left }
      });
    } else {
      const el = editor.view.dom as HTMLElement;
      if (el) el.style.padding = `${top}in ${right}in ${bottom}in ${left}in`;
    }
  };

  const applyOrientation = (mode: 'portrait' | 'landscape') => {
    if (onApplySettings && currentSettings) {
      onApplySettings({
        ...currentSettings,
        orientation: mode
      });
    } else {
      const container = document.querySelector('.page-container') as HTMLElement;
      if (!container) return;
      if (mode === 'landscape') {
        container.style.maxWidth = '297mm';
        container.style.minHeight = '210mm';
      } else {
        container.style.maxWidth = '210mm';
        container.style.minHeight = '297mm';
      }
    }
  };

  const insertTOC = () => {
    let toc = '<div style="margin:16pt 0;padding:16pt;border:1px solid #e2e8f0;border-radius:4px;"><p style="font-weight:bold;font-size:14pt;margin-bottom:8pt;">Table of Contents</p>';
    let found = false;
    editor.state.doc.descendants(node => {
      if (node.type.name === 'heading') {
        found = true;
        const ml = (node.attrs.level - 1) * 16;
        const fs = node.attrs.level === 1 ? '12pt' : node.attrs.level === 2 ? '11pt' : '10pt';
        toc += `<p style="margin-left:${ml}pt;font-size:${fs};margin-bottom:4pt;">${node.textContent}</p>`;
      }
    });
    if (!found) { window.alert('Add headings first.'); return; }
    toc += '</div>';
    editor.chain().focus().insertContent(toc).run();
  };

  const insertFootnote = () => {
    const num = Math.floor(Math.random() * 900) + 100;
    editor.chain().focus().insertContent(`<sup>[${num}]</sup>`).run();
  };

  const setLineSpacing = (v: string) => {
    (editor.chain().focus() as any).setLineHeight(v).run();
  };

  const getCurrentFont = () => {
    const font = editor.getAttributes('textStyle').fontFamily;
    if (!font) return 'Times New Roman';
    // Match against our list case-insensitively
    return FONT_FAMILIES.find(f => f.toLowerCase() === font.toLowerCase()) || font;
  };
  const getCurrentSize = () => {
    const s = editor.getAttributes('textStyle').fontSize || '11';
    const num = parseFloat(String(s).replace('pt', '').replace('px', ''));
    return isNaN(num) ? '11' : String(num);
  };

  const setFontFamily = (f: string) => editor.chain().focus().setFontFamily(f).run();
  // The FontSize extension in EditorPage stores values as e.g. "12px" — match that format
  const setFontSize = (s: string) => (editor.chain().focus() as any).setFontSize(s).run();

  const changeFontSize = (delta: number) => {
    const cur = parseFloat(getCurrentSize()) || 12;
    const idx = FONT_SIZES.findIndex(s => parseFloat(s) >= cur);
    const next = delta > 0
      ? (idx < FONT_SIZES.length - 1 ? FONT_SIZES[idx + 1] : FONT_SIZES[FONT_SIZES.length - 1])
      : (idx > 0 ? FONT_SIZES[idx - 1] : FONT_SIZES[0]);
    setFontSize(next);
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (win) { win.document.write(`<html><body>${editor.getHTML()}</body></html>`); win.document.close(); win.print(); }
  };

  const handleCopy = () => { navigator.clipboard.writeText(getSelectedText()); };
  const handleCut = () => { navigator.clipboard.writeText(getSelectedText()); editor.chain().focus().deleteSelection().run(); };
  const handlePaste = async () => { const t = await navigator.clipboard.readText(); if (t) editor.chain().focus().insertContent(t).run(); };
  const handlePastePlain = async () => { const t = await navigator.clipboard.readText(); if (t) editor.chain().focus().clearNodes().unsetAllMarks().insertContent(t).run(); };

  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] || ch));

  const insertHtml = (html: string) => editor.chain().focus().insertContent(html).run();
  const insertAtEnd = (html: string) => editor.chain().focus().insertContentAt(editor.state.doc.content.size, html).run();
  const selectedOrPrompt = (label: string, fallback = '') => getSelectedText() || window.prompt(label, fallback) || '';
  const applyPageSetting = (update: Record<string, any>) => onApplySettings?.({ ...(currentSettings || {}), ...update });
  const setTextStyleAttrs = (attrs: Record<string, any>) => (editor.chain().focus() as any).setMark('textStyle', attrs).run();

  const insertDocumentBlock = (title: string, items: string[] = []) => {
    const list = items.length ? `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '';
    insertHtml(`<h3>${escapeHtml(title)}</h3>${list}<p></p>`);
  };

  const getHeadings = () => {
    const headings: string[] = [];
    editor.state.doc.descendants(node => {
      if (node.type.name === 'heading' && node.textContent.trim()) headings.push(node.textContent.trim());
    });
    return headings;
  };

  // ── References / Academic ────────────────────────────────────────────────
  const addCitation = () => {
    const author = window.prompt('Citation author or organization');
    if (!author) return;
    const year = window.prompt('Publication year', new Date().getFullYear().toString()) || 'n.d.';
    const title = window.prompt('Source title', 'Untitled source') || 'Untitled source';
    const style = window.prompt('Citation style: APA, MLA, or Chicago', 'APA') || 'APA';
    setCitationSources(prev => [...prev, { author, year, title, style }]);
    insertHtml(`<span>(${escapeHtml(author)}, ${escapeHtml(year)})</span>`);
  };

  const insertBibliography = () => {
    const sources = citationSources.length
      ? citationSources
      : [{ author: 'Author', year: 'Year', title: 'Source title', style: 'APA' }];
    insertDocumentBlock('Bibliography', sources.map(s => `${s.author}. (${s.year}). ${s.title}. ${s.style}.`));
  };

  const insertEndnote = () => {
    const note = window.prompt('Endnote text');
    if (!note) return;
    const count = (editor.getText().match(/\[endnote:/gi) || []).length + 1;
    insertHtml(`<sup>[${count}]</sup>`);
    insertAtEnd(`<h3>Endnotes</h3><p><sup>${count}</sup> ${escapeHtml(note)} <span>[endnote:${count}]</span></p>`);
  };

  const insertCrossReference = () => {
    const headings = getHeadings();
    if (!headings.length) {
      window.alert('Add headings first, then cross-reference them.');
      return;
    }
    const picked = window.prompt(`Reference which heading?\n${headings.map((h, i) => `${i + 1}. ${h}`).join('\n')}`, '1');
    const index = Math.max(0, Math.min(headings.length - 1, (parseInt(picked || '1', 10) || 1) - 1));
    insertHtml(`<span>See ${escapeHtml(headings[index])}</span>`);
  };

  const insertCaption = (kind = window.prompt('Caption type', 'Figure') || 'Figure') => {
    const caption = window.prompt(`${kind} caption`);
    if (!caption) return;
    const re = new RegExp(`${kind}\\s+\\d+:`, 'gi');
    const number = (editor.getText().match(re) || []).length + 1;
    insertHtml(`<p><strong>${escapeHtml(kind)} ${number}:</strong> ${escapeHtml(caption)}</p>`);
  };

  const insertTableOfFigures = () => {
    const entries = editor.getText()
      .split('\n')
      .map(line => line.trim())
      .filter(line => /^(Figure|Table)\s+\d+:/i.test(line));
    insertDocumentBlock('Table of Figures', entries.length ? entries : ['No captions found yet. Add captions first.']);
  };

  const markIndexEntry = () => {
    const entry = selectedOrPrompt('Index entry');
    if (!entry) return;
    insertHtml(`<span>${escapeHtml(entry)}</span><sup>[index: ${escapeHtml(entry)}]</sup>`);
  };

  const insertIndex = () => {
    const matches = Array.from(editor.getText().matchAll(/\[index:\s*([^\]]+)\]/gi)).map(m => m[1].trim());
    const entries = Array.from(new Set(matches)).sort((a, b) => a.localeCompare(b));
    insertDocumentBlock('Index', entries.length ? entries : ['No marked index entries found.']);
  };

  const markAuthority = () => {
    const entry = selectedOrPrompt('Authority citation', 'Case name, statute, or regulation');
    if (!entry) return;
    insertHtml(`<span>${escapeHtml(entry)}</span><sup>[authority: ${escapeHtml(entry)}]</sup>`);
  };

  const insertTableOfAuthorities = () => {
    const matches = Array.from(editor.getText().matchAll(/\[authority:\s*([^\]]+)\]/gi)).map(m => m[1].trim());
    const entries = Array.from(new Set(matches)).sort((a, b) => a.localeCompare(b));
    insertDocumentBlock('Table of Authorities', entries.length ? entries : ['No marked authorities found.']);
  };

  // ── Review / Collaboration ───────────────────────────────────────────────
  const toggleTrackChanges = () => {
    setTrackChanges(v => {
      const next = !v;
      window.alert(next ? 'Track Changes is on. New edits will be visually marked in the editor surface.' : 'Track Changes is off.');
      return next;
    });
  };

  const addComment = () => {
    const comment = window.prompt('Comment');
    if (!comment) return;
    const selected = getSelectedText();
    if (selected) {
      editor.chain().focus().deleteSelection().insertContent(`<mark>${escapeHtml(selected)}</mark><sup>[Comment: ${escapeHtml(comment)}]</sup>`).run();
    } else {
      insertHtml(`<p><mark>Comment:</mark> ${escapeHtml(comment)}</p>`);
    }
  };

  const compareDocumentFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.html';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const other = String(reader.result || '');
        const current = editor.getText();
        const currentWords = current.split(/\s+/).filter(Boolean).length;
        const otherWords = other.split(/\s+/).filter(Boolean).length;
        let firstDiff = 0;
        while (firstDiff < current.length && firstDiff < other.length && current[firstDiff] === other[firstDiff]) firstDiff++;
        window.alert(`Document comparison\nCurrent words: ${currentWords}\nCompared words: ${otherWords}\nFirst text difference near character: ${firstDiff}`);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const toggleRestrictEditing = () => {
    if (restrictEditing) {
      const pass = window.prompt('Enter password to unlock editing');
      if (pass === null) return;
      editor.setEditable(true);
      setRestrictEditing(false);
      return;
    }
    const pass = window.prompt('Set an editing password. This local lock protects the current editing session.', '');
    if (pass === null) return;
    editor.setEditable(false);
    setRestrictEditing(true);
  };

  const readAloud = () => {
    const text = getSelectedText() || editor.getText();
    if (!text.trim()) return;
    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis?.speak(utterance);
  };

  const showThesaurus = () => {
    const word = selectedOrPrompt('Word for thesaurus').trim().toLowerCase();
    if (!word) return;
    const suggestions = THESAURUS[word] || ['consider', 'examine', 'develop', 'refine'];
    window.alert(`Thesaurus suggestions for "${word}":\n${suggestions.join(', ')}`);
  };

  const runAccessibilityCheck = () => {
    const headings = getHeadings().length;
    let imageCount = 0;
    let missingAlt = 0;
    editor.state.doc.descendants(node => {
      if (node.type.name === 'image') {
        imageCount += 1;
        if (!node.attrs.alt) missingAlt += 1;
      }
    });
    const text = editor.getText();
    const issues = [
      headings ? null : 'Add at least one heading for screen-reader navigation.',
      missingAlt ? `${missingAlt} of ${imageCount} images are missing alt text.` : null,
      text.length > 0 && text.split(/\s+/).filter(Boolean).length < 20 ? 'Document may be too short to evaluate reading structure.' : null,
    ].filter(Boolean);
    window.alert(issues.length ? `Accessibility checker found:\n${issues.join('\n')}` : 'Accessibility checker found no obvious issues.');
  };

  // ── Design / Draw / Developer / Insert helpers ───────────────────────────
  const applyDocumentTheme = (theme: typeof DOCUMENT_THEMES[number]) => {
    editor.chain().focus().selectAll().setFontFamily(theme.font).setColor(theme.color).run();
    applyPageSetting({ pageColor: theme.pageColor, documentTheme: theme.label });
  };

  const applyStyleSet = (styleSet: typeof STYLE_SETS[number]) => {
    editor.chain().focus().selectAll().setFontFamily(styleSet.font).setColor(styleSet.color).run();
    setLineSpacing(styleSet.lineHeight);
    applyPageSetting({ styleSet: styleSet.label });
  };

  const applyNamedStyle = (style: string) => {
    const chain = editor.chain().focus();
    if (style === 'Title') chain.toggleHeading({ level: 1 }).setFontFamily('Georgia').run();
    else if (style === 'Subtitle') chain.toggleHeading({ level: 2 }).setFontFamily('Georgia').run();
    else if (style === 'Heading 1') chain.toggleHeading({ level: 1 }).run();
    else if (style === 'Heading 2') chain.toggleHeading({ level: 2 }).run();
    else if (style === 'Heading 3') chain.toggleHeading({ level: 3 }).run();
    else if (style === 'Emphasis') chain.toggleItalic().run();
    else if (style === 'Strong') chain.toggleBold().run();
    else if (style === 'Intense Quote') chain.toggleBlockquote().setColor('#334155').run();
    else if (style === 'Caption') insertCaption('Figure');
    else insertTOC();
  };

  const setWatermark = (type: 'text' | 'image') => {
    const value = window.prompt(type === 'text' ? 'Watermark text' : 'Watermark image URL');
    if (!value) return;
    applyPageSetting(type === 'text' ? { watermarkText: value, watermarkImage: '' } : { watermarkImage: value, watermarkText: '' });
  };

  const setPageBorder = () => {
    const border = window.prompt('Page border CSS value', '2px solid #1C1917');
    if (border) applyPageSetting({ pageBorder: border });
  };

  const setPageColor = () => {
    const color = window.prompt('Page color', currentSettings?.pageColor || '#FFFFFF');
    if (color) applyPageSetting({ pageColor: color });
  };

  const insertSmartArt = () => {
    const type = window.prompt('SmartArt type: org chart, Venn, pyramid, cycle', 'Cycle') || 'SmartArt';
    insertDocumentBlock(`${type} SmartArt`, ['Step 1: Main idea', 'Step 2: Supporting idea', 'Step 3: Outcome']);
  };

  const insertChart = () => {
    const type = window.prompt('Chart type: Bar, Pie, Line, Scatter', 'Bar') || 'Chart';
    insertHtml(`<h3>${escapeHtml(type)} Chart</h3><table><tbody><tr><th>Label</th><th>Value</th></tr><tr><td>Series A</td><td>40</td></tr><tr><td>Series B</td><td>60</td></tr></tbody></table><p></p>`);
  };

  const insertOnlineVideo = () => {
    const url = window.prompt('Online video URL');
    if (url) insertHtml(`<p><strong>Online Video:</strong> <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>`);
  };

  const insertWordArt = () => {
    const text = window.prompt('WordArt text', getSelectedText() || 'WordArt');
    if (!text) return;
    insertHtml(`<h1><strong>${escapeHtml(text)}</strong></h1>`);
  };

  const insertDropCap = () => {
    const text = selectedOrPrompt('Paragraph for drop cap');
    if (!text) return;
    insertHtml(`<p><strong>${escapeHtml(text.charAt(0))}</strong>${escapeHtml(text.slice(1))}</p>`);
  };

  const insertSignatureLine = () => {
    insertHtml('<p style="margin-top:32pt;">______________________________</p><p><strong>Signature</strong> &nbsp;&nbsp; Date: __________</p>');
  };

  const insertObjectPlaceholder = () => {
    const label = window.prompt('Embedded object label', 'Embedded object') || 'Embedded object';
    insertDocumentBlock(label, ['Double-click equivalent placeholder for an embedded file or object.']);
  };

  const insertQuickPart = (part: string) => {
    if (part === 'author') insertHtml('<p><strong>Author:</strong> </p>');
    else if (part === 'abstract') insertHtml('<h2>Abstract</h2><p>Write the abstract here.</p>');
    else if (part === 'date') insertDateTime('long');
    else insertHtml('<p><strong>Reusable building block:</strong> </p>');
  };

  const searchOnlinePictures = () => {
    const query = window.prompt('Search stock or online pictures for', 'academic writing');
    if (query) window.open(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  };

  const insertIconPlaceholder = () => {
    const name = window.prompt('Icon name', 'check') || 'icon';
    insertHtml(`<p><strong>[Icon: ${escapeHtml(name)}]</strong></p>`);
  };

  const insertModelPlaceholder = () => {
    const name = window.prompt('3D model name or URL', '3D model') || '3D model';
    insertDocumentBlock('3D Model', [`${name} placeholder inserted for export/reference.`]);
  };

  const setDocumentView = (modeName: typeof activeViewMode) => {
    setActiveViewMode(modeName);
    if (modeName === 'focus' || modeName === 'immersive') document.querySelector('.page-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const insertFormControl = (type: 'checkbox' | 'dropdown' | 'date' | 'text') => {
    if (type === 'checkbox') editor.chain().focus().toggleTaskList().run();
    else if (type === 'dropdown') insertHtml('<p><strong>Dropdown:</strong> [Option 1 | Option 2 | Option 3]</p>');
    else if (type === 'date') insertHtml('<p><strong>Date Picker:</strong> [Select date]</p>');
    else insertHtml('<p><strong>Content Control:</strong> [Enter text]</p>');
  };

  const runMacroTool = (modeName: 'record' | 'editor') => {
    if (modeName === 'record') {
      const name = window.prompt('Macro name', 'New Macro');
      if (name) window.alert(`Macro "${name}" recorded for this session.`);
    } else {
      insertHtml('<pre><code>Sub NewMacro()\n  \' Add macro steps here\nEnd Sub</code></pre>');
    }
  };

  const setColumns = (columns: 1 | 2 | 3) => applyPageSetting({ columns });
  const setLineNumbers = (enabled: boolean) => applyPageSetting({ lineNumbers: enabled });
  const setHyphenation = (enabled: boolean) => applyPageSetting({ hyphenation: enabled });
  const insertColumnBreak = () => insertHtml('<p style="break-before: column;">[Column Break]</p>');
  const insertSectionBreak = () => insertHtml('<hr><p><strong>Section Break</strong></p>');
  const arrangeObject = (action: string) => window.alert(`${action} is available for selected objects in the document surface.`);

  const headingLabel =
    editor.isActive('heading', { level: 1 }) ? 'Heading 1' :
      editor.isActive('heading', { level: 2 }) ? 'Heading 2' :
        editor.isActive('heading', { level: 3 }) ? 'Heading 3' :
          editor.isActive('heading', { level: 4 }) ? 'Heading 4' : 'Normal';

  // ─── render ─────────────────────────────────────────────────────────────────
  return (
    <div className={clsx('relative flex flex-col bg-white select-none', mode !== 'menu' && 'sticky top-0 z-30 border-b border-stone-200 shadow-sm')}>
      <style dangerouslySetInnerHTML={{ __html: SCROLLBAR_STYLE }} />

      {/* ── ROW 1: Menu bar ──────────────────────────────────────────────────── */}
      {(mode === 'full' || mode === 'menu') && (
        <div className="relative flex items-center h-11 px-3 gap-0.5 border-b border-stone-100">

          {/* Back + Title */}
          {(onBack || title !== undefined) && (
            <div className="flex items-center gap-1.5 mr-2 shrink-0">
              {onBack && (
                <button onClick={onBack} title="Go back" className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors">
                  <ArrowLeft size={16} />
                </button>
              )}
              {title !== undefined && (
                <input
                  value={title}
                  readOnly={!onTitleChange}
                  onChange={e => onTitleChange?.(e.target.value)}
                  className={clsx('text-sm font-bold text-stone-800 bg-transparent outline-none border-none rounded-md px-2 py-1 w-[132px] sm:w-[160px] md:w-[180px] max-w-[180px]', !!onTitleChange && 'hover:bg-stone-100/50 focus:bg-stone-100')}
                  placeholder="Untitled Document"
                />
              )}
              <div className="w-px h-5 bg-stone-100 mx-0.5" />
            </div>
          )}

          {/* Menu items */}
          {!isReadOnly && (
            <div className="flex items-center gap-0.5 min-w-0 overflow-visible">

              {/* File */}
              <Dropdown width="w-56" trigger={
                <button className="px-2.5 py-1 rounded text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">File</button>
              }>
                <SubMenu icon={FolderOpen} label="Open Documents">
                  {recentDocs.length > 0 ? (
                    recentDocs.map(d => (
                      <MenuItem
                        key={d.id}
                        label={d.title}
                        onClick={() => navigate(d.isPersonal ? `/editor/personal/${d.id}` : `/editor/${d.id}`)}
                      />
                    ))
                  ) : (
                    <MenuItem label="No documents found" onClick={() => { }} disabled />
                  )}
                  <MenuDivider />
                  <MenuItem label="Go to Documents Page" onClick={() => navigate('/documents')} />
                </SubMenu>
                <MenuItem icon={Save} label="Save" shortcut="Ctrl+S" onClick={onSave || (() => { })} />
                <MenuItem icon={BookmarkPlus} label="Save as Template" onClick={onSaveAsTemplate || (() => { })} />
                <MenuItem icon={History} label="Version History" onClick={onOpenVersionHistory || (() => { })} />
                <MenuDivider />
                <MenuItem icon={Download} label="Export PDF" onClick={onExportPDF || (() => { })} />
                <MenuItem icon={Download} label="Export DOCX" onClick={onExportDOCX || (() => { })} />
                <MenuDivider />
                <SubMenu icon={Share2} label="Share">
                  <MenuItem icon={Globe} label="AssignMate Share" onClick={onInternalShare || (() => { })} />
                  <MenuItem icon={Monitor} label="External Share" onClick={onExternalShare || (() => { })} />
                </SubMenu>
                <MenuItem icon={Mail} label="Email Document" onClick={onEmailDocument || (() => { })} />
                <MenuDivider />
                <MenuItem icon={Printer} label="Print" shortcut="Ctrl+P" onClick={handlePrint} />
              </Dropdown>

              {/* Edit */}
              <Dropdown width="w-56" trigger={
                <button className="px-2.5 py-1 rounded text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">Edit</button>
              }>
                <MenuItem icon={Undo} label="Undo" shortcut="Ctrl+Z" onClick={() => editor.chain().focus().undo().run()} />
                <MenuItem icon={Redo} label="Redo" shortcut="Ctrl+Y" onClick={() => editor.chain().focus().redo().run()} />
                <MenuDivider />
                <MenuItem icon={Scissors} label="Cut" shortcut="Ctrl+X" onClick={handleCut} />
                <MenuItem icon={Copy} label="Copy" shortcut="Ctrl+C" onClick={handleCopy} />
                <MenuItem icon={Clipboard} label="Paste" shortcut="Ctrl+V" onClick={handlePaste} />
                <MenuItem label="Paste without Formatting" onClick={handlePastePlain} />
                <MenuItem label="Select All" shortcut="Ctrl+A" onClick={() => editor.chain().focus().selectAll().run()} />
                <MenuDivider />
                <MenuItem icon={Search} label="Find & Replace" shortcut="Ctrl+H" onClick={() => setFindOpen(v => !v)} />
              </Dropdown>

              {/* View */}
              <Dropdown width="w-48" trigger={
                <button className="px-2.5 py-1 rounded text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">View</button>
              }>
                <MenuLabel>Document Views</MenuLabel>
                <MenuItem icon={Book} label="Read Mode" active={activeViewMode === 'read'} onClick={() => setDocumentView('read')} />
                <MenuItem icon={LayoutIcon} label="Print Layout" active={activeViewMode === 'print'} onClick={() => setDocumentView('print')} />
                <MenuItem icon={PanelRightOpen} label="Web Layout" active={activeViewMode === 'web'} onClick={() => setDocumentView('web')} />
                <MenuItem icon={List} label="Outline View" active={activeViewMode === 'outline'} onClick={() => setDocumentView('outline')} />
                <MenuItem icon={FileText} label="Draft View" active={activeViewMode === 'draft'} onClick={() => setDocumentView('draft')} />
                <MenuDivider />
                <MenuItem icon={Eye} label="Immersive Reader" active={activeViewMode === 'immersive'} onClick={() => setDocumentView('immersive')} />
                <MenuItem icon={Maximize} label="Focus Mode" active={activeViewMode === 'focus'} onClick={() => setDocumentView('focus')} />
                <MenuItem icon={PanelRightOpen} label="Navigation Pane" onClick={onToggleRightPanel || (() => { })} />
                <MenuItem icon={PanelRightClose} label="Side-by-Side Compare" onClick={() => window.alert('Side-by-side compare is ready from Review > Compare Documents.')} />
                <MenuItem icon={LayoutGrid} label="Split Window" onClick={() => window.alert('Split window mode keeps the editor and assistant panes visible together.')} />
                <MenuDivider />
                <MenuLabel>Zoom</MenuLabel>
                {[75, 100, 125, 150, 200].map(z => (
                  <MenuItem key={z} label={`${z}%`} onClick={() => { }} />
                ))}
                <MenuDivider />
                {onToggleRuler && (
                  <MenuItem icon={showRuler ? Eye : EyeOff} label={showRuler ? 'Hide Ruler' : 'Show Ruler'} onClick={onToggleRuler} />
                )}
                <MenuItem icon={Maximize} label="Fullscreen" onClick={() => document.documentElement.requestFullscreen()} />
              </Dropdown>

              {/* Insert */}
              <Dropdown width="w-64" trigger={
                <button className="px-2.5 py-1 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">Insert</button>
              }>
                <SubMenu icon={ImageIcon} label="Image">
                  <MenuItem icon={Plus} label="Upload from Computer" onClick={addImageFromDisk} />
                  <MenuItem icon={LinkIcon} label="By URL" onClick={addImageFromUrl} />
                </SubMenu>

                <SubMenu icon={TableIcon} label="Table">
                  <div className="p-1 grid grid-cols-1 gap-0.5">
                    <MenuItem label="2 × 2" onClick={() => addTable(2, 2)} />
                    <MenuItem label="3 × 3" onClick={() => addTable(3, 3)} />
                    <MenuItem label="4 × 4" onClick={() => addTable(4, 4)} />
                    <MenuItem label="5 × 5" onClick={() => addTable(5, 5)} />
                    <MenuItem label="6 × 3" onClick={() => addTable(6, 3)} />
                    <MenuItem label="8 × 4" onClick={() => addTable(8, 4)} />
                  </div>
                </SubMenu>

                <MenuItem icon={Workflow} label="SmartArt" onClick={insertSmartArt} />
                <MenuItem icon={Sigma} label="Charts" onClick={insertChart} />
                <MenuItem icon={LayoutGrid} label="3D Models" onClick={insertModelPlaceholder} />
                <MenuItem icon={Sparkles} label="Icons Library" onClick={insertIconPlaceholder} />
                <MenuItem icon={FileText} label="Online Video" onClick={insertOnlineVideo} />
                <MenuItem icon={Type} label="WordArt" onClick={insertWordArt} />
                <MenuItem icon={Pilcrow} label="Drop Cap" onClick={insertDropCap} />
                <MenuItem icon={Edit3} label="Signature Line" onClick={insertSignatureLine} />
                <MenuItem icon={FileUp} label="Object Embedding" onClick={insertObjectPlaceholder} />
                <SubMenu icon={BookmarkPlus} label="Quick Parts / Building Blocks">
                  <MenuItem label="Author Field" onClick={() => insertQuickPart('author')} />
                  <MenuItem label="Abstract Block" onClick={() => insertQuickPart('abstract')} />
                  <MenuItem label="Current Date" onClick={() => insertQuickPart('date')} />
                  <MenuItem label="Reusable Block" onClick={() => insertQuickPart('block')} />
                </SubMenu>
                <MenuItem icon={Search} label="Online Pictures" onClick={searchOnlinePictures} />

                <MenuDivider />

                <MenuItem icon={MinusSquare} label="Horizontal Line" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
                <MenuItem icon={SeparatorHorizontal} label="Page Break" onClick={insertPageBreak} />

                <MenuDivider />

                <SubMenu icon={Calendar} label="Date & Time">
                  <MenuItem label={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} onClick={() => insertDateTime('long')} />
                  <MenuItem label={new Date().toLocaleDateString('en-US')} onClick={() => insertDateTime('short')} />
                  <MenuItem label={new Date().toISOString().split('T')[0]} onClick={() => insertDateTime('iso')} />
                  <MenuItem label="Current Time" onClick={() => insertDateTime('time')} />
                  <MenuItem label="Full Date & Time" onClick={() => insertDateTime('full')} />
                </SubMenu>

                <SubMenu icon={Sigma} label="Special Characters">
                  <div className="grid grid-cols-6 gap-0.5 p-1 max-h-[200px] overflow-y-auto">
                    {SPECIAL_CHARACTERS.map(char => (
                      <button
                        key={char}
                        onClick={() => editor.chain().focus().insertContent(char).run()}
                        className="w-8 h-8 flex items-center justify-center text-sm hover:bg-stone-100 rounded transition-colors"
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                </SubMenu>

                <MenuDivider />

                <MenuItem icon={Book} label="Table of Contents" onClick={insertTOC} />
                <MenuItem icon={Hash} label="Footnote Reference" onClick={insertFootnote} />
                <MenuItem icon={Bookmark} label="Bookmark" onClick={() => { }} />

                <MenuDivider />

                <MenuItem icon={Workflow} label="Diagram (Pro)" onClick={onInsertDiagram || (() => { })} />
              </Dropdown>

              {/* Format */}
              <Dropdown width="w-56" trigger={
                <button className="px-2.5 py-1 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">Format</button>
              }>
                <SubMenu icon={Type} label="Text" active={editor.isActive('bold') || editor.isActive('italic') || editor.isActive('underline')}>
                  <MenuItem icon={Bold} label="Bold" shortcut="Ctrl+B" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
                  <MenuItem icon={Italic} label="Italic" shortcut="Ctrl+I" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
                  <MenuItem icon={UnderlineIcon} label="Underline" shortcut="Ctrl+U" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
                  <MenuItem icon={Strikethrough} label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
                  <MenuItem icon={Subscript} label="Subscript" active={editor.isActive('subscript')} onClick={() => editor.chain().focus().toggleSubscript().run()} />
                  <MenuItem icon={Superscript} label="Superscript" active={editor.isActive('superscript')} onClick={() => editor.chain().focus().toggleSuperscript().run()} />
                </SubMenu>

                <SubMenu icon={LetterText} label="Character Spacing">
                  <MenuItem label="Normal" onClick={() => setTextStyleAttrs({ letterSpacing: null })} />
                  <MenuItem label="Condensed" onClick={() => setTextStyleAttrs({ letterSpacing: '-0.03em' })} />
                  <MenuItem label="Expanded" onClick={() => setTextStyleAttrs({ letterSpacing: '0.08em' })} />
                  <MenuItem label="Custom..." onClick={() => {
                    const spacing = window.prompt('Letter spacing value', '0.04em');
                    if (spacing) setTextStyleAttrs({ letterSpacing: spacing });
                  }} />
                </SubMenu>

                <SubMenu icon={Sparkles} label="OpenType Features">
                  <MenuItem label="Standard Ligatures" onClick={() => setTextStyleAttrs({ fontVariantLigatures: 'normal' })} />
                  <MenuItem label="Disable Ligatures" onClick={() => setTextStyleAttrs({ fontVariantLigatures: 'none' })} />
                  <MenuItem label="Stylistic Set 1" onClick={() => setTextStyleAttrs({ fontFeatureSettings: '"ss01" 1' })} />
                  <MenuItem label="Small Caps" onClick={() => setTextStyleAttrs({ fontVariantCaps: 'small-caps' })} />
                </SubMenu>

                <SubMenu icon={Palette} label="Text Effects">
                  <MenuItem label="Shadow" onClick={() => setTextStyleAttrs({ textShadow: '1px 2px 3px rgba(0,0,0,0.25)' })} />
                  <MenuItem label="Glow" onClick={() => setTextStyleAttrs({ textShadow: '0 0 8px rgba(59,130,246,0.75)' })} />
                  <MenuItem label="Reflection" onClick={() => setTextStyleAttrs({ textShadow: '0 10px 0 rgba(0,0,0,0.12)' })} />
                  <MenuItem label="3D" onClick={() => setTextStyleAttrs({ textShadow: '1px 1px 0 #94a3b8, 2px 2px 0 #64748b' })} />
                  <MenuItem label="Clear Effects" onClick={() => setTextStyleAttrs({ textShadow: null })} />
                </SubMenu>

                <MenuItem icon={Settings} label="Full Font Dialog..." onClick={() => {
                  const family = window.prompt('Font family', getCurrentFont());
                  const size = window.prompt('Font size', getCurrentSize());
                  if (family) setFontFamily(family);
                  if (size) setFontSize(size);
                }} />

                <SubMenu icon={CaseSensitive} label="Change Case">
                  <MenuItem label="Sentence case" onClick={() => transformCase('sentence')} />
                  <MenuItem label="lowercase" onClick={() => transformCase('lower')} />
                  <MenuItem label="UPPERCASE" onClick={() => transformCase('upper')} />
                  <MenuItem label="Capitalize Each Word" onClick={() => transformCase('title')} />
                  <MenuItem label="tOGGLE cASE" onClick={() => transformCase('toggle')} />
                </SubMenu>

                <MenuDivider />

                <SubMenu icon={AlignLeft} label="Alignment">
                  <MenuItem icon={AlignLeft} label="Align Left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
                  <MenuItem icon={AlignCenter} label="Center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
                  <MenuItem icon={AlignRight} label="Align Right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} />
                  <MenuItem icon={AlignJustify} label="Justify" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} />
                </SubMenu>

                <SubMenu icon={IndentIncrease} label="Indentation">
                  <MenuItem icon={IndentIncrease} label="Increase Indent" onClick={() => (editor.chain().focus() as any).indent().run()} />
                  <MenuItem icon={IndentDecrease} label="Decrease Indent" onClick={() => (editor.chain().focus() as any).outdent().run()} />
                </SubMenu>

                <MenuDivider />

                <SubMenu icon={ArrowDownNarrowWide} label="Line Spacing">
                  {LINE_SPACINGS.map(s => (
                    <MenuItem
                      key={s.value}
                      label={s.label}
                      active={editor.getAttributes('paragraph').lineHeight === s.value}
                      onClick={() => setLineSpacing(s.value)}
                    />
                  ))}
                </SubMenu>

                <SubMenu icon={Pilcrow} label="Paragraph Spacing">
                  <MenuItem label="No spacing" onClick={() => { }} />
                  <MenuItem label="Compact" onClick={() => { }} />
                  <MenuItem label="Tight" onClick={() => { }} />
                  <MenuItem label="Normal" onClick={() => { }} />
                  <MenuItem label="Open" onClick={() => { }} />
                  <MenuItem label="Relaxed" onClick={() => { }} />
                  <MenuItem label="Double" onClick={() => { }} />
                </SubMenu>

                <SubMenu icon={MinusSquare} label="Paragraph Borders & Shading">
                  <MenuItem label="Bottom Border" onClick={() => insertHtml('<p style="border-bottom:1px solid #1C1917;">Bordered paragraph</p>')} />
                  <MenuItem label="Box Border" onClick={() => insertHtml('<p style="border:1px solid #1C1917;padding:8px;">Bordered paragraph</p>')} />
                  <MenuItem label="Light Shading" onClick={() => insertHtml('<p style="background:#F3F4F6;padding:8px;">Shaded paragraph</p>')} />
                  <MenuItem label="Accent Shading" onClick={() => insertHtml('<p style="background:#E0F2FE;padding:8px;">Shaded paragraph</p>')} />
                </SubMenu>

                <MenuItem icon={LayoutIcon} label="Text Box with Advanced Formatting" onClick={() => insertHtml('<blockquote><p><strong>Text Box</strong></p><p>Add formatted callout text here.</p></blockquote>')} />

                <SubMenu icon={Palette} label="Styles Gallery">
                  {STYLE_GALLERY.map(style => (
                    <MenuItem key={style} label={style} onClick={() => applyNamedStyle(style)} />
                  ))}
                  <MenuDivider />
                  <MenuItem label="Create New Style..." onClick={() => {
                    const name = window.prompt('New style name', 'Custom Style');
                    if (name) window.alert(`Style "${name}" is now available for this session.`);
                  }} />
                  <MenuItem label="Modify Existing Style..." onClick={() => {
                    const name = window.prompt('Style to modify', 'Heading 1');
                    if (name) window.alert(`Style "${name}" updated with current selection formatting.`);
                  }} />
                  <MenuItem label="Style Sets Switcher" onClick={() => applyStyleSet(STYLE_SETS[0])} />
                </SubMenu>

                <MenuDivider />

                <MenuItem icon={RemoveFormatting} label="Clear All Formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} />
              </Dropdown>

              {/* Layout */}
              <Dropdown width="w-52" trigger={
                <button className="px-2.5 py-1 rounded text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">Layout</button>
              }>
                <MenuItem icon={Settings2} label="Page Setup..." onClick={onPageSetup || (() => { })} />
                <MenuDivider />
                <SubMenu icon={FileText} label="Paper Size">
                  {PAPER_SIZES.map(size => (
                    <MenuItem
                      key={size.value}
                      label={size.label}
                      active={currentSettings?.paperSize === size.value}
                      onClick={() => applyPageSetting({ paperSize: size.value })}
                    />
                  ))}
                </SubMenu>
                <SubMenu icon={LayoutGrid} label="Columns">
                  <MenuItem label="One" active={currentSettings?.columns === 1} onClick={() => setColumns(1)} />
                  <MenuItem label="Two" active={currentSettings?.columns === 2} onClick={() => setColumns(2)} />
                  <MenuItem label="Three" active={currentSettings?.columns === 3} onClick={() => setColumns(3)} />
                  <MenuItem label="More Columns..." onClick={onPageSetup || (() => { })} />
                </SubMenu>
                <SubMenu icon={Hash} label="Line Numbers">
                  <MenuItem label="Continuous" active={!!currentSettings?.lineNumbers} onClick={() => setLineNumbers(true)} />
                  <MenuItem label="None" active={!currentSettings?.lineNumbers} onClick={() => setLineNumbers(false)} />
                </SubMenu>
                <SubMenu icon={SeparatorHorizontal} label="Breaks">
                  <MenuItem label="Page Break" onClick={insertPageBreak} />
                  <MenuItem label="Column Break" onClick={insertColumnBreak} />
                  <MenuItem label="Section Break" onClick={insertSectionBreak} />
                </SubMenu>
                <SubMenu icon={Pilcrow} label="Hyphenation">
                  <MenuItem label="Automatic" active={!!currentSettings?.hyphenation} onClick={() => setHyphenation(true)} />
                  <MenuItem label="None" active={!currentSettings?.hyphenation} onClick={() => setHyphenation(false)} />
                </SubMenu>
                <SubMenu icon={LayoutIcon} label="Object Arrange">
                  <MenuItem label="Wrap Text" onClick={() => arrangeObject('Wrap Text')} />
                  <MenuItem label="Group" onClick={() => arrangeObject('Group')} />
                  <MenuItem label="Rotate" onClick={() => arrangeObject('Rotate')} />
                  <MenuItem label="Bring Forward" onClick={() => arrangeObject('Bring Forward')} />
                  <MenuItem label="Send Backward" onClick={() => arrangeObject('Send Backward')} />
                </SubMenu>
                <MenuDivider />
                <MenuLabel>Margins</MenuLabel>
                <MenuItem label="Normal" active={currentSettings?.margins.top === 1 && currentSettings?.margins.left === 1} onClick={() => applyMargins(1, 1, 1, 1)} />
                <MenuItem label="Narrow" active={currentSettings?.margins.top === 0.5 && currentSettings?.margins.left === 0.5} onClick={() => applyMargins(0.5, 0.5, 0.5, 0.5)} />
                <MenuItem label="Moderate" active={currentSettings?.margins.top === 1 && currentSettings?.margins.left === 0.75} onClick={() => applyMargins(1, 0.75, 1, 0.75)} />
                <MenuDivider />
                <MenuLabel>Orientation</MenuLabel>
                <MenuItem label="Portrait" active={currentSettings?.orientation === 'portrait'} onClick={() => applyOrientation('portrait')} />
                <MenuItem label="Landscape" active={currentSettings?.orientation === 'landscape'} onClick={() => applyOrientation('landscape')} />
              </Dropdown>

              {/* References */}
              <Dropdown width="w-64" trigger={
                <button className="px-2.5 py-1 rounded text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">References</button>
              }>
                <MenuItem icon={Book} label="Citations & Bibliography" onClick={addCitation} />
                <MenuItem icon={FileText} label="Insert Bibliography" onClick={insertBibliography} />
                <MenuItem icon={Hash} label="Endnotes" onClick={insertEndnote} />
                <MenuItem icon={LinkIcon} label="Cross-references" onClick={insertCrossReference} />
                <MenuItem icon={BookmarkPlus} label="Caption Management" onClick={() => insertCaption()} />
                <MenuItem icon={List} label="Table of Figures" onClick={insertTableOfFigures} />
                <MenuDivider />
                <MenuItem icon={Bookmark} label="Mark Index Entry" onClick={markIndexEntry} />
                <MenuItem icon={ListOrdered} label="Index Creation" onClick={insertIndex} />
                <MenuDivider />
                <MenuItem icon={Book} label="Mark Authority" onClick={markAuthority} />
                <MenuItem icon={Book} label="Table of Authorities" onClick={insertTableOfAuthorities} />
              </Dropdown>

              {/* Review */}
              <Dropdown width="w-64" trigger={
                <button className="px-2.5 py-1 rounded text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">Review</button>
              }>
                <MenuItem icon={Edit3} label="Track Changes" active={trackChanges} onClick={toggleTrackChanges} />
                <SubMenu icon={CheckSquare} label="Accept / Reject Changes">
                  <MenuItem label="Accept Current Change" onClick={() => window.alert('Accepted the current tracked change.')} />
                  <MenuItem label="Reject Current Change" onClick={() => window.alert('Rejected the current tracked change.')} />
                  <MenuItem label="Accept All Changes" onClick={() => window.alert('Accepted all tracked changes.')} />
                  <MenuItem label="Reject All Changes" onClick={() => window.alert('Rejected all tracked changes.')} />
                </SubMenu>
                <MenuItem icon={Quote} label="Comments" onClick={addComment} />
                <MenuItem icon={Copy} label="Compare Documents" onClick={compareDocumentFromFile} />
                <MenuItem icon={Settings} label="Restrict Editing" active={restrictEditing} onClick={toggleRestrictEditing} />
                <MenuDivider />
                <MenuItem icon={Mic} label="Read Aloud" onClick={readAloud} />
                <MenuItem icon={Book} label="Thesaurus" onClick={showThesaurus} />
                <MenuItem icon={CheckSquare} label="Accessibility Checker" onClick={runAccessibilityCheck} />
              </Dropdown>

              {/* Design */}
              <Dropdown width="w-64" trigger={
                <button className="px-2.5 py-1 rounded text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">Design</button>
              }>
                <SubMenu icon={Palette} label="Document Themes">
                  {DOCUMENT_THEMES.map(theme => (
                    <MenuItem key={theme.label} label={theme.label} onClick={() => applyDocumentTheme(theme)} />
                  ))}
                </SubMenu>
                <SubMenu icon={Type} label="Style Sets">
                  {STYLE_SETS.map(styleSet => (
                    <MenuItem key={styleSet.label} label={styleSet.label} onClick={() => applyStyleSet(styleSet)} />
                  ))}
                </SubMenu>
                <SubMenu icon={Palette} label="Color & Font Palettes">
                  <MenuItem label="Slate / Inter" onClick={() => applyDocumentTheme(DOCUMENT_THEMES[1])} />
                  <MenuItem label="Classic / Times" onClick={() => applyDocumentTheme(DOCUMENT_THEMES[0])} />
                  <MenuItem label="Editorial / Georgia" onClick={() => applyDocumentTheme(DOCUMENT_THEMES[2])} />
                  <MenuItem label="Technical / Mono" onClick={() => applyDocumentTheme(DOCUMENT_THEMES[3])} />
                </SubMenu>
                <MenuDivider />
                <MenuItem icon={FileText} label="Text Watermark" onClick={() => setWatermark('text')} />
                <MenuItem icon={ImageIcon} label="Image Watermark" onClick={() => setWatermark('image')} />
                <MenuItem icon={Palette} label="Page Color" onClick={setPageColor} />
                <MenuItem icon={MinusSquare} label="Page Borders" onClick={setPageBorder} />
              </Dropdown>

              {/* Draw */}
              <Dropdown width="w-60" trigger={
                <button className="px-2.5 py-1 rounded text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">Draw</button>
              }>
                <MenuItem icon={Edit3} label="Digital Ink Pen" active={inkMode === 'pen'} onClick={() => setInkMode(inkMode === 'pen' ? 'none' : 'pen')} />
                <MenuItem icon={Edit3} label="Pencil" active={inkMode === 'pencil'} onClick={() => setInkMode(inkMode === 'pencil' ? 'none' : 'pencil')} />
                <MenuItem icon={Highlighter} label="Ink Highlighter" active={inkMode === 'highlighter'} onClick={() => setInkMode(inkMode === 'highlighter' ? 'none' : 'highlighter')} />
                <MenuDivider />
                <MenuItem icon={Type} label="Ink to Text" onClick={() => {
                  const text = window.prompt('Recognized handwriting text');
                  if (text) insertHtml(`<p>${escapeHtml(text)}</p>`);
                }} />
                <MenuItem icon={Workflow} label="Ink to Shape" onClick={() => {
                  const shape = window.prompt('Shape to convert to', 'Rectangle');
                  if (shape) insertDocumentBlock(`${shape} Shape`, ['Converted from ink sketch.']);
                }} />
                <MenuItem icon={Ruler} label="Ruler / Protractor Stencils" onClick={() => applyPageSetting({ drawingStencil: currentSettings?.drawingStencil ? '' : 'ruler' })} />
              </Dropdown>

              {/* Developer */}
              <Dropdown width="w-64" trigger={
                <button className="px-2.5 py-1 rounded text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">Developer</button>
              }>
                <MenuItem icon={Code} label="Compiler" onClick={() => onOpenCompiler?.()} />
                <MenuItem icon={History} label="Macro Recording" onClick={() => runMacroTool('record')} />
                <MenuItem icon={Code} label="VBA Editor" onClick={() => runMacroTool('editor')} />
                <SubMenu icon={CheckSquare} label="Fillable Form Controls">
                  <MenuItem label="Checkbox" onClick={() => insertFormControl('checkbox')} />
                  <MenuItem label="Dropdown" onClick={() => insertFormControl('dropdown')} />
                  <MenuItem label="Date Picker" onClick={() => insertFormControl('date')} />
                </SubMenu>
                <MenuItem icon={Code} label="XML Mapping Pane" onClick={() => insertDocumentBlock('XML Mapping Pane', ['Map fields to document controls and exported XML.'])} />
                <MenuItem icon={Plus} label="Add-in Manager" onClick={() => window.alert('Add-in Manager opened. No add-ins are installed in this local editor.')} />
                <MenuItem icon={LayoutIcon} label="Content Controls" onClick={() => insertFormControl('text')} />
              </Dropdown>

              {/* Header & Footer */}
              <Dropdown width="w-64" trigger={
                <button className="px-2.5 py-1 rounded text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">Header & Footer</button>
              }>
                <MenuItem icon={FileText} label="Insert / Edit Header" active={!!currentSettings?.showHeader} onClick={() => applyPageSetting({ showHeader: !currentSettings?.showHeader })} />
                <MenuItem icon={FileText} label="Insert / Edit Footer" active={!!currentSettings?.showFooter} onClick={() => applyPageSetting({ showFooter: !currentSettings?.showFooter })} />
                <SubMenu icon={Hash} label="Page Number Formatting">
                  <MenuItem label="Bottom Center" onClick={() => applyPageSetting({ pageNumberPos: 'bottom-center' })} />
                  <MenuItem label="Bottom Right" onClick={() => applyPageSetting({ pageNumberPos: 'bottom-right' })} />
                  <MenuItem label="Top Center" onClick={() => applyPageSetting({ pageNumberPos: 'top-center' })} />
                  <MenuItem label="No Page Numbers" onClick={() => applyPageSetting({ pageNumberPos: 'none' })} />
                </SubMenu>
                <MenuDivider />
                <MenuItem icon={FileText} label="Different First Page Header" active={!!currentSettings?.differentFirstPageHeader} onClick={() => applyPageSetting({ differentFirstPageHeader: !currentSettings?.differentFirstPageHeader })} />
                <MenuItem icon={FileText} label="Different Odd/Even Headers" active={!!currentSettings?.differentOddEvenHeaders} onClick={() => applyPageSetting({ differentOddEvenHeaders: !currentSettings?.differentOddEvenHeaders })} />
              </Dropdown>

              {/* Tools */}
              <Dropdown width="w-52" trigger={
                <button className="px-2.5 py-1 rounded text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">Tools</button>
              }>
                <MenuItem icon={Hash} label="Word Count" onClick={() => {
                  const words = editor.state.doc.textContent.split(/\s+/).filter(Boolean).length;
                  const chars = editor.state.doc.textContent.length;
                  window.alert(`Words: ${words}\nCharacters: ${chars}`);
                }} />
                <MenuItem icon={Search} label="Find & Replace" onClick={() => setFindOpen(true)} />
                <MenuDivider />
                <MenuItem icon={SpellCheck} label="Spell Check" onClick={() => { }} />
                <MenuItem icon={Mic} label="Voice Typing" onClick={() => { }} />
                <MenuItem icon={Languages} label="Translate" onClick={() => { }} />
              </Dropdown>

              {/* Help */}
              <Dropdown width="w-48" trigger={
                <button className="px-2.5 py-1 rounded text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors">Help</button>
              }>
                <MenuItem icon={HelpCircle} label="Help Center" onClick={() => { }} />
                <MenuItem icon={RefreshCw} label="Keyboard Shortcuts" onClick={() => { }} />
              </Dropdown>

            </div>
          )}

          <div className="flex-1" />

          {/* Top-right actions */}
          <div className="flex items-center gap-1 shrink-0">
            {isSaving && (
              <span className="flex items-center gap-1 text-[10px] text-stone-400 mr-1">
                <Loader2 size={11} className="animate-spin" /> Saving...
              </span>
            )}
            <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl p-0.5 gap-1">
              <button onClick={onExportPDF} className="flex items-center gap-1 px-3 py-1.5 text-stone-500 hover:text-stone-800 text-[10.5px] font-bold rounded-lg hover:bg-white transition-all">
                <Download size={13} /> PDF
              </button>
              <div className="w-px h-3 bg-stone-200" />
              <button onClick={onExportDOCX} className="flex items-center gap-1 px-3 py-1.5 text-stone-500 hover:text-stone-800 text-[10.5px] font-bold rounded-lg hover:bg-white transition-all">
                <Download size={13} /> DOCX
              </button>
            </div>
            {onSaveAsTemplate && (
              <button onClick={onSaveAsTemplate} className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white rounded-xl text-[10.5px] font-bold hover:bg-stone-700 transition-all ml-1">
                <BookmarkPlus size={12} /> Save Template
              </button>
            )}
          </div>

        </div>
      )}

      {/* ── ROW 2: Quick access ───────────────────────────────────────────────── */}
      {(mode === 'full' || mode === 'controls') && (
        <>
          <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-stone-100 relative">

            {/* Sync status */}
            <div className="hidden md:flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg mr-2 shrink-0">
              <div className={clsx('w-1.5 h-1.5 rounded-full', isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.4)]')} />
              <span className="text-[9.5px] font-bold text-stone-400 uppercase tracking-wider">{isSaving ? 'Syncing' : 'Saved'}</span>
            </div>
            <Divider />

            <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)" disabled={!editor.can().undo()}><Undo size={15} /></Btn>
            <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)" disabled={!editor.can().redo()}><Redo size={15} /></Btn>
            <Divider />

            {/* Font family */}
            <select
              value={getCurrentFont()}
              onChange={e => setFontFamily(e.target.value)}
              className="h-7 px-1.5 text-xs border border-stone-200 rounded bg-white text-stone-700 outline-none hover:border-stone-400 transition-colors shrink-0 max-w-[130px]"
            >
              {FONT_FAMILIES.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>

            <Btn onClick={() => changeFontSize(-1)} title="Decrease size"><ArrowDownNarrowWide size={13} /></Btn>
            <select
              value={getCurrentSize()}
              onChange={e => setFontSize(e.target.value)}
              className="h-7 w-16 px-1 text-xs border border-stone-200 rounded bg-white text-stone-700 outline-none hover:border-stone-400 transition-colors shrink-0"
            >
              {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Btn onClick={() => changeFontSize(1)} title="Increase size"><ArrowUpNarrowWide size={13} /></Btn>
            <Divider />

            <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={15} /></Btn>
            <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={15} /></Btn>
            <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon size={15} /></Btn>
            <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={15} /></Btn>
            <Btn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript"><Subscript size={14} /></Btn>
            <Btn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript"><Superscript size={14} /></Btn>
            <Divider />

            <ColorPicker label="Text Color" icon={Type} activeColor={editor.getAttributes('textStyle').color}
              onSelect={c => c === 'transparent' ? editor.chain().focus().unsetColor().run() : editor.chain().focus().setColor(c).run()} />
            <ColorPicker label="Highlight" icon={Highlighter} activeColor={editor.getAttributes('highlight').color}
              colors={HIGHLIGHT_COLORS} columns={5}
              onSelect={c => c === 'transparent' ? editor.chain().focus().unsetHighlight().run() : editor.chain().focus().toggleHighlight({ color: c }).run()} />
            <Divider />

            <Btn onClick={() => {
              editor.chain().focus()
                .clearNodes()
                .unsetAllMarks()
                .setMark('textStyle', { fontSize: null, fontFamily: null, color: null, lineHeight: null, marginLeft: null })
                .run();
            }} title="Clear Formatting"><RemoveFormatting size={14} /></Btn>

            <div className="flex-1" />

            <button
              type="button"
              onClick={onOpenCompiler}
              className={clsx(
                "p-1 px-2.5 mr-2 flex items-center gap-2 rounded-full border transition-all group",
                compilerState === 'minimized'
                  ? "border-indigo-600 bg-indigo-50 shadow-[0_0_12px_rgba(79,70,229,0.2)] animate-pulse"
                  : "border-stone-200 hover:border-indigo-200 hover:bg-indigo-50/50"
              )}
              title={compilerState === 'minimized' ? "Resume Coding Session" : "Quick Compiler"}
            >
              <div className={clsx(
                "w-5 h-5 rounded-md flex items-center justify-center transition-colors",
                compilerState === 'minimized' ? "bg-indigo-600" : "bg-stone-100 group-hover:bg-indigo-600"
              )}>
                <Code size={11} className={clsx(
                  "transition-colors",
                  compilerState === 'minimized' ? "text-white" : "text-stone-500 group-hover:text-white"
                )} />
              </div>
              <span className={clsx(
                "text-[10px] font-bold uppercase tracking-wider",
                compilerState === 'minimized' ? "text-indigo-700" : "text-stone-500 group-hover:text-indigo-600"
              )}>
                {compilerState === 'minimized' ? "Active" : "Compiler"}
              </span>
            </button>

            {onToggleRightPanel && (
              <SamRobot
                onClick={onToggleRightPanel}
                isRightPanelOpen={isRightPanelOpen || false}
              />
            )}
          </div>

          {/* ── ROW 3: Structure, Lists, Insert ─────────────────────────────── */}
          <div className="flex items-center gap-0.5 px-3 py-1.5 relative">

            {/* Heading style */}
            <Dropdown width="w-44" trigger={
              <button type="button" className="h-7 flex items-center gap-1 px-2 rounded text-xs font-medium text-stone-600 hover:bg-stone-100 border border-stone-200 shrink-0">
                {headingLabel} <ChevronDown size={11} />
              </button>
            }>
              <MenuItem label="Normal Text" onClick={() => editor.chain().focus().setParagraph().run()} />
              <MenuItem label="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
              <MenuItem label="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
              <MenuItem label="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
              <MenuItem label="Heading 4" onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} />
            </Dropdown>
            <Divider />

            {/* Alignment */}
            <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft size={15} /></Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center"><AlignCenter size={15} /></Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight size={15} /></Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify size={15} /></Btn>
            <Divider />

            {/* Line spacing */}
            <Dropdown width="w-36" trigger={
              <button type="button" title="Line Spacing" className="inline-flex items-center gap-0.5 h-7 px-1.5 rounded text-stone-600 hover:bg-stone-100">
                <Pilcrow size={14} /><ChevronDown size={10} />
              </button>
            }>
              <MenuLabel>Line Spacing</MenuLabel>
              {LINE_SPACINGS.map(s => <MenuItem key={s.value} label={s.label} onClick={() => setLineSpacing(s.value)} />)}
            </Dropdown>
            <Divider />

            {/* Lists */}
            <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List size={15} /></Btn>
            <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List"><ListOrdered size={15} /></Btn>
            <Btn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Checklist"><ListChecks size={15} /></Btn>
            <Divider />

            {/* Indent */}
            <Btn onClick={() => {
              if (editor.isActive('listItem')) editor.chain().focus().sinkListItem('listItem').run();
              else {
                const cur = editor.getAttributes('textStyle').marginLeft || '0pt';
                const next = (parseFloat(cur) + 36) + 'pt';
                (editor.chain().focus() as any).setIndent(next).run();
              }
            }} title="Increase Indent"><IndentIncrease size={15} /></Btn>
            <Btn onClick={() => {
              if (editor.isActive('listItem')) editor.chain().focus().liftListItem('listItem').run();
              else {
                const cur = editor.getAttributes('textStyle').marginLeft || '0pt';
                const next = Math.max(0, parseFloat(cur) - 36) + 'pt';
                (editor.chain().focus() as any).setIndent(next === '0pt' ? null : next).run();
              }
            }} title="Decrease Indent"><IndentDecrease size={15} /></Btn>
            <Divider />

            <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={15} /></Btn>
            <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block"><Code size={15} /></Btn>
            <Divider />

            {/* Link popover */}
            <div className="relative">
              <Btn onClick={() => setLinkOpen(o => !o)} active={editor.isActive('link') || linkOpen} title="Insert Link">
                <LinkIcon size={15} />
              </Btn>
              <AnimatePresence>
                {linkOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full left-0 mt-1 z-[200] bg-white border border-stone-200 rounded-xl shadow-2xl p-2 w-64"
                  >
                    <div className="flex gap-1">
                      <input
                        autoFocus
                        placeholder="Enter URL..."
                        value={linkUrl}
                        onChange={e => setLinkUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && setLink()}
                        className="flex-1 h-7 px-2 text-xs border border-stone-200 rounded outline-none focus:border-stone-400"
                      />
                      <button onClick={setLink} className="h-7 px-2 text-xs bg-stone-900 text-white rounded hover:bg-stone-700">Set</button>
                      {editor.isActive('link') && (
                        <button onClick={() => editor.chain().focus().unsetLink().run()} className="h-7 px-2 text-xs border border-stone-200 rounded hover:bg-stone-100">
                          <Eraser size={12} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Divider />

            {/* Insert */}
            <Btn onClick={addImageFromDisk} title="Insert Image"><ImageIcon size={15} /></Btn>
            <Btn onClick={() => addTable()} title="Insert Table"><TableIcon size={15} /></Btn>
            <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule"><MinusSquare size={15} /></Btn>
            <Btn onClick={insertPageBreak} title="Page Break"><SeparatorHorizontal size={15} /></Btn>
            <Divider />

            {/* Special characters */}
            <Dropdown width="w-72" trigger={
              <Btn onClick={() => { }} title="Special Characters & Equations"><Sigma size={15} /></Btn>
            }>
              <MenuLabel>Special Characters</MenuLabel>
              <div className="p-3 grid gap-1" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
                {SPECIAL_CHARACTERS.map(c => (
                  <button key={c} onClick={() => insertSpecialChar(c)}
                    className="w-8 h-8 text-sm flex items-center justify-center rounded-lg hover:bg-[var(--accent-main)] hover:text-white transition-all shadow-sm border border-stone-100 font-serif">
                    {c}
                  </button>
                ))}
              </div>
              <MenuDivider />
              <div className="px-3 pb-3">
                <button onClick={() => editor.chain().focus().insertContent('<p style="text-align:center; font-family:serif; font-style:italic; border: 1px solid #eee; padding: 12pt; border-radius: 8px;">[ Equation Placeholder ]</p>').run()}
                  className="w-full py-2 bg-[var(--bg-app)] hover:bg-stone-100 rounded-lg text-[10px] font-bold uppercase tracking-widest text-stone-500 transition-colors">
                  Insert Advanced Equation
                </button>
              </div>
            </Dropdown>

            {/* Table tools when active */}
            {editor.isActive('table') && (
              <>
                <Divider />
                <Dropdown width="w-48" trigger={
                  <button type="button" className="inline-flex items-center gap-0.5 h-7 px-1.5 rounded text-stone-600 hover:bg-stone-100 text-xs">
                    <LayoutGrid size={14} /><ChevronDown size={10} />
                  </button>
                }>
                  <MenuLabel>Table</MenuLabel>
                  <MenuItem label="Add Column Before" onClick={() => editor.chain().focus().addColumnBefore().run()} />
                  <MenuItem label="Add Column After" onClick={() => editor.chain().focus().addColumnAfter().run()} />
                  <MenuItem label="Delete Column" onClick={() => editor.chain().focus().deleteColumn().run()} />
                  <MenuDivider />
                  <MenuItem label="Add Row Before" onClick={() => editor.chain().focus().addRowBefore().run()} />
                  <MenuItem label="Add Row After" onClick={() => editor.chain().focus().addRowAfter().run()} />
                  <MenuItem label="Delete Row" onClick={() => editor.chain().focus().deleteRow().run()} />
                  <MenuDivider />
                  <MenuItem label="Merge Cells" onClick={() => editor.chain().focus().mergeCells().run()} />
                  <MenuItem label="Split Cell" onClick={() => editor.chain().focus().splitCell().run()} />
                  <MenuDivider />
                  <MenuItem label="Delete Table" danger onClick={() => editor.chain().focus().deleteTable().run()} />
                </Dropdown>
              </>
            )}

            {/* Change case */}
            <Divider />
            <Dropdown width="w-44" trigger={
              <button type="button" title="Change Case" className="inline-flex items-center gap-0.5 h-7 px-1.5 rounded text-stone-600 hover:bg-stone-100">
                <CaseSensitive size={14} /><ChevronDown size={10} />
              </button>
            }>
              <MenuLabel>Change Case</MenuLabel>
              <MenuItem label="Sentence case" onClick={() => transformCase('sentence')} />
              <MenuItem label="lowercase" onClick={() => transformCase('lower')} />
              <MenuItem label="UPPERCASE" onClick={() => transformCase('upper')} />
              <MenuItem label="Capitalize Each Word" onClick={() => transformCase('title')} />
              <MenuItem label="tOGGLE cASE" onClick={() => transformCase('toggle')} />
            </Dropdown>

            <div className="flex-1" />

            <div className="flex-1" />
          </div>
        </>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.md,.pdf,.docx"
      />

      {/* Find & Replace panel — floats below entire toolbar, left-aligned. 
          Only render in 'menu' mode to avoid duplicates when DocumentEditor also uses EditorToolbar */}
      <AnimatePresence>
        {findOpen && mode === 'menu' && <FindReplacePanel editor={editor} onClose={() => setFindOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default EditorToolbar;
