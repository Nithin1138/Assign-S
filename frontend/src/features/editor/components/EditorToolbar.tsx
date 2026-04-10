import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Undo, 
  Redo, 
  Image as ImageIcon, 
  SearchCode, 
  BookmarkPlus,
  ArrowLeft,
  Save,
  FileDown,
  FileUp,
  Share2,
  Settings,
  Highlighter,
  Palette,
  Puzzle,
  HelpCircle,
  Keyboard,
  RefreshCw,
  Code,
  Quote,
  ChevronDown,
  Plus,
  Minus,
  Type,
  Link as LinkIcon,
  Table as TableIcon,
  MinusSquare,
  Hash,
  Search,
  FileText,
  Copy,
  Scissors,
  Clipboard,
  Maximize,
  CheckSquare,
  Indent,
  Outdent,
  Baseline,
  MoreHorizontal,
  Printer,
  Mail,
  History,
  Download,
  FilePlus,
  FolderOpen,
  Copy as CopyIcon,
  Layout as LayoutIcon,
  Languages,
  SpellCheck,
  Book,
  Mic,
  Settings2,
  FileCode,
  Sigma,
  Bookmark,
  Calendar,
  Clock,
  Type as TypeIcon,
  Eraser,
  Edit3,
  Superscript,
  Subscript,
  Sparkles
} from 'lucide-react';
import clsx from 'clsx';
import SamRobot from './SamRobot';
import { AnimatePresence, motion } from 'framer-motion';

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
  mode?: 'full' | 'menu' | 'controls';
  title?: string;
  onTitleChange?: (newTitle: string) => void;
  isSaving?: boolean;
  onBack?: () => void;
}

const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
  '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
  '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
  '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130',
];

