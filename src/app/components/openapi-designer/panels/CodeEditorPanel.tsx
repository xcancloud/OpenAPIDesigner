import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import { Code, Copy, Check, RefreshCw, Download, AlertCircle, XCircle, AlertTriangle, Info, CheckCircle2, ArrowRight, Shield } from 'lucide-react';
import yaml from 'js-yaml';
import type { OpenAPIDocument } from '../types/openapi';
import { validateDocument } from '../utils/validation';

function syntaxHighlight(code: string, format: 'yaml' | 'json'): string {
  if (format === 'json') {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(
        /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let cls = 'text-[#0550ae] dark:text-[#79c0ff]'; // number
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'text-[#0a3069] dark:text-[#d2a8ff]'; // key
            } else {
              cls = 'text-[#0a3069] dark:text-[#a5d6ff]'; // string
            }
          } else if (/true|false/.test(match)) {
            cls = 'text-[#cf222e] dark:text-[#ff7b72]'; // boolean
          } else if (/null/.test(match)) {
            cls = 'text-[#6e7781] dark:text-[#8b949e]'; // null
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
  } else {
    // YAML highlighting
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .split('\n')
      .map((line) => {
        // Comment
        if (line.trim().startsWith('#')) {
          return `<span class="text-[#6e7781] dark:text-[#8b949e]">${line}</span>`;
        }
        // Key-value
        return line.replace(
          /^(\s*)([\w/{}$.-]+)(:)(.*)/,
          (_, indent, key, colon, value) => {
            let valHtml = value;
            const trimVal = value.trim();
            if (trimVal === 'true' || trimVal === 'false') {
              valHtml = ` <span class="text-[#cf222e] dark:text-[#ff7b72]">${trimVal}</span>`;
            } else if (trimVal === 'null' || trimVal === '~') {
              valHtml = ` <span class="text-[#6e7781] dark:text-[#8b949e]">${trimVal}</span>`;
            } else if (/^-?\d+(\.\d+)?$/.test(trimVal)) {
              valHtml = ` <span class="text-[#0550ae] dark:text-[#79c0ff]">${trimVal}</span>`;
            } else if (trimVal.startsWith("'") || trimVal.startsWith('"')) {
              valHtml = ` <span class="text-[#0a3069] dark:text-[#a5d6ff]">${trimVal}</span>`;
            } else if (trimVal.length > 0) {
              valHtml = ` <span class="text-[#0a3069] dark:text-[#a5d6ff]">${trimVal}</span>`;
            }
            return `${indent}<span class="text-[#0a3069] dark:text-[#d2a8ff]">${key}</span><span class="text-foreground">${colon}</span>${valHtml}`;
          }
        );
      })
      .join('\n');
  }
}

