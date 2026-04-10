import React, { useState } from 'react';
import { updateDocument, createDocument } from '../../../shared/services/db';
import { EditorContent, Editor, BubbleMenu } from '@tiptap/react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  Sparkles,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Table as TableIcon,
  Trash2,
  Plus,
  Minus,
  Columns,
  Rows,
  Zap
} from 'lucide-react';
import EditorToolbar from './EditorToolbar';

interface DocumentEditorProps {
  editor: Editor | null;
  isPaginated?: boolean;
  zoom?: number;
  onZoomChange?: (newZoom: number) => void;
  onAiAction?: (task: any) => void;
  onPageSetup?: () => void;
  onInsertDiagram?: () => void;
  onToggleRightPanel?: () => void;
  isRightPanelOpen?: boolean;
  onExportPDF?: () => void;
  onExportDOCX?: () => void;
  onSaveAsTemplate?: () => void;
  onFindReplace?: () => void;
  userId?: string;
  docId?: string;
  title?: string;
  onTitleChange?: (newTitle: string) => void;
  toolbarMode?: 'full' | 'menu' | 'controls';
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({
  editor,
  isPaginated = true,
  zoom = 100,
  onZoomChange,
  onAiAction,
  onPageSetup,
  onInsertDiagram,
  onToggleRightPanel,
  isRightPanelOpen,
  onExportPDF,
  onExportDOCX,
  onSaveAsTemplate,
  onFindReplace,
  userId,
  docId,
  title = "Untitled",
  onTitleChange,
  toolbarMode = 'full'
}) => {
  const [isAiInputOpen, setIsAiInputOpen] = React.useState(false);
  const [customPrompt, setCustomPrompt] = React.useState('');
  const [content, setContent] = useState("");

  if (!editor) return null;

  const handleSave = async () => {
    if (!editor || !userId) return;
    
    const editorContent = editor.getHTML();
    setContent(editorContent);
    
    try {
      console.log('Saving document...', { title, content: editorContent });
      if (docId) {
        await updateDocument(userId, docId, {
          title,
          content: editorContent
        });
        console.log('Document updated successfully');
      } else {
        const result = await createDocument(userId, title, editorContent);
        console.log('Document created successfully, ID:', result.id);
      }
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  // Handle Ctrl + Scroll for zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey && onZoomChange) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -5 : 5;
      const newZoom = Math.min(Math.max(zoom + delta, 50), 200);
      onZoomChange(newZoom);
    }
  };

  const BubbleButton = ({ onClick, isActive = false, children, title }: any) => (
    <button
      onClick={onClick}
      title={title}
      className={clsx(
        "p-1.5 rounded transition-all",
        isActive ? "bg-[var(--text-main)] text-[var(--bg-card)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-app)]"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full">
      <EditorToolbar 
        editor={editor}
        mode={toolbarMode}
        onSave={handleSave}
        onPageSetup={onPageSetup}
        onInsertDiagram={onInsertDiagram}
        onToggleRightPanel={onToggleRightPanel}
        isRightPanelOpen={isRightPanelOpen}
        onExportPDF={onExportPDF}
        onExportDOCX={onExportDOCX}
        onSaveAsTemplate={onSaveAsTemplate}
        onFindReplace={onFindReplace}
      />
      
      <div
        onWheel={handleWheel}
        className={clsx(
          "flex-1 overflow-y-auto bg-[var(--bg-app)] p-4 sm:p-8 md:p-12 no-scrollbar relative flex flex-col items-center",
          isPaginated ? "paginated-mode" : "standard-mode"
        )}
      >
        {editor && (
          <>
            {/* Text Bubble Menu - Responsive considerations */}
            <BubbleMenu
              editor={editor}
              shouldShow={({ from, to }) => {
                return !editor.isActive('table') && !editor.isActive('image') && from !== to;
              }}
              tippyOptions={{
                duration: 100,
                maxWidth: window.innerWidth < 640 ? 280 : 350
              }}
              className="flex items-center gap-0.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg shadow-xl p-1 z-50 overflow-x-auto max-w-[90vw] sm:max-w-none"
            >
              <BubbleButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
              >
                <Bold size={14} />
              </BubbleButton>
              <BubbleButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
              >
                <Italic size={14} />
              </BubbleButton>
              <BubbleButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline"
              >
                <UnderlineIcon size={14} />
              </BubbleButton>
              <div className="w-px h-4 bg-[var(--border-main)] mx-1 shrink-0" />
              <BubbleButton
                onClick={() => {
                  const url = window.prompt('Enter URL');
                  if (url) editor.chain().focus().setLink({ href: url }).run();
                }}
                isActive={editor.isActive('link')}
                title="Link"
              >
                <LinkIcon size={14} />
              </BubbleButton>
              <div className="w-px h-4 bg-[var(--border-main)] mx-1 shrink-0" />
              <BubbleButton
                onClick={() => onAiAction?.('improve')}
                title="AI Improve"
              >
                <Sparkles size={14} className="text-amber-500" />
              </BubbleButton>
              <BubbleButton
                onClick={() => onAiAction?.('summarize')}
                title="AI Summarize"
              >
                <Zap size={14} className="text-indigo-500" />
              </BubbleButton>
              <div className="w-px h-4 bg-[var(--border-main)] mx-1 shrink-0" />
              <div className="flex items-center">
                <AnimatePresence>
                  {isAiInputOpen ? (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: window.innerWidth < 640 ? 120 : 200, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="flex items-center overflow-hidden"
                    >
                      <input
                        autoFocus
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customPrompt.trim()) {
                            onAiAction?.({ id: 'custom', prompt: customPrompt });
                            setIsAiInputOpen(false);
                            setCustomPrompt('');
                          }
                        }}
                        placeholder="Ask AI..."
                        className="bg-[var(--bg-app)] border-none outline-none text-xs px-2 py-1 w-full placeholder:text-[var(--text-muted)]/50 text-[var(--text-main)]"
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                <BubbleButton
                  onClick={() => setIsAiInputOpen(!isAiInputOpen)}
                  isActive={isAiInputOpen}
                  title="Custom AI Action"
                >
                  <Sparkles size={14} className="text-[var(--text-main)]" />
                </BubbleButton>
              </div>
            </BubbleMenu>

            {/* Table Bubble Menu */}
            <BubbleMenu
              editor={editor}
              shouldShow={() => editor.isActive('table')}
              tippyOptions={{ duration: 100 }}
              className="flex items-center gap-0.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-lg shadow-xl p-1 z-50 overflow-x-auto max-w-[90vw] sm:max-w-none"
            >
              <BubbleButton onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add Column Before">
                <Plus size={14} className="rotate-90" />
              </BubbleButton>
              <BubbleButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column After">
                <Plus size={14} className="-rotate-90" />
              </BubbleButton>
              <BubbleButton onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column">
                <Trash2 size={14} className="text-red-500" />
              </BubbleButton>
              <div className="w-px h-4 bg-[var(--border-main)] mx-1 shrink-0" />
              <BubbleButton onClick={() => editor.chain().focus().addRowBefore().run()} title="Add Row Before">
                <Plus size={14} />
              </BubbleButton>
              <BubbleButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row After">
                <Plus size={14} className="rotate-180" />
              </BubbleButton>
              <BubbleButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row">
                <Trash2 size={14} className="text-red-500" />
              </BubbleButton>
              <div className="w-px h-4 bg-[var(--border-main)] mx-1 shrink-0" />
              <BubbleButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">
                <TableIcon size={14} className="text-red-500" />
              </BubbleButton>
            </BubbleMenu>
          </>
        )}

        <motion.div
          initial={false}
          animate={{
            scale: zoom / 100,
            opacity: 1,
            y: 0
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ transformOrigin: 'top center' }}
          className="w-full max-w-[210mm] page-container relative"
        >
          <EditorContent
            editor={editor}
            className="bg-white shadow-2xl min-h-[297mm] relative z-10 w-full"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentEditor;
