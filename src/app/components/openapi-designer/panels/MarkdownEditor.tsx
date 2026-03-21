import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, Edit3 } from 'lucide-react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown as cmMarkdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useI18n } from '../context/DesignerContext';
import { renderMarkdown, initMarkdown } from '../utils/markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  /** Extra Tailwind classes applied to the outer wrapper */
  className?: string;
}

/** Reactively tracks the .dark class on <html> */
export function useDark(): boolean {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark')),
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

/**
 * Markdown editor with:
 * - CodeMirror 6 edit pane (GFM syntax highlighting, history, line-wrap)
 * - Preview pane: CommonMark/GFM via marked + KaTeX math + Shiki code + Mermaid diagrams
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = '',
}: MarkdownEditorProps) {
  const { t } = useI18n();
  const isDark = useDark();

  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [html, setHtml] = useState('');
  // Bumped when Shiki finishes loading → triggers preview re-render
  const [shikiGen, setShikiGen] = useState(0);

  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Stable Compartment for the dark-mode theme
  const themeCompt = useRef(new Compartment()).current;

  const minHeight = `${rows * 1.6 + 0.75}em`;

  // ── Init Shiki + marked (once) ──────────────────────────────────────────
  useEffect(() => {
    initMarkdown().then(() => setShikiGen(g => g + 1));
  }, []);

  // ── Create CodeMirror editor (once on mount) ─────────────────────────────
  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.lineWrapping,
          cmMarkdown(),
          ...(placeholder ? [cmPlaceholder(placeholder)] : []),
          themeCompt.of(isDark ? oneDark : []),
          EditorView.theme({
            '&': { fontSize: '13px' },
            '.cm-content': {
              padding: '6px 10px',
              minHeight,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              lineHeight: '1.6',
            },
            '&.cm-editor.cm-focused': { outline: 'none' },
            '.cm-scroller': { fontFamily: 'inherit' },
          }),
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: editorRef.current,
    });

    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reconfigure theme when dark mode changes ──────────────────────────────
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: themeCompt.reconfigure(isDark ? oneDark : []),
    });
  }, [isDark, themeCompt]);

  // ── Sync external value → editor (avoids infinite loop) ──────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  // ── Re-measure CM layout when switching back to edit mode ─────────────────
  const switchToEdit = useCallback(() => {
    setMode('edit');
    requestAnimationFrame(() => viewRef.current?.requestMeasure());
  }, []);

  // ── Render markdown preview ───────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'preview') return;
    setHtml(renderMarkdown(value, isDark));
  }, [mode, value, isDark, shikiGen]);

  // ── Render Mermaid diagrams after HTML is injected ────────────────────────
  useEffect(() => {
    if (!previewRef.current || !html) return;
    const nodes = previewRef.current.querySelectorAll<HTMLDivElement>('.md-mermaid');
    if (!nodes.length) return;

    import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
      });
      nodes.forEach(async el => {
        const code = el.getAttribute('data-code') ?? '';
        if (!code.trim()) return;
        const id = el.id || `mmd-${Math.random().toString(36).slice(2, 8)}`;
        try {
          const { svg } = await mermaid.render(id, code);
          el.innerHTML = svg;
        } catch {
          el.innerHTML = `<pre class="md-mermaid-error">${escHtml(code)}</pre>`;
        }
      });
    });
  }, [html, isDark]);

  return (
    <div className={`border border-border rounded-lg overflow-hidden bg-background ${className}`}>
      {/* Tab bar */}
      <div className="flex items-center border-b border-border bg-muted/20">
        <button
          type="button"
          onClick={switchToEdit}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium transition-colors ${
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
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium transition-colors ${
            mode === 'preview'
              ? 'text-primary border-b-2 border-primary -mb-px bg-background'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          <Eye size={11} />
          {t.markdown.preview}
        </button>
        <span className="ml-auto px-3 text-[12px] text-muted-foreground/60 select-none">Markdown</span>
      </div>

      {/* CodeMirror editor — always mounted, hidden when in preview */}
      <div
        ref={editorRef}
        style={mode === 'edit' ? { minHeight } : { display: 'none' }}
      />

      {/* Preview pane */}
      {mode === 'preview' && (
        <div
          ref={previewRef}
          className="md-preview px-3 py-2 text-[15px] text-foreground overflow-auto"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{
            __html: html
              ? html
              : `<span class="text-muted-foreground italic text-[12px]">${t.markdown.noContent}</span>`,
          }}
        />
      )}
    </div>
  );
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
