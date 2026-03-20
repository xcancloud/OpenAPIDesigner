import React, { useState } from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import {
  Eye, ChevronDown, ChevronRight, ExternalLink, Lock, Copy, Send, Loader2
} from 'lucide-react';
import type { HttpMethod, OperationObject, SchemaObject } from '../types/openapi';
import { HTTP_METHODS, METHOD_COLORS } from '../types/openapi';

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
  const [mockResponse, setMockResponse] = useState<string | null>(null);
  const [mockLoading, setMockLoading] = useState(false);
  const color = METHOD_COLORS[method];

  const responseEntries = Object.entries(operation.responses || {});
  const hasRequestBody = !!operation.requestBody;
  const requestSchema = hasRequestBody
    ? operation.requestBody?.content?.['application/json']?.schema
    : undefined;

  const handleTryIt = () => {
    setMockLoading(true);
    setMockResponse(null);
    // Simulate API call with mock data
    setTimeout(() => {
      const firstResponse = responseEntries[0];
      if (firstResponse) {
        const [code, resp] = firstResponse;
        const respSchema = resp.content?.['application/json']?.schema;
        const body = respSchema ? resolveSchemaDisplay(respSchema, schemas) : '{}';
        let parsedBody: unknown;
        try {
          parsedBody = JSON.parse(body.replace(/\n/g, '').replace(/,\s*}/g, '}').replace(/,\s*]/g, ']'));
        } catch {
          parsedBody = body;
        }
        setMockResponse(JSON.stringify({
          status: parseInt(code),
          statusText: resp.description,
          headers: {
            'content-type': 'application/json',
            'x-request-id': Math.random().toString(36).substring(2, 15),
          },
          body: parsedBody,
        }, null, 2));
      }
      setMockLoading(false);
    }, 800);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden" style={{ borderLeftColor: color, borderLeftWidth: '3px' }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
      >
        <span
          className="inline-flex items-center justify-center rounded-md text-white px-2.5 py-0.5 text-[11px] uppercase min-w-[56px]"
          style={{ backgroundColor: color, fontWeight: 700 }}
        >
          {method}
        </span>
        <span className="text-[13px] font-mono text-foreground flex-1" style={{ fontWeight: 500 }}>{path}</span>
        <span className="text-[12px] text-muted-foreground truncate max-w-[300px]">{operation.summary}</span>
        {operation.deprecated && (
          <span className="text-[10px] line-through text-muted-foreground">{t.common.deprecated}</span>
        )}
        {operation.security && <Lock size={12} className="text-orange-500" />}
        {expanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
      </div>

      {expanded && (
        <div className="border-t border-border">
          {/* Description */}
          {operation.description && (
            <div className="px-4 py-3 text-[13px] text-muted-foreground border-b border-border">
              {operation.description}
            </div>
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
                    </tr>
                  </thead>
                  <tbody>
                    {(operation.parameters || []).map((param, i) => (
                      <tr key={i} className="border-b border-border last:border-b-0">
                        <td className="py-1.5 pr-4 font-mono text-foreground">{param.name}</td>
                        <td className="py-1.5 pr-4">
                          <span className="px-1.5 py-0.5 rounded bg-muted text-[10px]">{param.in}</span>
                        </td>
                        <td className="py-1.5 pr-4 text-muted-foreground">{param.schema?.type as string || '—'}</td>
                        <td className="py-1.5 pr-4">
                          {param.required ? (
                            <span className="text-destructive text-[10px]">{t.common.required}</span>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">{t.common.optional}</span>
                          )}
                        </td>
                        <td className="py-1.5 text-muted-foreground">{param.description || '—'}</td>
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
              <h4 className="text-[12px] text-foreground mb-2" style={{ fontWeight: 600 }}>{t.common.requestBody}</h4>
              <pre className="text-[11px] bg-muted/50 rounded-lg p-3 font-mono text-foreground overflow-x-auto">
                {resolveSchemaDisplay(requestSchema, schemas)}
              </pre>
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
                      <pre className="text-[11px] bg-muted/20 p-3 font-mono text-foreground overflow-x-auto border-t border-border">
                        {resolveSchemaDisplay(respSchema, schemas)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Try it out */}
          <div className="px-4 py-3 border-t border-border bg-muted/10">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px] text-muted-foreground font-mono flex-1 truncate">
                {serverUrl}{path}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(`${serverUrl}${path}`)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title={t.common.copy}
              >
                <Copy size={11} />
              </button>
              <button
                onClick={handleTryIt}
                disabled={mockLoading}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-[11px] hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
              >
                {mockLoading ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                {t.preview.tryItOut}
              </button>
            </div>
            {mockResponse && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Mock Response</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(mockResponse); }}
                    className="p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <Copy size={10} />
                  </button>
                </div>
                <pre className="text-[11px] bg-[#0d1117] dark:bg-[#0d1117] text-[#c9d1d9] rounded-lg p-3 font-mono overflow-x-auto max-h-[200px] overflow-y-auto">
                  {mockResponse}
                </pre>
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
  const doc = state.document;
  const schemas = doc.components?.schemas || {};
  const serverUrl = doc.servers?.[0]?.url || 'https://api.example.com';

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

  return (
    <div className="space-y-6">
      {/* Header with API info */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-foreground">{doc.info.title}</h1>
            <p className="text-[13px] text-muted-foreground mt-1">{doc.info.description}</p>
          </div>
          <span className="text-[12px] px-3 py-1 rounded-full bg-primary/10 text-primary" style={{ fontWeight: 500 }}>
            v{doc.info.version}
          </span>
        </div>
        {doc.servers && doc.servers.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {doc.servers.map((server, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 text-[12px]">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-mono text-foreground">{server.url}</span>
                {server.description && <span className="text-muted-foreground">({server.description})</span>}
              </div>
            ))}
          </div>
        )}
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

      {/* Endpoints grouped by tags */}
      {Object.entries(tagGroups).map(([tagName, ops]) => {
        const tagInfo = tags.find(t => t.name === tagName);
        return (
          <div key={tagName}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-[14px] text-foreground capitalize" style={{ fontWeight: 600 }}>{tagName}</h3>
              {tagInfo?.description && (
                <span className="text-[12px] text-muted-foreground">— {tagInfo.description}</span>
              )}
              <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {ops.length}
              </span>
            </div>
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
      {Object.keys(schemas).length > 0 && (
        <div>
          <h3 className="text-[14px] text-foreground mb-3" style={{ fontWeight: 600 }}>{t.schemas.title}</h3>
          <div className="space-y-3">
            {Object.entries(schemas).map(([name, schema]) => (
              <div key={name} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center gap-2">
                  <span className="text-[13px] font-mono text-foreground" style={{ fontWeight: 500 }}>{name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-600">
                    {typeof schema.type === 'string' ? schema.type : 'object'}
                  </span>
                </div>
                {schema.description && (
                  <div className="px-4 py-2 text-[12px] text-muted-foreground border-b border-border">
                    {schema.description}
                  </div>
                )}
                <pre className="px-4 py-3 text-[11px] font-mono text-foreground overflow-x-auto">
                  {resolveSchemaDisplay(schema, schemas)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}