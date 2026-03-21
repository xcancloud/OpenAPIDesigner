import React, { useState, useMemo } from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import {
  Plus, Trash2, Route, ChevronDown, ChevronRight, Search, X, HelpCircle
} from 'lucide-react';
import type {
  PathItemObject, OperationObject, ParameterObject, HttpMethod, ResponseObject
} from '../types/openapi';
import { HTTP_METHODS, METHOD_COLORS } from '../types/openapi';
import { MarkdownEditor } from './MarkdownEditor';

/** P1-1: Render path string with {param} segments highlighted. */
function HighlightedPath({ path }: { path: string }) {
  const parts = path.split(/(\{[^}]+\})/);
  return (
    <span className="text-[13px] font-mono text-foreground flex-1">
      {parts.map((part, i) =>
        part.startsWith('{') ? (
          <span key={i} className="bg-orange-500/10 text-orange-600 rounded px-0.5">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

function FieldHint({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1 align-middle">
      <HelpCircle
        size={10}
        className="text-muted-foreground/50 cursor-help hover:text-muted-foreground transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <span className="absolute bottom-full left-0 mb-1.5 w-60 p-2 rounded-lg bg-popover border border-border shadow-xl text-[12px] text-muted-foreground leading-relaxed z-50 whitespace-normal pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}

function MethodBadge({ method, size = 'sm' }: { method: HttpMethod; size?: 'sm' | 'md' }) {
  const color = METHOD_COLORS[method];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md text-white uppercase tracking-wide ${size === 'sm' ? 'px-2 py-0.5 text-[12px] min-w-[52px]' : 'px-3 py-1 text-[12px] min-w-[60px]'}`}
      style={{ backgroundColor: color, fontWeight: 700 }}
    >
      {method}
    </span>
  );
}

function OperationEditor({
  path,
  method,
  operation,
  onUpdate,
  onDelete,
}: {
  path: string;
  method: HttpMethod;
  operation: OperationObject;
  onUpdate: (op: OperationObject) => void;
  onDelete: () => void;
}) {
  const { t } = useI18n();
  const p = t.placeholders;
  const [expanded, setExpanded] = useState(false);
  const { state } = useDesigner();
  const schemaNames = Object.keys(state.document.components?.schemas || {});
  // BUG-5: Buffer tag edits as a local string; only parse + commit on blur to avoid
  // flickering when the user types a comma to start a second tag.
  const [tagInput, setTagInput] = useState(() => (operation.tags || []).join(', '));
  React.useEffect(() => {
    setTagInput((operation.tags || []).join(', '));
  }, [operation.tags]);

  const addParameter = () => {
    const params = [...(operation.parameters || [])];
    params.push({ name: '', in: 'query', description: '', schema: { type: 'string' } });
    onUpdate({ ...operation, parameters: params });
  };

  const updateParam = (index: number, field: string, value: unknown) => {
    const params = [...(operation.parameters || [])];
    params[index] = { ...params[index], [field]: value };
    onUpdate({ ...operation, parameters: params });
  };

  const removeParam = (index: number) => {
    const params = (operation.parameters || []).filter((_, i) => i !== index);
    onUpdate({ ...operation, parameters: params });
  };

  const addResponse = () => {
    const responses = { ...(operation.responses || {}) };
    // Pick the first unused code from common candidates instead of always duplicating 200/201.
    const candidates = ['200', '201', '204', '400', '401', '403', '404', '422', '500', '503'];
    const code = candidates.find(c => !responses[c])
      ?? String(200 + Object.keys(responses).length);
    responses[code] = { description: 'Successful response' };
    onUpdate({ ...operation, responses });
  };

  const renameResponseCode = (oldCode: string, newCode: string) => {
    if (!newCode.trim() || newCode === oldCode) return;
    const responses = { ...(operation.responses || {}) };
    if (responses[newCode]) return; // don't overwrite an existing code
    const entry = responses[oldCode];
    delete responses[oldCode];
    // Preserve insertion order by rebuilding the object.
    const rebuilt: typeof responses = {};
    Object.entries(responses).forEach(([k, v]) => { rebuilt[k] = v; });
    rebuilt[newCode] = entry;
    onUpdate({ ...operation, responses: rebuilt });
  };

  const updateResponse = (code: string, resp: ResponseObject) => {
    const responses = { ...(operation.responses || {}) };
    responses[code] = resp;
    onUpdate({ ...operation, responses });
  };

  const removeResponse = (code: string) => {
    const responses = { ...(operation.responses || {}) };
    delete responses[code];
    onUpdate({ ...operation, responses });
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
        style={{ borderLeft: `3px solid ${METHOD_COLORS[method]}` }}
      >
        <MethodBadge method={method} />
        <HighlightedPath path={path} />
        {operation.summary && (
          <span className="text-[12px] text-muted-foreground truncate max-w-[200px]">{operation.summary}</span>
        )}
        {operation.deprecated && (
          <span className="text-[12px] bg-yellow-500/20 text-yellow-600 px-1.5 py-0.5 rounded">{t.common.deprecated}</span>
        )}
        {expanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
      </div>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4 bg-muted/10">
          {/* Basic fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wide flex items-center">
                {t.common.summary}
                <FieldHint text={t.hints.operationSummary} />
              </label>
              <input
                value={operation.summary || ''}
                onChange={(e) => onUpdate({ ...operation, summary: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                placeholder={p.operationSummary}
              />
            </div>
            <div>
              <label className="text-[12px] text-muted-foreground uppercase tracking-wide flex items-center">
                {t.common.operationId}
                <FieldHint text={t.hints.operationId} />
              </label>
              <input
                value={operation.operationId || ''}
                onChange={(e) => onUpdate({ ...operation, operationId: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono"
                placeholder={p.operationId}
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] text-muted-foreground uppercase tracking-wide flex items-center">
              {t.common.description}
              <FieldHint text={t.hints.operationDescription} />
            </label>
            <div className="mt-1">
              <MarkdownEditor
                value={operation.description || ''}
                onChange={(v) => onUpdate({ ...operation, description: v })}
                placeholder="Describe what this operation does. **Markdown** is fully supported."
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-[12px] text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={operation.deprecated || false}
                onChange={(e) => onUpdate({ ...operation, deprecated: e.target.checked })}
                className="rounded border-border"
              />
              {t.paths.deprecated}
            </label>
            <div className="flex items-center gap-2">
              <label className="text-[12px] text-muted-foreground flex items-center">
                {t.paths.tags}:
                <FieldHint text={t.hints.operationTags} />
              </label>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onBlur={(e) => {
                  const tags = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  onUpdate({ ...operation, tags: tags.length ? tags : undefined });
                }}
                className="px-2 py-1 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                placeholder="users, pets"
              />
            </div>
          </div>

          {/* Parameters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[12px] text-foreground" style={{ fontWeight: 600 }}>{t.common.parameters}</h4>
              <button
                onClick={addParameter}
                className="text-[12px] text-primary hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> {t.common.add}
              </button>
            </div>
            {(operation.parameters || []).length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[12px] text-muted-foreground uppercase tracking-wide px-1">
                  <span className="col-span-3">{t.common.name}</span>
                  <span className="col-span-2">{t.paths.parameterLocation}</span>
                  <span className="col-span-2">{t.common.type}</span>
                  <span className="col-span-1">{t.common.required}</span>
                  <span className="col-span-3">{t.common.description}</span>
                  <span className="col-span-1"></span>
                </div>
                {(operation.parameters || []).map((param, pi) => (
                  <div key={pi} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      value={param.name}
                      onChange={(e) => updateParam(pi, 'name', e.target.value)}
                      className="col-span-3 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                      placeholder="name"
                    />
                    <select
                      value={param.in}
                      onChange={(e) => updateParam(pi, 'in', e.target.value)}
                      className="col-span-2 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="query">{t.paths.paramIn.query}</option>
                      <option value="header">{t.paths.paramIn.header}</option>
                      <option value="path">{t.paths.paramIn.path}</option>
                      <option value="cookie">{t.paths.paramIn.cookie}</option>
                    </select>
                    <select
                      value={param.schema?.type as string || 'string'}
                      onChange={(e) => updateParam(pi, 'schema', { ...param.schema, type: e.target.value })}
                      className="col-span-2 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="string">string</option>
                      <option value="integer">integer</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="array">array</option>
                    </select>
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        checked={param.required || false}
                        onChange={(e) => updateParam(pi, 'required', e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    <input
                      value={param.description || ''}
                      onChange={(e) => updateParam(pi, 'description', e.target.value)}
                      className="col-span-3 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Parameter description"
                    />
                    <button
                      onClick={() => removeParam(pi)}
                      className="col-span-1 p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Request Body */}
          {(method === 'post' || method === 'put' || method === 'patch') && (
            <div>
              <h4 className="text-[12px] text-foreground mb-2" style={{ fontWeight: 600 }}>{t.common.requestBody}</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={operation.requestBody?.content ? Object.keys(operation.requestBody.content)[0] || 'application/json' : 'application/json'}
                    className="px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                    onChange={(e) => {
                      const newContentType = e.target.value;
                      const currentContent = operation.requestBody?.content || {};
                      const currentKey = Object.keys(currentContent)[0];
                      // Move the existing schema to the new content-type key.
                      const existingMedia = currentKey ? currentContent[currentKey] : {};
                      onUpdate({
                        ...operation,
                        requestBody: {
                          required: operation.requestBody?.required ?? true,
                          content: { [newContentType]: existingMedia },
                        },
                      });
                    }}
                  >
                    <option>application/json</option>
                    <option>multipart/form-data</option>
                    <option>application/x-www-form-urlencoded</option>
                  </select>
                  {schemaNames.length > 0 && (
                    <select
                      value={(() => {
                        const content = operation.requestBody?.content || {};
                        const key = Object.keys(content)[0] || 'application/json';
                        return content[key]?.schema?.$ref?.replace('#/components/schemas/', '') || '';
                      })()}
                      onChange={(e) => {
                        const ref = e.target.value ? `#/components/schemas/${e.target.value}` : undefined;
                        const currentContent = operation.requestBody?.content || {};
                        const contentType = Object.keys(currentContent)[0] || 'application/json';
                        onUpdate({
                          ...operation,
                          requestBody: {
                            required: true,
                            content: {
                              [contentType]: {
                                schema: ref ? { $ref: ref } : { type: 'object' },
                              },
                            },
                          },
                        });
                      }}
                      className="px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">{t.schemas.selectRef}</option>
                      {schemaNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Responses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[12px] text-foreground" style={{ fontWeight: 600 }}>{t.common.responses}</h4>
              <button
                onClick={addResponse}
                className="text-[12px] text-primary hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> {t.common.add}
              </button>
            </div>
            {Object.entries(operation.responses || {}).map(([code, resp]) => (
              <div key={code} className="flex items-center gap-2 mb-2">
                <input
                  defaultValue={code}
                  onBlur={(e) => renameResponseCode(code, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                  className={`text-[12px] w-16 px-2 py-1 rounded font-mono text-center border focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    code.startsWith('2') ? 'bg-green-500/10 text-green-600 border-green-300' :
                    code.startsWith('4') ? 'bg-yellow-500/10 text-yellow-600 border-yellow-300' :
                    code.startsWith('5') ? 'bg-red-500/10 text-red-600 border-red-300' :
                    'bg-muted text-muted-foreground border-border'
                  }`}
                  style={{ fontWeight: 600 }}
                />
                <input
                  value={resp.description}
                  onChange={(e) => updateResponse(code, { ...resp, description: e.target.value })}
                  className="flex-1 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder={code.startsWith('2') ? 'Successful response' : code.startsWith('4') ? 'Client error response' : 'Server error response'}
                />
                {schemaNames.length > 0 && (
                  <select
                    value={resp.content?.['application/json']?.schema?.$ref?.replace('#/components/schemas/', '') || ''}
                    onChange={(e) => {
                      const ref = e.target.value ? `#/components/schemas/${e.target.value}` : undefined;
                      updateResponse(code, {
                        ...resp,
                        content: ref ? { 'application/json': { schema: { $ref: ref } } } : resp.content,
                      });
                    }}
                    className="px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">{t.common.schema}</option>
                    {schemaNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                )}
                <button onClick={() => removeResponse(code)} className="p-1 text-muted-foreground hover:text-destructive">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Delete operation */}
          <div className="pt-2 border-t border-border">
            <button
              onClick={onDelete}
              className="text-[12px] text-destructive hover:underline flex items-center gap-1"
            >
              <Trash2 size={12} /> {t.common.delete} {method.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PathsPanel() {
  const { t } = useI18n();
  const { state, setDocument } = useDesigner();
  const doc = state.document;
  const p = t.placeholders;
  const paths = doc.paths || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [newPath, setNewPath] = useState('');
  const [showAddPath, setShowAddPath] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [pathError, setPathError] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Collect all unique tags from operations
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    Object.values(paths).forEach(pathItem => {
      HTTP_METHODS.forEach(m => {
        const op = pathItem[m] as OperationObject | undefined;
        op?.tags?.forEach(tag => tags.add(tag));
      });
    });
    return Array.from(tags).sort();
  }, [paths]);

  const togglePath = (path: string) => {
    const next = new Set(expandedPaths);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpandedPaths(next);
  };

  const addPath = () => {
    if (!newPath || !newPath.startsWith('/')) {
      setPathError('Path must start with /');
      return;
    }
    const newDoc = JSON.parse(JSON.stringify(doc));
    if (!newDoc.paths) newDoc.paths = {};
    // UX-1: Show inline error when the path already exists instead of silently doing nothing.
    if (newDoc.paths[newPath]) {
      setPathError(`Path "${newPath}" already exists`);
      return;
    }
    newDoc.paths[newPath] = {};
    setDocument(newDoc);
    setNewPath('');
    setPathError('');
    setShowAddPath(false);
    setExpandedPaths(new Set([...expandedPaths, newPath]));
  };

  const deletePath = (path: string) => {
    const newDoc = JSON.parse(JSON.stringify(doc));
    delete newDoc.paths[path];
    setDocument(newDoc);
  };

  const addOperation = (path: string, method: HttpMethod) => {
    const newDoc = JSON.parse(JSON.stringify(doc));
    newDoc.paths[path][method] = {
      summary: '',
      operationId: '',
      responses: { '200': { description: 'Successful response' } },
    };
    setDocument(newDoc);
  };

  const updateOperation = (path: string, method: HttpMethod, op: OperationObject) => {
    const newDoc = JSON.parse(JSON.stringify(doc));
    newDoc.paths[path][method] = op;
    setDocument(newDoc);
  };

  const deleteOperation = (path: string, method: HttpMethod) => {
    const newDoc = JSON.parse(JSON.stringify(doc));
    delete newDoc.paths[path][method];
    setDocument(newDoc);
  };

  const filteredPaths = Object.entries(paths).filter(([path, pathItem]) => {
    if (searchTerm && !path.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (activeTag !== null) {
      const hasTag = HTTP_METHODS.some(m => {
        const op = pathItem[m] as OperationObject | undefined;
        return op?.tags?.includes(activeTag);
      });
      if (!hasTag) return false;
    }
    return true;
  });

  const pathCount = Object.keys(paths).length;
  const opCount = Object.values(paths).reduce((acc, item) => {
    return acc + HTTP_METHODS.filter(m => item[m]).length;
  }, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Route size={16} className="text-purple-500" />
            </div>
            {t.paths.title}
          </h2>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {pathCount} {t.paths.endpoints} &middot; {opCount} {t.paths.operations}
          </p>
        </div>
        <button
          onClick={() => setShowAddPath(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          {t.paths.addPath}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.common.search}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      {/* Tag tabs */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setActiveTag(null)}
            className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
              activeTag === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {t.paths.allTags}
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                activeTag === tag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Add path form */}
      {showAddPath && (
        <>
          <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-primary/30">
            <input
              value={newPath}
              onChange={(e) => { setNewPath(e.target.value); setPathError(''); }}
              placeholder={t.paths.pathUrl}
              className={`flex-1 px-3 py-2 rounded-lg border bg-background text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                pathError ? 'border-destructive focus:ring-destructive/30' : 'border-border'
              }`}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && addPath()}
            />
            <button
              onClick={addPath}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-[12px]"
            >
              {t.common.add}
            </button>
            <button
              onClick={() => { setShowAddPath(false); setNewPath(''); setPathError(''); }}
              className="px-3 py-2 rounded-lg border border-border text-[12px] text-muted-foreground hover:bg-muted"
            >
              {t.common.cancel}
            </button>
          </div>
          {pathError && (
            <p className="mt-1 text-[12px] text-destructive">{pathError}</p>
          )}
        </>
      )}

      {/* Paths list */}
      {filteredPaths.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Route size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-[13px]">{t.paths.noEndpoints}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPaths.map(([path, pathItem]) => {
            const isExpanded = expandedPaths.has(path);
            const methods = HTTP_METHODS.filter(m => pathItem[m]);
            const unusedMethods = HTTP_METHODS.filter(m => !pathItem[m]);

            return (
              <div key={path} className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Path header */}
                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => togglePath(path)}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span className="text-[13px] font-mono text-foreground flex-1" style={{ fontWeight: 500 }}>{path}</span>
                  <div className="flex gap-1">
                    {methods.map(m => <MethodBadge key={m} method={m} />)}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deletePath(path); }}
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-2"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-3">
                    {/* Add method */}
                    {unusedMethods.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] text-muted-foreground">{t.paths.addOperation}:</span>
                        {unusedMethods.map(m => (
                          <button
                            key={m}
                            onClick={() => addOperation(path, m)}
                            className="px-2 py-0.5 rounded text-[12px] border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors uppercase"
                            style={{ fontWeight: 600 }}
                          >
                            + {m}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Operations */}
                    {methods.map(method => (
                      <OperationEditor
                        key={method}
                        path={path}
                        method={method}
                        operation={pathItem[method]!}
                        onUpdate={(op) => updateOperation(path, method, op)}
                        onDelete={() => deleteOperation(path, method)}
                      />
                    ))}

                    {methods.length === 0 && (
                      <p className="text-[12px] text-muted-foreground text-center py-4">{t.paths.noOperations}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}