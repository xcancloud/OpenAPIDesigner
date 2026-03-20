import React, { useState, useRef } from 'react';
import { Eye, Edit3 } from 'lucide-react';
import { useI18n } from '../context/DesignerContext';
import { renderMarkdown } from '../utils/markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  /** Extra Tailwind classes applied to the outer wrapper */
  className?: string;
}

/**
 * A lightweight Markdown editor with an Edit / Preview toggle.
 * The edit pane is a plain <textarea>; the preview pane renders
 * the Markdown using the shared renderMarkdown() utility.
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = '',
}: MarkdownEditorProps) {
  const { t } = useI18n();
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const minHeight = `${rows * 1.6 + 0.75}em`;

  return (
    <div className={`border border-border rounded-lg overflow-hidden bg-background ${className}`}>
      {/* Tab bar */}
      <div className="flex items-center border-b border-border bg-muted/20">
        <button
          type="button"
          onClick={() => { setMode('edit'); setTimeout(() => textareaRef.current?.focus(), 0); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium transition-colors ${
            mode === 'edit'
              ? 'text-primary border-b-2 border-primary -mb-px bg-background'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          <Edit3 size={11} />
          {t.markdown.edit}
        </button>
        <button
          type="button"
          onClick={() => setMode('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium transition-colors ${
            mode === 'preview'
              ? 'text-primary border-b-2 border-primary -mb-px bg-background'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          <Eye size={11} />
          {t.markdown.preview}
        </button>
        <span className="ml-auto px-3 text-[10px] text-muted-foreground/60 select-none">Markdown</span>
      </div>

      {/* Content area */}
      {mode === 'edit' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{ minHeight }}
          className="w-full px-3 py-2 bg-background text-foreground text-[13px] focus:outline-none resize-none block"
        />
      ) : (
        <div
          className="px-3 py-2 text-[13px] text-foreground overflow-auto md-preview"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{
            __html: value
              ? renderMarkdown(value)
              : `<span class="text-muted-foreground italic text-[12px]">${t.markdown.noContent}</span>`,
          }}
        />
      )}
    </div>
  );
}
