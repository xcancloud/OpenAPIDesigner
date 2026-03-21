import React, { useRef, useState, useEffect } from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import {
  FilePlus, Undo2, Redo2, Download, Upload, BookOpen,
  ChevronDown, Keyboard, FileJson, Printer, FileText
} from 'lucide-react';
import yaml from 'js-yaml';
import { createDefaultDocument, createPetStoreDocument } from '../types/openapi';
import type { OpenAPIDocument, OperationObject, ParameterObject } from '../types/openapi';
import { toast } from 'sonner';
import { downloadMarkdown, downloadHtml, downloadWord, printPdf } from '../utils/exporters';

// ==================== Postman → OpenAPI converter ====================
function convertPostmanToOpenAPI(collection: Record<string, unknown>): OpenAPIDocument {
  const info = (collection.info || {}) as Record<string, string>;
  const doc: OpenAPIDocument = {
    openapi: '3.1.0',
    info: {
      title: info.name || 'Imported from Postman',
      version: '1.0.0',
      description: info.description || '',
    },
    paths: {},
  };

  function processItems(items: Record<string, unknown>[], parentTag?: string) {
    for (const item of items) {
      if (Array.isArray(item.item)) {
        // Folder → use as tag group
        processItems(item.item as Record<string, unknown>[], (item.name as string) || parentTag);
      } else if (item.request) {
        const req = item.request as Record<string, unknown>;
        const method = ((req.method as string) || 'GET').toLowerCase();
        const urlObj = typeof req.url === 'string'
          ? { raw: req.url, path: [], query: [] }
          : (req.url as Record<string, unknown> || {});
        const rawUrl = (urlObj.raw as string) || '';

        // Build path string
        let pathStr = '';
        if (Array.isArray(urlObj.path)) {
          pathStr = '/' + (urlObj.path as string[]).join('/');
        } else {
          try {
            const u = new URL(rawUrl.replace(/{{[^}]+}}/g, '__placeholder__'));
            pathStr = u.pathname;
          } catch {
            pathStr = rawUrl.replace(/^https?:\/\/[^/]+/, '') || '/';
          }
        }
        // Postman {{var}} → OpenAPI {var} in path
        pathStr = pathStr.replace(/{{([^}]+)}}/g, '{$1}').replace(/:([a-zA-Z_]\w*)/g, '{$1}');
        if (!pathStr.startsWith('/')) pathStr = '/' + pathStr;

        const headers = (req.header as Record<string, string>[]) || [];
        const queryItems = (Array.isArray(urlObj.query) ? urlObj.query : []) as Record<string, string>[];
        const skipHeaders = new Set(['content-type', 'accept', 'authorization', 'content-length']);

        const parameters: ParameterObject[] = [];
        // Path params
        for (const match of pathStr.matchAll(/\{([^}]+)\}/g)) {
          parameters.push({ name: match[1], in: 'path', required: true, schema: { type: 'string' } });
        }
        // Query params
        for (const q of queryItems) {
          if (q.key) {
            parameters.push({ name: q.key, in: 'query', description: q.description || '', schema: { type: 'string' } });
          }
        }
        // Header params (non-standard)
        for (const h of headers) {
          if (h.key && !skipHeaders.has(h.key.toLowerCase())) {
            parameters.push({ name: h.key, in: 'header', schema: { type: 'string' } });
          }
        }

        const operation: OperationObject = {
          summary: (item.name as string) || '',
          description: (req.description as string) || '',
          responses: { '200': { description: 'Successful response' } },
        };
        if (parentTag) operation.tags = [parentTag];
        if (parameters.length > 0) operation.parameters = parameters;

        const bodyMethods = new Set(['post', 'put', 'patch']);
        const body = req.body as Record<string, unknown> | undefined;
        if (body && bodyMethods.has(method)) {
          const ctHeader = headers.find(h => h.key?.toLowerCase() === 'content-type');
          const ct = (ctHeader?.value || 'application/json').split(';')[0].trim();
          operation.requestBody = { content: { [ct]: { schema: { type: 'object' } } } };
        }

        if (!doc.paths![pathStr]) doc.paths![pathStr] = {};
        (doc.paths![pathStr] as Record<string, unknown>)[method] = operation;
      }
    }
  }

  processItems((collection.item as Record<string, unknown>[]) || []);
  return doc;
}

