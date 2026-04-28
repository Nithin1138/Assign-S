import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  BookmarkPlus,
  RefreshCw,
  Sparkles,
  Clock,
  Trash2,
  Eye,
  Zap,
  ArrowLeft,
  X,
  ChevronDown,
  CheckSquare,
  Code,
  Minus,
  History,
  Edit2,
  Check,
  Share2,
  Globe,
  Monitor,
  Copy as CopyIcon,
  Mail as MailIcon,
  QrCode,
  FileText as FileTextIcon,
  Users,
  Send,
  User,
  Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
const lowlight = createLowlight(common);
import TiptapLink from '@tiptap/extension-link';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import clsx from 'clsx';

import { useAuth } from '../../auth/context/AuthContext';
import { useResponsive } from '../../../shared/hooks/useResponsive';
import {
  getDocument,
  createDocument,
  updateDocument,
  getEditorDocument,
  createEditorDocument,
  updateEditorDocument,
  saveAsTemplate,
  getDocumentVersions,
  renameDocumentVersion,
  deleteDocumentVersion,
  generateShareCode,
  Document as Assignment,
  DocumentSection,
  updateUserProfile,
  UserProfile
} from '../../../shared/services/db';
import { performTask, TaskType, AcademicTone } from '../../../shared/services/ai';
import DocumentEditor from '../components/DocumentEditor';
import EditorToolbar, { SearchHighlight } from '../components/EditorToolbar';
import EditorStatusBar from '../components/EditorStatusBar';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

// Professional-grade Worker Configuration for PDF.js (Synchronized with v5.5.207)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs';
import RightPanel, { TabType } from '../components/RightPanel';
import Aurora from '../components/Aurora';
import { SamHead } from '../components/SamRobot';

// Custom bubble menu extension (referenced in App.tsx as BubbleMenuExtension)
// Assuming it's the standard one or defined similarly
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';

import { Extension } from '@tiptap/core';

