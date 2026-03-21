import React, { useState, useEffect, useCallback } from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import {
  Eye, ChevronDown, ChevronRight, ExternalLink, Lock, Copy, Terminal,
  Play, Loader2, AlertCircle, Server, Settings2, ChevronsUpDown
} from 'lucide-react';
import type { HttpMethod, OperationObject, SchemaObject } from '../types/openapi';
import { HTTP_METHODS, METHOD_COLORS } from '../types/openapi';
import { renderMarkdown, initMarkdown } from '../utils/markdown';
import { useDark } from './MarkdownEditor';

function resolveSchemaDisplay(
  schema: SchemaObject | undefined,
  schemas: Record<string, SchemaObject>,
  depth = 0
): string {
  if (!schema || depth > 4) return '{}';
  if (schema.$ref) {
    const refName = schema.$ref.replace('#/components/schemas/', '');
    const resolved = schemas[refName];
    if (resolved) return resolveSchemaDisplay(resolved, schemas, depth + 1);
    return `{ "$ref": "${schema.$ref}" }`;
  }
  const type = typeof schema.type === 'string' ? schema.type : 'object';
  if (type === 'object' && schema.properties) {
    const props = Object.entries(schema.properties).map(([key, val]) => {
      const valDisplay = resolveSchemaDisplay(val, schemas, depth + 1);
      return `  "${key}": ${valDisplay}`;
    });
    return `{\n${props.join(',\n')}\n}`;
  }
  if (type === 'array' && schema.items) {
    return `[${resolveSchemaDisplay(schema.items, schemas, depth + 1)}]`;
  }
  if (type === 'string') return schema.enum ? `"${schema.enum[0]}"` : '"string"';
  if (type === 'integer' || type === 'number') return '0';
  if (type === 'boolean') return 'true';
  return 'null';
}