export function Toolbar() {
  const { t, locale } = useI18n();
  const { state, setDocument, undo, redo, canUndo, canRedo, saveNow } = useDesigner();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const postmanInputRef = useRef<HTMLInputElement>(null);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  // P1-5: track brief "Saved" feedback after Ctrl+S
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // BUG-14: Don't intercept native browser undo/redo when the user is typing in an input.
      const target = e.target as HTMLElement;
      const isTyping = target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target.isContentEditable;

      if (mod && e.key === 'z' && !e.shiftKey) {
        if (isTyping) return;
        e.preventDefault();
        undo();
      }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        if (isTyping) return;
        e.preventDefault();
        redo();
      }
      if (mod && e.key === 's') {
        e.preventDefault();
        // BUG-13: Actually save, then show success — don't just show a toast without saving.
        saveNow();
        toast.success(t.common.save);
        // P1-5: show "Saved" badge in toolbar then fade it after 2 s
        setSavedFeedback(true);
        setTimeout(() => setSavedFeedback(false), 2000);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, saveNow, t]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        let parsed: unknown;
        if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
          parsed = yaml.load(text);
        } else {
          parsed = JSON.parse(text);
        }
        const p = parsed as Record<string, unknown>;
        if (p && typeof p.openapi === 'string'
          && p.info !== null && typeof p.info === 'object'
          && typeof (p.info as Record<string, unknown>).title === 'string') {
          setDocument(parsed as OpenAPIDocument);
          toast.success(`${t.common.import}: ${file.name}`);
        } else {
          toast.error('Invalid OpenAPI document: missing required "openapi" or "info.title" field');
        }
      } catch (err) {
        console.error('Import error:', err);
        toast.error(`Import failed: ${String(err)}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePostmanImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const collection = JSON.parse(evt.target?.result as string);
        if (!collection?.info || !Array.isArray(collection.item)) {
          toast.error('Invalid Postman collection: missing info or item array');
          return;
        }
        const openapi = convertPostmanToOpenAPI(collection);
        setDocument(openapi);
        toast.success(`Postman collection imported: ${collection.info.name || file.name}`);
      } catch (err) {
        toast.error(`Import failed: ${String(err)}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExport = (format: 'yaml' | 'json') => {
    const content = format === 'yaml'
      ? yaml.dump(state.document, { indent: 2, lineWidth: -1, noRefs: true })
      : JSON.stringify(state.document, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.document.info.title?.replace(/\s+/g, '-').toLowerCase() || 'openapi'}.${format === 'yaml' ? 'yaml' : 'json'}`;
    a.click();
    // BUG-16: Defer revoke to allow the browser to initiate the download first.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setShowFileMenu(false);
    toast.success(format === 'yaml' ? t.common.downloadYaml : t.common.downloadJson);
  };

  const handleExportMarkdown = () => {
    downloadMarkdown(state.document, locale);
    setShowFileMenu(false);
    toast.success(t.common.downloadMarkdown);
  };

  const handleExportHtml = () => {
    downloadHtml(state.document, locale);
    setShowFileMenu(false);
    toast.success(t.common.downloadHtml);
  };

  const handleExportWord = () => {
    downloadWord(state.document, locale);
    setShowFileMenu(false);
    toast.success(t.common.downloadWord);
  };

  const handlePrintPdf = () => {
    printPdf(state.document, locale);
    setShowFileMenu(false);
    toast.success(t.common.printPdf);
  };

  const doc = state.document;

  return (
    <div className="h-[57px] border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
      {/* Left: Doc info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-[13px] min-w-0">
          <span className="text-foreground truncate max-w-[360px]" style={{ fontWeight: 600 }}>{doc.info.title}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">v{doc.info.version}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">OAS {doc.openapi}</span>
          {state.isDirty && !savedFeedback && (
            <span className="flex items-center gap-1 text-[11px] text-orange-500 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              {t.common.unsaved}
            </span>
          )}
          {savedFeedback && (
            <span className="flex items-center gap-1 text-[11px] text-green-600 shrink-0 animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {t.common.saved}
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
          title={`${t.common.undo} (Ctrl+Z)`}
        >
          <Undo2 size={15} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
          title={`${t.common.redo} (Ctrl+Y)`}
        >
          <Redo2 size={15} />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Shortcuts hint */}
        <div className="relative">
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard size={15} />
          </button>
          {showShortcuts && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowShortcuts(false)} />
              <div className="absolute right-0 top-full mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg z-50 py-2 overflow-hidden">
                <div className="px-3 py-1.5 text-[11px] text-muted-foreground uppercase tracking-wide">Keyboard Shortcuts</div>
                {[
                  { keys: '⌘ K', label: 'Command palette' },
                  { keys: '⌘ Z', label: t.common.undo },
                  { keys: '⌘ ⇧ Z', label: t.common.redo },
                  { keys: '⌘ S', label: t.common.save },
                ].map(({ keys, label }) => (
                  <div key={keys} className="flex items-center justify-between px-3 py-1.5">
                    <span className="text-[12px] text-foreground">{label}</span>
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">{keys}</kbd>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* File menu */}
        <div className="relative">
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <BookOpen size={14} />
            <ChevronDown size={10} />
          </button>
          {showFileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowFileMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-52 bg-popover border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                <button
                  onClick={() => { setDocument(createDefaultDocument()); setShowFileMenu(false); toast.success(t.common.newDocument); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground hover:bg-muted transition-colors"
                >
                  <FilePlus size={14} className="text-muted-foreground" />
                  {t.common.newDocument}
                </button>
                <button
                  onClick={() => { setDocument(createPetStoreDocument()); setShowFileMenu(false); toast.success(t.common.samplePetstore); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground hover:bg-muted transition-colors"
                >
                  <BookOpen size={14} className="text-muted-foreground" />
                  {t.common.samplePetstore}
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => { fileInputRef.current?.click(); setShowFileMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground hover:bg-muted transition-colors"
                >
                  <Upload size={14} className="text-muted-foreground" />
                  {t.common.importFile}
                </button>
                <button
                  onClick={() => { postmanInputRef.current?.click(); setShowFileMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground hover:bg-muted transition-colors"
                >
                  <FileJson size={14} className="text-muted-foreground" />
                  {t.common.importPostman}
                </button>
                <button
                  onClick={() => handleExport('yaml')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground hover:bg-muted transition-colors"
                >
                  <Download size={14} className="text-muted-foreground" />
                  {t.common.downloadYaml}
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground hover:bg-muted transition-colors"
                >
                  <Download size={14} className="text-muted-foreground" />
                  {t.common.downloadJson}
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={handleExportMarkdown}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground hover:bg-muted transition-colors"
                >
                  <FileText size={14} className="text-muted-foreground" />
                  {t.common.downloadMarkdown}
                </button>
                <button
                  onClick={handleExportHtml}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground hover:bg-muted transition-colors"
                >
                  <FileText size={14} className="text-muted-foreground" />
                  {t.common.downloadHtml}
                </button>
                <button
                  onClick={handleExportWord}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground hover:bg-muted transition-colors"
                >
                  <FileText size={14} className="text-muted-foreground" />
                  {t.common.downloadWord}
                </button>
                <button
                  onClick={handlePrintPdf}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground hover:bg-muted transition-colors"
                >
                  <Printer size={14} className="text-muted-foreground" />
                  {t.common.printPdf}
                </button>
              </div>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml,.json"
          onChange={handleImport}
          className="hidden"
        />
        <input
          ref={postmanInputRef}
          type="file"
          accept=".json"
          onChange={handlePostmanImport}
          className="hidden"
        />
      </div>
    </div>
  );
}