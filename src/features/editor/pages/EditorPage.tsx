import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  BookmarkPlus,
  Menu,
  X,
  RefreshCw,
  Sparkles,
  Clock,
  Trash2,
  Eye,
  Zap
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
  updateDocument,
  saveAsTemplate,
  Document as Assignment,
  DocumentSection
} from '../../../shared/services/db';
import { performTask, TaskType, AcademicTone } from '../../../shared/services/ai';
import DocumentEditor from '../components/DocumentEditor';
import EditorSidebar from '../components/EditorSidebar';
import EditorStatusBar from '../components/EditorStatusBar';
import RightPanel, { TabType } from '../components/RightPanel';
import Aurora from '../components/Aurora';

// Custom bubble menu extension (referenced in App.tsx as BubbleMenuExtension)
// Assuming it's the standard one or defined similarly
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';

// Custom Font Size extension (referenced in App.tsx)
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize.replace('px', ''),
        renderHTML: attributes => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}px` }
        },
      },
    }
  },
})

// Custom Line Height extension (referenced in App.tsx)
const LineHeight = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      lineHeight: {
        default: null,
        parseHTML: element => element.style.lineHeight,
        renderHTML: attributes => {
          if (!attributes.lineHeight) return {}
          return { style: `line-height: ${attributes.lineHeight}` }
        },
      },
    }
  },
})

// Custom Indent extension (referenced in App.tsx)
const Indent = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      marginRight: {
        default: null,
        parseHTML: element => element.style.marginRight,
        renderHTML: attributes => {
          if (!attributes.marginRight) return {}
          return { style: `margin-right: ${attributes.marginRight}` }
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
    }
  },
})

const EditorPage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(!isMobile && !isTablet);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(!isMobile && !isTablet);

  useEffect(() => {
    if (isMobile || isTablet) {
      setIsLeftSidebarOpen(false);
      setIsRightPanelOpen(false);
    } else {
      setIsLeftSidebarOpen(true);
      setIsRightPanelOpen(true);
    }
  }, [isMobile, isTablet]);

  const [isPageSetupOpen, setIsPageSetupOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const [rightPanelTab, setRightPanelTab] = useState<TabType>('ai');
  const [qualityReport, setQualityReport] = useState<string | null>(null);
  const [plagiarismReport, setPlagiarismReport] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [notes, setNotes] = useState("");
  const [zoom, setZoom] = useState(100);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      Indent,
      LineHeight,
      Subscript,
      Superscript,
      BubbleMenuExtension,
      Image,
      TiptapLink.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Typography,
      CharacterCount,
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
        spellcheck: 'true',
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
    getDocument(user.uid, id).then((data) => {
      if (data) {
        setAssignment(data as Assignment);

        const docSections = data.sections || [];
        if (docSections.length === 0) {
          const defaultSection: DocumentSection = {
            id: 'default',
            title: 'Introduction',
            content: data.content || ''
          };
          setSections([defaultSection]);
          setActiveSectionId('default');
          editor.commands.setContent(defaultSection.content);
        } else {
          setSections(docSections);
          setActiveSectionId(docSections[0].id);
          editor.commands.setContent(docSections[0].content);
        }

        setWordCount(editor.getText().split(/\s+/).filter(x => x).length || 0);
        setCharCount(editor.getText().length || 0);
      } else {
        toast.error('Document not found');
        navigate('/documents');
      }
    }).catch((err) => {
      console.error('Failed to load document:', err);
    });
  }, [user, id, editor]);

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
        docId: Number(id)
      });

      if (res && res.id) {
        toast.success('Document saved as template!');
      } else {
        throw new Error('Save failed — no ID returned');
      }
    } catch (err: any) {
      console.error('Save as template error:', err);
      toast.error(err.message || 'Failed to save as template');
    }
  }, [user, assignment, editor, sections, activeSectionId, id]);

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

      <header className="h-16 border-b border-[var(--border-main)] flex items-center justify-between px-4 md:px-6 bg-[var(--bg-card)]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/documents')}
            className="p-2 hover:bg-[var(--bg-app)] rounded-xl transition-all text-[var(--text-muted)] group shrink-0"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col min-w-0 flex-1">
            <input
              value={assignment.title}
              onChange={async (e) => {
                const newTitle = e.target.value;
                setAssignment(prev => prev ? { ...prev, title: newTitle } : null);
                updateDocument(user!.uid, id!, {
                  title: newTitle,
                }).catch(err => {
                  console.error("Failed to update title:", err);
                });
              }}
              className="font-bold text-[var(--text-main)] outline-none bg-transparent border-b border-transparent focus:border-[var(--border-main)] transition-all text-sm md:text-lg tracking-tight truncate"
            />
            <div className="flex items-center gap-2">
              <div className={clsx(
                "w-1.5 h-1.5 rounded-full transition-colors",
                saving ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              )} />
              <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)] truncate">
                {saving ? "Syncing..." : "Cloud Synced"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 ml-2">
          <div className="hidden sm:flex items-center bg-[var(--bg-app)] p-1 rounded-xl">
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-3 md:px-4 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold transition-all text-xs rounded-lg hover:bg-[var(--bg-card)] hover:shadow-sm"
            >
              <Download size={14} /> <span className="hidden md:inline">PDF</span>
            </button>
            <button
              onClick={() => handleExport('docx')}
              className="flex items-center gap-2 px-3 md:px-4 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold transition-all text-xs rounded-lg hover:bg-[var(--bg-card)] hover:shadow-sm"
            >
              <Download size={14} /> <span className="hidden md:inline">DOCX</span>
            </button>
          </div>

          <button
            onClick={handleSaveAsTemplate}
            className="flex items-center gap-2 px-3 md:px-5 py-2 bg-[var(--accent-main)] text-[var(--bg-card)] rounded-xl font-bold hover:opacity-90 transition-all text-xs shadow-lg shadow-[var(--accent-main)]/20"
          >
            <BookmarkPlus size={16} /> <span className="hidden md:inline">Save Template</span>
          </button>

          <button
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className={clsx(
              "lg:hidden p-2 rounded-xl transition-all",
              isLeftSidebarOpen ? "bg-[var(--accent-main)] text-[var(--bg-card)]" : "bg-[var(--bg-app)] text-[var(--text-muted)]"
            )}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        <EditorSidebar
          sections={sections}
          activeSectionId={activeSectionId}
          onSelectSection={(id) => {
            handleSelectSection(id);
            if (isMobile) setIsLeftSidebarOpen(false);
          }}
          onAddSection={handleAddSection}
          onDeleteSection={handleDeleteSection}
          onReorderSections={setSections}
          isOpen={isLeftSidebarOpen}
          setIsOpen={setIsLeftSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />

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
              onInsertDiagram={() => { }}
              onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
              isRightPanelOpen={isRightPanelOpen}
              onExportPDF={() => handleExport('pdf')}
              onExportDOCX={() => handleExport('docx')}
              onSaveAsTemplate={handleSaveAsTemplate}
              onFindReplace={() => setIsFindReplaceOpen(true)}
              userId={user?.uid}
              docId={id}
              title={assignment?.title}
              onTitleChange={(newTitle) => setAssignment(prev => prev ? { ...prev, title: newTitle } : null)}
            />
          </div>

          <EditorStatusBar
            wordCount={wordCount}
            charCount={charCount}
            pageCount={Math.ceil(charCount / 3000) || 1}
            zoom={zoom}
            onZoomChange={setZoom}
          />

          <button
            onClick={() => {
              setRightPanelTab('ai');
              setIsRightPanelOpen(true);
            }}
            className="md:hidden fixed bottom-14 right-6 w-14 h-14 bg-[var(--accent-main)] text-[var(--bg-card)] rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform"
          >
            <Sparkles size={24} />
          </button>

          <AnimatePresence>
            {isPageSetupOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[var(--bg-card)] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-[var(--border-main)]"
                >
                  <div className="p-6 border-b border-[var(--border-main)] flex items-center justify-between">
                    <h3 className="font-bold text-[var(--text-main)]">Page Setup</h3>
                    <button onClick={() => setIsPageSetupOpen(false)} className="p-2 hover:bg-[var(--bg-app)] rounded-full transition-colors">
                      <X size={20} className="text-[var(--text-muted)]" />
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Orientation</label>
                      <div className="flex gap-4">
                        <button className="flex-1 py-3 bg-[var(--accent-main)] text-[var(--bg-card)] rounded-xl font-bold text-sm">Portrait</button>
                        <button className="flex-1 py-3 bg-[var(--bg-app)] text-[var(--text-muted)] rounded-xl font-bold text-sm border border-[var(--border-main)]">Landscape</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Paper Size</label>
                      <select className="w-full p-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl outline-none font-bold text-sm text-[var(--text-main)]">
                        <option>A4 (210 x 297 mm)</option>
                        <option>Letter (8.5 x 11 in)</option>
                        <option>Legal (8.5 x 14 in)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Margins (inches)</label>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="number" defaultValue={1} className="p-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl outline-none font-bold text-sm text-[var(--text-main)]" placeholder="Top" />
                        <input type="number" defaultValue={1} className="p-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl outline-none font-bold text-sm text-[var(--text-main)]" placeholder="Bottom" />
                        <input type="number" defaultValue={1} className="p-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl outline-none font-bold text-sm text-[var(--text-main)]" placeholder="Left" />
                        <input type="number" defaultValue={1} className="p-3 bg-[var(--bg-app)] border border-[var(--border-main)] rounded-xl outline-none font-bold text-sm text-[var(--text-main)]" placeholder="Right" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-[var(--bg-app)] flex gap-4">
                    <button onClick={() => setIsPageSetupOpen(false)} className="flex-1 py-3 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl font-bold text-sm hover:bg-[var(--bg-app)] transition-colors text-[var(--text-main)]">Cancel</button>
                    <button onClick={() => { setIsPageSetupOpen(false); toast.success('Page setup applied'); }} className="flex-1 py-3 bg-[var(--accent-main)] text-[var(--bg-card)] rounded-xl font-bold text-sm hover:opacity-90 transition-colors shadow-lg">Apply</button>
                  </div>
                </motion.div>
              </div>
            )}

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

        <AnimatePresence mode="wait">
          {isRightPanelOpen && (
            <motion.div
              initial={isMobile ? { y: '100%' } : { x: 350, opacity: 0 }}
              animate={isMobile ? { y: 0 } : { x: 0, opacity: 1 }}
              exit={isMobile ? { y: '100%' } : { x: 350, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={clsx(
                "border-stone-200 bg-white/80 backdrop-blur-xl z-30",
                isMobile
                  ? "fixed inset-x-0 bottom-0 h-[80vh] border-t rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]"
                  : "w-[350px] border-l h-full"
              )}
            >
              {isMobile && (
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
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EditorPage;