export function CodeEditorPanel() {
  const { t } = useI18n();
  const { state, setDocument, dispatch } = useDesigner();
  const [format, setFormat] = useState<'yaml' | 'json'>('yaml');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync from document to code
  const syncFromDoc = useCallback(() => {
    try {
      if (format === 'yaml') {
        setCode(yaml.dump(state.document, { indent: 2, lineWidth: -1, noRefs: true }));
      } else {
        setCode(JSON.stringify(state.document, null, 2));
      }
      setParseError(null);
    } catch (e) {
      setParseError(String(e));
    }
  }, [state.document, format]);

  useEffect(() => {
    if (!isEditing) {
      syncFromDoc();
    }
  }, [syncFromDoc, isEditing]);

  // Apply code to document
  const applyToDocument = () => {
    try {
      let parsed: OpenAPIDocument;
      if (format === 'yaml') {
        parsed = yaml.load(code) as OpenAPIDocument;
      } else {
        parsed = JSON.parse(code);
      }
      if (parsed && typeof parsed === 'object') {
        setDocument(parsed);
        setParseError(null);
        setIsEditing(false);
      }
    } catch (e) {
      setParseError(String(e));
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // UX-6: Use the API title as filename, matching the Toolbar export behavior.
    const title = state.document?.info?.title?.replace(/\s+/g, '-').toLowerCase() || 'openapi';
    a.download = `${title}.${format === 'yaml' ? 'yaml' : 'json'}`;
    a.click();
    // BUG-16: Defer revoke to allow the browser to initiate the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    // BUG-9: Keep line numbers in sync with the textarea scroll position.
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const lines = code.split('\n');

  // --- Inline validation (moved from ValidationPanel) ---
  const errors = state.validationErrors;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const results = validateDocument(state.document);
      dispatch({ type: 'SET_VALIDATION_ERRORS', payload: results });
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [state.document, dispatch]);

  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;
  const infoCount = errors.filter(e => e.severity === 'info').length;

  const severityIcon: Record<string, React.ReactNode> = {
    error: <XCircle size={12} className="text-destructive shrink-0" />,
    warning: <AlertTriangle size={12} className="text-yellow-500 shrink-0" />,
    info: <Info size={12} className="text-blue-500 shrink-0" />,
  };

  const severityBg: Record<string, string> = {
    error: 'bg-destructive/5 border-destructive/20',
    warning: 'bg-yellow-500/5 border-yellow-500/20',
    info: 'bg-blue-500/5 border-blue-500/20',
  };

  const navigateToError = (path: string) => {
    if (path.startsWith('paths')) {
      dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'paths' });
    } else if (path.startsWith('info') || path === 'openapi') {
      dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'info' });
    } else if (path.startsWith('servers')) {
      dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'servers' });
    } else if (path.startsWith('components.schemas')) {
      dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'schemas' });
    } else if (path.startsWith('security') || path.startsWith('components.securitySchemes')) {
      dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'security' });
    } else if (path.startsWith('tags')) {
      dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'tags' });
    }
  };

  return (
    <div className="h-full flex">
      {/* Editor area — 80% */}
      <div className="flex-1 min-w-0 flex flex-col" style={{ width: '80%' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-foreground flex items-center gap-2">
            <Code size={16} className="text-indigo-500" />
            <span className="text-[14px]">{t.codeEditor.title}</span>
          </h2>
          <div className="flex rounded-lg border border-border overflow-hidden ml-4">
            <button
              onClick={() => { setFormat('yaml'); setIsEditing(false); }}
              className={`px-3 py-1 text-[12px] transition-colors ${format === 'yaml' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
            >
              {t.codeEditor.yaml}
            </button>
            <button
              onClick={() => { setFormat('json'); setIsEditing(false); }}
              className={`px-3 py-1 text-[12px] transition-colors ${format === 'json' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}
            >
              {t.codeEditor.json}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={applyToDocument}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-600 text-white text-[11px] hover:bg-green-700 transition-colors"
            >
              <RefreshCw size={12} />
              {t.codeEditor.syncToVisual}
            </button>
          )}
          <button
            onClick={() => { setIsEditing(false); syncFromDoc(); }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border text-[11px] text-muted-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw size={12} />
            {t.codeEditor.syncFromVisual}
          </button>
          <button onClick={copyCode} className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border text-[11px] text-muted-foreground hover:bg-muted transition-colors">
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            {copied ? t.common.copied : t.codeEditor.copyCode}
          </button>
          <button onClick={downloadCode} className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border text-[11px] text-muted-foreground hover:bg-muted transition-colors">
            <Download size={12} />
          </button>
        </div>
      </div>

      {/* Error bar — BUG-10: show actual error message, not just a generic label */}
      {parseError && (
        <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/30 flex items-center gap-2 text-[12px] text-destructive shrink-0 overflow-hidden">
          <AlertCircle size={14} className="shrink-0" />
          <span className="font-medium shrink-0">{t.codeEditor.parseError}:</span>
          <span className="truncate">{parseError}</span>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden relative bg-background">
        {/* Line numbers */}
        <div ref={lineNumbersRef} className="absolute left-0 top-0 bottom-0 w-[50px] bg-muted/30 border-r border-border overflow-hidden z-10 pointer-events-none">
          <div className="pt-4 pr-2 text-right">
            {lines.map((_, i) => (
              <div key={i} className="text-[11px] text-muted-foreground h-[20px] leading-[20px] px-2">{i + 1}</div>
            ))}
          </div>
        </div>

        {/* Syntax highlighted view */}
        <pre
          ref={preRef}
          className="absolute inset-0 ml-[50px] p-4 text-[12px] leading-[20px] font-mono overflow-auto pointer-events-none whitespace-pre"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: syntaxHighlight(code, format) }}
        />

        {/* Textarea overlay */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => { setCode(e.target.value); setIsEditing(true); setParseError(null); }}
          onScroll={handleScroll}
          className="absolute inset-0 ml-[50px] p-4 text-[12px] leading-[20px] font-mono bg-transparent text-transparent caret-foreground resize-none outline-none overflow-auto"
          spellCheck={false}
          wrap="off"
        />
      </div>
      </div>

      {/* Validation sidebar — 20% */}
      <div className="border-l border-border bg-card overflow-y-auto shrink-0" style={{ width: '20%', minWidth: '200px' }}>
        <div className="p-3 space-y-3">
          {/* Validation header */}
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-yellow-500" />
            <span className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>{t.validation.title}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className={`rounded-lg border p-2 text-center ${errorCount > 0 ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-background'}`}>
              <div className={`text-[16px] ${errorCount > 0 ? 'text-destructive' : 'text-green-500'}`} style={{ fontWeight: 700 }}>{errorCount}</div>
              <div className="text-[10px] text-muted-foreground">{t.validation.errors}</div>
            </div>
            <div className={`rounded-lg border p-2 text-center ${warningCount > 0 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-border bg-background'}`}>
              <div className={`text-[16px] ${warningCount > 0 ? 'text-yellow-500' : 'text-green-500'}`} style={{ fontWeight: 700 }}>{warningCount}</div>
              <div className="text-[10px] text-muted-foreground">{t.validation.warnings}</div>
            </div>
            <div className="rounded-lg border p-2 text-center border-border bg-background">
              <div className="text-[16px] text-blue-500" style={{ fontWeight: 700 }}>{infoCount}</div>
              <div className="text-[10px] text-muted-foreground">{t.validation.infos}</div>
            </div>
          </div>

          {/* Status */}
          <div className={`rounded-lg border p-2 flex items-center gap-2 ${errorCount === 0 ? 'bg-green-500/5 border-green-500/30' : 'bg-destructive/5 border-destructive/30'}`}>
            {errorCount === 0 ? (
              <CheckCircle2 size={14} className="text-green-500 shrink-0" />
            ) : (
              <XCircle size={14} className="text-destructive shrink-0" />
            )}
            <div className="text-[11px] text-foreground" style={{ fontWeight: 500 }}>
              {errorCount === 0 ? t.validation.valid : t.validation.invalid}
            </div>
          </div>

          {/* Issues list */}
          {errors.length > 0 && (
            <div className="space-y-1.5">
              {errors.map((error, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-2 flex items-start gap-2 cursor-pointer hover:shadow-sm transition-shadow ${severityBg[error.severity]}`}
                  onClick={() => navigateToError(error.path)}
                >
                  {severityIcon[error.severity]}
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-foreground leading-tight">{error.message}</div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{error.path}</div>
                  </div>
                  <ArrowRight size={10} className="text-muted-foreground shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}