// Ultimate Unified Text Style Extension
// Consolidates everything into one to avoid "Style Overwrite" bugs in Tiptap
const CustomFormatting = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize?.replace('pt', '').replace('px', ''),
        renderHTML: attributes => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}pt` }
        },
      },
      lineHeight: {
        default: null,
        parseHTML: element => element.style.lineHeight,
        renderHTML: attributes => {
          if (!attributes.lineHeight) return {}
          return { style: `line-height: ${attributes.lineHeight}` }
        },
      },
      marginLeft: {
        default: null,
        parseHTML: element => element.style.marginLeft,
        renderHTML: attributes => {
          if (!attributes.marginLeft) return {}
          return { style: `margin-left: ${attributes.marginLeft}` }
        },
      },
      color: {
        default: null,
        parseHTML: element => element.style.color,
        renderHTML: attributes => {
          if (!attributes.color) return {}
          return { style: `color: ${attributes.color}` }
        },
      },
      letterSpacing: {
        default: null,
        parseHTML: element => element.style.letterSpacing,
        renderHTML: attributes => {
          if (!attributes.letterSpacing) return {}
          return { style: `letter-spacing: ${attributes.letterSpacing}` }
        },
      },
      textShadow: {
        default: null,
        parseHTML: element => element.style.textShadow,
        renderHTML: attributes => {
          if (!attributes.textShadow) return {}
          return { style: `text-shadow: ${attributes.textShadow}` }
        },
      },
      fontVariantLigatures: {
        default: null,
        parseHTML: element => element.style.fontVariantLigatures,
        renderHTML: attributes => {
          if (!attributes.fontVariantLigatures) return {}
          return { style: `font-variant-ligatures: ${attributes.fontVariantLigatures}` }
        },
      },
      fontFeatureSettings: {
        default: null,
        parseHTML: element => element.style.fontFeatureSettings,
        renderHTML: attributes => {
          if (!attributes.fontFeatureSettings) return {}
          return { style: `font-feature-settings: ${attributes.fontFeatureSettings}` }
        },
      },
      fontVariantCaps: {
        default: null,
        parseHTML: element => element.style.fontVariantCaps,
        renderHTML: attributes => {
          if (!attributes.fontVariantCaps) return {}
          return { style: `font-variant-caps: ${attributes.fontVariantCaps}` }
        },
      },
    }
  },

  addCommands(): any {
    return {
      ...this.parent?.(),
      setFontSize: (size: string) => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: size }).run()
      },
      setColor: (color: string) => ({ chain }) => {
        return chain().setMark('textStyle', { color }).run()
      },
      unsetColor: () => ({ chain }) => {
        return chain().setMark('textStyle', { color: null }).removeEmptyTextStyle().run()
      },
      setLineHeight: (height: string) => ({ chain }) => {
        return chain().setMark('textStyle', { lineHeight: height }).run()
      },
      setIndent: (indent: string) => ({ chain }) => {
        return chain().setMark('textStyle', { marginLeft: indent }).run()
      },
      indent: () => ({ chain, editor }: { chain: any, editor: any }) => {
        const currentIndent = editor.getAttributes('textStyle').marginLeft || '0px';
        const currentLevel = parseFloat(currentIndent) || 0;
        return chain().setMark('textStyle', { marginLeft: `${currentLevel + 20}px` }).run()
      },
      outdent: () => ({ chain, editor }: { chain: any, editor: any }) => {
        const currentIndent = editor.getAttributes('textStyle').marginLeft || '0px';
        const currentLevel = parseFloat(currentIndent) || 0;
        const nextLevel = Math.max(0, currentLevel - 20);
        return chain().setMark('textStyle', { marginLeft: nextLevel ? `${nextLevel}px` : null }).run()
      },
    }
  },
})

// ─── Page Setup Modal ─────────────────────────────────────────────────────────
type PageOrientation = 'portrait' | 'landscape';
type PaperSizeId = 'a4' | 'letter' | 'legal' | 'a3' | 'a5';
type PageNumberPos = 'none' | 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';

interface PageSetupSettings {
  orientation: PageOrientation;
  paperSize: PaperSizeId;
  margins: { top: number; right: number; bottom: number; left: number };
  columns: 1 | 2 | 3;
  pageColor: string;
  showHeader: boolean;
  showFooter: boolean;
  pageNumberPos: PageNumberPos;
  pageBorder?: string;
  watermarkText?: string;
  watermarkImage?: string;
  lineNumbers?: boolean;
  hyphenation?: boolean;
  differentFirstPageHeader?: boolean;
  differentOddEvenHeaders?: boolean;
  documentTheme?: string;
  styleSet?: string;
  drawingStencil?: string;
}

const MARGIN_PRESETS = [
  { label: 'Normal', values: { top: 1, right: 1, bottom: 1, left: 1 } },
  { label: 'Narrow', values: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 } },
  { label: 'Moderate', values: { top: 1, right: 0.75, bottom: 1, left: 0.75 } },
  { label: 'Mirrored', values: { top: 1, right: 0.75, bottom: 1, left: 1.25 } },
];

const PAGE_COLORS = [
  { label: 'White', value: '#FFFFFF' },
  { label: 'Warm', value: '#FDF6E3' },
  { label: 'Cool', value: '#F0F4FF' },
  { label: 'Mint', value: '#F0FFF4' },
  { label: 'Dark', value: '#1A1A2E' },
  { label: 'Graphite', value: '#2D2D2D' },
];

const PAPER_SIZES: { id: PaperSizeId; label: string; dim: string; wMM: number; hMM: number }[] = [
  { id: 'a4', label: 'A4', dim: '210 × 297 mm', wMM: 210, hMM: 297 },
  { id: 'letter', label: 'Letter', dim: '8.5 × 11 in', wMM: 216, hMM: 279 },
  { id: 'legal', label: 'Legal', dim: '8.5 × 14 in', wMM: 216, hMM: 356 },
  { id: 'a3', label: 'A3', dim: '297 × 420 mm', wMM: 297, hMM: 420 },
  { id: 'a5', label: 'A5', dim: '148 × 210 mm', wMM: 148, hMM: 210 },
];

const PAGE_NUM_POSITIONS: { value: PageNumberPos; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'top-left', label: 'Top Left' },
];

const DiagramModal = ({ onClose, onGenerate }: { onClose: () => void; onGenerate: (prompt: string, type: string, caption: string) => void }) => {
  const [activeTab, setActiveTab] = React.useState<'generate' | 'library'>('generate');
  const [description, setDescription] = React.useState('');
  const [type, setType] = React.useState('Flowchart');
  const [caption, setCaption] = React.useState('');
  const [isTypeOpen, setIsTypeOpen] = React.useState(false);

  const DIAGRAM_TYPES = [
    'Flowchart',
    'System Architecture',
    'Process Diagram',
    'Comparison Diagram'
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-md" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.18)] w-full max-w-lg relative border border-stone-200 flex flex-col"
      >
        <div className="p-6 border-b border-stone-100 flex items-center justify-between relative bg-stone-50/50 rounded-t-[2.5rem]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-blue-500/10 blur-xl rounded-full" />
              <SamHead size={36} className="relative shadow-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 tracking-tight leading-none mb-1">Generate Diagram</h3>
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Powered by Sam Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-stone-200/50 rounded-full transition-all text-stone-400 hover:text-stone-900 hover:rotate-90">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 relative overflow-visible">
          {/* Enhanced Pill Tabs */}
          <div className="flex bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/50 backdrop-blur-sm shadow-inner">
            <button
              onClick={() => setActiveTab('generate')}
              className={clsx(
                "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                activeTab === 'generate' ? "bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-blue-600" : "text-stone-400 hover:text-stone-600"
              )}
            >
              <Zap size={14} className={activeTab === 'generate' ? "fill-blue-600" : ""} />
              Generate New
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={clsx(
                "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                activeTab === 'library' ? "bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-blue-600" : "text-stone-400 hover:text-stone-600"
              )}
            >
              <Clock size={14} />
              Library
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-stone-400">Diagram Description</label>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[160px] p-6 bg-stone-50 border border-stone-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all font-medium text-[15px] text-stone-800 resize-none shadow-inner placeholder:text-stone-300"
              placeholder="Describe the diagram you need... e.g. 'A flowchart showing the customer journey from signup to first purchase'"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3 relative">
              <label className="text-xs font-black uppercase tracking-widest text-stone-400">Diagram Type</label>
              <button
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                className="group w-full p-4.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between font-bold text-sm text-stone-700 hover:border-stone-400 transition-all shadow-sm"
              >
                {type}
                <ChevronDown size={16} className={clsx("text-stone-400 transition-transform duration-300", isTypeOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isTypeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.98 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white border border-stone-200 rounded-[1.5rem] shadow-[0_24px_48px_rgba(0,0,0,0.12)] z-50 overflow-hidden backdrop-blur-xl"
                  >
                    <div className="p-2 space-y-1">
                      {DIAGRAM_TYPES.map(t => (
                        <button
                          key={t}
                          onClick={() => { setType(t); setIsTypeOpen(false); }}
                          className={clsx(
                            "w-full px-5 py-3.5 text-left text-sm font-bold rounded-xl transition-all flex items-center justify-between",
                            t === type ? "text-blue-600 bg-blue-50" : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                          )}
                        >
                          {t}
                          {t === type && <CheckSquare size={16} className="text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-stone-400">Caption (optional)</label>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-4.5 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all font-bold text-sm text-stone-800 shadow-sm placeholder:text-stone-300"
                placeholder="Figure 1: Architectural Overview"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-stone-50/80 border-t border-stone-100 flex justify-end items-center gap-4 rounded-b-[2.5rem]">
          <button
            disabled={!description}
            onClick={() => onGenerate(description, type, caption)}
            className="group relative px-8 py-4 bg-stone-900 text-white rounded-[2rem] font-black text-xs flex items-center gap-2.5 hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-blue-500/20 transition-all active:translate-y-0 disabled:opacity-30 disabled:pointer-events-none overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Zap size={18} className="fill-blue-400 text-blue-400 animate-pulse" />
            <span>Generate with Sam</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

type SetupTab = 'margins' | 'paper' | 'layout' | 'header';

const PageSetupModal = ({
  onClose,
  onApply,
  initialSettings
}: {
  onClose: () => void;
  onApply: (s: PageSetupSettings) => void;
  initialSettings: PageSetupSettings;
}) => {
  const [tab, setTab] = React.useState<SetupTab>('margins');
  const [orientation, setOrientation] = React.useState<PageOrientation>(initialSettings.orientation);
  const [paperSize, setPaperSize] = React.useState<PaperSizeId>(initialSettings.paperSize);
  const [margins, setMargins] = React.useState(initialSettings.margins);
  const [columns, setColumns] = React.useState<1 | 2 | 3>(initialSettings.columns);
  const [pageColor, setPageColor] = React.useState(initialSettings.pageColor);
  const [showHeader, setShowHeader] = React.useState(initialSettings.showHeader);
  const [showFooter, setShowFooter] = React.useState(initialSettings.showFooter);
  const [pageNumberPos, setPageNumberPos] = React.useState<PageNumberPos>(initialSettings.pageNumberPos);

  // Find which preset matches current margins, or set to Custom
  const matchingPreset = MARGIN_PRESETS.find(p =>
    p.values.top === initialSettings.margins.top &&
    p.values.bottom === initialSettings.margins.bottom &&
    p.values.left === initialSettings.margins.left &&
    p.values.right === initialSettings.margins.right
  );
  const [activePreset, setActivePreset] = React.useState(matchingPreset ? matchingPreset.label : 'Custom');
  const [pnDropOpen, setPnDropOpen] = React.useState(false);

  const setM = (key: keyof typeof margins, val: string) =>
    setMargins(m => ({ ...m, [key]: parseFloat(val) || 0 }));

  const applyPreset = (p: typeof MARGIN_PRESETS[0]) => {
    setMargins(p.values);
    setActivePreset(p.label);
  };

  const paper = PAPER_SIZES.find(p => p.id === paperSize) || PAPER_SIZES[0];
  const isLandscape = orientation === 'landscape';
  const rawW = isLandscape ? paper.hMM : paper.wMM;
  const rawH = isLandscape ? paper.wMM : paper.hMM;
  const MAX_PW = 100;
  const MAX_PH = 130;
  const scale = Math.min(MAX_PW / rawW, MAX_PH / rawH);
  const previewW = Math.round(rawW * scale);
  const previewH = Math.round(rawH * scale);
  const pxPerMM = scale;
  const pxPerIn = pxPerMM * 25.4;
  const isLight = ['#FFFFFF', '#FDF6E3', '#F0F4FF', '#F0FFF4'].includes(pageColor);
  const lineColor = isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)';

  const TABS: { id: SetupTab; label: string }[] = [
    { id: 'margins', label: 'Margins' },
    { id: 'paper', label: 'Paper' },
    { id: 'layout', label: 'Layout' },
    { id: 'header', label: 'Header/Footer' },
  ];

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border-main)] last:border-0">
      <span className="text-sm font-medium text-[var(--text-main)]">{label}</span>
      <button onClick={onChange}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-[var(--accent-main)]' : 'bg-[var(--border-main)]'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="bg-[var(--bg-card)] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[var(--border-main)]"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-[var(--border-main)]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)] mb-0.5">Document</p>
            <h2 className="text-xl font-black text-[var(--text-main)] tracking-tight">Page Setup</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-app)] transition-colors text-[var(--text-muted)]">
            <X size={18} />
          </button>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex gap-1 px-7 py-3 bg-[var(--bg-app)] border-b border-[var(--border-main)]">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tab === t.id
                ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Body: preview + tab content ── */}
        <div className="flex" style={{ minHeight: 320, maxHeight: '60vh' }}>

          {/* LEFT: live page preview */}
          <div className="w-44 shrink-0 flex flex-col items-center justify-center gap-4 px-5 py-6 bg-[var(--bg-app)] border-r border-[var(--border-main)]">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Preview</p>
            <div
              className="relative rounded shadow-lg border border-[var(--border-main)] overflow-hidden transition-all duration-300"
              style={{ width: previewW, height: previewH, backgroundColor: pageColor }}
            >
              {/* margin dashes */}
              <div className="absolute border border-dashed border-blue-400/40 pointer-events-none"
                style={{
                  top: Math.min(margins.top * pxPerIn, previewH * 0.28),
                  bottom: Math.min(margins.bottom * pxPerIn, previewH * 0.28),
                  left: Math.min(margins.left * pxPerIn, previewW * 0.28),
                  right: Math.min(margins.right * pxPerIn, previewW * 0.28),
                }} />
              {/* column guides */}
              {columns > 1 && Array.from({ length: columns - 1 }).map((_, i) => (
                <div key={i} className="absolute top-0 bottom-0 w-px border-l border-dashed border-blue-400/30"
                  style={{ left: `${((i + 1) / columns) * 100}%` }} />
              ))}
              {/* fake text */}
              <div className="absolute inset-0 flex flex-col gap-1 pointer-events-none"
                style={{
                  paddingTop: Math.min(margins.top * pxPerIn + 4, 24),
                  paddingBottom: Math.min(margins.bottom * pxPerIn + 4, 14),
                  paddingLeft: Math.min(margins.left * pxPerIn + 3, 18),
                  paddingRight: Math.min(margins.right * pxPerIn + 3, 18),
                }}>
                {[100, 80, 100, 60, 100, 75, 100, 55, 90, 65].map((w, i) => (
                  <div key={i} className="h-px rounded-full" style={{ width: `${w}%`, backgroundColor: lineColor }} />
                ))}
              </div>
              {/* page number indicator */}
              {pageNumberPos !== 'none' && (
                <div className="absolute text-[5px] font-bold"
                  style={{
                    color: isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.4)',
                    bottom: pageNumberPos.startsWith('bottom') ? 3 : undefined,
                    top: pageNumberPos.startsWith('top') ? 3 : undefined,
                    left: pageNumberPos.endsWith('left') ? 4 : pageNumberPos.endsWith('center') ? '50%' : undefined,
                    right: pageNumberPos.endsWith('right') ? 4 : undefined,
                    transform: pageNumberPos.endsWith('center') ? 'translateX(-50%)' : undefined,
                  }}>1</div>
              )}
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold text-[var(--text-main)]">{paper.label}</p>
              <p className="text-[10px] text-[var(--text-muted)] capitalize">{orientation}</p>
            </div>
          </div>

          {/* RIGHT: tab pane */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5">

            {/* ── MARGINS TAB ── */}
            {tab === 'margins' && (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">Presets</p>
                  <div className="flex gap-2 flex-wrap">
                    {MARGIN_PRESETS.map(p => (
                      <button key={p.label} onClick={() => applyPreset(p)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${activePreset === p.label
                          ? 'border-[var(--accent-main)] bg-[var(--accent-main)]/10 text-[var(--accent-main)]'
                          : 'border-[var(--border-main)] bg-[var(--bg-app)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
                          }`}>{p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">Custom (inches)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(['top', 'bottom', 'left', 'right'] as const).map(key => (
                      <div key={key} className="space-y-1.5">
                        <label className="text-xs font-bold text-[var(--text-muted)] capitalize block">{key}</label>
                        <div className="relative">
                          <input type="number" step="0.25" min="0" max="4"
                            value={margins[key]}
                            onChange={e => { setM(key, e.target.value); setActivePreset('Custom'); }}
                            className="w-full pl-3 pr-7 py-2.5 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl text-sm font-bold text-[var(--text-main)] outline-none focus:border-[var(--accent-main)] transition-colors"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)] pointer-events-none">in</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PAPER TAB ── */}
            {tab === 'paper' && (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">Orientation</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(['portrait', 'landscape'] as const).map(o => (
                      <button key={o} onClick={() => setOrientation(o)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all ${orientation === o
                          ? 'border-[var(--accent-main)] bg-[var(--accent-main)]/8'
                          : 'border-[var(--border-main)] bg-[var(--bg-app)] hover:border-[var(--text-muted)]'
                          }`}>
                        <div className={`border-2 rounded-sm bg-white shrink-0 ${o === 'portrait' ? 'w-5 h-7' : 'w-8 h-5'
                          } ${orientation === o ? 'border-[var(--accent-main)]' : 'border-stone-300'}`} />
                        <span className={`text-sm font-bold capitalize ${orientation === o ? 'text-[var(--accent-main)]' : 'text-[var(--text-muted)]'}`}>{o}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">Paper Size</p>
                  <div className="grid grid-cols-3 gap-2">
                    {PAPER_SIZES.map(p => (
                      <button key={p.id} onClick={() => setPaperSize(p.id)}
                        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border-2 transition-all ${paperSize === p.id
                          ? 'border-[var(--accent-main)] bg-[var(--accent-main)]/8'
                          : 'border-[var(--border-main)] bg-[var(--bg-app)] hover:border-[var(--text-muted)]'
                          }`}>
                        <span className={`text-sm font-black ${paperSize === p.id ? 'text-[var(--accent-main)]' : 'text-[var(--text-main)]'}`}>{p.label}</span>
                        <span className="text-[9px] text-[var(--text-muted)] text-center leading-tight">{p.dim}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── LAYOUT TAB ── */}
            {tab === 'layout' && (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">Columns</p>
                  <div className="grid grid-cols-3 gap-3">
                    {([1, 2, 3] as const).map(n => (
                      <button key={n} onClick={() => setColumns(n)}
                        className={`flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all ${columns === n
                          ? 'border-[var(--accent-main)] bg-[var(--accent-main)]/8'
                          : 'border-[var(--border-main)] bg-[var(--bg-app)] hover:border-[var(--text-muted)]'
                          }`}>
                        <div className="flex gap-1 h-8 w-full px-1">
                          {Array.from({ length: n }).map((_, i) => (
                            <div key={i} className={`flex-1 rounded-sm ${columns === n ? 'bg-[var(--accent-main)]/30' : 'bg-[var(--border-main)]'}`} />
                          ))}
                        </div>
                        <span className={`text-xs font-bold ${columns === n ? 'text-[var(--accent-main)]' : 'text-[var(--text-muted)]'}`}>
                          {n === 1 ? 'Single' : n === 2 ? 'Two' : 'Three'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">Page Color</p>
                  <div className="flex gap-3 flex-wrap">
                    {PAGE_COLORS.map(c => (
                      <div key={c.value} className="flex flex-col items-center gap-1.5">
                        <button onClick={() => setPageColor(c.value)}
                          title={c.label}
                          className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${pageColor === c.value ? 'border-[var(--accent-main)] scale-110 shadow-md' : 'border-[var(--border-main)]'
                            }`}
                          style={{ backgroundColor: c.value }} />
                        <span className="text-[9px] text-[var(--text-muted)]">{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── HEADER/FOOTER TAB ── */}
            {tab === 'header' && (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-2">Visibility</p>
                  <div className="bg-[var(--bg-app)] rounded-2xl px-4">
                    <Toggle checked={showHeader} onChange={() => setShowHeader(v => !v)} label="Show Header" />
                    <Toggle checked={showFooter} onChange={() => setShowFooter(v => !v)} label="Show Footer" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">Page Numbers</p>
                  {/* Custom dropdown matching image style */}
                  <div className="relative">
                    <button
                      onClick={() => setPnDropOpen(v => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-2xl text-sm font-semibold text-[var(--text-main)] hover:border-[var(--text-muted)] transition-colors"
                    >
                      <span>{PAGE_NUM_POSITIONS.find(p => p.value === pageNumberPos)?.label ?? 'None'}</span>
                      <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${pnDropOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {pnDropOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-xl z-10 overflow-hidden">
                        {PAGE_NUM_POSITIONS.map(p => (
                          <button key={p.value}
                            onClick={() => { setPageNumberPos(p.value); setPnDropOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors ${pageNumberPos === p.value
                              ? 'bg-[var(--accent-main)] text-white'
                              : 'text-[var(--text-main)] hover:bg-[var(--bg-app)]'
                              }`}>
                            {pageNumberPos === p.value && <span className="text-white">✓</span>}
                            {pageNumberPos !== p.value && <span className="w-4" />}
                            {p.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-2 px-1">
                    Choose where page numbers appear — reflected in the preview.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-3 px-7 py-4 border-t border-[var(--border-main)] bg-[var(--bg-app)]">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-main)] text-sm font-bold hover:opacity-80 transition-all">
            Cancel
          </button>
          <button onClick={() => onApply({ ...initialSettings, orientation, paperSize, margins, columns, pageColor, showHeader, showFooter, pageNumberPos })}
            className="flex-1 py-3 rounded-2xl bg-[var(--text-main)] text-[var(--bg-card)] text-sm font-bold hover:opacity-85 transition-opacity shadow-lg">
            Apply
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const CompilerModal = ({
  onClose,
  onMinimize,
  isMinimized = false,
  currentTheme = 'light',
  onThemeChange
}: {
  onClose: () => void;
  onMinimize: () => void;
  isMinimized?: boolean;
  currentTheme?: 'light' | 'dark';
  onThemeChange: (t: 'light' | 'dark') => void;
}) => {
  const envUrl = import.meta.env.VITE_ONECOMPILER_URL;
  const [lastCode, setLastCode] = useState<any>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Handle incoming messages from OneCompiler
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 1. Capture code changes
      if (event.data && event.data.eventType === 'codeChange') {
        setLastCode(event.data);
      }

      // 2. Wait for editor to be fully ready before restoring code
      if (event.data && event.data.eventType === 'editorLoaded') {
        setIsIframeLoading(false);
        if (lastCode && iframeRef.current) {
          // Small delay to ensure the internal editor engine is ready to receive the state
          setTimeout(() => {
            iframeRef.current?.contentWindow?.postMessage({
              eventType: 'populateCode',
              language: lastCode.language,
              files: lastCode.files
            }, "*");
          }, 800);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [lastCode]);

  // Reset loading state and set safety timeout when theme changes
  useEffect(() => {
    setIsIframeLoading(true);
    // Fail-safe: If editorLoaded never fires, show iframe anyway after 4s
    const timer = setTimeout(() => {
      setIsIframeLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, [currentTheme]);

  // Also use native onLoad as a secondary signal
  const handleLoadFallback = () => {
    // If native load fired, give it 1.5s then show if still loading
    setTimeout(() => {
      setIsIframeLoading(false);
    }, 1000);
  };

  let baseUrl = 'https://onecompiler.com/embed/';

  if (envUrl && envUrl.trim() !== '') {
    if (envUrl.startsWith('http')) {
      baseUrl = envUrl;
    } else if (!envUrl.startsWith('oc_')) {
      baseUrl = `https://onecompiler.com/embed/${envUrl}`;
    }
  }

  // Robust URL parameters assembly
  const baseObj = new URL(baseUrl);
  baseObj.searchParams.set('theme', currentTheme);
  baseObj.searchParams.set('listenToEvents', 'true');
  baseObj.searchParams.set('codeChangeEvent', 'true');
  const compilerUrl = baseObj.toString();

  return (
    <div
      className={clsx(
        "fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ease-out",
        isMinimized
          ? "pointer-events-none bg-transparent backdrop-blur-0"
          : currentTheme === 'dark'
            ? "bg-stone-950/80 backdrop-blur-2xl pointer-events-auto"
            : "bg-white/70 backdrop-blur-2xl pointer-events-auto"
      )}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{
          opacity: isMinimized ? 0 : 1,
          scale: isMinimized ? 0.7 : 1,
          y: isMinimized ? 200 : 0,
          rotateX: isMinimized ? 20 : 0
        }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className={clsx(
          "w-full max-w-7xl h-[92vh] relative border flex flex-col overflow-hidden transition-colors duration-300",
          currentTheme === 'dark'
            ? "bg-stone-950 border-stone-800 shadow-[0_64px_128px_rgba(0,0,0,0.8)]"
            : "bg-white border-stone-200 shadow-[0_64px_128px_rgba(0,0,0,0.3)]",
          "rounded-[3.5rem]"
        )}
      >
        <div className={clsx(
          "p-8 border-b flex items-center justify-between transition-colors duration-100",
          currentTheme === 'dark' ? "bg-stone-950/50 border-stone-800" : "bg-white border-stone-100"
        )}>
          <div className="flex items-center gap-6">
            <div className={clsx(
              "p-3.5 rounded-2xl shadow-2xl transition-all duration-500",
              currentTheme === 'dark' ? "bg-indigo-500 text-white shadow-indigo-500/20" : "bg-indigo-600 text-white shadow-indigo-600/20"
            )}>
              <Code size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className={clsx(
                "text-2xl font-black tracking-tight leading-none mb-1.5 transition-colors",
                currentTheme === 'dark' ? "text-white" : "text-stone-900"
              )}>
                Elite Compiler
              </h3>
              <p className={clsx(
                "text-[10px] font-black uppercase tracking-[0.3em] transition-colors",
                currentTheme === 'dark' ? "text-stone-500" : "text-stone-400"
              )}>
                Developer Integrated Sandbox
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={clsx(
              "flex items-center p-1.5 rounded-[1.25rem] border transition-all duration-300",
              currentTheme === 'dark' ? "bg-stone-900 border-stone-800" : "bg-stone-100 border-stone-200"
            )}>
              <button
                onClick={() => onThemeChange('light')}
                className={clsx(
                  "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  currentTheme === 'light'
                    ? "bg-white text-stone-900 shadow-xl"
                    : "text-stone-500 hover:text-stone-700"
                )}
              >
                Light
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={clsx(
                  "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  currentTheme === 'dark'
                    ? "bg-stone-800 text-white shadow-xl"
                    : "text-stone-500 hover:text-stone-300"
                )}
              >
                Dark
              </button>
            </div>

            <div className={clsx("w-px h-8 transition-colors", currentTheme === 'dark' ? "bg-stone-800" : "bg-stone-200")} />

            <div className="flex items-center gap-2">
              <button
                onClick={onMinimize}
                className={clsx(
                  "p-3.5 rounded-full transition-all duration-300",
                  currentTheme === 'dark' ? "hover:bg-stone-900 text-stone-500 hover:text-white" : "hover:bg-stone-100 text-stone-400 hover:text-stone-900"
                )}
                title="Minimize Session"
              >
                <Minus size={24} />
              </button>
              <button
                onClick={onClose}
                className={clsx(
                  "p-3.5 rounded-full transition-all duration-300 hover:rotate-90",
                  currentTheme === 'dark' ? "hover:bg-red-500/10 text-stone-500 hover:text-red-500" : "hover:bg-red-50 text-stone-400 hover:text-red-600"
                )}
                title="End Session"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className={clsx(
          "flex-1 w-full relative transition-colors duration-300",
          currentTheme === 'dark' ? "bg-stone-900" : "bg-stone-50"
        )}>
          <iframe
            ref={iframeRef}
            src={compilerUrl}
            onLoad={handleLoadFallback}
            width="100%"
            height="100%"
            frameBorder="0"
            title="OneCompiler"
            className="w-full h-full"
            style={{
              backgroundColor: currentTheme === 'dark' ? '#1e1e1e' : 'white',
              opacity: isIframeLoading || isMinimized ? 0 : 1,
              transition: 'opacity 0.25s ease-in-out'
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

const CompilerThemeWrapper = ({
  user,
  profile,
  refreshProfile,
  onClose,
  onMinimize,
  isMinimized
}: {
  user: any;
  profile: any;
  refreshProfile: () => Promise<void>;
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
}) => {
  const savedTheme = profile?.preferences?.compilerTheme || 'light';
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(savedTheme);

  // Sync local state if profile changes (e.g. from another tab)
  useEffect(() => {
    setLocalTheme(savedTheme);
  }, [savedTheme]);

  const handleThemeToggle = async (newTheme: 'light' | 'dark') => {
    // 1. Instant local update
    setLocalTheme(newTheme);

    // 2. Background sync
    if (!user) return;
    try {
      const updatedPrefs = {
        ...(profile?.preferences || {}),
        compilerTheme: newTheme
      };
      await updateUserProfile(user.uid, { preferences: updatedPrefs } as UserProfile);
      await refreshProfile();
    } catch (err) {
      console.error('Failed to sync compiler theme preference:', err);
    }
  };

  return (
    <CompilerModal
      onClose={onClose}
      onMinimize={onMinimize}
      isMinimized={isMinimized}
      currentTheme={localTheme}
      onThemeChange={handleThemeToggle}
    />
  );
};

const EditorPage = ({ isPersonal = false }: { isPersonal?: boolean }) => {
  const { user, profile, refreshProfile } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(!isMobile && !isTablet);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const [isDiagramOpen, setIsDiagramOpen] = useState(false);
  const [compilerWindowState, setCompilerWindowState] = useState<'closed' | 'open' | 'minimized'>('closed');

  useEffect(() => {
    if (isMobile || isTablet) {
      setIsRightPanelOpen(false);
    } else {
      setIsRightPanelOpen(true);
    }
  }, [isMobile, isTablet]);

  const [isPageSetupOpen, setIsPageSetupOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const [rightPanelTab, setRightPanelTab] = useState<TabType>('ai');
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [editingVersionId, setEditingVersionId] = useState<number | null>(null);
  const [editVersionName, setEditVersionName] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [isGeneratingShareCode, setIsGeneratingShareCode] = useState(false);
  const [shareTab, setShareTab] = useState<'link' | 'access'>('link');
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState<'viewer' | 'editor'>('viewer');
  const [qualityReport, setQualityReport] = useState<string | null>(null);
  const [plagiarismReport, setPlagiarismReport] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [notes, setNotes] = useState("");
  const [zoom, setZoom] = useState(100);
  const [pageSettings, setPageSettings] = useState<PageSetupSettings>({
    orientation: 'portrait',
    paperSize: 'a4',
    margins: { top: 1, right: 1, bottom: 1, left: 1 },
    columns: 1,
    pageColor: '#FFFFFF',
    showHeader: false,
    showFooter: false,
    pageNumberPos: 'none',
    pageBorder: '',
    watermarkText: '',
    watermarkImage: '',
    lineNumbers: false,
    hyphenation: false,
    differentFirstPageHeader: false,
    differentOddEvenHeaders: false,
    documentTheme: '',
    styleSet: '',
    drawingStencil: ''
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      SearchHighlight,
      CustomFormatting,
      FontFamily.configure(),
      Highlight.configure({ multicolor: true }),
      Underline.configure(),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Subscript.configure(),
      Superscript.configure(),
      BubbleMenuExtension,
      Image.configure({
        allowBase64: true,
        inline: false,
      }),
      TiptapLink.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow.configure(),
      TableHeader.configure(),
      TableCell.configure(),
      TaskList.configure(),
      TaskItem.configure({
        nested: true,
      }),
      Typography.configure(),
      CharacterCount.configure(),
      CodeBlockLowlight.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            class: {
              default: null,
              renderHTML: attributes => {
                const classes = [attributes.class];
                if (attributes.size) classes.push(`size-${attributes.size}`);
                return { class: classes.filter(Boolean).join(' ') };
              },
              parseHTML: element => element.getAttribute('class'),
            },
            size: {
              default: 'md',
              renderHTML: attributes => ({ 'data-size': attributes.size }),
              parseHTML: element => element.getAttribute('data-size'),
            },
            maxHeight: {
              default: null,
              renderHTML: attributes => {
                if (!attributes.maxHeight) return {};
                return {
                  style: `max-height: ${attributes.maxHeight}; overflow-y: auto;`,
                  'data-max-height': attributes.maxHeight
                };
              },
              parseHTML: element => element.getAttribute('data-max-height'),
            }
          }
        },
      }).configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your assignment...',
      }),
    ],
    editorProps: {
      attributes: {
        spellcheck: 'false',
        class: 'focus:outline-none min-h-[297mm]',
      },
    },
    content: '',
    onUpdate: ({ editor }) => {
      setWordCount(editor.getText().split(/\s+/).filter(x => x).length);
      setCharCount(editor.getText().length);

      if (activeSectionId) {
        setSections(prev => prev.map(s =>
          s.id === activeSectionId ? { ...s, content: editor.getHTML() } : s
        ));
      }
    },
  });

  const applyStyles = useCallback((settings: PageSetupSettings) => {
    const container = document.querySelector('.page-container') as HTMLElement;
    if (container) {
      const d = {
        a4: { w: 210, h: 297 },
        letter: { w: 215.9, h: 279.4 },
        legal: { w: 215.9, h: 355.6 },
        a3: { w: 297, h: 420 },
        a5: { w: 148, h: 210 }
      }[settings.paperSize] || { w: 210, h: 297 };

      const isL = settings.orientation === 'landscape';
      const finalW = isL ? d.h : d.w;
      const finalH = isL ? d.w : d.h;

      container.style.setProperty('--page-width', `${finalW}mm`);
      container.style.setProperty('--page-height', `${finalH}mm`);
      container.style.setProperty('--page-color', settings.pageColor);
      container.style.maxWidth = `${finalW}mm`;
      container.style.minHeight = `${finalH}mm`;

      if (settings.showHeader) container.classList.add('show-header');
      else container.classList.remove('show-header');

      if (settings.showFooter) container.classList.add('show-footer');
      else container.classList.remove('show-footer');

      container.setAttribute('data-page-numbers', settings.pageNumberPos);
      container.setAttribute('data-line-numbers', settings.lineNumbers ? 'true' : 'false');
      container.setAttribute('data-different-first-page', settings.differentFirstPageHeader ? 'true' : 'false');
      container.setAttribute('data-different-odd-even', settings.differentOddEvenHeaders ? 'true' : 'false');
      container.style.border = settings.pageBorder || '';

      if (settings.watermarkText) container.setAttribute('data-watermark', settings.watermarkText);
      else container.removeAttribute('data-watermark');

      if (settings.watermarkImage) {
        container.style.setProperty('--watermark-image', `url("${settings.watermarkImage}")`);
        container.setAttribute('data-watermark-image', 'true');
      } else {
        container.style.removeProperty('--watermark-image');
        container.removeAttribute('data-watermark-image');
      }

      if (settings.drawingStencil) container.setAttribute('data-drawing-stencil', settings.drawingStencil);
      else container.removeAttribute('data-drawing-stencil');
    }

    if (editor) {
      const el = editor.view.dom as HTMLElement;
      if (el) {
        el.style.padding = `${settings.margins.top}in ${settings.margins.right}in ${settings.margins.bottom}in ${settings.margins.left}in`;
        el.style.columnCount = settings.columns.toString();
        el.style.columnGap = '0.5in';
        el.style.hyphens = settings.hyphenation ? 'auto' : 'manual';
        const darkColors = ['#1A1A2E', '#2D2D2D', '#022C22', '#450A0A'];
        el.style.color = darkColors.includes(settings.pageColor) ? '#FFFFFF' : 'inherit';
      }
    }
  }, [editor]);

  const applyDocumentSettings = useCallback((settings: PageSetupSettings) => {
    setPageSettings(settings);
    applyStyles(settings);
  }, [applyStyles]);

  const handleFindReplace = (replace = false) => {
    if (!editor || !findText) return;
    const { state } = editor;
    const { doc } = state;
    const text = doc.textBetween(0, doc.content.size, '\n');
    const index = text.indexOf(findText);

    if (index !== -1) {
      if (replace) {
        editor.chain().focus().setTextSelection({ from: index + 1, to: index + findText.length + 1 }).insertContent(replaceText).run();
      } else {
        editor.chain().focus().setTextSelection({ from: index + 1, to: index + findText.length + 1 }).run();
      }
    } else {
      toast.error('Text not found');
    }
  };

  useEffect(() => {
    if (!user || !id || !editor) return;

    // Handle "New Blank Document" request
    if (id === 'new') {
      const newDoc: Assignment = {
        id: 'new',
        userId: user.uid,
        title: 'Untitled Document',
        topic: 'Academic',
        description: '',
        content: '',
        taskType: 'generate',
        tone: 'formal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sections: []
      };

      setAssignment(newDoc);
      const defaultSection: DocumentSection = {
        id: 'default',
        title: 'Introduction',
        content: ''
      };
      setSections([defaultSection]);
      setActiveSectionId('default');
      editor.commands.setContent('');
      setWordCount(0);
      setCharCount(0);
      return;
    }

    const primaryFetch = isPersonal ? getEditorDocument(user.uid, id) : getDocument(user.uid, id);
    const fallbackFetch = isPersonal ? getDocument(user.uid, id) : getEditorDocument(user.uid, id);

    primaryFetch.then((data) => {
      if (data) return data;
      // Try fallback if primary fails
      return fallbackFetch;
    }).then((data) => {
      if (data) {
        setAssignment(data as Assignment);

        // Ensure Page Settings are restored
        const localSettings = localStorage.getItem(`doc_settings_${id}`);
        if (localSettings) {
          try { setPageSettings(JSON.parse(localSettings)); } catch (e) { }
        } else if (data.pageSettings) {
          setPageSettings(data.pageSettings);
        }


        const docSections = data.sections || [];

        // 2. Restore Content (Check LocalStorage for un-synced draft)
        const localContent = localStorage.getItem(`doc_content_${id}`);

        if (docSections.length === 0) {
          const defaultSection: DocumentSection = {
            id: 'default',
            title: 'Introduction',
            content: localContent || data.content || ''
          };
          setSections([defaultSection]);
          setActiveSectionId('default');
          editor.commands.setContent(defaultSection.content);
        } else {
          setSections(docSections);
          setActiveSectionId(docSections[0].id);
          editor.commands.setContent(docSections[0].content);
        }

        if (data.permission === 'view') {
          editor.setEditable(false);
        } else {
          editor.setEditable(true);
        }

        setWordCount(editor.getText().split(/\s+/).filter(x => x).length || 0);
        setCharCount(editor.getText().length || 0);
      } else {
        toast.error('Document not found');
        navigate(isPersonal ? '/editor' : '/documents');
      }
    }).catch((err) => {
      console.error('Failed to load document:', err);
    });
  }, [user, id, editor, isPersonal, navigate]);

  // Apply settings whenever they change
  useEffect(() => {
    if (editor && pageSettings) {
      // Small timeout to ensure DOM is ready
      const timer = setTimeout(() => {
        applyStyles(pageSettings);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editor, pageSettings, applyStyles]);

  // ── Auto-save logic ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !id || !assignment || assignment.permission === 'view' || !editor) return;

    const timer = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        const currentContent = editor.getHTML();

        if (id === 'new') {
          // Only create if there's actually some content to avoid empty docs
          if (currentContent && currentContent !== '<p></p>') {
            const saveFunc = isPersonal ? createEditorDocument : createDocument;
            const doc = await saveFunc(
              user.uid,
              assignment.title || 'Untitled Assignment',
              currentContent,
              assignment.topic,
              assignment.description,
              assignment.tone,
              'blank'
            );
            if (doc && doc.id) {
              const targetPath = isPersonal ? `/editor/personal/${doc.id}` : `/editor/${doc.id}`;
              navigate(targetPath, { replace: true });
            }
          }
        } else {
          // 1. Save to Database
          const updateFunc = isPersonal ? updateEditorDocument : updateDocument;
          await updateFunc(user.uid, id, {
            title: assignment.title,
            content: currentContent,
            pageSettings: pageSettings,
            sections: sections
          });
        }

        // 2. Backup to Local Storage (Fallback for instant recovery)
        localStorage.setItem(`doc_settings_${id}`, JSON.stringify(pageSettings));
        localStorage.setItem(`doc_content_${id}`, currentContent);

        setLastAutoSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsAutoSaving(false);
      }
    }, 2000); // Debounce for 2 seconds

    return () => clearTimeout(timer);
  }, [sections, pageSettings, assignment?.title, editor, user, id, navigate]);

  const handleSelectSection = useCallback((id: string) => {
    if (!editor || id === activeSectionId) return;

    if (activeSectionId) {
      const currentContent = editor.getHTML();
      setSections(prev => prev.map(s =>
        s.id === activeSectionId ? { ...s, content: currentContent } : s
      ));
    }

    const nextSection = sections.find(s => s.id === id);
    if (nextSection) {
      setActiveSectionId(id);
      editor.commands.setContent(nextSection.content);
    }
  }, [editor, activeSectionId, sections]);

  const handleAddSection = useCallback(() => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newSection: DocumentSection = {
      id: newId,
      title: 'New Section',
      content: ''
    };

    setSections(prev => [...prev, newSection]);
    handleSelectSection(newId);
  }, [handleSelectSection]);

  const handleDeleteSection = useCallback((id: string) => {
    if (sections.length <= 1) {
      toast.error('Document must have at least one section');
      return;
    }

    const newSections = sections.filter(s => s.id !== id);
    setSections(newSections);

    if (activeSectionId === id) {
      handleSelectSection(newSections[0].id);
    }
  }, [sections, activeSectionId, handleSelectSection]);

  const handleUpload = useCallback(async (file: File) => {
    if (!user) return;

    setSaving(true);
    const title = file.name.split('.')[0] || 'Uploaded Doc';
    const extension = file.name.split('.').pop()?.toLowerCase();

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        let content = '';
        const arrayBuffer = reader.result as ArrayBuffer;

        if (extension === 'pdf') {
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          let text = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Sort items by Y (top to bottom) and then X (left to right)
            const items = (textContent.items as any[]).sort((a, b) => {
              if (Math.abs(a.transform[5] - b.transform[5]) > 2) {
                return b.transform[5] - a.transform[5];
              }
              return a.transform[4] - b.transform[4];
            });

            let html = '';
            let currentLine = '';
            let isTechnicalBlock = false;
            let lastY = -1;
            let lastX = -1;

            for (const item of items) {
              const currentY = item.transform[5];
              const currentX = item.transform[4];
              const text = item.str;

              // Heuristic: Check if this line looks like code or technical data
              const isTechnical = /[%=\(\);\{\}\*\[\]]/.test(text) || text.trim().length < 40;

              if (lastY !== -1 && Math.abs(currentY - lastY) > 2) {
                // Finalize previous line
                const style = isTechnicalBlock ? 'font-family: monospace; font-size: 10pt; background: #f8fafc; padding: 2px 4px; border-radius: 4px;' : '';
                html += `<p style="margin: 0; min-height: 1.2em; ${style}">${currentLine || '&nbsp;'}</p>`;

                currentLine = '';
                lastX = -1;
                // Transition logic for technical blocks
                if (isTechnical) isTechnicalBlock = true;
                else if (text.trim().length > 60) isTechnicalBlock = false;
              }

              if (lastX !== -1 && currentX > lastX + 1) {
                const spaces = Math.floor((currentX - lastX) / (item.transform[0] * 0.4 || 4));
                currentLine += '&nbsp;'.repeat(Math.max(1, spaces));
              }

              currentLine += text;
              lastY = currentY;
              lastX = currentX + (item.width || 0);
            }
            if (currentLine) html += `<p>${currentLine}</p>`;
            text += html + '<div style="margin: 40px 0; border-top: 1px dashed #cbd5e1; opacity: 0.5;"></div>';
          }
          content = text;
        } else if (extension === 'docx') {
          const options = {
            convertImage: mammoth.images.imgElement(function (imageElement: any) {
              return imageElement.read("base64").then(function (imageBuffer: string) {
                return {
                  src: "data:" + imageElement.contentType + ";base64," + imageBuffer
                };
              });
            }),
            styleMap: [
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh",
              "p[style-name='Heading 3'] => h3:fresh",
              "p[style-name='Title'] => h1:fresh",
              "p[style-name='Subtitle'] => h2:fresh",
              "p:empty => p > br:fresh",
              "u => u"
            ],
            ignoreEmptyParagraphs: false,
            preserveEmptyParagraphs: true
          };
          const result = await mammoth.convertToHtml({ arrayBuffer }, options);
          content = result.value;
        } else {
          // Fallback for txt/md
          content = new TextDecoder().decode(arrayBuffer);
        }

        if (!content.trim()) {
          throw new Error('Could not extract content from file');
        }

        const saveFunc = isPersonal ? createEditorDocument : createDocument;
        const newDoc = await saveFunc(
          user.uid,
          title,
          content,
          'Academic',
          `Imported from ${file.name}`,
          'formal',
          'upload'
        );

        if (newDoc && newDoc.id) {
          toast.success(`'${title}' uploaded successfully!`);
          const targetPath = isPersonal ? `/editor/personal/${newDoc.id}` : `/editor/${newDoc.id}`;
          navigate(targetPath);
        } else {
          toast.error('Failed to create document from upload');
        }
      } catch (err: any) {
        toast.error(`Import failed: ${err.message || 'Unknown error'}`);
      } finally {
        setSaving(false);
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
      setSaving(false);
    };

    reader.readAsText(file);
  }, [user, navigate]);

  const handleAiAction = useCallback(async (action: TaskType | { id: string, prompt: string }) => {
    if (!editor) return;

    const task = typeof action === 'string' ? action : (action.id as TaskType);
    const customPrompt = typeof action === 'object' ? action.prompt : undefined;

    const selection = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    ).trim();

    const selectionRequiredTasks: TaskType[] = [
      'improve', 'expand', 'shorten', 'rewrite',
      'summarize', 'bullet_points', 'add_examples', 'simplify'
    ];

    if (selectionRequiredTasks.includes(task) && !selection) {
      toast.error('Please select text to perform this action');
      return;
    }

    setAiLoading(true);
    try {
      const result = await performTask({
        task_type: task,
        description: customPrompt,
        content: editor.getHTML(),
        selection: selection || undefined,
        tone: assignment?.tone as AcademicTone || 'formal'
      });

      if (task === 'check_quality') {
        setQualityReport(result);
      } else if (task === 'plagiarism_check') {
        setPlagiarismReport(result);
      } else if (selection || task === 'custom') {
        editor.chain().focus().insertContent(result).run();
      } else {
        if (['generate_title', 'generate_abstract', 'generate_conclusion'].includes(task)) {
          editor.chain().focus().insertContent(`\n\n${result}`).run();
        } else if (!['check_quality', 'plagiarism_check'].includes(task)) {
          editor.commands.setContent(result);
        }
      }
      toast.success('AI action completed');
    } catch (err) {
      toast.error('AI action failed');
    } finally {
      setAiLoading(false);
    }
  }, [editor, assignment]);

  const handleExport = useCallback(async (format: 'pdf' | 'docx') => {
    if (!assignment || !editor) return;

    const fullContent = sections.map(s => `<h2>${s.title}</h2>${s.content}`).join('\n');

    const tempEditor = new Editor({
      extensions: [StarterKit, Underline, TextAlign, TextStyle, FontFamily, Color, Highlight, Subscript, Superscript, CodeBlockLowlight.configure({ lowlight })],
      content: fullContent
    });

    const json = tempEditor.getJSON();

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(assignment.title, 20, 20);
      doc.setFontSize(12);

      let y = 40;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - 2 * margin;

      const renderNode = (node: any) => {
        if (node.type === 'text') {
          const isBold = node.marks?.some((m: any) => m.type === 'bold');
          doc.setFont('helvetica', isBold ? 'bold' : 'normal');
          const lines = doc.splitTextToSize(node.text, contentWidth);
          doc.text(lines, margin, y);
          y += lines.length * 7;
        } else if (node.content) {
          node.content.forEach(renderNode);
        }
        if (node.type === 'paragraph' || node.type === 'heading') {
          y += 5;
        }
      };

      json.content?.forEach(renderNode);
      doc.save(`${assignment.title}.pdf`);
    } else {
      const children: any[] = [
        new Paragraph({ text: assignment.title, heading: HeadingLevel.HEADING_1 }),
      ];

      const parseNode = (node: any): any[] => {
        if (node.type === 'text') {
          const isBold = node.marks?.some((m: any) => m.type === 'bold');
          const isItalic = node.marks?.some((m: any) => m.type === 'italic');
          return [new TextRun({ text: node.text, bold: isBold, italics: isItalic })];
        }
        if (node.content) {
          return node.content.flatMap(parseNode);
        }
        return [];
      };

      json.content?.forEach(node => {
        if (node.type === 'paragraph' || node.type === 'heading') {
          children.push(new Paragraph({
            children: parseNode(node),
            heading: node.type === 'heading' ? (node.attrs?.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2) : undefined
          }));
        }
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children,
        }],
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${assignment.title}.docx`);
    }
    toast.success(`Exported as ${format.toUpperCase()}`);
    tempEditor.destroy();
  }, [assignment, editor, sections]);

  const handleSaveAsTemplate = useCallback(async () => {
    if (!user || !assignment || !editor) return;
    try {
      // Sync current section content before saving
      const currentContent = editor.getHTML();
      const updatedSections = sections.map(s =>
        s.id === activeSectionId ? { ...s, content: currentContent } : s
      );

      const res = await saveAsTemplate(user.uid, {
        name: `${assignment.title} (Template)`,
        sections: updatedSections.map(s => ({
          title: s.title,
          level: 1,
          content: s.content
        })),
        topic: assignment.topic,
        description: assignment.description,
        metadataFields: {},
        docId: id && id !== 'new' ? Number(id) : undefined
      });

      if (res && res.id) {
        toast.success(`"${assignment.title}" saved as template!`);
      } else {
        toast.error('Save completed, but no template ID was returned.');
      }
    } catch (err: any) {
      console.error('Save as template error:', err);
      // Specifically handle the duplicate error from backend
      if (err.message?.includes('already saved as a template')) {
        toast.error('This document is already saved as a template.');
      } else if (err.message?.toLowerCase().includes('load failed') || err.message?.toLowerCase().includes('failed to fetch')) {
        // If the request was aborted but the backend processed it (common in some browsers)
        toast.success(`"${assignment.title}" saved as template!`);
      } else {
        toast.error(`Template Save Error: ${err.message || 'Unknown issue'}`);
      }
    }
  }, [user, assignment, editor, sections, activeSectionId, id]);

  const handleSave = useCallback(async () => {
    if (!editor || !user || !id || !assignment) return;
    setSaving(true);
    try {
      const currentContent = editor.getHTML();
      if (id === 'new') {
        const saveFunc = isPersonal ? createEditorDocument : createDocument;
        const doc = await saveFunc(
          user.uid,
          assignment.title || 'Untitled Document',
          currentContent,
          assignment.topic,
          assignment.description,
          assignment.tone,
          'blank'
        );
        if (doc && doc.id) {
          const targetPath = isPersonal ? `/editor/personal/${doc.id}` : `/editor/${doc.id}`;
          navigate(targetPath, { replace: true });
          toast.success('Document created!');
        }
      } else {
        const updateFunc = isPersonal ? updateEditorDocument : updateDocument;
        await updateFunc(user.uid, id, {
          title: assignment.title,
          content: currentContent,
          pageSettings: pageSettings,
          is_manual_save: true,
          version_name: `Saved Version ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
        });
        toast.success('Saved successfully');
      }
    } catch (err) {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }, [editor, user, id, assignment, pageSettings, isPersonal, navigate]);

  const loadVersions = useCallback(async () => {
    if (!user || !id || id === 'new') return;
    setLoadingVersions(true);
    try {
      const vers = await getDocumentVersions(user.uid, id);
      setVersions(vers || []);
    } catch (err) {
      console.error('Failed to load versions', err);
      toast.error('Failed to load version history');
    } finally {
      setLoadingVersions(false);
    }
  }, [user, id]);

  useEffect(() => {
    if (isVersionHistoryOpen) {
      loadVersions();
    }
  }, [isVersionHistoryOpen, loadVersions]);

  const handleRestoreVersion = useCallback(async (version: any) => {
    if (!editor || !version.content) return;
    try {
      // 1. Update the editor content
      editor.commands.setContent(version.content);
      
      // 2. If it's the only section, update it
      if (sections.length > 0) {
        setSections(prev => {
          const newSections = [...prev];
          const defaultSec = newSections.find(s => s.id === 'default') || newSections[0];
          if (defaultSec) {
            defaultSec.content = version.content;
          }
          return newSections;
        });
      }

      // 3. Save it to trigger a new version and update DB
      await handleSave();
      
      toast.success('Version restored successfully!');
      setIsVersionHistoryOpen(false);
    } catch (err) {
      console.error('Failed to restore version', err);
      toast.error('Failed to restore version');
    }
  }, [editor, sections, handleSave]);

  const handleRenameVersion = async (versionId: number) => {
    if (!user || !id) return;
    try {
      await renameDocumentVersion(user.uid, id, versionId, editVersionName);
      toast.success('Version renamed');
      setEditingVersionId(null);
      loadVersions();
    } catch (err) {
      toast.error('Failed to rename version');
    }
  };

  const handleDeleteVersion = async (versionId: number) => {
    if (!user || !id) return;
    if (!window.confirm('Are you sure you want to delete this version? This will save memory but cannot be undone.')) return;
    try {
      await deleteDocumentVersion(user.uid, id, versionId);
      toast.success('Version deleted');
      loadVersions();
    } catch (err) {
      toast.error('Failed to delete version');
    }
  };

  const handleExternalShare = async () => {
    if (!assignment || !editor) return;

    try {
      toast.loading('Preparing PDF for sharing...', { id: 'share-loading' });
      
      const fullContent = sections.map(s => `<h2>${s.title}</h2>${s.content}`).join('\n');
      const tempEditor = new Editor({
        extensions: [StarterKit, Underline, TextAlign, TextStyle, FontFamily, Color, Highlight, Subscript, Superscript, CodeBlockLowlight.configure({ lowlight })],
        content: fullContent
      });
      const json = tempEditor.getJSON();

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(assignment.title || 'Untitled Document', 20, 20);
      doc.setFontSize(12);

      let y = 40;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - 2 * margin;

      const renderNode = (node: any) => {
        if (node.type === 'text') {
          const isBold = node.marks?.some((m: any) => m.type === 'bold');
          doc.setFont('helvetica', isBold ? 'bold' : 'normal');
          const lines = doc.splitTextToSize(node.text, contentWidth);
          
          if (y + (lines.length * 7) > 280) {
            doc.addPage();
            y = 20;
          }
          
          doc.text(lines, margin, y);
          y += lines.length * 7;
        } else if (node.content) {
          node.content.forEach(renderNode);
        }
        if (node.type === 'paragraph' || node.type === 'heading') {
          y += 5;
        }
      };

      json.content?.forEach(renderNode);
      const pdfOutput = doc.output('blob');
      const fileName = `${(assignment.title || 'Document').replace(/\s+/g, '_')}.pdf`;
      const file = new File([pdfOutput], fileName, { type: 'application/pdf' });

      tempEditor.destroy();
      toast.dismiss('share-loading');

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
          });
          toast.success('PDF Shared successfully!');
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            toast.error('Sharing failed: ' + err.message);
          }
        }
      } else {
        // Fallback for browsers that don't support file sharing but do support text share
        const shareData = {
          title: assignment.title || 'Untitled Document',
          text: `Check out this document: ${assignment.title}`,
          url: window.location.href,
        };
        
        if (navigator.share) {
          await navigator.share(shareData);
          toast.success('Link shared (PDF sharing not supported on this browser)');
        } else {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Share link copied to clipboard');
        }
      }
    } catch (err: any) {
      toast.dismiss('share-loading');
      toast.error('Failed to prepare document: ' + err.message);
    }
    setIsShareModalOpen(false);
  };

  const handleInternalShare = async () => {
    if (!id || id === 'new') return;
    setIsGeneratingShareCode(true);
    try {
      const code = await generateShareCode(id);
      setShareCode(code);
    } catch (err) {
      toast.error('Failed to generate share code');
    } finally {
      setIsGeneratingShareCode(false);
    }
  };

  const handleEmailDocument = async () => {
    if (!assignment || !editor) return;
    try {
      toast.loading('Preparing PDF...', { id: 'email-loading' });

      const fullContent = sections.map(s => `<h2>${s.title}</h2>${s.content}`).join('\n');
      const tempEditor = new Editor({
        extensions: [StarterKit, Underline, TextAlign, TextStyle, FontFamily, Color, Highlight, Subscript, Superscript, CodeBlockLowlight.configure({ lowlight })],
        content: fullContent
      });
      const json = tempEditor.getJSON();

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text(assignment.title || 'Untitled Document', 20, 20);
      doc.setFontSize(12);

      let y = 40;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - 2 * margin;

      const renderNode = (node: any) => {
        if (node.type === 'text') {
          const isBold = node.marks?.some((m: any) => m.type === 'bold');
          doc.setFont('helvetica', isBold ? 'bold' : 'normal');
          const lines = doc.splitTextToSize(node.text, contentWidth);
          if (y + lines.length * 7 > 280) { doc.addPage(); y = 20; }
          doc.text(lines, margin, y);
          y += lines.length * 7;
        } else if (node.content) {
          node.content.forEach(renderNode);
        }
        if (node.type === 'paragraph' || node.type === 'heading') y += 5;
      };

      json.content?.forEach(renderNode);
      const fileName = `${(assignment.title || 'Document').replace(/\s+/g, '_')}.pdf`;
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      tempEditor.destroy();
      toast.dismiss('email-loading');

      // Use Web Share API — user picks Mail from system share sheet, PDF is directly attached
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          toast.success('Select Mail to send the PDF!');
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            // Fallback: open mailto and save the file
            doc.save(fileName);
            const subject = encodeURIComponent(`Document: ${assignment.title}`);
            const body = encodeURIComponent(`Hi,\n\nPlease find the attached document "${assignment.title}".\n\nShared via Doxio.`);
            window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
            toast.success('PDF saved — attach it to the email that opened.', { duration: 5000 });
          }
        }
      } else {
        // Browser doesn't support file sharing — fallback to mailto
        const subject = encodeURIComponent(`Document: ${assignment.title}`);
        const body = encodeURIComponent(`Hi,\n\nPlease find the attached document "${assignment.title}".\n\nShared via Doxio.`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        toast.success('Mail opened (PDF file sharing not supported on this browser).', { duration: 4000 });
      }
    } catch (err: any) {
      toast.dismiss('email-loading');
      toast.error('Failed to prepare email: ' + err.message);
    }
  };

  if (!assignment) return <div className="h-screen flex items-center justify-center bg-[var(--bg-app)]"><RefreshCw className="animate-spin text-[var(--text-muted)]" /></div>;

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-app)] overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <Aurora
          colorStops={['var(--bg-app)', 'var(--bg-card)', 'var(--bg-app)']}
          speed={0.1}
          amplitude={0.5}
        />
      </div>


      {/* 1st Line: Global Menu Bar (Fixed Full Width) */}
      <div className="shrink-0 z-40 bg-white">
        <EditorToolbar
          editor={editor}
          mode="menu"
          isReadOnly={assignment?.permission === 'view'}
          title={assignment?.title}
          onTitleChange={assignment?.permission === 'view' ? undefined : (newTitle) => {
            setAssignment(prev => prev ? { ...prev, title: newTitle } : null);
            if (id && id !== 'new') {
              const updateFunc = isPersonal ? updateEditorDocument : updateDocument;
              updateFunc(user!.uid, id, {
                title: newTitle,
                pageSettings: pageSettings
              }).catch(console.error);
            }
          }}
          isSaving={saving}
          onBack={() => navigate(isPersonal ? '/editor' : '/documents')}
          onPageSetup={() => setIsPageSetupOpen(true)}
          onApplySettings={applyDocumentSettings}
          currentSettings={pageSettings}
          onInsertDiagram={() => setIsDiagramOpen(true)}
          onToggleRightPanel={assignment?.permission === 'view' ? undefined : () => setIsRightPanelOpen(!isRightPanelOpen)}
          isRightPanelOpen={isRightPanelOpen}
          onExportPDF={() => handleExport('pdf')}
          onExportDOCX={() => handleExport('docx')}
          onSaveAsTemplate={assignment?.permission === 'view' ? undefined : handleSaveAsTemplate}
          onSave={assignment?.permission === 'view' ? undefined : handleSave}
          onOpenCompiler={() => setCompilerWindowState('open')}
          onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
          onInternalShare={() => setIsShareModalOpen(true)}
          onExternalShare={handleExternalShare}
          onEmailDocument={handleEmailDocument}
          compilerState={compilerWindowState}
          user={user}
        />
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 bg-[var(--text-main)]/[0.02] pointer-events-none" />
          <div className="flex-1 relative overflow-hidden">
            <DocumentEditor
              editor={editor}
              isPaginated={true}
              zoom={zoom}
              onZoomChange={setZoom}
              onAiAction={handleAiAction}
              onPageSetup={() => setIsPageSetupOpen(true)}
              onApplySettings={applyDocumentSettings}
              currentSettings={pageSettings}
              onInsertDiagram={() => setIsDiagramOpen(true)}
              onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
              isRightPanelOpen={isRightPanelOpen}
              onExportPDF={() => handleExport('pdf')}
              onExportDOCX={() => handleExport('docx')}
              onSaveAsTemplate={handleSaveAsTemplate}
              onFindReplace={() => setIsFindReplaceOpen(true)}
              onUploadDocument={handleUpload}
              userId={user?.uid}
              docId={id}
              title={assignment?.title}
              isSaving={saving}
              onTitleChange={(newTitle) => setAssignment(prev => prev ? { ...prev, title: newTitle } : null)}
              onOpenCompiler={() => setCompilerWindowState('open')}
              compilerState={compilerWindowState}
              toolbarMode={assignment?.permission === 'view' ? 'none' : 'controls'}
            />
          </div>

          <EditorStatusBar
            wordCount={wordCount}
            charCount={charCount}
            pageCount={Math.ceil(charCount / 3000) || 1}
            currentPage={1}
            zoom={zoom}
            onZoomChange={setZoom}
            isSaving={isAutoSaving}
            lastSaved={lastAutoSaved}
          />

          {/* ── Modals ─────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isPageSetupOpen && (
              <PageSetupModal
                onClose={() => setIsPageSetupOpen(false)}
                initialSettings={pageSettings}
                onApply={(settings) => {
                  applyDocumentSettings(settings);
                  setIsPageSetupOpen(false);
                  toast.success('Document layout updated');
                }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isDiagramOpen && (
              <DiagramModal
                onClose={() => setIsDiagramOpen(false)}
                onGenerate={(prompt, type, caption) => {
                  setIsDiagramOpen(false);
                  toast.loading("Generating diagram...", { duration: 2000 });
                  setTimeout(() => {
                    toast.success("Diagram generated and inserted!");
                    editor?.chain().focus().insertContent(`<p><strong>Diagram: ${type}</strong><br/><em>${caption || prompt}</em></p><div class="my-6 p-12 bg-stone-50 border-2 border-dashed border-stone-200 rounded-[2rem] text-center text-stone-400 flex flex-col items-center gap-4"><div class="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-stone-400"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg></div><span class="font-bold text-xs tracking-[0.2em] text-stone-400 uppercase">Visualizing ${type}...</span></div>`).run();
                  }, 2000);
                }}
              />
            )}
          </AnimatePresence>

          {/* ── Find & Replace Modal ──────────────────────────────────────── */}
          <AnimatePresence>
            {isFindReplaceOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[var(--bg-card)] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-[var(--border-main)]"
                >
                  <div className="p-6 border-b border-[var(--border-main)] flex items-center justify-between">
                    <h3 className="font-bold text-[var(--text-main)]">Find and Replace</h3>
                    <button onClick={() => setIsFindReplaceOpen(false)} className="p-2 hover:bg-[var(--bg-app)] rounded-full transition-colors">
                      <X size={20} className="text-[var(--text-muted)]" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Find</label>
                      <input
                        value={findText}
                        onChange={(e) => setFindText(e.target.value)}
                        className="w-full p-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl outline-none font-bold text-sm text-[var(--text-main)]"
                        placeholder="Text to find..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Replace with</label>
                      <input
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        className="w-full p-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl outline-none font-bold text-sm text-[var(--text-main)]"
                        placeholder="Replacement text..."
                      />
                    </div>
                  </div>
                  <div className="p-6 bg-[var(--bg-app)] flex gap-4">
                    <button onClick={() => handleFindReplace(false)} className="flex-1 py-3 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl font-bold text-sm hover:bg-[var(--bg-app)] transition-colors text-[var(--text-main)]">Find Next</button>
                    <button onClick={() => handleFindReplace(true)} className="flex-1 py-3 bg-[var(--accent-main)] text-[var(--bg-card)] rounded-xl font-bold text-sm hover:opacity-90 transition-colors shadow-lg">Replace</button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>


        {assignment?.permission !== 'view' && (
          <motion.div
            initial={isMobile ? { y: '100%' } : { width: 0, opacity: 0 }}
            animate={isMobile
              ? (isRightPanelOpen ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 })
              : { width: isRightPanelOpen ? 350 : 0, opacity: 1 }
            }
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={clsx(
              "bg-white/80 backdrop-blur-xl z-30 relative",
              isMobile
                ? "fixed inset-x-0 bottom-0 h-[80vh] border-t border-stone-200 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]"
                : "h-full shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.03)]"
            )}
            style={{ overflow: 'visible' }}
          >
            {isMobile && isRightPanelOpen && (
              <div className="flex justify-center p-4">
                <div className="w-12 h-1.5 bg-stone-200 rounded-full" onClick={() => setIsRightPanelOpen(false)} />
              </div>
            )}
            <RightPanel
              editor={editor}
              isOpen={isRightPanelOpen}
              setIsOpen={setIsRightPanelOpen}
              activeTab={rightPanelTab}
              onTabChange={setRightPanelTab}
              aiLoading={aiLoading}
              onAiAction={handleAiAction}
              qualityReport={qualityReport}
              onCheckQuality={() => handleAiAction('check_quality')}
              notes={notes}
              onUpdateNotes={setNotes}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </div>
      {compilerWindowState !== 'closed' && (
        <CompilerThemeWrapper
          user={user}
          profile={profile}
          refreshProfile={refreshProfile}
          onClose={() => setCompilerWindowState('closed')}
          onMinimize={() => setCompilerWindowState('minimized')}
          isMinimized={compilerWindowState === 'minimized'}
        />
      )}

      {/* Version History Modal */}
      <AnimatePresence>
        {isVersionHistoryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--text-main)]/20 backdrop-blur-sm"
              onClick={() => setIsVersionHistoryOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
            >
              <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-app)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--accent-main)]/10 text-[var(--accent-main)] rounded-lg">
                    <History size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-[var(--text-main)]">Version History</h2>
                    <p className="text-xs text-[var(--text-muted)]">Restore previous versions of this document</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVersionHistoryOpen(false)}
                  className="p-2 text-[var(--text-muted)] hover:bg-[var(--border-main)] rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-app)]">
                {loadingVersions ? (
                  <div className="flex justify-center items-center h-32">
                    <RefreshCw className="animate-spin text-[var(--text-muted)]" size={24} />
                  </div>
                ) : versions.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="mx-auto text-[var(--text-muted)] opacity-50 mb-3" size={48} />
                    <p className="text-[var(--text-muted)] font-medium">No version history available</p>
                    <p className="text-xs text-[var(--text-muted)] opacity-70 mt-1">Save the document to create versions.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {versions.map((version, idx) => (
                      <div key={version.id} className="flex items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl hover:shadow-md transition-shadow group">
                        <div className="flex-1 mr-4">
                          {editingVersionId === version.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editVersionName}
                                onChange={(e) => setEditVersionName(e.target.value)}
                                className="flex-1 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-2 py-1 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent-main)]"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRenameVersion(version.id);
                                  if (e.key === 'Escape') setEditingVersionId(null);
                                }}
                              />
                              <button
                                onClick={() => handleRenameVersion(version.id)}
                                className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => setEditingVersionId(null)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-[var(--text-main)] text-sm">
                                {version.name || (idx === 0 ? 'Current Version' : `Version ${versions.length - idx}`)}
                              </p>
                              <button
                                onClick={() => {
                                  setEditingVersionId(version.id);
                                  setEditVersionName(version.name || (idx === 0 ? 'Current Version' : `Version ${versions.length - idx}`));
                                }}
                                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Rename version"
                              >
                                <Edit2 size={12} />
                              </button>
                            </div>
                          )}
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {new Date(version.created_at || new Date()).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {idx !== 0 && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRestoreVersion(version)}
                                className="px-4 py-2 text-xs font-bold bg-[var(--accent-main)] text-[var(--bg-card)] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:shadow"
                              >
                                Restore
                              </button>
                              <button
                                onClick={() => handleDeleteVersion(version.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:shadow"
                                title="Delete version"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                          {idx === 0 && (
                            <span className="text-xs font-bold text-[var(--accent-main)] bg-[var(--accent-main)]/10 px-3 py-1 rounded-full">Active</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
              onClick={() => setIsShareModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[460px] bg-white border border-stone-200 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-7 pt-7 pb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-[28px] font-[950] text-stone-900 tracking-tight leading-none">Share Document</h2>
                  <p className="text-xs font-semibold text-stone-400 mt-2">Configure access layers for your peers</p>
                </div>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-7 flex border-b border-stone-100">
                <button
                  onClick={() => setShareTab('link')}
                  className={clsx(
                    "flex-1 py-4 text-[13px] font-black transition-all border-b-[2.5px] tracking-wide",
                    shareTab === 'link' ? "border-stone-900 text-stone-900" : "border-transparent text-stone-300 hover:text-stone-400"
                  )}
                >
                  Share Link
                </button>
                <button
                  onClick={() => setShareTab('access')}
                  className={clsx(
                    "flex-1 py-4 text-[13px] font-black transition-all border-b-[2.5px] tracking-wide",
                    shareTab === 'access' ? "border-stone-900 text-stone-900" : "border-transparent text-stone-300 hover:text-stone-400"
                  )}
                >
                  Manage Access (1)
                </button>
              </div>

              <div className="p-7 space-y-5">
                {shareTab === 'link' && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    {!shareCode ? (
                      <div className="flex flex-col items-center justify-center py-12 bg-stone-50 rounded-[2rem] border border-stone-200 border-dashed">
                         <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-stone-400 mb-4">
                           <Globe size={32} />
                         </div>
                         <h4 className="font-bold text-stone-900">No share code generated</h4>
                         <p className="text-xs text-stone-500 mt-1 mb-6 text-center px-8">Generate a secure code to share this document with your peers.</p>
                         <button
                           onClick={handleInternalShare}
                           disabled={isGeneratingShareCode}
                           className="px-8 py-3 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                         >
                           {isGeneratingShareCode ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                           Generate Access Code
                         </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="relative">
                           <p className="text-[10px] font-[800] text-stone-400 uppercase tracking-[0.1em] mb-3 flex items-center justify-between">
                             SECURE ACCESS CODE
                             <span className="bg-[#f5f5f4] text-stone-500 px-2 py-0.5 rounded-lg text-[8px] font-bold lowercase">view-only access</span>
                           </p>
                           <div className="flex items-center gap-3 p-4 bg-[#fafaf9] border border-stone-100 rounded-[1.5rem] group hover:border-stone-200 transition-all shadow-sm">
                              <div className="flex-1 text-[26px] font-[900] text-stone-900 tracking-[0.4em] pl-4 uppercase">
                                {shareCode.split('').join('')}
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(shareCode);
                                  toast.success('Code copied');
                                }}
                                className="px-6 py-4 bg-[#1c1917] text-white rounded-[1rem] text-[10px] font-[900] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-md active:scale-95"
                              >
                                COPY
                              </button>
                           </div>
                        </div>

                         <div className="grid grid-cols-2 gap-3">
                           <button
                             onClick={() => setShareRole('viewer')}
                             className={clsx(
                               "flex items-center justify-center gap-2 py-5 rounded-[1.5rem] border transition-all font-black text-[13px] tracking-tight shadow-sm",
                               shareRole === 'viewer' ? "bg-white border-stone-200 shadow-xl text-stone-900" : "bg-[#fafaf9] border-transparent text-stone-300 hover:text-stone-400"
                             )}
                           >
                             <Eye size={18} strokeWidth={2.5} /> Viewer
                           </button>
                           <button
                             onClick={() => setShareRole('editor')}
                             className={clsx(
                               "flex items-center justify-center gap-2 py-5 rounded-[1.5rem] border transition-all font-black text-[13px] tracking-tight shadow-sm",
                               shareRole === 'editor' ? "bg-white border-stone-200 shadow-xl text-stone-900" : "bg-[#fafaf9] border-transparent text-stone-300 hover:text-stone-400"
                             )}
                           >
                             <Edit2 size={16} strokeWidth={2.5} /> Editor
                           </button>
                        </div>

                        <div className="space-y-3">
                           <p className="text-[10px] font-[800] text-stone-400 uppercase tracking-[0.1em]">MAIL OR USER ID</p>
                           <div className="relative group">
                              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors">
                                <MailIcon size={18} strokeWidth={2} />
                              </div>
                              <input
                                type="text"
                                placeholder="peer@institution.edu"
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                                className="w-full bg-[#fafaf9] border border-stone-100 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-semibold text-stone-900 outline-none focus:border-stone-900 focus:bg-white transition-all shadow-sm placeholder:text-stone-200"
                              />
                           </div>
                        </div>

                        <button
                          onClick={() => {
                            if (!shareEmail) return toast.error('Please enter an email');
                            toast.success(`Invitation sent to ${shareEmail}`);
                            setShareEmail("");
                          }}
                          className="w-full py-5 bg-[#d6d3d1] text-white rounded-[1.5rem] font-[900] text-[17px] flex items-center justify-center gap-3 shadow-sm hover:bg-[#1c1917] transition-all group active:scale-95"
                        >
                          <Send size={22} strokeWidth={2.5} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          Send Scholarly Invitation
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {shareTab === 'access' && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between p-5 bg-stone-50 rounded-2xl border border-stone-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-stone-900 shadow-sm border border-stone-100">
                           <User size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-stone-900">You (Owner)</p>
                          <p className="text-xs text-stone-500">nithin@doxio.edu</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-stone-400 uppercase bg-stone-200/50 px-3 py-1 rounded-full">Full Access</span>
                    </div>
                    <div className="text-center py-8">
                       <p className="text-xs text-stone-400 font-medium italic">No other peers have access to this document yet.</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditorPage;