const ColorPicker = ({ 
  onSelect, 
  activeColor, 
  label, 
  icon: Icon 
}: { 
  onSelect: (color: string) => void, 
  activeColor?: string, 
  label: string, 
  icon: any 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={label}
        className={clsx(
          "p-1.5 rounded transition-all duration-200 flex flex-col items-center justify-center gap-0.5",
          isOpen ? "bg-[var(--bg-app)] text-[var(--text-main)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-app)]"
        )}
      >
        <Icon size={16} />
        <div 
          className="w-4 h-1 rounded-full" 
          style={{ backgroundColor: activeColor || '#000000' }} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 mt-1 p-3 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg shadow-xl z-50 w-64"
          >
            <div className="grid grid-cols-10 gap-1 mb-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onSelect(color);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "w-5 h-5 rounded-sm border border-[var(--border-main)] transition-transform hover:scale-110",
                    activeColor === color && "ring-2 ring-blue-500 ring-offset-1"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-main)]">
              <button
                onClick={() => colorInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-app)] rounded border border-[var(--border-main)]"
              >
                <Plus size={12} /> Custom
              </button>
              <button
                onClick={() => {
                  onSelect('transparent');
                  setIsOpen(false);
                }}
                className="flex-1 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-app)] rounded border border-[var(--border-main)]"
              >
                Reset
              </button>
              <input 
                type="color" 
                ref={colorInputRef}
                className="hidden"
                onChange={(e) => {
                  onSelect(e.target.value);
                  setIsOpen(false);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EditorToolbar: React.FC<EditorToolbarProps> = React.memo(({ 
  editor, 
  onPageSetup, 
  onInsertDiagram,
  onToggleRightPanel,
  isRightPanelOpen = false,
  onSave,
  onExportPDF,
  onExportDOCX,
  onSaveAsTemplate,
  onFindReplace,
  mode = 'full',
  title,
  onTitleChange,
  isSaving,
  onBack
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!editor) return null;

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title,
    disabled = false,
    className = ""
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={clsx(
        "p-1.5 rounded transition-all duration-200 flex items-center justify-center",
        isActive 
          ? "bg-stone-300 text-stone-900 shadow-inner" 
          : "text-stone-700 hover:bg-stone-200 hover:text-stone-900 shadow-sm transition-all duration-100",
        disabled && "opacity-30 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-4 bg-black/5 mx-1 self-center" />;

  const MenuDropdown = ({ label, items }: { label: string, items: any[] }) => (
    <div className="relative">
      <button
        onClick={() => setActiveMenu(activeMenu === label ? null : label)}
        className={clsx(
          "px-3 py-1 rounded-md text-xs font-bold transition-all duration-150",
          activeMenu === label ? "bg-stone-300 text-stone-950 shadow-sm" : "text-stone-700 hover:bg-stone-200 hover:text-stone-900"
        )}
      >
        {label}
      </button>
      <AnimatePresence>
        {activeMenu === label && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 mt-1 w-56 bg-white border border-stone-200 rounded-xl shadow-2xl py-2 z-[200] overflow-hidden"
          >
            {items.map((item, idx) => (
              item.type === 'divider' ? (
                <div key={idx} className="h-px bg-[var(--border-main)] my-1" />
              ) : (
                <button
                  key={idx}
                  onClick={() => {
                    item.onClick();
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-[var(--text-main)] hover:bg-[var(--bg-app)] flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <item.icon size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-main)]" />}
                    <span>{item.label}</span>
                  </div>
                  {item.shortcut && <span className="text-[10px] text-[var(--text-muted)]">{item.shortcut}</span>}
                </button>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const fonts = [
    'Inter', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Impact'
  ];

  const fontSizes = [
    '8', '9', '10', '11', '12', '14', '18', '24', '30', '36', '48', '60', '72', '96'
  ];

  const menuData = {
    File: [
      { label: 'New document', icon: FilePlus, onClick: () => {} },
      { label: 'Open', icon: FolderOpen, onClick: () => {} },
      { label: 'Save', icon: Save, onClick: onSave || (() => {}), shortcut: 'Ctrl+S' },
      { label: 'Save as Template', icon: BookmarkPlus, onClick: onSaveAsTemplate || (() => {}) },
      { label: 'Make a copy', icon: CopyIcon, onClick: () => {} },
      { type: 'divider' },
      { label: 'Download as PDF', icon: Download, onClick: onExportPDF || (() => {}) },
      { label: 'Download as DOCX', icon: Download, onClick: onExportDOCX || (() => {}) },
      { label: 'Download as TXT', icon: Download, onClick: () => {} },
      { type: 'divider' },
      { label: 'Share', icon: Share2, onClick: () => {} },
      { label: 'Email document', icon: Mail, onClick: () => {} },
      { type: 'divider' },
      { label: 'Version history', icon: History, onClick: () => {} },
      { label: 'Rename', icon: Edit3, onClick: () => {} },
      { label: 'Page setup', icon: LayoutIcon, onClick: onPageSetup || (() => {}) },
      { label: 'Print', icon: Printer, onClick: () => window.print(), shortcut: 'Ctrl+P' },
    ],
    Edit: [
      { label: 'Undo', icon: Undo, onClick: () => editor.chain().focus().undo().run(), shortcut: 'Ctrl+Z' },
      { label: 'Redo', icon: Redo, onClick: () => editor.chain().focus().redo().run(), shortcut: 'Ctrl+Y' },
      { type: 'divider' },
      { label: 'Cut', icon: Scissors, onClick: () => document.execCommand('cut'), shortcut: 'Ctrl+X' },
      { label: 'Copy', icon: Copy, onClick: () => document.execCommand('copy'), shortcut: 'Ctrl+C' },
      { label: 'Paste', icon: Clipboard, onClick: () => document.execCommand('paste'), shortcut: 'Ctrl+V' },
      { label: 'Paste without formatting', onClick: () => {}, shortcut: 'Ctrl+Shift+V' },
      { type: 'divider' },
      { label: 'Select all', onClick: () => editor.chain().focus().selectAll().run(), shortcut: 'Ctrl+A' },
      { label: 'Find & replace', icon: Search, onClick: onFindReplace || (() => {}), shortcut: 'Ctrl+H' },
    ],
    View: [
      { label: 'Show ruler', onClick: () => {}, icon: CheckSquare },
      { label: 'Show document outline', onClick: () => {}, icon: CheckSquare },
      { type: 'divider' },
      { label: 'Full screen', icon: Maximize, onClick: () => document.documentElement.requestFullscreen() },
      { type: 'divider' },
      { label: 'Mode: Editing', onClick: () => {} },
      { label: 'Mode: Suggesting', onClick: () => {} },
      { label: 'Mode: Viewing', onClick: () => {} },
    ],
    Insert: [
      { label: 'Image', icon: ImageIcon, onClick: () => {
        const url = window.prompt('Enter image URL');
        if (url) editor.chain().focus().setImage({ src: url }).run();
      }},
      { label: 'Table', icon: TableIcon, onClick: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
      { label: 'Horizontal line', icon: MinusSquare, onClick: () => editor.chain().focus().setHorizontalRule().run() },
      { label: 'Page break', onClick: () => editor.chain().focus().setHardBreak().run() },
      { type: 'divider' },
      { label: 'Special characters', icon: Sigma, onClick: () => {} },
      { label: 'Equation', icon: Sigma, onClick: () => {} },
      { label: 'Link', icon: LinkIcon, onClick: () => {
        const url = window.prompt('Enter URL');
        if (url) editor.chain().focus().setLink({ href: url }).run();
      }},
      { label: 'Bookmark', icon: Bookmark, onClick: () => {} },
    ],
    Format: [
      { label: 'Bold', icon: Bold, onClick: () => editor.chain().focus().toggleBold().run(), shortcut: 'Ctrl+B' },
      { label: 'Italic', icon: Italic, onClick: () => editor.chain().focus().toggleItalic().run(), shortcut: 'Ctrl+I' },
      { label: 'Underline', icon: UnderlineIcon, onClick: () => editor.chain().focus().toggleUnderline().run(), shortcut: 'Ctrl+U' },
      { label: 'Strikethrough', icon: Strikethrough, onClick: () => editor.chain().focus().toggleStrike().run() },
      { type: 'divider' },
      { label: 'Superscript', icon: Superscript, onClick: () => editor.chain().focus().toggleSuperscript().run() },
      { label: 'Subscript', icon: Subscript, onClick: () => editor.chain().focus().toggleSubscript().run() },
      { type: 'divider' },
      { label: 'Align Left', icon: AlignLeft, onClick: () => editor.chain().focus().setTextAlign('left').run() },
      { label: 'Align Center', icon: AlignCenter, onClick: () => editor.chain().focus().setTextAlign('center').run() },
      { label: 'Align Right', icon: AlignRight, onClick: () => editor.chain().focus().setTextAlign('right').run() },
      { label: 'Align Justify', icon: AlignJustify, onClick: () => editor.chain().focus().setTextAlign('justify').run() },
      { type: 'divider' },
      { label: 'Clear formatting', icon: Eraser, onClick: () => editor.chain().focus().unsetAllMarks().run() },
    ],
    Layout: [
      { label: 'Margins', onClick: () => {} },
      { label: 'Orientation: Portrait', onClick: () => {} },
      { label: 'Orientation: Landscape', onClick: () => {} },
      { type: 'divider' },
      { label: 'Page size: A4', onClick: () => {} },
      { label: 'Page size: Letter', onClick: () => {} },
      { type: 'divider' },
      { label: 'Columns: 1', onClick: () => {} },
      { label: 'Columns: 2', onClick: () => {} },
    ],
    Tools: [
      { label: 'Spelling & grammar', icon: SpellCheck, onClick: () => {} },
      { label: 'Word count', icon: Hash, onClick: () => {} },
      { label: 'Dictionary', icon: Book, onClick: () => {} },
      { type: 'divider' },
      { label: 'Voice typing', icon: Mic, onClick: () => {} },
      { label: 'Translate document', icon: Languages, onClick: () => {} },
      { type: 'divider' },
      { label: 'Preferences', icon: Settings2, onClick: () => {} },
    ],
    Extensions: [
      { label: 'Add-ons', icon: Puzzle, onClick: () => {} },
      { label: 'App Script', icon: Code, onClick: () => {} },
    ],
    Help: [
      { label: 'Search the menus', icon: Search, onClick: () => {} },
      { label: 'Help', icon: HelpCircle, onClick: () => {} },
      { label: 'Training', icon: Book, onClick: () => {} },
      { label: 'Updates', icon: RefreshCw, onClick: () => {} },
      { type: 'divider' },
      { label: 'Help Academic improve', onClick: () => {} },
      { label: 'Privacy Policy', onClick: () => {} },
      { label: 'Terms of Service', onClick: () => {} },
      { type: 'divider' },
      { label: 'Keyboard shortcuts', icon: Keyboard, onClick: () => {} },
    ]
  };

  const getCurrentFontSize = () => {
    const attrs = editor.getAttributes('textStyle');
    return attrs.fontSize ? attrs.fontSize.replace('px', '') : '12';
  };

  const changeFontSize = (delta: number) => {
    const current = parseInt(getCurrentFontSize());
    const next = Math.max(1, current + delta);
    (editor.chain().focus() as any).setFontSize(`${next}px`).run();
  };

  return (
    <div className={clsx(
      "flex flex-col bg-white select-none",
      mode !== 'menu' && "sticky top-0 z-30 border-b border-stone-200 shadow-sm"
    )} ref={menuRef}>
      {/* ROW 1: MENU BAR */}
      {(mode === 'full' || mode === 'menu') && (
        <div className="h-12 flex items-center px-4 gap-1 relative border-b border-stone-100/30">
          {(onBack || title !== undefined) && (
            <div className="flex items-center gap-3 mr-4 shrink-0">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors active:scale-95"
                  title="Go back"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              {title !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <input
                      value={title}
                      onChange={(e) => onTitleChange?.(e.target.value)}
                      className="text-sm font-bold text-stone-800 bg-transparent outline-none border-none hover:bg-stone-100/50 rounded-md px-2 py-1 transition-all focus:bg-stone-100 w-auto min-w-[100px] max-w-[300px]"
                      placeholder="Untitled Document"
                    />
                  </div>
                </div>
              )}
              <div className="w-px h-6 bg-stone-100/80 mx-1" />
            </div>
          )}
          <div className="flex items-center">
            {Object.entries(menuData).map(([label, items]) => (
              <MenuDropdown key={label} label={label} items={items} />
            ))}
          </div>
          <div className="flex-1 min-w-[20px]" />
          
          {/* ROW 1 ACTIONS (Moved from top header) */}
          <div className="flex items-center gap-1 shrink-0 ml-auto mr-1">
            <div className="flex items-center bg-[var(--bg-app)]/50 p-0.5 rounded-xl border border-[var(--border-main)]/30">
              <button
                onClick={onExportPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold transition-all text-[10.5px] rounded-lg hover:bg-[var(--bg-card)]"
              >
                <Download size={13} /> <span>PDF</span>
              </button>
              <button
                onClick={onExportDOCX}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold transition-all text-[10.5px] rounded-lg hover:bg-[var(--bg-card)]"
              >
                <Download size={13} /> <span>DOCX</span>
              </button>
            </div>

            <button
              onClick={onSaveAsTemplate}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[var(--text-main)] text-[var(--bg-card)] rounded-xl font-bold hover:opacity-90 transition-all text-[10.5px] shadow-sm ml-1"
            >
              <BookmarkPlus size={13} strokeWidth={3} /> Save Template
            </button>

            <button
              onClick={onToggleRightPanel}
              className={clsx(
                "p-2 rounded-2xl transition-all ml-1",
                isRightPanelOpen 
                  ? "bg-[var(--accent-main)] text-[var(--bg-card)] shadow-[0_2_10px_rgba(var(--accent-main-rgb),0.2)]" 
                  : "bg-[var(--text-main)] text-[var(--bg-card)] hover:opacity-90 transition-all shadow-sm"
              )}
              title={isRightPanelOpen ? "Close Assistant" : "Open Assistant"}
            >
              <Sparkles size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* ROW 2 & 3: MAIN CONTROLS */}
      {(mode === 'full' || mode === 'controls') && (
        <div className="flex flex-col">
          <div className="h-11 sm:h-10 flex items-center px-4 overflow-x-auto no-scrollbar relative">
            {/* Left side: Sync Status (If needed) */}
            <div className="absolute left-4 hidden md:flex items-center gap-2 px-2 py-1 rounded-lg">
               <div className={clsx(
                 "w-1.5 h-1.5 rounded-full",
                 isSaving ? "bg-amber-400 animate-pulse" : "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
               )} />
               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest uppercase">
                 {isSaving ? "Syncing" : "Cloud Saved"}
               </span>
            </div>

            <div className="flex-1 flex items-center justify-center gap-0.5">
              <div className="flex items-center gap-1 shrink-0">
              <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)" disabled={!editor.can().undo()} className="w-9 h-9 sm:w-7 sm:h-7">
                <Undo size={18} />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)" disabled={!editor.can().redo()} className="w-9 h-9 sm:w-7 sm:h-7">
                <Redo size={18} />
              </ToolbarButton>
            </div>
            
            <Divider />

            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 ml-2"
            >
              <Save size={14} />
              Save
            </button>

            <Divider />

            <select 
              className="h-9 sm:h-7 px-2 text-xs border border-[var(--border-main)] rounded bg-[var(--bg-app)] text-[var(--text-main)] outline-none hover:border-[var(--text-muted)] transition-colors shrink-0"
              onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
              value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
            >
              {fonts.map(font => <option key={font} value={font}>{font}</option>)}
            </select>

            <Divider />

            <div className="flex items-center gap-1 shrink-0">
              <ToolbarButton onClick={() => changeFontSize(-1)} title="Decrease font size" className="w-9 h-9 sm:w-7 sm:h-7">
                <Minus size={16} />
              </ToolbarButton>
              <select 
                className="h-9 sm:h-7 w-14 sm:w-12 px-1 text-xs border border-[var(--border-main)] rounded bg-[var(--bg-app)] text-[var(--text-main)] outline-none hover:border-[var(--text-muted)] transition-colors shrink-0"
                onChange={(e) => (editor.chain().focus() as any).setFontSize(`${e.target.value}px`).run()}
                value={getCurrentFontSize()}
              >
                {fontSizes.map(size => <option key={size} value={size}>{size}</option>)}
              </select>
              <ToolbarButton onClick={() => changeFontSize(1)} title="Increase font size" className="w-9 h-9 sm:w-7 sm:h-7">
                <Plus size={16} />
              </ToolbarButton>
            </div>

            <Divider />

            <div className="flex items-center gap-1 shrink-0">
              <ToolbarButton 
                onClick={() => editor.chain().focus().toggleBold().run()} 
                isActive={editor.isActive('bold')}
                title="Bold (Ctrl+B)"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <Bold size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => editor.chain().focus().toggleItalic().run()} 
                isActive={editor.isActive('italic')}
                title="Italic (Ctrl+I)"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <Italic size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => editor.chain().focus().toggleUnderline().run()} 
                isActive={editor.isActive('underline')}
                title="Underline (Ctrl+U)"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <UnderlineIcon size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => editor.chain().focus().toggleStrike().run()} 
                isActive={editor.isActive('strike')}
                title="Strikethrough"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <Strikethrough size={18} />
              </ToolbarButton>
            </div>

            <Divider />

            <div className="flex items-center gap-1 shrink-0">
              <ToolbarButton 
                onClick={() => editor.chain().focus().toggleSubscript().run()} 
                isActive={editor.isActive('subscript')}
                title="Subscript"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <Subscript size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => editor.chain().focus().toggleSuperscript().run()} 
                isActive={editor.isActive('superscript')}
                title="Superscript"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <Superscript size={18} />
              </ToolbarButton>
            </div>

            <Divider />

            <div className="flex items-center gap-1 shrink-0">
              <ColorPicker 
                label="Text Color" 
                icon={Palette} 
                activeColor={editor.getAttributes('textStyle').color}
                onSelect={(color) => {
                  if (color === 'transparent') editor.chain().focus().unsetColor().run();
                  else editor.chain().focus().setColor(color).run();
                }}
              />
              <ColorPicker 
                label="Highlight Color" 
                icon={Highlighter} 
                activeColor={editor.getAttributes('highlight').color}
                onSelect={(color) => {
                  if (color === 'transparent') editor.chain().focus().unsetHighlight().run();
                  else editor.chain().focus().toggleHighlight({ color }).run();
                }}
              />
            </div>

            <Divider />

            <ToolbarButton 
              onClick={() => editor.chain().focus().unsetAllMarks().run()} 
              title="Clear Formatting"
              className="w-9 h-9 sm:w-7 sm:h-7 shrink-0"
            >
              <Baseline size={18} />
            </ToolbarButton>
          </div>
        </div>

          <div className="h-11 sm:h-10 flex items-center justify-center px-4 gap-0.5 overflow-x-auto no-scrollbar">
            <select 
              className="h-9 sm:h-7 px-2 text-xs border border-[var(--border-main)] rounded bg-[var(--bg-app)] text-[var(--text-main)] outline-none hover:border-[var(--text-muted)] transition-colors min-w-[120px] sm:min-w-[100px] shrink-0"
              onChange={(e) => {
                if (e.target.value === 'p') editor.chain().focus().setParagraph().run();
                else editor.chain().focus().toggleHeading({ level: parseInt(e.target.value) as any }).run();
              }}
              value={editor.isActive('heading', { level: 1 }) ? '1' : editor.isActive('heading', { level: 2 }) ? '2' : editor.isActive('heading', { level: 3 }) ? '3' : 'p'}
            >
              <option value="p">Normal Text</option>
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
            </select>

            <Divider />

            <div className="flex items-center gap-1 shrink-0">
              <ToolbarButton 
                onClick={() => editor.chain().focus().setTextAlign('left').run()} 
                isActive={editor.isActive({ textAlign: 'left' })}
                title="Align Left"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <AlignLeft size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => editor.chain().focus().setTextAlign('center').run()} 
                isActive={editor.isActive({ textAlign: 'center' })}
                title="Align Center"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <AlignCenter size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => editor.chain().focus().setTextAlign('right').run()} 
                isActive={editor.isActive({ textAlign: 'right' })}
                title="Align Right"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <AlignRight size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => editor.chain().focus().setTextAlign('justify').run()} 
                isActive={editor.isActive({ textAlign: 'justify' })}
                title="Align Justify"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <AlignJustify size={18} />
              </ToolbarButton>
            </div>

            <Divider />

            <select 
              className="h-9 sm:h-7 px-2 text-xs border border-[var(--border-main)] rounded bg-[var(--bg-app)] text-[var(--text-main)] outline-none hover:border-[var(--text-muted)] transition-colors shrink-0"
              onChange={(e) => (editor.chain().focus() as any).setLineHeight(e.target.value).run()}
              value={editor.getAttributes('paragraph').lineHeight || '1.0'}
              title="Line Spacing"
            >
              <option value="1.0">1.0</option>
              <option value="1.15">1.15</option>
              <option value="1.5">1.5</option>
              <option value="2.0">2.0</option>
            </select>

            <Divider />

            <div className="flex items-center gap-1 shrink-0">
              <ToolbarButton 
                onClick={() => editor.chain().focus().toggleBulletList().run()} 
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <List size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <ListOrdered size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => editor.chain().focus().toggleTaskList().run()} 
                isActive={editor.isActive('taskList')}
                title="Checklist"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <CheckSquare size={18} />
              </ToolbarButton>
            </div>

            <Divider />

            <div className="flex items-center gap-1 shrink-0">
              <ToolbarButton 
                onClick={() => (editor.chain().focus() as any).indent().run()} 
                title="Increase Indent"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <Indent size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => (editor.chain().focus() as any).outdent().run()} 
                title="Decrease Indent"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <Outdent size={18} />
              </ToolbarButton>
            </div>

            <Divider />

            <div className="flex items-center gap-1 shrink-0">
              <ToolbarButton 
                onClick={() => editor.chain().focus().toggleBlockquote().run()} 
                isActive={editor.isActive('blockquote')}
                title="Quote"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <Quote size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
                isActive={editor.isActive('codeBlock')}
                title="Code Block"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <FileCode size={18} />
              </ToolbarButton>
            </div>

            <Divider />

            <div className="flex items-center gap-1 shrink-0">
              <ToolbarButton 
                onClick={() => {
                  const url = window.prompt('Enter URL');
                  if (url) editor.chain().focus().setLink({ href: url }).run();
                }} 
                isActive={editor.isActive('link')}
                title="Insert Link"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <LinkIcon size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => {
                  const url = window.prompt('Enter image URL');
                  if (url) editor.chain().focus().setImage({ src: url }).run();
                }} 
                title="Insert Image"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <ImageIcon size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} 
                title="Insert Table"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <TableIcon size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => editor.chain().focus().setHorizontalRule().run()} 
                title="Horizontal Line"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <MinusSquare size={18} />
              </ToolbarButton>
              <ToolbarButton 
                onClick={() => {}} 
                title="Special Characters"
                className="w-9 h-9 sm:w-7 sm:h-7"
              >
                <Sigma size={18} />
              </ToolbarButton>
            </div>

            <Divider />

            <ToolbarButton 
              onClick={() => {}} 
              title="Search"
              className="w-9 h-9 sm:w-7 sm:h-7 shrink-0"
            >
              <Search size={18} />
            </ToolbarButton>
          </div>
        </div>
      )}
    </div>
  );
});

export default EditorToolbar;