function EndpointPreview({
  path,
  method,
  operation,
  schemas,
  serverUrl,
}: {
  path: string;
  method: HttpMethod;
  operation: OperationObject;
  schemas: Record<string, SchemaObject>;
  serverUrl: string;
}) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [debugResult, setDebugResult] = useState<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    time: number;
  } | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  // Editable param values
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [headerValues, setHeaderValues] = useState<Record<string, string>>({});
  const [bodyValue, setBodyValue] = useState('');
  const color = METHOD_COLORS[method];

  const responseEntries = Object.entries(operation.responses || {});
  const hasRequestBody = !!operation.requestBody;
  const requestSchema = hasRequestBody
    ? operation.requestBody?.content?.['application/json']?.schema
    : undefined;

  // Initialize body value from schema
  useEffect(() => {
    if (requestSchema && !bodyValue) {
      setBodyValue(resolveSchemaDisplay(requestSchema, schemas));
    }
  }, [requestSchema, schemas]);

  /** Build the effective URL with param substitution */
  const buildUrl = useCallback(() => {
    let url = `${serverUrl}${path}`;
    // Substitute path params
    (operation.parameters || []).filter(p => p.in === 'path').forEach(p => {
      const val = paramValues[p.name] || `{${p.name}}`;
      url = url.replace(`{${p.name}}`, encodeURIComponent(val));
    });
    // Append query params
    const queryParams = (operation.parameters || []).filter(p => p.in === 'query');
    const queryEntries = queryParams
      .map(p => [p.name, paramValues[p.name] || ''])
      .filter(([, v]) => v);
    if (queryEntries.length > 0) {
      url += '?' + queryEntries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    }
    return url;
  }, [serverUrl, path, operation.parameters, paramValues]);

  /** Build a cURL command string from the operation definition */
  const buildCurlCommand = () => {
    const url = buildUrl();
    const lines: string[] = [`curl -X ${method.toUpperCase()} '${url}'`];
    lines.push(`  -H 'Accept: application/json'`);
    // Add custom headers
    (operation.parameters || []).filter(p => p.in === 'header').forEach(p => {
      const val = headerValues[p.name] || paramValues[p.name];
      if (val) lines.push(`  -H '${p.name}: ${val}'`);
    });
    if (operation.security) lines.push(`  -H 'Authorization: Bearer <token>'`);
    if (requestSchema) {
      lines.push(`  -H 'Content-Type: application/json'`);
      lines.push(`  -d '${bodyValue || resolveSchemaDisplay(requestSchema, schemas)}'`);
    }
    return lines.join(' \\\n');
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(buildCurlCommand()).then(() => {
      setCurlCopied(true);
      setTimeout(() => setCurlCopied(false), 2000);
    });
  };

  /** Send the actual request */
  const handleSendRequest = async () => {
    setSending(true);
    setDebugResult(null);
    setDebugError(null);
    const url = buildUrl();
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    // Add header params
    (operation.parameters || []).filter(p => p.in === 'header').forEach(p => {
      const val = headerValues[p.name] || paramValues[p.name];
      if (val) headers[p.name] = val;
    });
    if (requestSchema) headers['Content-Type'] = 'application/json';
    const start = performance.now();
    try {
      const resp = await fetch(url, {
        method: method.toUpperCase(),
        headers,
        body: requestSchema && bodyValue ? bodyValue : undefined,
      });
      const elapsed = Math.round(performance.now() - start);
      const respHeaders: Record<string, string> = {};
      resp.headers.forEach((v, k) => { respHeaders[k] = v; });
      let respBody: string;
      const ct = resp.headers.get('content-type') || '';
      if (ct.includes('json')) {
        try {
          const json = await resp.json();
          respBody = JSON.stringify(json, null, 2);
        } catch {
          respBody = await resp.text();
        }
      } else {
        respBody = await resp.text();
      }
      setDebugResult({ status: resp.status, statusText: resp.statusText, headers: respHeaders, body: respBody, time: elapsed });
    } catch (err: any) {
      setDebugError(err?.message || String(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden" style={{ borderLeftColor: color, borderLeftWidth: '3px' }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
      >
        <span
          className="inline-flex items-center justify-center rounded-md text-white px-2.5 py-0.5 text-[12px] uppercase min-w-[56px]"
          style={{ backgroundColor: color, fontWeight: 700 }}
        >
          {method}
        </span>
        <span className="text-[13px] font-mono text-foreground flex-1" style={{ fontWeight: 500 }}>{path}</span>
        <span className="text-[12px] text-muted-foreground truncate max-w-[300px]">{operation.summary}</span>
        {operation.deprecated && (
          <span className="text-[12px] line-through text-muted-foreground">{t.common.deprecated}</span>
        )}
        {operation.security && <Lock size={12} className="text-orange-500" />}
        {expanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
      </div>

      {expanded && (
        <div className="border-t border-border">
          {/* Description */}
          {operation.description && (
            <div
              className="px-4 py-3 text-[13px] text-muted-foreground border-b border-border md-preview"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(operation.description) }}
            />
          )}

          {/* Parameters */}
          {(operation.parameters || []).length > 0 && (
            <div className="px-4 py-3 border-b border-border">
              <h4 className="text-[12px] text-foreground mb-2" style={{ fontWeight: 600 }}>{t.common.parameters}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border">
                      <th className="text-left py-1.5 pr-4" style={{ fontWeight: 500 }}>{t.common.name}</th>
                      <th className="text-left py-1.5 pr-4" style={{ fontWeight: 500 }}>In</th>
                      <th className="text-left py-1.5 pr-4" style={{ fontWeight: 500 }}>{t.common.type}</th>
                      <th className="text-left py-1.5 pr-4" style={{ fontWeight: 500 }}>{t.common.required}</th>
                      <th className="text-left py-1.5" style={{ fontWeight: 500 }}>{t.common.description}</th>
                      {debugMode && <th className="text-left py-1.5 pl-2" style={{ fontWeight: 500 }}>{t.preview.paramValue}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(operation.parameters || []).map((param, i) => (
                      <tr key={i} className="border-b border-border last:border-b-0">
                        <td className="py-1.5 pr-4 font-mono text-foreground">{param.name}</td>
                        <td className="py-1.5 pr-4">
                          <span className="px-1.5 py-0.5 rounded bg-muted text-[12px]">{param.in}</span>
                        </td>
                        <td className="py-1.5 pr-4 text-muted-foreground">{param.schema?.type as string || '—'}</td>
                        <td className="py-1.5 pr-4">
                          {param.required ? (
                            <span className="text-destructive text-[12px]">{t.common.required}</span>
                          ) : (
                            <span className="text-muted-foreground text-[12px]">{t.common.optional}</span>
                          )}
                        </td>
                        <td className="py-1.5 text-muted-foreground">{param.description || '—'}</td>
                        {debugMode && (
                          <td className="py-1.5 pl-2">
                            <input
                              value={param.in === 'header' ? (headerValues[param.name] || '') : (paramValues[param.name] || '')}
                              onChange={(e) => {
                                if (param.in === 'header') {
                                  setHeaderValues(prev => ({ ...prev, [param.name]: e.target.value }));
                                } else {
                                  setParamValues(prev => ({ ...prev, [param.name]: e.target.value }));
                                }
                              }}
                              placeholder={param.schema?.default != null ? String(param.schema.default) : ''}
                              className="w-full min-w-[100px] px-2 py-0.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Request Body */}
          {requestSchema && (
            <div className="px-4 py-3 border-b border-border">
              <h4 className="text-[12px] text-foreground mb-2" style={{ fontWeight: 600 }}>{t.preview.requestBodyContent}</h4>
              {debugMode ? (
                <textarea
                  value={bodyValue}
                  onChange={(e) => setBodyValue(e.target.value)}
                  className="w-full h-32 text-[12px] bg-muted/50 rounded-lg p-3 font-mono text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                  spellCheck={false}
                />
              ) : (
                <pre className="text-[12px] bg-muted/50 rounded-lg p-3 font-mono text-foreground overflow-x-auto">
                  {resolveSchemaDisplay(requestSchema, schemas)}
                </pre>
              )}
            </div>
          )}

          {/* Responses */}
          <div className="px-4 py-3">
            <h4 className="text-[12px] text-foreground mb-2" style={{ fontWeight: 600 }}>{t.common.responses}</h4>
            <div className="space-y-2">
              {responseEntries.map(([code, resp]) => {
                const respSchema = resp.content?.['application/json']?.schema;
                return (
                  <div key={code} className="rounded-lg border border-border overflow-hidden">
                    <div className={`flex items-center gap-2 px-3 py-1.5 text-[12px] ${
                      code.startsWith('2') ? 'bg-green-500/5' :
                      code.startsWith('4') ? 'bg-yellow-500/5' :
                      code.startsWith('5') ? 'bg-red-500/5' : 'bg-muted/30'
                    }`}>
                      <span className={`${
                        code.startsWith('2') ? 'text-green-600' :
                        code.startsWith('4') ? 'text-yellow-600' :
                        code.startsWith('5') ? 'text-red-600' : 'text-muted-foreground'
                      }`} style={{ fontWeight: 600 }}>{code}</span>
                      <span className="text-muted-foreground">{resp.description}</span>
                    </div>
                    {respSchema && (
                      <pre className="text-[12px] bg-muted/20 p-3 font-mono text-foreground overflow-x-auto border-t border-border">
                        {resolveSchemaDisplay(respSchema, schemas)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Try-it / Debug area */}
          <div className="px-4 py-3 border-t border-border bg-muted/10">
            <div className="flex items-center gap-3">
              <Terminal size={12} className="text-muted-foreground shrink-0" />
              <span className="text-[12px] text-muted-foreground font-mono flex-1 truncate">
                {method.toUpperCase()} {buildUrl()}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(buildUrl())}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title={t.common.copy}
              >
                <Copy size={11} />
              </button>
              <button
                onClick={handleCopyCurl}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] transition-all shrink-0 ${
                  curlCopied
                    ? 'bg-green-600/10 text-green-600 border border-green-600/20'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground border border-border'
                }`}
                title="Copy as cURL command"
              >
                <Copy size={11} />
                {curlCopied ? t.common.copied : 'cURL'}
              </button>
              <button
                onClick={() => setDebugMode(!debugMode)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] transition-all shrink-0 ${
                  debugMode
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground border border-border'
                }`}
              >
                <Play size={11} />
                {t.preview.tryItOut}
              </button>
            </div>

            {/* Debug controls */}
            {debugMode && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendRequest}
                    disabled={sending}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {sending ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                    {sending ? t.preview.sending : t.preview.sendRequest}
                  </button>
                </div>

                {/* Debug error */}
                {debugError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
                    <AlertCircle size={14} className="text-destructive shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[12px] text-destructive" style={{ fontWeight: 600 }}>{t.preview.debugError}</div>
                      <div className="text-[12px] text-destructive/80 mt-0.5 font-mono">{debugError}</div>
                    </div>
                  </div>
                )}

                {/* Debug result */}
                {debugResult && (
                  <div className="rounded-lg border border-border overflow-hidden">
                    {/* Status bar */}
                    <div className={`flex items-center gap-3 px-3 py-2 text-[12px] ${
                      debugResult.status < 300 ? 'bg-green-500/10' :
                      debugResult.status < 400 ? 'bg-yellow-500/10' : 'bg-red-500/10'
                    }`}>
                      <span className={`${
                        debugResult.status < 300 ? 'text-green-600' :
                        debugResult.status < 400 ? 'text-yellow-600' : 'text-red-600'
                      }`} style={{ fontWeight: 700 }}>
                        {debugResult.status} {debugResult.statusText}
                      </span>
                      <span className="text-muted-foreground text-[12px]">
                        {t.preview.responseTime}: {debugResult.time}ms
                      </span>
                    </div>
                    {/* Response headers */}
                    <div className="px-3 py-2 border-t border-border">
                      <h5 className="text-[12px] text-muted-foreground mb-1" style={{ fontWeight: 600 }}>{t.preview.responseHeaders}</h5>
                      <div className="text-[12px] font-mono text-foreground/80 space-y-0.5 max-h-[100px] overflow-y-auto">
                        {Object.entries(debugResult.headers).map(([k, v]) => (
                          <div key={k}><span className="text-primary">{k}</span>: {v}</div>
                        ))}
                      </div>
                    </div>
                    {/* Response body */}
                    <div className="px-3 py-2 border-t border-border">
                      <h5 className="text-[12px] text-muted-foreground mb-1" style={{ fontWeight: 600 }}>{t.preview.responseBody}</h5>
                      <pre className="text-[12px] bg-muted/50 rounded-lg p-3 font-mono text-foreground overflow-x-auto max-h-[300px] overflow-y-auto">
                        {debugResult.body}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PreviewPanel() {
  const { t } = useI18n();
  const { state } = useDesigner();
  const isDark = useDark();
  const doc = state.document;

  useEffect(() => { initMarkdown(); }, []);
  const schemas = doc.components?.schemas || {};

  // --- Server switcher state ---
  const servers = doc.servers || [];
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [serverVarValues, setServerVarValues] = useState<Record<string, string>>({});

  // Compute effective server URL with variable substitution
  const selectedServer = servers[selectedServerIndex] || null;
  const computeServerUrl = useCallback(() => {
    if (!selectedServer) return 'https://api.example.com';
    let url = selectedServer.url;
    if (selectedServer.variables) {
      Object.entries(selectedServer.variables).forEach(([varName, varObj]) => {
        const val = serverVarValues[varName] || varObj.default || '';
        url = url.replace(`{${varName}}`, val);
      });
    }
    return url;
  }, [selectedServer, serverVarValues]);
  const serverUrl = computeServerUrl();

  // Reset variable values when switching servers
  useEffect(() => {
    if (selectedServer?.variables) {
      const defaults: Record<string, string> = {};
      Object.entries(selectedServer.variables).forEach(([name, v]) => {
        defaults[name] = v.default || '';
      });
      setServerVarValues(defaults);
    } else {
      setServerVarValues({});
    }
  }, [selectedServerIndex, servers.length]);

  // --- Tag collapse/expand state ---
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());

  const toggleTag = (tagName: string) => {
    setExpandedTags(prev => {
      const next = new Set(prev);
      if (next.has(tagName)) next.delete(tagName);
      else next.add(tagName);
      return next;
    });
  };

  // Group endpoints by tags
  const tags = doc.tags || [];
  const pathEntries = Object.entries(doc.paths || {});

  // Collect all operations
  const allOps: { path: string; method: HttpMethod; operation: OperationObject; tags: string[] }[] = [];
  pathEntries.forEach(([path, pathItem]) => {
    HTTP_METHODS.forEach(method => {
      const op = pathItem[method] as OperationObject | undefined;
      if (op) {
        allOps.push({ path, method, operation: op, tags: op.tags || ['default'] });
      }
    });
  });

  // Group by tag
  const tagGroups: Record<string, typeof allOps> = {};
  allOps.forEach(op => {
    op.tags.forEach(tag => {
      if (!tagGroups[tag]) tagGroups[tag] = [];
      tagGroups[tag].push(op);
    });
  });

  const tagNames = Object.keys(tagGroups);
  const allExpanded = tagNames.length > 0 && tagNames.every(t => expandedTags.has(t));

  const handleToggleAll = () => {
    if (allExpanded) {
      setExpandedTags(new Set());
    } else {
      setExpandedTags(new Set(tagNames));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with API info */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-foreground">{doc.info.title}</h1>
            {doc.info.description && (
              <div
                className="text-[13px] text-muted-foreground mt-2 md-preview"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(doc.info.description, isDark) }}
              />
            )}
          </div>
          <span className="text-[12px] px-3 py-1 rounded-full bg-primary/10 text-primary" style={{ fontWeight: 500 }}>
            v{doc.info.version}
          </span>
        </div>

        {doc.info.contact && (
          <div className="mt-3 flex items-center gap-4 text-[12px] text-muted-foreground">
            {doc.info.contact.name && <span>{doc.info.contact.name}</span>}
            {doc.info.contact.email && <span>{doc.info.contact.email}</span>}
            {doc.info.contact.url && (
              <a href={doc.info.contact.url} className="flex items-center gap-1 text-primary hover:underline">
                <ExternalLink size={10} /> Website
              </a>
            )}
          </div>
        )}
      </div>

      {/* Server info panel */}
      {servers.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="text-[13px] text-foreground flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Server size={14} className="text-green-500" />
            {t.servers.title}
          </h3>
          {servers.length === 1 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-[12px]">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-mono text-foreground">{serverUrl}</span>
              {selectedServer?.description && <span className="text-muted-foreground">({selectedServer.description})</span>}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {servers.map((server, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedServerIndex(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all ${
                    i === selectedServerIndex
                      ? 'bg-primary/10 border border-primary/30 text-primary'
                      : 'bg-muted/50 border border-transparent text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${i === selectedServerIndex ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                  <span className="font-mono">{server.url}</span>
                  {server.description && <span className="text-[12px] opacity-70">({server.description})</span>}
                </button>
              ))}
            </div>
          )}

          {/* Server variables editing */}
          {selectedServer?.variables && Object.keys(selectedServer.variables).length > 0 && (
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Settings2 size={12} className="text-muted-foreground" />
                <span className="text-[12px] text-muted-foreground" style={{ fontWeight: 600 }}>{t.preview.serverVariables}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(selectedServer.variables).map(([varName, varObj]) => (
                  <div key={varName} className="flex items-center gap-2">
                    <label className="text-[12px] font-mono text-foreground shrink-0 min-w-[60px]">{varName}</label>
                    {varObj.enum && varObj.enum.length > 0 ? (
                      <select
                        value={serverVarValues[varName] || varObj.default || ''}
                        onChange={(e) => setServerVarValues(prev => ({ ...prev, [varName]: e.target.value }))}
                        className="flex-1 px-2 py-1 rounded border border-border bg-background text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {varObj.enum.map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={serverVarValues[varName] || ''}
                        onChange={(e) => setServerVarValues(prev => ({ ...prev, [varName]: e.target.value }))}
                        placeholder={varObj.default || ''}
                        className="flex-1 px-2 py-1 rounded border border-border bg-background text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Authentication info */}
      {doc.components?.securitySchemes && Object.keys(doc.components.securitySchemes).length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-[13px] text-foreground flex items-center gap-2 mb-3" style={{ fontWeight: 600 }}>
            <Lock size={14} className="text-orange-500" />
            {t.preview.authorization}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(doc.components.securitySchemes).map(([name, scheme]) => (
              <div key={name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/5 border border-orange-500/20 text-[12px]">
                <Lock size={10} className="text-orange-500" />
                <span className="font-mono text-foreground">{name}</span>
                <span className="text-muted-foreground">({scheme.type})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expand/Collapse all toggle */}
      {tagNames.length > 0 && (
        <div className="flex items-center justify-start">
          <button
            onClick={handleToggleAll}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border text-[12px] text-muted-foreground hover:bg-muted transition-colors"
          >
            <ChevronsUpDown size={12} />
            {allExpanded ? t.preview.collapseAll : t.preview.expandAll}
          </button>
        </div>
      )}

      {/* Endpoints grouped by tags — collapsible */}
      {tagNames.map(tagName => {
        const ops = tagGroups[tagName];
        const tagInfo = tags.find(tg => tg.name === tagName);
        const isExpanded = expandedTags.has(tagName);
        return (
          <div key={tagName}>
            <div
              className="flex items-center gap-2 mb-3 cursor-pointer select-none group"
              onClick={() => toggleTag(tagName)}
            >
              {isExpanded
                ? <ChevronDown size={14} className="text-muted-foreground" />
                : <ChevronRight size={14} className="text-muted-foreground" />
              }
              <h3 className="text-[14px] text-foreground capitalize group-hover:text-primary transition-colors" style={{ fontWeight: 600 }}>{tagName}</h3>
              {tagInfo?.description && (
                <span className="text-[12px] text-muted-foreground">— {tagInfo.description}</span>
              )}
              <span className="text-[12px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {ops.length}
              </span>
            </div>
            {isExpanded && (
              <div className="space-y-2">
                {ops.map((op, i) => (
                  <EndpointPreview
                    key={`${op.path}-${op.method}-${i}`}
                    path={op.path}
                    method={op.method}
                    operation={op.operation}
                    schemas={schemas}
                    serverUrl={serverUrl}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {allOps.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Eye size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-[13px]">{t.preview.noContent}</p>
        </div>
      )}

      {/* Schemas section */}
      {Object.keys(schemas).length > 0 && (() => {
        const schemaNames = Object.keys(schemas);
        const allSchemasExpanded = schemaNames.length > 0 && schemaNames.every(n => expandedSchemas.has(n));
        const handleToggleAllSchemas = () => {
          if (allSchemasExpanded) {
            setExpandedSchemas(new Set());
          } else {
            setExpandedSchemas(new Set(schemaNames));
          }
        };
        const toggleSchema = (name: string) => {
          setExpandedSchemas(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
          });
        };
        return (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] text-foreground" style={{ fontWeight: 600 }}>{t.schemas.title}</h3>
            <button
              onClick={handleToggleAllSchemas}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border text-[12px] text-muted-foreground hover:bg-muted transition-colors"
            >
              <ChevronsUpDown size={12} />
              {allSchemasExpanded ? t.preview.collapseAll : t.preview.expandAll}
            </button>
          </div>
          <div className="space-y-3">
            {Object.entries(schemas).map(([name, schema]) => {
              const isSchemaExpanded = expandedSchemas.has(name);
              return (
              <div key={name} className="bg-card rounded-xl border border-border overflow-hidden">
                <div
                  className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2 cursor-pointer select-none group"
                  onClick={() => toggleSchema(name)}
                >
                  {isSchemaExpanded
                    ? <ChevronDown size={14} className="text-muted-foreground" />
                    : <ChevronRight size={14} className="text-muted-foreground" />
                  }
                  <span className="text-[13px] font-mono text-foreground group-hover:text-primary transition-colors" style={{ fontWeight: 500 }}>{name}</span>
                  <span className="text-[12px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-600">
                    {typeof schema.type === 'string' ? schema.type : 'object'}
                  </span>
                </div>
                {isSchemaExpanded && (
                  <>
                    {schema.description && (
                      <div className="px-4 py-2 text-[12px] text-muted-foreground border-b border-border">
                        {schema.description}
                      </div>
                    )}
                    <pre className="px-4 py-3 text-[12px] font-mono text-foreground overflow-x-auto">
                      {resolveSchemaDisplay(schema, schemas)}
                    </pre>
                  </>
                )}
              </div>
              );
            })}
          </div>
        </div>
        );
      })()}
    </div>
  );
}