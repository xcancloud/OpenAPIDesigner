import React, { useState } from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import {
  Plus, Trash2, ChevronDown, ChevronRight, Webhook, Search, X
} from 'lucide-react';
import type { PathItemObject, OperationObject, HttpMethod, ResponseObject } from '../types/openapi';
import { HTTP_METHODS, METHOD_COLORS } from '../types/openapi';
import { MarkdownEditor } from './MarkdownEditor';

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-md text-white uppercase tracking-wide px-2 py-0.5 text-[12px] min-w-[52px]"
      style={{ backgroundColor: METHOD_COLORS[method], fontWeight: 700 }}
    >
      {method}
    </span>
  );
}

function WebhookOperationEditor({
  webhookName,
  method,
  operation,
  onUpdate,
  onDelete,
}: {
  webhookName: string;
  method: HttpMethod;
  operation: OperationObject;
  onUpdate: (op: OperationObject) => void;
  onDelete: () => void;
}) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const { state } = useDesigner();
  const schemaNames = Object.keys(state.document.components?.schemas || {});

  const addResponse = () => {
    const responses = { ...(operation.responses || {}) };
    const candidates = ['200', '201', '204', '400', '401', '403', '404', '422', '500', '503'];
    const code = candidates.find(c => !responses[c]) ?? String(200 + Object.keys(responses).length);
    responses[code] = { description: 'Successful response' };
    onUpdate({ ...operation, responses });
  };

  const updateResponse = (code: string, resp: ResponseObject) => {
    onUpdate({ ...operation, responses: { ...(operation.responses || {}), [code]: resp } });
  };

  const removeResponse = (code: string) => {
    const responses = { ...(operation.responses || {}) };
    delete responses[code];
    onUpdate({ ...operation, responses });
  };

  // Active content-type for response schema editing
  const [activeContentType, setActiveContentType] = useState('application/json');

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
        style={{ borderLeft: `3px solid ${METHOD_COLORS[method]}` }}
      >
        <MethodBadge method={method} />
        <span className="text-[13px] text-foreground font-mono flex-1">{webhookName}</span>
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
              <label className="text-[12px] text-muted-foreground uppercase tracking-wide">{t.common.summary}</label>
              <input
                value={operation.summary || ''}
                onChange={(e) => onUpdate({ ...operation, summary: e.target.value })}
                placeholder={t.common.inputPlaceholder}
              className="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-md text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[12px] text-muted-foreground uppercase tracking-wide">{t.common.description}</label>
            <div className="mt-1">
              <MarkdownEditor
                value={operation.description || ''}
                onChange={(v) => onUpdate({ ...operation, description: v })}
                placeholder="Describe what this webhook does. **Markdown** supported."
                rows={2}
              />
            </div>
          </div>

          {/* Request Body */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] text-muted-foreground uppercase tracking-wide">{t.common.requestBody}</label>
            </div>
            <div className="border border-border rounded-lg p-3 space-y-2 bg-background">
              <div className="flex items-center gap-2">
                <label className="text-[12px] text-muted-foreground w-24">{t.common.contentType}</label>
                <select
                  value={activeContentType}
                  onChange={(e) => setActiveContentType(e.target.value)}
                  className="flex-1 px-2 py-1 bg-muted border border-border rounded text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  <option value="application/json">application/json</option>
                  <option value="application/xml">application/xml</option>
                  <option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</option>
                  <option value="multipart/form-data">multipart/form-data</option>
                  <option value="text/plain">text/plain</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[12px] text-muted-foreground w-24">{t.common.schema}</label>
                <select
                  value={operation.requestBody?.content?.[activeContentType]?.schema?.['$ref'] || ''}
                  onChange={(e) => {
                    const ref = e.target.value;
                    const requestBody = {
                      ...(operation.requestBody || { description: '', required: true }),
                      content: {
                        ...(operation.requestBody?.content || {}),
                        [activeContentType]: {
                          schema: ref ? { $ref: ref } : {},
                        },
                      },
                    };
                    onUpdate({ ...operation, requestBody });
                  }}
                  className="flex-1 px-2 py-1 bg-muted border border-border rounded text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  <option value="">— {t.common.none} —</option>
                  {schemaNames.map(name => (
                    <option key={name} value={`#/components/schemas/${name}`}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Responses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] text-muted-foreground uppercase tracking-wide">{t.common.responses}</label>
              <button
                onClick={addResponse}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[12px] hover:bg-primary/20 transition-colors"
              >
                <Plus size={11} />
                {t.common.add}
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(operation.responses || {}).map(([code, resp]) => (
                <div key={code} className="border border-border rounded-lg p-3 space-y-2 bg-background">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[12px] font-bold px-2 py-0.5 rounded ${
                        code.startsWith('2')
                          ? 'bg-green-500/10 text-green-600'
                          : code.startsWith('4')
                          ? 'bg-yellow-500/10 text-yellow-600'
                          : code.startsWith('5')
                          ? 'bg-red-500/10 text-red-600'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {code}
                    </span>
                    <input
                      value={resp.description || ''}
                      onChange={(e) => updateResponse(code, { ...resp, description: e.target.value })}
                      placeholder="Response description"
                    className="flex-1 px-2 py-1 bg-muted border border-border rounded text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                    <button
                      onClick={() => removeResponse(code)}
                      className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={operation.deprecated || false}
                onChange={(e) => onUpdate({ ...operation, deprecated: e.target.checked })}
                className="w-3.5 h-3.5 accent-primary"
              />
              <span className="text-[12px] text-muted-foreground">{t.common.deprecated}</span>
            </label>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-[12px] hover:bg-destructive/20 transition-colors"
            >
              <Trash2 size={12} />
              {t.common.delete}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function WebhooksPanel() {
  const { t } = useI18n();
  const { state, setDocument } = useDesigner();
  const doc = state.document;
  const webhooks = doc.webhooks || {};

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [search, setSearch] = useState('');
  const [expandedWebhooks, setExpandedWebhooks] = useState<Set<string>>(new Set());

  const addWebhook = () => {
    const name = newName.trim();
    if (!name || webhooks[name]) return;
    const newDoc = structuredClone(doc);
    if (!newDoc.webhooks) newDoc.webhooks = {};
    newDoc.webhooks[name] = {};
    setDocument(newDoc);
    setExpandedWebhooks(prev => new Set(prev).add(name));
    setNewName('');
    setShowAdd(false);
  };

  const deleteWebhook = (name: string) => {
    const newDoc = structuredClone(doc);
    if (!newDoc.webhooks) return;
    delete newDoc.webhooks[name];
    if (Object.keys(newDoc.webhooks).length === 0) delete newDoc.webhooks;
    setDocument(newDoc);
  };

  const addOperation = (webhookName: string, method: HttpMethod) => {
    const newDoc = structuredClone(doc);
    if (!newDoc.webhooks) return;
    if (!newDoc.webhooks[webhookName][method]) {
      newDoc.webhooks[webhookName][method] = {
        summary: '',
        description: '',
        operationId: '',
        responses: { '200': { description: 'OK' } },
      };
    }
    setDocument(newDoc);
  };

  const updateOperation = (webhookName: string, method: HttpMethod, op: OperationObject) => {
    const newDoc = structuredClone(doc);
    if (!newDoc.webhooks) return;
    newDoc.webhooks[webhookName][method] = op;
    setDocument(newDoc);
  };

  const deleteOperation = (webhookName: string, method: HttpMethod) => {
    const newDoc = structuredClone(doc);
    if (!newDoc.webhooks) return;
    delete newDoc.webhooks[webhookName][method];
    setDocument(newDoc);
  };

  const toggleWebhook = (name: string) => {
    setExpandedWebhooks(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const filteredNames = Object.keys(webhooks).filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <Webhook size={16} className="text-rose-500" />
          </div>
          {t.webhooks.title}
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          {t.webhooks.addWebhook}
        </button>
      </div>

      {/* Add Webhook form */}
      {showAdd && (
        <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
          <label className="text-[12px] text-muted-foreground">{t.webhooks.webhookName}</label>
          <div className="flex gap-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addWebhook(); if (e.key === 'Escape') setShowAdd(false); }}
              placeholder="newPet"
              className="flex-1 px-3 py-1.5 bg-background border border-border rounded-md text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
            <button onClick={addWebhook} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-[12px] hover:opacity-90">
              {t.common.add}
            </button>
            <button onClick={() => { setShowAdd(false); setNewName(''); }} className="px-3 py-1.5 bg-muted text-foreground rounded-md text-[12px] hover:bg-muted/80">
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {Object.keys(webhooks).length > 3 && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.common.search}
            className="w-full pl-9 pr-8 py-2 bg-muted/30 border border-border rounded-lg text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {Object.keys(webhooks).length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Webhook size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-[13px]">{t.webhooks.noWebhooks}</p>
        </div>
      )}

      {/* Webhook list */}
      <div className="space-y-4">
        {filteredNames.map((name) => {
          const pathItem: PathItemObject = webhooks[name];
          const activeOps = HTTP_METHODS.filter(m => (pathItem as any)[m]);
          const availableMethods = HTTP_METHODS.filter(m => !(pathItem as any)[m]);
          const isExpanded = expandedWebhooks.has(name);

          return (
            <div key={name} className="border border-border rounded-xl overflow-hidden">
              {/* Webhook header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors bg-muted/10"
                onClick={() => toggleWebhook(name)}
              >
                <div className="w-6 h-6 rounded bg-rose-500/10 flex items-center justify-center shrink-0">
                  <Webhook size={12} className="text-rose-500" />
                </div>
                <span className="font-mono text-[13px] text-foreground font-medium flex-1">{name}</span>
                <div className="flex items-center gap-1">
                  {activeOps.map(m => <MethodBadge key={m} method={m} />)}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteWebhook(name); }}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
                >
                  <Trash2 size={14} />
                </button>
                {isExpanded
                  ? <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                  : <ChevronRight size={14} className="text-muted-foreground shrink-0" />}
              </div>

              {/* Webhook body */}
              {isExpanded && (
                <div className="p-4 space-y-3 border-t border-border">
                  {/* Existing operations */}
                  {activeOps.length === 0 && (
                    <p className="text-[12px] text-muted-foreground text-center py-4">{t.webhooks.noOperations}</p>
                  )}
                  {activeOps.map(method => (
                    <WebhookOperationEditor
                      key={method}
                      webhookName={name}
                      method={method}
                      operation={(pathItem as any)[method] as OperationObject}
                      onUpdate={(op) => updateOperation(name, method, op)}
                      onDelete={() => deleteOperation(name, method)}
                    />
                  ))}

                  {/* Add operation */}
                  {availableMethods.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[12px] text-muted-foreground self-center">{t.webhooks.addOperation}:</span>
                      {availableMethods.map(method => (
                        <button
                          key={method}
                          onClick={() => addOperation(name, method)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-dashed border-border text-[12px] text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                        >
                          <Plus size={10} />
                          <span className="uppercase font-bold">{method}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
