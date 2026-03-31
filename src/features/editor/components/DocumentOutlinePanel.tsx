import React from 'react';
import { List, ChevronRight } from 'lucide-react';
import { Editor } from '@tiptap/react';
import clsx from 'clsx';

interface DocumentOutlinePanelProps {
  editor: Editor | null;
}

const DocumentOutlinePanel: React.FC<DocumentOutlinePanelProps> = ({ editor }) => {
  if (!editor) return null;

  const headings: { level: number; text: string; pos: number }[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      headings.push({ level: node.attrs.level, text: node.textContent, pos });
    }
  });

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)]">
      <div className="p-4 border-b border-[var(--border-main)] flex items-center gap-2 font-bold text-[var(--text-main)]">
        <List size={18} className="text-[var(--text-muted)]" />
        Outline
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1 no-scrollbar">
        {headings.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)] italic p-2">No headings found in this section.</div>
        ) : (
          headings.map((h, i) => (
            <button
              key={i}
              onClick={() => {
                editor.commands.focus();
                editor.commands.setTextSelection(h.pos);
                editor.commands.scrollIntoView();
              }}
              className={clsx(
                "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-2 group",
                h.level === 1 && "font-bold text-[var(--text-main)]",
                h.level === 2 && "pl-6",
                h.level === 3 && "pl-9"
              )}
            >
              <ChevronRight size={12} className="text-[var(--border-main)] group-hover:text-[var(--text-main)] transition-all" />
              <span className="truncate block">{h.text || "Untitled Heading"}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentOutlinePanel;
