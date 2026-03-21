/**
 * Export utilities for OpenAPI documents.
 * Supports Markdown, HTML (print-ready / TOC / full OAS 3.1), Word (.doc), PDF (browser print).
 * Zero external dependencies — standard browser APIs only.
 *
 * OAS 3.1 coverage:
 *  ✓ info (title, summary, description, termsOfService, contact, license, version)
 *  ✓ servers + variables
 *  ✓ tags + externalDocs
 *  ✓ paths + webhooks, all HTTP methods
 *  ✓ operation: summary, description, operationId, deprecated, tags, security, externalDocs
 *  ✓ parameters: name, in, description, required, deprecated, schema (with constraints)
 *  ✓ requestBody: description, required, content (media-types with schema)
 *  ✓ responses: description, headers, content (media-types with schema)
 *  ✓ schema: type, format, enum, const, nullable, min/max, minLength/maxLength, pattern,
 *            minItems/maxItems, uniqueItems, items, properties, required, additionalProperties,
 *            allOf, oneOf, anyOf, not, $ref, example, default, readOnly, writeOnly, deprecated
 *  ✓ components: schemas, responses, parameters, requestBodies, securitySchemes
 *  ✓ securitySchemes: all types, OAuth2 flows + scopes
 *  ✓ global security requirements
 */

import type {
  OpenAPIDocument,
  OperationObject,
  SchemaObject,
  ParameterObject,
  OAuthFlowObject,
} from '../types/openapi';
import { HTTP_METHODS } from '../types/openapi';
import { renderMarkdown, MARKDOWN_CSS } from './markdown';
import { locales, type Locale } from '../i18n/locales';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeFilename(title: string): string {
  return (title || 'openapi')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase() || 'openapi';
}

/** HTML-escape a string (safe for attribute and text content) */
function esc(s: string | undefined | null): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Escape for Markdown table cells */
function md(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');
}

/** Convert a string to a URL-safe slug for anchor IDs */
function slug(s: string): string {
  return s.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Resolve a local $ref (e.g. #/components/schemas/Foo) into the referenced object */
function resolveRef<T>(ref: string, doc: OpenAPIDocument): T | null {
  if (!ref.startsWith('#/')) return null;
  const parts = ref.slice(2).split('/');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = doc;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return null;
    cur = cur[p];
  }
  return (cur as T) ?? null;
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ─── Schema type helpers ──────────────────────────────────────────────────────

/** Short inline type label, e.g. "string(email)", "integer", "Pet", "string[]" */
function schemaTypeLabel(schema: SchemaObject, doc: OpenAPIDocument): string {
  if (schema.$ref) {
    const name = schema.$ref.split('/').pop() || '$ref';
    return resolveRef<SchemaObject>(schema.$ref, doc) ? name : schema.$ref;
  }
  const base = Array.isArray(schema.type)
    ? (schema.type as string[]).join(' | ')
    : (schema.type ?? '');
  let label = base;
  if (schema.format) label += `(${schema.format})`;
  if (base === 'array' && schema.items) label += `[${schemaTypeLabel(schema.items, doc)}]`;
  return label || 'any';
}

/** Collect notable constraints as human-readable strings */
function schemaConstraints(schema: SchemaObject): string[] {
  const c: string[] = [];
  if (schema.enum) c.push(`enum: [${(schema.enum as unknown[]).map(v => JSON.stringify(v)).join(', ')}]`);
  if (schema.const !== undefined) c.push(`const: ${JSON.stringify(schema.const)}`);
  if (schema.minimum !== undefined) c.push(`min: ${schema.minimum}`);
  if (schema.maximum !== undefined) c.push(`max: ${schema.maximum}`);
  if (schema.exclusiveMinimum !== undefined) c.push(`excl.min: ${schema.exclusiveMinimum}`);
  if (schema.exclusiveMaximum !== undefined) c.push(`excl.max: ${schema.exclusiveMaximum}`);
  if (schema.minLength !== undefined) c.push(`minLen: ${schema.minLength}`);
  if (schema.maxLength !== undefined) c.push(`maxLen: ${schema.maxLength}`);
  if (schema.pattern) c.push(`pattern: /${schema.pattern}/`);
  if (schema.minItems !== undefined) c.push(`minItems: ${schema.minItems}`);
  if (schema.maxItems !== undefined) c.push(`maxItems: ${schema.maxItems}`);
  if (schema.uniqueItems) c.push('uniqueItems');
  if (schema.readOnly) c.push('readOnly');
  if (schema.writeOnly) c.push('writeOnly');
  if (schema.deprecated) c.push('deprecated');
  if (schema.nullable) c.push('nullable');
  if (schema.default !== undefined) c.push(`default: ${JSON.stringify(schema.default)}`);
  return c;
}

// ─── Operation grouping ───────────────────────────────────────────────────────

interface OpEntry {
  kind: 'path' | 'webhook';
  path: string;
  method: string;
  op: OperationObject;
}

function collectByTag(doc: OpenAPIDocument): {
  tagOrder: string[];
  byTag: Record<string, OpEntry[]>;
  untagged: OpEntry[];
  tagDescriptions: Record<string, string>;
  tagExternalDocs: Record<string, { description?: string; url: string }>;
} {
  const byTag: Record<string, OpEntry[]> = {};
  const untagged: OpEntry[] = [];
  const tagOrder: string[] = [];
  const tagDescriptions: Record<string, string> = {};
  const tagExternalDocs: Record<string, { description?: string; url: string }> = {};
  for (const t of doc.tags || []) {
    tagDescriptions[t.name] = t.description || '';
    if (t.externalDocs) tagExternalDocs[t.name] = t.externalDocs;
  }

  function processPathMap(pathMap: Record<string, unknown>, kind: 'path' | 'webhook') {
    for (const [path, pathItem] of Object.entries(pathMap)) {
      for (const method of HTTP_METHODS) {
        const op = (pathItem as Record<string, unknown>)[method] as OperationObject | undefined;
        if (!op) continue;
        const tags = (op.tags || []).filter(Boolean);
        if (tags.length === 0) {
          untagged.push({ kind, path, method, op });
        } else {
          for (const tag of tags) {
            if (!byTag[tag]) {
              byTag[tag] = [];
              tagOrder.push(tag);
            }
            byTag[tag].push({ kind, path, method, op });
          }
        }
      }
    }
  }

  if (doc.paths) processPathMap(doc.paths as Record<string, unknown>, 'path');
  if (doc.webhooks) processPathMap(doc.webhooks as Record<string, unknown>, 'webhook');

  return { tagOrder: [...new Set(tagOrder)], byTag, untagged, tagDescriptions, tagExternalDocs };
}

// ─── Markdown export ──────────────────────────────────────────────────────────

function generateMarkdown(doc: OpenAPIDocument, locale: Locale = 'en'): string {
  const t = locales[locale];
  const L: string[] = [];
  const push = (...lines: string[]) => L.push(...lines);
  const nl = () => L.push('');

  // ── Header ────────────────────────────────────────────────────────────────
  push(`# ${doc.info.title}`);
  nl();
  if (doc.info.summary) { push(`> ${doc.info.summary}`); nl(); }
  if (doc.info.description) { push(doc.info.description); nl(); }

  const metaRows: [string, string][] = [
    [t.export.version, doc.info.version],
    [t.export.openAPI, doc.openapi],
  ];
  if (doc.info.termsOfService) metaRows.push([t.export.termsOfService, doc.info.termsOfService]);
  if (doc.info.contact) {
    const c = doc.info.contact;
    const parts = [c.name ?? '', c.email ? `<${c.email}>` : '', c.url ? `[link](${c.url})` : ''].filter(Boolean);
    if (parts.length) metaRows.push([t.export.contact, parts.join(' · ')]);
  }
  if (doc.info.license?.name) {
    const l = doc.info.license;
    metaRows.push([t.export.license, l.url ? `[${l.name}](${l.url})` : l.name]);
  }
  if (doc.externalDocs) {
    const ed = doc.externalDocs;
    metaRows.push([t.export.externalDocs, `[${ed.description || ed.url}](${ed.url})`]);
  }
  push('| Field | Value |', '|---|---|');
  metaRows.forEach(([k, v]) => push(`| **${k}** | ${md(v)} |`));
  nl();

  // ── Table of Contents ────────────────────────────────────────────────────
  const { tagOrder, byTag, untagged, tagDescriptions, tagExternalDocs } = collectByTag(doc);
  push(`## ${t.export.contents}`); nl();
  if (doc.servers?.length) push(`- [${t.export.servers}](#servers)`);
  if (doc.security?.length) push(`- [${t.export.security}](#global-security)`);
  push(`- [${t.export.endpoints}](#endpoints)`);
  for (const tag of tagOrder) push(`  - [${tag}](#${slug(tag)})`);
  if (untagged.length) push(`  - [${t.export.untagged}](#untagged)`);
  if (doc.components?.schemas && Object.keys(doc.components.schemas).length) push(`- [${t.export.schemas}](#schemas)`);
  if (doc.components?.securitySchemes && Object.keys(doc.components.securitySchemes).length) push(`- [${t.export.securitySchemes}](#security-schemes)`);
  nl();

  // ── Servers ───────────────────────────────────────────────────────────────
  if (doc.servers?.length) {
    push(`## ${t.export.servers}`); nl();
    push('| URL | Description |', '|---|---|');
    for (const s of doc.servers) {
      push(`| \`${md(s.url)}\` | ${md(s.description || '')} |`);
    }
    nl();
    for (const s of doc.servers) {
      if (s.variables && Object.keys(s.variables).length) {
        push(`**${t.export.variables} \`${s.url}\`**`); nl();
        push(`| ${t.export.variable} | ${t.export.default} | ${t.export.enumValues} | ${t.export.description} |`, '|---|---|---|---|');
        for (const [vn, vo] of Object.entries(s.variables)) {
          push(`| \`${vn}\` | \`${vo.default}\` | ${vo.enum ? vo.enum.map(e => `\`${e}\``).join(', ') : ''} | ${md(vo.description || '')} |`);
        }
        nl();
      }
    }
  }

  // ── Global security ───────────────────────────────────────────────────────
  if (doc.security?.length) {
    push(`## ${t.export.security}`); nl();
    for (const req of doc.security) {
      const parts = Object.entries(req).map(([name, scopes]) =>
        scopes.length ? `**${name}** (${t.export.scopes}: ${scopes.join(', ')})` : `**${name}**`
      );
      push(`- ${parts.join(' + ')}`);
    }
    nl();
  }

  // ── Endpoints ─────────────────────────────────────────────────────────────
  const allGroups: Array<{ tag: string; ops: OpEntry[]; anchor: string }> = [
    ...tagOrder.map(tag => ({ tag, ops: byTag[tag] || [], anchor: slug(tag) })),
    ...(untagged.length ? [{ tag: t.export.untagged, ops: untagged, anchor: 'untagged' }] : []),
  ];

  if (allGroups.some(g => g.ops.length)) {
    push(`## ${t.export.endpoints}`); nl();

    for (const { tag, ops, anchor } of allGroups) {
      if (!ops.length) continue;
      push(`### ${tag} {#${anchor}}`); nl();
      if (tagDescriptions[tag]) { push(tagDescriptions[tag]); nl(); }
      if (tagExternalDocs[tag]) {
        const ed = tagExternalDocs[tag];
        push(`📖 [${ed.description || 'External Docs'}](${ed.url})`);
        nl();
      }

      for (const { kind, path, method, op } of ops) {
        const pathLabel = kind === 'webhook' ? `${path} *(webhook)*` : path;
        push(`#### ${method.toUpperCase()} \`${pathLabel}\``); nl();

        if (op.deprecated) { push('> ⚠️ **Deprecated**'); nl(); }
        if (op.summary) { push(`**${op.summary}**`); nl(); }
        if (op.description) { push(op.description); nl(); }
        if (op.operationId) { push(`- **operationId:** \`${op.operationId}\``); nl(); }
        if (op.externalDocs) {
          push(`- 📖 [${op.externalDocs.description || 'External Docs'}](${op.externalDocs.url})`);
          nl();
        }
        if (op.security !== undefined) {
          const secStr = op.security.length === 0
            ? '*(public — no auth)*'
            : op.security.map(req =>
                Object.entries(req).map(([n, sc]) => sc.length ? `${n}(${sc.join(',')})` : n).join('+')
              ).join(' or ');
          push(`- **Security:** ${secStr}`); nl();
        }

        // Parameters
        if (op.parameters?.length) {
          push(`**${t.export.parameters}**`); nl();
          push(`| ${t.export.name} | ${t.export.paramIn} | ${t.export.type} | ${t.export.constraints} | ${t.export.required.charAt(0).toUpperCase()} | ${t.export.description} |`);
          push('|------|----|------|-------------|:---:|-------------|');
          for (const rawP of op.parameters as ParameterObject[]) {
            const rawPAny = rawP as unknown as Record<string, unknown>;
            const p = rawPAny.$ref
              ? (resolveRef<ParameterObject>(rawPAny.$ref as string, doc) ?? rawP)
              : rawP;
            const t2 = p.schema ? schemaTypeLabel(p.schema, doc) : '';
            const cs = p.schema ? schemaConstraints(p.schema).join(', ') : '';
            push(`| \`${p.name}\` | ${p.in} | \`${md(t2)}\` | ${md(cs)} | ${p.required ? '✓' : ''} | ${md(p.description || '')} |`);
          }
          nl();
        }

        // Request body
        if (op.requestBody) {
          const rb = op.requestBody;
          push(`**${t.export.requestBody}**${rb.required ? ' *(required)*' : ''}`); nl();
          if (rb.description) { push(rb.description); nl(); }
          for (const [ct, media] of Object.entries(rb.content || {})) {
            push(`- **${ct}**`);
            if (media.schema) {
              const s = media.schema;
              if (s.$ref) {
                push(`  - ${t.export.schema}: [\`${s.$ref.split('/').pop()}\`](#${slug(s.$ref.split('/').pop() || '')})`);
              } else {
                push(`  - ${t.export.type}: \`${schemaTypeLabel(s, doc)}\``);
                const cs = schemaConstraints(s);
                if (cs.length) push(`  - ${t.export.constraints}: ${cs.join(', ')}`);
              }
            }
          }
          nl();
        }

        // Responses
        if (op.responses && Object.keys(op.responses).length) {
          push(`**${t.export.responses}**`); nl();
          push('| Status | Description | Content-Types |');
          push('|--------|-------------|---------------|');
          for (const [code, resp] of Object.entries(op.responses)) {
            const cts = resp.content ? Object.keys(resp.content).map(c => `\`${c}\``).join(', ') : '';
            push(`| \`${code}\` | ${md(resp.description || '')} | ${cts} |`);
          }
          nl();
          // Response headers
          for (const [code, resp] of Object.entries(op.responses)) {
            if (resp.headers && Object.keys(resp.headers).length) {
              push(`${t.export.responses} \`${code}\` ${t.export.headers}:`); nl();
              push(`| ${t.export.headers.charAt(0).toUpperCase() + t.export.headers.slice(1)} | ${t.export.type} | ${t.export.description} |`, '|--------|------|-------------|');
              for (const [hName, hObj] of Object.entries(resp.headers)) {
                const hType = hObj.schema ? schemaTypeLabel(hObj.schema, doc) : '';
                push(`| \`${hName}\` | \`${hType}\` | ${md(hObj.description || '')} |`);
              }
              nl();
            }
          }
        }

        push('---'); nl();
      }
    }
  }

  // ── Schemas ────────────────────────────────────────────────────────────────
  const schemas = doc.components?.schemas;
  if (schemas && Object.keys(schemas).length) {
    push(`## ${t.export.schemas}`); nl();

    function renderSchemaMd(schema: SchemaObject, name: string, depth = 0): void {
      const indent = '  '.repeat(depth);
      if (depth === 0) { push(`### ${name}`); nl(); }
      if (schema.$ref) {
        push(`${indent}→ [\`${schema.$ref.split('/').pop()}\`](#${slug(schema.$ref.split('/').pop() || '')})`);
        nl(); return;
      }
      if (schema.description && depth === 0) { push(schema.description); nl(); }
      const typeLine = schemaTypeLabel(schema, doc);
      const cs = schemaConstraints(schema);
      if (depth === 0) {
        if (typeLine !== 'any') push(`- **${t.export.type}:** \`${typeLine}\``);
        if (cs.length) push(`- **${t.export.constraints}:** ${cs.join(', ')}`);
        if (schema.example !== undefined) push(`- **Example:** \`${JSON.stringify(schema.example)}\``);
        nl();
      }
      for (const [kw, items] of [['allOf', schema.allOf], ['oneOf', schema.oneOf], ['anyOf', schema.anyOf]] as [string, SchemaObject[] | undefined][]) {
        if (!items?.length) continue;
        push(`${indent}**${kw}:**`); nl();
        items.forEach((s, i) => { push(`${indent}*${t.export.option} ${i + 1}:*`); renderSchemaMd(s, '', depth + 1); });
      }
      if (schema.not) { push(`${indent}**not:**`); renderSchemaMd(schema.not, '', depth + 1); }
      if (schema.properties && Object.keys(schema.properties).length) {
        push(`| ${t.export.property} | ${t.export.type} | ${t.export.required} | ${t.export.constraints} | ${t.export.description} |`);
        push('|----------|------|:--------:|-------------|-------------|');
        const req = schema.required || [];
        for (const [pName, pSchema] of Object.entries(schema.properties)) {
          const propType = schemaTypeLabel(pSchema, doc);
          const pcs = schemaConstraints(pSchema).join(', ');
          push(`| \`${pName}\` | \`${md(propType)}\` | ${req.includes(pName) ? '✓' : ''} | ${md(pcs)} | ${md(pSchema.description || '')} |`);
        }
        nl();
        for (const [pName, pSchema] of Object.entries(schema.properties)) {
          if (pSchema.properties || pSchema.allOf || pSchema.oneOf || pSchema.anyOf) {
            push(`**\`${pName}\` ${t.export.property.toLowerCase()}s:**`);
            renderSchemaMd(pSchema, '', depth + 1);
          }
        }
      }
      if (schema.items) { push(`${indent}**${t.export.items}:** \`${schemaTypeLabel(schema.items, doc)}\``); nl(); }
      if (typeof schema.additionalProperties === 'object') {
        push(`${indent}**${t.export.additionalProperties}:** \`${schemaTypeLabel(schema.additionalProperties as SchemaObject, doc)}\``);
        nl();
      }
    }

    for (const [name, schema] of Object.entries(schemas)) { renderSchemaMd(schema, name); }
  }

  // ── Reusable parameters ───────────────────────────────────────────────────
  if (doc.components?.parameters && Object.keys(doc.components.parameters).length) {
    push(`## ${t.export.reusableParameters}`); nl();
    push(`| ${t.export.name} | ${t.export.paramIn} | ${t.export.type} | ${t.export.description} |`, '|---|---|---|---|');
    for (const [name, p] of Object.entries(doc.components.parameters)) {
      const paramType = p.schema ? schemaTypeLabel(p.schema, doc) : '';
      push(`| \`${name}\` | ${p.in} | \`${paramType}\` | ${md(p.description || '')} |`);
    }
    nl();
  }

  // ── Security schemes ──────────────────────────────────────────────────────
  if (doc.components?.securitySchemes && Object.keys(doc.components.securitySchemes).length) {
    push(`## ${t.export.securitySchemes}`); nl();
    for (const [name, scheme] of Object.entries(doc.components.securitySchemes)) {
      push(`### ${name}`); nl();
      push(`- **${t.export.type}:** \`${scheme.type}\``);
      if (scheme.description) push(`- **${t.export.description}:** ${scheme.description}`);
      if (scheme.in) push(`- **${t.export.in}:** \`${scheme.in}\``);
      if (scheme.name) push(`- **${t.export.parameterName}:** \`${scheme.name}\``);
      if (scheme.scheme) push(`- **${t.export.httpScheme}:** \`${scheme.scheme}\``);
      if (scheme.bearerFormat) push(`- **${t.export.bearerFormat}:** \`${scheme.bearerFormat}\``);
      if (scheme.openIdConnectUrl) push(`- **OpenID Connect URL:** ${scheme.openIdConnectUrl}`);
      if (scheme.flows) {
        nl(); push('**OAuth2 Flows:**'); nl();
        const flowList: [string, OAuthFlowObject | undefined][] = [
          ['Implicit', scheme.flows.implicit],
          ['Password', scheme.flows.password],
          ['Client Credentials', scheme.flows.clientCredentials],
          ['Authorization Code', scheme.flows.authorizationCode],
        ];
        for (const [flowName, flow] of flowList) {
          if (!flow) continue;
          push(`*${flowName}:*`);
          if (flow.authorizationUrl) push(`  - authorizationUrl: ${flow.authorizationUrl}`);
          if (flow.tokenUrl) push(`  - tokenUrl: ${flow.tokenUrl}`);
          if (flow.refreshUrl) push(`  - refreshUrl: ${flow.refreshUrl}`);
          if (flow.scopes && Object.keys(flow.scopes).length) {
            push(`  - Scopes:`);
            for (const [sc, desc] of Object.entries(flow.scopes)) push(`    - \`${sc}\`: ${desc}`);
          }
        }
      }
      nl();
    }
  }

  return L.join('\n');
}

// ══════════════════════════════════════════════════════════════════════════════
// HTML GENERATOR
// ══════════════════════════════════════════════════════════════════════════════

const METHOD_COLORS: Record<string, { bg: string; fg: string }> = {
  get:     { bg: '#10b981', fg: '#fff' },
  post:    { bg: '#3b82f6', fg: '#fff' },
  put:     { bg: '#f59e0b', fg: '#fff' },
  patch:   { bg: '#8b5cf6', fg: '#fff' },
  delete:  { bg: '#ef4444', fg: '#fff' },
  head:    { bg: '#6b7280', fg: '#fff' },
  options: { bg: '#6b7280', fg: '#fff' },
  trace:   { bg: '#6b7280', fg: '#fff' },
};

const HTML_CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px; color: #111827; line-height: 1.7; background: #fff;
}
a { color: #2563eb; text-decoration: none; }
a:hover { text-decoration: underline; }
code, pre { font-family: ui-monospace, 'Cascadia Code', 'Fira Code', 'Source Code Pro', monospace; }
code { background: #f3f4f6; border-radius: 4px; padding: 1px 6px; font-size: 12px; }

/* Layout */
.layout { display: flex; min-height: 100vh; }
.toc-sidebar {
  width: 240px; flex-shrink: 0; position: sticky; top: 0; height: 100vh;
  overflow-y: auto; border-right: 1px solid #e5e7eb; padding: 24px 0; background: #fafafa;
}
.toc-sidebar::-webkit-scrollbar { width: 4px; }
.toc-sidebar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
.main { flex: 1; min-width: 0; padding: 48px 56px 80px; max-width: 900px; }
.toc-title {
  font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  color: #9ca3af; padding: 0 20px 10px; border-bottom: 1px solid #e5e7eb; margin-bottom: 10px;
}
.toc-section {
  display: block; padding: 5px 20px; font-size: 12px; font-weight: 600; color: #374151;
  text-decoration: none; border-left: 2px solid transparent;
}
.toc-section:hover { background: #f3f4f6; color: #111827; border-left-color: #6b7280; }
.toc-item {
  display: flex; align-items: center; gap: 6px; padding: 4px 20px 4px 26px; font-size: 12px;
  color: #6b7280; text-decoration: none; border-left: 2px solid transparent;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.toc-item:hover { background: #f3f4f6; color: #111827; border-left-color: #d1d5db; }
.toc-method-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

/* Headers */
h1 {
  font-size: 28px; font-weight: 800; color: #030712; margin-bottom: 6px;
  padding-bottom: 16px; border-bottom: 3px solid #e5e7eb;
}
h2 {
  font-size: 18px; font-weight: 700; color: #111827; margin: 48px 0 16px;
  padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; scroll-margin-top: 24px;
}
h3 { font-size: 15px; font-weight: 700; color: #1f2937; margin: 32px 0 12px; scroll-margin-top: 24px; }

/* Meta table */
.meta-table { border-collapse: collapse; margin: 16px 0 28px; font-size: 13px; }
.meta-table th {
  text-align: left; padding: 5px 16px 5px 0; color: #6b7280;
  font-weight: 600; font-size: 12px; white-space: nowrap; vertical-align: top;
}
.meta-table td { padding: 5px 0; color: #111827; }

/* Info badges */
.info-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
.badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; gap: 4px; }
.badge-version { background: #dbeafe; color: #1e40af; }
.badge-oas     { background: #d1fae5; color: #065f46; }

/* Server card */
.server-card {
  background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
  padding: 12px 16px; margin: 8px 0; font-size: 13px;
}
.server-desc { color: #6b7280; font-size: 12px; margin-top: 2px; }

/* Operation card */
.operation {
  border: 1px solid #e5e7eb; border-radius: 10px; margin: 12px 0; overflow: hidden;
  scroll-margin-top: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.op-header {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px;
  background: #f9fafb; flex-wrap: wrap; border-bottom: 1px solid #e5e7eb;
}
.method-badge {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 3px 10px; border-radius: 5px; font-size: 12px; font-weight: 800;
  letter-spacing: 0.6px; min-width: 62px; flex-shrink: 0;
}
.op-path { font-size: 13.5px; font-weight: 700; font-family: ui-monospace, monospace; }
.op-summary { font-size: 12.5px; color: #6b7280; flex: 1; }
.op-description { padding: 10px 16px; font-size: 13px; color: #4b5563; border-bottom: 1px solid #f9fafb; }
.op-meta { font-size: 12px; color: #6b7280; padding: 4px 16px 8px; }
.op-section { padding: 0 16px 14px; }
.section-label {
  font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;
  color: #9ca3af; margin: 14px 0 8px; padding-top: 2px; border-top: 1px solid #f3f4f6;
}

/* In-location badges */
.in-badge { display: inline-block; padding: 1px 7px; border-radius: 4px; font-size: 12px; font-weight: 700; vertical-align: middle; }
.in-path   { background: #fce7f3; color: #be185d; }
.in-query  { background: #dbeafe; color: #1d4ed8; }
.in-header { background: #d1fae5; color: #047857; }
.in-cookie { background: #fef3c7; color: #92400e; }
.badge-webhook { background: #ede9fe; color: #6d28d9; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; }
.badge-depr { background: #fef9c3; color: #92400e; padding: 1px 7px; border-radius: 4px; font-size: 12px; font-weight: 700; }

/* Security chips */
.sec-chip {
  display: inline-flex; align-items: center; gap: 4px; background: #f0f9ff;
  border: 1px solid #bae6fd; color: #0369a1; padding: 2px 8px; border-radius: 20px;
  font-size: 12px; font-weight: 600; margin: 2px 3px 2px 0;
}

/* Data tables */
.data-table { width: 100%; border-collapse: collapse; font-size: 12.5px; margin: 6px 0; }
.data-table th {
  background: #f9fafb; text-align: left; padding: 7px 12px; border-bottom: 2px solid #e5e7eb;
  color: #374151; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;
}
.data-table td { padding: 7px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #fafafa; }
.td-req { text-align: center; color: #ef4444; font-weight: 700; }
.constr { font-size: 12px; color: #6b7280; }
code.status { padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 12px; }
.s2xx { background: #dcfce7; color: #166534; }
.s3xx { background: #dbeafe; color: #1e40af; }
.s4xx { background: #fef3c7; color: #92400e; }
.s5xx { background: #fee2e2; color: #991b1b; }

/* Schema card */
.schema-card {
  border: 1px solid #e5e7eb; border-radius: 10px; margin: 12px 0;
  overflow: hidden; scroll-margin-top: 24px;
}
.schema-header {
  background: #f5f3ff; border-bottom: 1px solid #e5e7eb;
  padding: 10px 16px; display: flex; align-items: center; gap: 10px;
}
.schema-name { font-weight: 700; font-size: 14px; color: #4c1d95; }
.schema-body { padding: 12px 16px; }
.compose-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #8b5cf6; margin: 10px 0 6px; }
.nested-schema { margin-left: 16px; border-left: 3px solid #ede9fe; padding-left: 12px; margin-top: 6px; }

/* Security scheme card */
.scheme-card { border: 1px solid #e5e7eb; border-radius: 10px; margin: 12px 0; overflow: hidden; }
.scheme-header { background: #f0fdf4; border-bottom: 1px solid #e5e7eb; padding: 10px 16px; display: flex; align-items: center; gap: 10px; }
.scheme-name { font-weight: 700; font-size: 14px; color: #065f46; }
.scheme-body { padding: 12px 16px; }
.flow-card { border: 1px solid #d1fae5; border-radius: 6px; padding: 10px 14px; margin: 8px 0; background: #fafffe; }
.flow-name { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #047857; margin-bottom: 6px; }
.scope-row { display: flex; gap: 8px; margin: 3px 0; font-size: 12px; }
.scope-name { background: #d1fae5; color: #065f46; padding: 1px 7px; border-radius: 4px; font-weight: 600; font-size: 12px; }

/* Print */
@media print {
  .toc-sidebar { display: none; }
  .layout { display: block; }
  .main { padding: 0; max-width: 100%; }
  body { font-size: 14px; color: #000; }
  h1 { font-size: 22px; page-break-after: avoid; }
  h2 { font-size: 15px; page-break-inside: avoid; margin-top: 28px; }
  h3 { font-size: 13px; page-break-inside: avoid; }
  .operation { page-break-inside: avoid; border: 1px solid #ccc; margin: 8px 0; box-shadow: none; }
  .schema-card { page-break-inside: avoid; }
  a { color: #000; }
  a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 12px; color: #666; }
  @page { margin: 20mm 15mm; }
}
`;

function generateHTML(doc: OpenAPIDocument, locale: Locale = 'en'): string {
  const t = locales[locale];
  const { tagOrder, byTag, untagged, tagDescriptions, tagExternalDocs } = collectByTag(doc);

  // ── Schema type as HTML (with $ref link) ────────────────────────────────────
  function schemaTypeHtml(schema: SchemaObject): string {
    if (schema.$ref) {
      const name = schema.$ref.split('/').pop() || '';
      return `<a href="#schema-${slug(name)}"><code>${esc(name)}</code></a>`;
    }
    return `<code>${esc(schemaTypeLabel(schema, doc))}</code>`;
  }

  // ── Constraint chips ─────────────────────────────────────────────────────────
  function constraintsHtml(schema: SchemaObject): string {
    const cs = schemaConstraints(schema);
    if (!cs.length) return '';
    return cs.map(c => `<code class="constr" style="background:#f0fdf4;color:#166534;margin:1px">${esc(c)}</code>`).join(' ');
  }

  // ── Status code badge ────────────────────────────────────────────────────────
  function statusBadge(code: string): string {
    const cls = code.startsWith('2') ? 's2xx' : code.startsWith('3') ? 's3xx'
              : code.startsWith('4') ? 's4xx' : code.startsWith('5') ? 's5xx' : '';
    return `<code class="status ${cls}">${esc(code)}</code>`;
  }

  // ── Security requirement chips ───────────────────────────────────────────────
  function securityHtml(reqs: Array<Record<string, string[]>>): string {
    if (reqs.length === 0) return `<span class="sec-chip">🔓 Public (no auth)</span>`;
    return reqs.map(req =>
      Object.entries(req).map(([name, scopes]) =>
        `<span class="sec-chip">🔒 ${esc(name)}${scopes.length ? ` <span style="opacity:.7;font-weight:400">[${scopes.map(esc).join(', ')}]</span>` : ''}</span>`
      ).join('')
    ).join('<span style="color:#9ca3af;margin:0 4px;font-size:12px">or</span>');
  }

  // ── Schema renderer (recursive) ──────────────────────────────────────────────
  function renderSchemaHtml(schema: SchemaObject, depth = 0): string {
    if (schema.$ref) {
      const name = schema.$ref.split('/').pop() || '';
      return `<p style="margin:4px 0">→ <a href="#schema-${slug(name)}"><code>${esc(name)}</code></a></p>`;
    }
    let html = '';
    const cs = constraintsHtml(schema);
    if (depth > 0) {
      const typeLabel = schemaTypeLabel(schema, doc);
      if (typeLabel !== 'any') html += `<div style="margin:4px 0">${schemaTypeHtml(schema)} ${cs}</div>`;
      if (schema.description) html += `<div class="md-rendered" style="color:#6b7280;font-size:12px;margin:2px 0">${renderMarkdown(schema.description)}</div>`;
    }
    if (schema.example !== undefined) {
      html += `<div style="font-size:12px;color:#6b7280;margin:4px 0">Example: <code>${esc(JSON.stringify(schema.example))}</code></div>`;
    }
    // Composition: allOf / oneOf / anyOf / not
    for (const [kw, items] of [['allOf', schema.allOf], ['oneOf', schema.oneOf], ['anyOf', schema.anyOf]] as [string, SchemaObject[] | undefined][]) {
      if (!items?.length) continue;
      html += `<div class="compose-label">${kw}</div>`;
      items.forEach((s, i) => {
        html += `<div class="nested-schema"><div style="font-size:12px;color:#8b5cf6;font-weight:600;margin-bottom:4px">${t.export.option} ${i + 1}</div>${renderSchemaHtml(s, depth + 1)}</div>`;
      });
    }
    if (schema.not) html += `<div class="compose-label">not</div><div class="nested-schema">${renderSchemaHtml(schema.not, depth + 1)}</div>`;
    // Enum
    if (schema.enum) {
      html += `<div style="margin:6px 0;font-size:12px">${t.export.enum}: ${(schema.enum as unknown[]).map(v => `<code style="background:#f0fdf4;color:#166534">${esc(String(v))}</code>`).join(' ')}</div>`;
    }
    // Properties table
    if (schema.properties && Object.keys(schema.properties).length) {
      const req = schema.required || [];
      const rows = Object.entries(schema.properties).map(([pName, pSchema]) => {
        const hasNested = pSchema.properties || pSchema.allOf || pSchema.oneOf || pSchema.anyOf || pSchema.items;
        const nested = hasNested ? `<div class="nested-schema" style="margin-top:6px">${renderSchemaHtml(pSchema, depth + 1)}</div>` : '';
        const depBadge = pSchema.deprecated ? `<span class="badge-depr">depr</span>` : '';
        return `<tr>
          <td><code>${esc(pName)}</code>${req.includes(pName) ? '<span style="color:#ef4444;font-size:12px;margin-left:2px">*</span>' : ''} ${depBadge}</td>
          <td>${schemaTypeHtml(pSchema)}</td>
          <td>${constraintsHtml(pSchema)}</td>
          <td>${esc(pSchema.description || '')}${nested}</td>
        </tr>`;
      }).join('');
      html += `<table class="data-table" style="margin-top:8px">
        <thead><tr><th>${t.export.property}</th><th>${t.export.type}</th><th>${t.export.constraints}</th><th>${t.export.description}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    }
    // Array items
    if (schema.items) {
      html += `<div style="margin:8px 0;font-size:12px"><strong>${t.export.items}:</strong> ${schemaTypeHtml(schema.items)}`;
      if (schema.items.properties) html += `<div class="nested-schema">${renderSchemaHtml(schema.items, depth + 1)}</div>`;
      html += `</div>`;
    }
    // additionalProperties
    if (typeof schema.additionalProperties === 'object') {
      html += `<div style="margin:6px 0;font-size:12px"><strong>${t.export.additionalProperties}:</strong> ${schemaTypeHtml(schema.additionalProperties as SchemaObject)}</div>`;
    }
    return html;
  }

  // ── Parameters table ─────────────────────────────────────────────────────────
  function paramsTable(params: ParameterObject[]): string {
    const rows = params.map(rawP => {
      const rawPAny = rawP as unknown as Record<string, unknown>;
      const p = rawPAny.$ref
        ? (resolveRef<ParameterObject>(rawPAny.$ref as string, doc) ?? rawP)
        : rawP;
      const t = p.schema ? schemaTypeHtml(p.schema) : '';
      const cs = p.schema ? constraintsHtml(p.schema) : '';
      const inCls = `in-${p.in}`;
      const depBadge = p.deprecated ? `<span class="badge-depr">deprecated</span>` : '';
      return `<tr>
        <td><code>${esc(p.name)}</code> ${depBadge}</td>
        <td><span class="in-badge ${inCls}">${p.in}</span></td>
        <td>${t}</td>
        <td class="constr">${cs}</td>
        <td class="td-req">${p.required ? '✓' : ''}</td>
        <td>${esc(p.description || '')}</td>
      </tr>`;
    }).join('');
    return `<table class="data-table">
      <thead><tr><th>${t.export.name}</th><th>${t.export.paramIn}</th><th>${t.export.type}</th><th>${t.export.constraints}</th><th>${t.export.required.charAt(0).toUpperCase()}</th><th>${t.export.description}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  // ── Request body ─────────────────────────────────────────────────────────────
  function requestBodyHtml(rb: NonNullable<OperationObject['requestBody']>): string {
    let html = `<div class="op-section"><div class="section-label">${t.export.requestBody}${rb.required ? ' <span style="color:#ef4444">*</span>' : ''}</div>`;
    if (rb.description) html += `<div class="md-rendered" style="font-size:13px;color:#4b5563;margin-bottom:8px">${renderMarkdown(rb.description)}</div>`;
    for (const [ct, media] of Object.entries(rb.content || {})) {
      html += `<div style="margin-bottom:12px">
        <span style="font-size:12px;font-weight:700;padding:2px 8px;background:#f3f4f6;border-radius:4px;color:#374151">${esc(ct)}</span>`;
      if (media.schema) html += `<div style="margin-top:8px">${renderSchemaHtml(media.schema)}</div>`;
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  }

  // ── Responses ────────────────────────────────────────────────────────────────
  function responsesHtml(responses: NonNullable<OperationObject['responses']>): string {
    let html = `<div class="op-section"><div class="section-label">${t.export.responses}</div>`;
    for (const [code, resp] of Object.entries(responses)) {
      html += `<div style="border:1px solid #f3f4f6;border-radius:6px;margin-bottom:8px;overflow:hidden">
        <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:#f9fafb;border-bottom:1px solid #f3f4f6">
          ${statusBadge(code)}
          <span style="font-size:13px;color:#374151">${esc(resp.description || '')}</span>
        </div>`;
      if (resp.headers && Object.keys(resp.headers).length) {
        const hRows = Object.entries(resp.headers).map(([hName, hObj]) =>
          `<tr><td><code>${esc(hName)}</code></td><td>${hObj.schema ? schemaTypeHtml(hObj.schema) : ''}</td><td>${esc(hObj.description || '')}</td></tr>`
        ).join('');
        html += `<div style="padding:8px 12px;border-bottom:1px solid #f9fafb">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#9ca3af;margin-bottom:6px">${t.export.headers}</div>
          <table class="data-table"><thead><tr><th>${t.export.name}</th><th>${t.export.type}</th><th>${t.export.description}</th></tr></thead><tbody>${hRows}</tbody></table>
        </div>`;
      }
      if (resp.content && Object.keys(resp.content).length) {
        html += `<div style="padding:8px 12px">`;
        for (const [ct, media] of Object.entries(resp.content)) {
          html += `<div style="margin-bottom:8px">
            <span style="font-size:12px;font-weight:700;padding:2px 7px;background:#f3f4f6;border-radius:4px;color:#374151">${esc(ct)}</span>`;
          if (media.schema) html += `<div style="margin-top:6px">${renderSchemaHtml(media.schema)}</div>`;
          html += `</div>`;
        }
        html += `</div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  }

  // ── Render one operation ──────────────────────────────────────────────────────
  function renderOperation(entry: OpEntry): string {
    const { kind, path, method, op } = entry;
    const opId = `op-${slug(method + '-' + path)}`;
    const { bg, fg } = METHOD_COLORS[method] ?? { bg: '#6b7280', fg: '#fff' };
    const pathLabel = kind === 'webhook'
      ? `${esc(path)} <span class="badge-webhook">webhook</span>`
      : esc(path);

    let html = `<div class="operation" id="${opId}">
      <div class="op-header">
        <span class="method-badge" style="background:${bg};color:${fg}">${method.toUpperCase()}</span>
        <span class="op-path">${pathLabel}</span>
        ${op.summary ? `<span class="op-summary">${esc(op.summary)}</span>` : ''}
        ${op.deprecated ? `<span class="badge-depr">${t.export.deprecated}</span>` : ''}
        ${op.operationId ? `<code style="font-size:12px;color:#9ca3af;margin-left:auto">${esc(op.operationId)}</code>` : ''}
      </div>`;

    if (op.description) html += `<div class="op-description">${renderMarkdown(op.description)}</div>`;
    if (op.security !== undefined) html += `<div class="op-meta">${t.export.security}: ${securityHtml(op.security)}</div>`;
    if (op.externalDocs) html += `<div class="op-meta">📖 <a href="${esc(op.externalDocs.url)}" target="_blank">${esc(op.externalDocs.description || op.externalDocs.url)}</a></div>`;

    if ((op.parameters as ParameterObject[] | undefined)?.length) {
      html += `<div class="op-section"><div class="section-label">${t.export.parameters}</div>${paramsTable(op.parameters as ParameterObject[])}</div>`;
    }
    if (op.requestBody) html += requestBodyHtml(op.requestBody);
    if (op.responses && Object.keys(op.responses).length) html += responsesHtml(op.responses);

    html += `</div>`;
    return html;
  }

  // ── TOC sidebar ──────────────────────────────────────────────────────────────
  function buildToc(): string {
    let html = `<nav class="toc-sidebar"><div class="toc-title">${t.export.contents}</div>`;
    html += `<a class="toc-section" href="#api-info">${t.export.overview}</a>`;
    if (doc.servers?.length) html += `<a class="toc-section" href="#servers">${t.export.servers}</a>`;
    if (tagOrder.length || untagged.length) {
      html += `<a class="toc-section" href="#endpoints">${t.export.endpoints}</a>`;
      for (const tag of tagOrder) {
        html += `<a class="toc-item" href="#tag-${slug(tag)}">${esc(tag)}</a>`;
        for (const { method, path, op } of byTag[tag] || []) {
          const color = METHOD_COLORS[method]?.bg ?? '#6b7280';
          html += `<a class="toc-item" href="#op-${slug(method + '-' + path)}" style="padding-left:36px">
            <span class="toc-method-dot" style="background:${color}"></span>
            <span style="color:#374151;font-size:12px;overflow:hidden;text-overflow:ellipsis">${esc(op.summary || path)}</span>
          </a>`;
        }
      }
      if (untagged.length) html += `<a class="toc-item" href="#tag-untagged">${t.export.untagged}</a>`;
    }
    const schemas = doc.components?.schemas;
    if (schemas && Object.keys(schemas).length) {
      html += `<a class="toc-section" href="#schemas">${t.export.schemas}</a>`;
      for (const name of Object.keys(schemas)) {
        html += `<a class="toc-item" href="#schema-${slug(name)}">${esc(name)}</a>`;
      }
    }
    if (doc.components?.securitySchemes && Object.keys(doc.components.securitySchemes).length) {
      html += `<a class="toc-section" href="#security-schemes">${t.export.security}</a>`;
    }
    html += `</nav>`;
    return html;
  }

  // ── Overview ─────────────────────────────────────────────────────────────────
  function overviewSection(): string {
    const metaRows: [string, string][] = [
      [t.export.openAPI, esc(doc.openapi)],
      [t.export.version, esc(doc.info.version)],
    ];
    if (doc.info.termsOfService) metaRows.push([t.export.termsOfService, `<a href="${esc(doc.info.termsOfService)}" target="_blank">${esc(doc.info.termsOfService)}</a>`]);
    if (doc.info.contact) {
      const c = doc.info.contact;
      const parts = [
        c.name ? esc(c.name) : '',
        c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : '',
        c.url ? `<a href="${esc(c.url)}" target="_blank">${esc(c.url)}</a>` : '',
      ].filter(Boolean);
      if (parts.length) metaRows.push([t.export.contact, parts.join(' · ')]);
    }
    if (doc.info.license?.name) {
      const l = doc.info.license;
      metaRows.push([t.export.license, l.url ? `<a href="${esc(l.url)}" target="_blank">${esc(l.name)}</a>` : esc(l.name)]);
    }
    if (doc.externalDocs) {
      metaRows.push([t.export.externalDocs, `<a href="${esc(doc.externalDocs.url)}" target="_blank">${esc(doc.externalDocs.description || doc.externalDocs.url)}</a>`]);
    }
    let html = `<section id="api-info">
      <h1>${esc(doc.info.title)}</h1>
      <div class="info-badges">
        <span class="badge badge-version">v${esc(doc.info.version)}</span>
        <span class="badge badge-oas">OAS ${esc(doc.openapi)}</span>
      </div>`;
    if (doc.info.summary) html += `<p style="font-size:15px;color:#4b5563;margin:8px 0 14px">${esc(doc.info.summary)}</p>`;
    if (doc.info.description) html += `<div class="md-rendered" style="color:#374151;margin-bottom:16px;line-height:1.8">${renderMarkdown(doc.info.description)}</div>`;
    html += `<table class="meta-table">${metaRows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table>`;
    html += `</section>`;
    return html;
  }

  // ── Servers ──────────────────────────────────────────────────────────────────
  function serversSection(): string {
    if (!doc.servers?.length) return '';
    let html = `<section><h2 id="servers">${t.export.servers}</h2>`;
    for (const s of doc.servers) {
      html += `<div class="server-card">
        <div><code style="font-size:13px;font-weight:700">${esc(s.url)}</code></div>
        ${s.description ? `<div class="server-desc">${esc(s.description)}</div>` : ''}`;
      if (s.variables && Object.keys(s.variables).length) {
        const rows = Object.entries(s.variables).map(([vn, vo]) => {
          const enumVals = vo.enum ? vo.enum.map(e => `<code>${esc(e)}</code>`).join(', ') : '';
          return `<tr><td><code>${esc(vn)}</code></td><td><code>${esc(vo.default)}</code></td><td>${enumVals}</td><td>${esc(vo.description || '')}</td></tr>`;
        }).join('');
        html += `<table class="data-table" style="margin-top:10px">
          <thead><tr><th>${t.export.variable}</th><th>${t.export.default}</th><th>${t.export.enumValues}</th><th>${t.export.description}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
      }
      html += `</div>`;
    }
    html += `</section>`;
    return html;
  }

  // ── Endpoints ────────────────────────────────────────────────────────────────
  function endpointsSection(): string {
    const allGroups = [
      ...tagOrder.map(tag => ({ tag, ops: byTag[tag] || [], tagId: `tag-${slug(tag)}` })),
      ...(untagged.length ? [{ tag: t.export.untagged, ops: untagged, tagId: 'tag-untagged' }] : []),
    ];
    if (!allGroups.some(g => g.ops.length)) return '';

    let html = `<section><h2 id="endpoints">${t.export.endpoints}</h2>`;
    for (const { tag, ops, tagId } of allGroups) {
      if (!ops.length) continue;
      html += `<div id="${tagId}"><h3>${esc(tag)}</h3>`;
      if (tagDescriptions[tag]) html += `<div class="md-rendered" style="color:#6b7280;margin-bottom:12px">${renderMarkdown(tagDescriptions[tag])}</div>`;
      if (tagExternalDocs[tag]) {
        const ed = tagExternalDocs[tag];
        html += `<p style="margin-bottom:12px">📖 <a href="${esc(ed.url)}" target="_blank">${esc(ed.description || ed.url)}</a></p>`;
      }
      html += ops.map(renderOperation).join('');
      html += `</div>`;
    }
    html += `</section>`;
    return html;
  }

  function schemasSection(): string {
    const schemas = doc.components?.schemas;
    if (!schemas || !Object.keys(schemas).length) return '';

    let html = `<section><h2 id="schemas">${t.export.schemas}</h2>`;
    for (const [name, schema] of Object.entries(schemas)) {
      const typeLabel = schemaTypeLabel(schema, doc);
      html += `<div class="schema-card" id="schema-${slug(name)}">
        <div class="schema-header">
          <span class="schema-name">${esc(name)}</span>
          ${typeLabel !== 'any' ? `<code style="font-size:12px;background:#ede9fe;color:#6d28d9;padding:2px 8px;border-radius:4px">${esc(typeLabel)}</code>` : ''}
          ${schema.deprecated ? `<span class="badge-depr">deprecated</span>` : ''}
        </div>
        <div class="schema-body">
          ${schema.description ? `<div class="md-rendered" style="color:#4b5563;margin-bottom:12px">${renderMarkdown(schema.description)}</div>` : ''}
          ${constraintsHtml(schema) ? `<div style="margin-bottom:10px">${constraintsHtml(schema)}</div>` : ''}
          ${renderSchemaHtml(schema)}
        </div>
      </div>`;
    }
    html += `</section>`;
    return html;
  }

  // ── Reusable components ───────────────────────────────────────────────────────
  function componentsSection(): string {
    let html = '';
    const { parameters, responses: compResp, requestBodies } = doc.components ?? {};
    if (parameters && Object.keys(parameters).length) {
      const rows = Object.entries(parameters).map(([name, p]) => {
        const schemaType = p.schema ? schemaTypeHtml(p.schema) : '';
        return `<tr><td><code>${esc(name)}</code></td><td><span class="in-badge in-${p.in}">${p.in}</span></td><td>${schemaType}</td><td>${esc(p.description || '')}</td></tr>`;
      }).join('');
      html += `<section><h2>${t.export.reusableParameters}</h2>
        <table class="data-table"><thead><tr><th>${t.export.name}</th><th>${t.export.paramIn}</th><th>${t.export.type}</th><th>${t.export.description}</th></tr></thead><tbody>${rows}</tbody></table>
      </section>`;
    }
    if (compResp && Object.keys(compResp).length) {
      html += `<section><h2>${t.export.reusableResponses}</h2>`;
      for (const [name, resp] of Object.entries(compResp)) {
        html += `<div style="margin:8px 0;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px">
          <strong>${esc(name)}</strong> <span style="color:#6b7280;font-size:13px">— ${esc(resp.description || '')}</span>
        </div>`;
      }
      html += `</section>`;
    }
    if (requestBodies && Object.keys(requestBodies).length) {
      html += `<section><h2>${t.export.reusableRequestBodies}</h2>`;
      for (const [name, rb] of Object.entries(requestBodies)) {
        html += `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin:8px 0">
          <strong>${esc(name)}</strong>${rb.required ? '<span style="color:#ef4444;margin-left:4px">*</span>' : ''}
          ${rb.description ? `<p style="color:#6b7280;font-size:13px;margin-top:4px">${esc(rb.description)}</p>` : ''}
          ${requestBodyHtml(rb)}
        </div>`;
      }
      html += `</section>`;
    }
    return html;
  }

  // ── Security schemes ──────────────────────────────────────────────────────────
  function securitySchemesSection(): string {
    const schemes = doc.components?.securitySchemes;
    if (!schemes || !Object.keys(schemes).length) return '';
    let html = `<section><h2 id="security-schemes">${t.export.securitySchemes}</h2>`;
    for (const [name, scheme] of Object.entries(schemes)) {
      html += `<div class="scheme-card">
        <div class="scheme-header">
          <span class="scheme-name">${esc(name)}</span>
          <span style="font-size:12px;font-weight:700;padding:2px 8px;background:#d1fae5;color:#065f46;border-radius:4px">${esc(scheme.type)}</span>
        </div>
        <div class="scheme-body">`;
      if (scheme.description) html += `<p style="color:#4b5563;margin-bottom:10px">${esc(scheme.description)}</p>`;
      const details: [string, string | undefined][] = [
        [t.export.in, scheme.in], [t.export.parameterName, scheme.name],
        [t.export.httpScheme, scheme.scheme], [t.export.bearerFormat, scheme.bearerFormat],
        [t.export.openIdConnectUrl, scheme.openIdConnectUrl],
      ];
      const detailRows = details.filter(([, v]) => v).map(([k, v]) =>
        `<tr><th>${esc(k)}</th><td><code>${esc(v!)}</code></td></tr>`
      ).join('');
      if (detailRows) html += `<table class="meta-table" style="margin-bottom:14px"><tbody>${detailRows}</tbody></table>`;

      if (scheme.flows) {
        const flowList: [string, OAuthFlowObject | undefined][] = [
          [t.export.implicit, scheme.flows.implicit], [t.export.password, scheme.flows.password],
          [t.export.clientCredentials, scheme.flows.clientCredentials], [t.export.authorizationCode, scheme.flows.authorizationCode],
        ];
        for (const [flowName, flow] of flowList) {
          if (!flow) continue;
          html += `<div class="flow-card"><div class="flow-name">${esc(flowName)}</div>`;
          if (flow.authorizationUrl) html += `<div style="font-size:12px;margin-bottom:4px">${t.export.authorizationUrl}: <a href="${esc(flow.authorizationUrl)}" target="_blank">${esc(flow.authorizationUrl)}</a></div>`;
          if (flow.tokenUrl) html += `<div style="font-size:12px;margin-bottom:4px">${t.export.tokenUrl}: <a href="${esc(flow.tokenUrl)}" target="_blank">${esc(flow.tokenUrl)}</a></div>`;
          if (flow.refreshUrl) html += `<div style="font-size:12px;margin-bottom:8px">${t.export.refreshUrl}: <a href="${esc(flow.refreshUrl)}" target="_blank">${esc(flow.refreshUrl)}</a></div>`;
          if (flow.scopes && Object.keys(flow.scopes).length) {
            html += `<div style="font-size:12px;font-weight:700;color:#047857;margin-bottom:6px">${t.export.scopes}</div>`;
            for (const [sc, desc] of Object.entries(flow.scopes)) {
              html += `<div class="scope-row"><span class="scope-name">${esc(sc)}</span><span style="color:#4b5563">${esc(desc)}</span></div>`;
            }
          }
          html += `</div>`;
        }
      }
      html += `</div></div>`;
    }
    if (doc.security?.length) {
      html += `<div style="margin-top:20px"><h3>${t.export.globalSecurityRequirement}</h3>
        <div style="margin-top:8px">${securityHtml(doc.security)}</div>
      </div>`;
    }
    html += `</section>`;
    return html;
  }

  // ── Assemble ──────────────────────────────────────────────────────────────────
  const body = [
    overviewSection(),
    serversSection(),
    endpointsSection(),
    schemasSection(),
    componentsSection(),
    securitySchemesSection(),
  ].join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(doc.info.title)} v${esc(doc.info.version)} — API Docs</title>
  <style>${HTML_CSS}
${MARKDOWN_CSS}</style>
</head>
<body>
  <div class="layout">
    ${buildToc()}
    <main class="main">${body}</main>
  </div>
</body>
</html>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC EXPORT FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

export function downloadMarkdown(doc: OpenAPIDocument, locale: Locale = 'en'): void {
  downloadBlob(
    generateMarkdown(doc, locale),
    `${sanitizeFilename(doc.info.title)}.md`,
    'text/markdown; charset=utf-8'
  );
}

export function downloadHtml(doc: OpenAPIDocument, locale: Locale = 'en'): void {
  downloadBlob(
    generateHTML(doc, locale),
    `${sanitizeFilename(doc.info.title)}.html`,
    'text/html; charset=utf-8'
  );
}

/**
 * Opens generated HTML in a new tab then triggers the browser print dialog.
 * User can choose "Save as PDF". Falls back to HTML download if popup is blocked.
 */
export function printPdf(doc: OpenAPIDocument, locale: Locale = 'en'): void {
  const html = generateHTML(doc, locale);
  const win = window.open('', '_blank');
  if (!win) { downloadHtml(doc, locale); return; }
  win.document.write(html);
  win.document.close();
  win.addEventListener('load', () => { setTimeout(() => { win.focus(); win.print(); }, 400); });
  setTimeout(() => { win.focus(); win.print(); }, 900);
}

/**
 * Downloads as .doc (HTML-based). Word, LibreOffice, Google Docs all open it.
 * BOM prefix ensures correct UTF-8 rendering in Word.
 */
export function downloadWord(doc: OpenAPIDocument, locale: Locale = 'en'): void {
  downloadBlob(
    '\ufeff' + generateWordHTML(doc, locale),
    `${sanitizeFilename(doc.info.title)}.doc`,
    'application/msword'
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WORD-OPTIMIZED HTML GENERATOR
// Produces a linear (single-column) layout that renders correctly in Word /
// LibreOffice / Google Docs.  Avoids flexbox, sticky, position:fixed —
// anything that HTML-based .doc readers typically ignore.
// ══════════════════════════════════════════════════════════════════════════════

const WORD_CSS = `
/* ── Reset ─────────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: Calibri, 'Segoe UI', Arial, sans-serif;
  font-size: 11pt; color: #111827; line-height: 1.55;
  max-width: 750pt; margin: 0 auto; padding: 32pt 40pt;
}
a { color: #2563eb; text-decoration: none; }
a:hover { text-decoration: underline; }
code, pre {
  font-family: 'Courier New', Consolas, 'Lucida Console', monospace;
}

/* ── Headings ───────────────────────────────────────────────────────────── */
h1 {
  font-size: 22pt; font-weight: 700; color: #030712;
  border-bottom: 2pt solid #e5e7eb; padding-bottom: 8pt; margin: 0 0 16pt;
}
h2 {
  font-size: 16pt; font-weight: 700; color: #111827;
  border-bottom: 1pt solid #e5e7eb; padding-bottom: 5pt; margin: 16pt 0 8pt;
}
h3 { font-size: 13pt; font-weight: 700; color: #1f2937; margin: 12pt 0 6pt; }
h4 { font-size: 11pt; font-weight: 700; color: #374151; margin: 8pt 0 4pt; }

/* ── Lists ──────────────────────────────────────────────────────────────── */
ul { list-style: disc; margin: 6pt 0 6pt 18pt; padding: 0; }
ol { list-style: decimal; margin: 6pt 0 6pt 18pt; padding: 0; }
li { margin: 2pt 0; }

/* ── Tables ─────────────────────────────────────────────────────────────── */
table { border-collapse: collapse; width: 100%; margin: 8pt 0; font-size: 10pt; }
th {
  background: #f3f4f6; text-align: left; padding: 5pt 8pt;
  border: 1pt solid #d1d5db; font-size: 9.5pt; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.3pt; white-space: nowrap;
}
td { padding: 5pt 8pt; border: 1pt solid #e5e7eb; vertical-align: top; }

/* ── Inline code / pre ──────────────────────────────────────────────────── */
code {
  background: #f3f4f6; border-radius: 3pt; padding: 1pt 5pt;
  font-size: 9.5pt; color: #1f2937;
}
pre {
  background: #f3f4f6; border-radius: 6pt; padding: 10pt 12pt;
  margin: 8pt 0; font-size: 9pt; overflow-x: auto; white-space: pre-wrap;
  word-break: break-word;
}
pre code { background: none; padding: 0; font-size: inherit; }

/* ── Badges ─────────────────────────────────────────────────────────────── */
.badge {
  display: inline-block; padding: 2pt 7pt; border-radius: 12pt;
  font-size: 9pt; font-weight: 600;
}
.badge-version { background: #dbeafe; color: #1e40af; }
.badge-oas     { background: #d1fae5; color: #065f46; }
.badge-depr    { background: #fef9c3; color: #92400e; font-size: 8.5pt; padding: 1pt 5pt; }

/* Method badges */
.method-badge {
  display: inline-block; padding: 2pt 8pt; border-radius: 4pt;
  font-size: 9pt; font-weight: 800; letter-spacing: 0.5pt; min-width: 50pt;
  text-align: center; color: #fff;
}
.in-badge {
  display: inline-block; padding: 1pt 6pt; border-radius: 3pt;
  font-size: 8.5pt; font-weight: 700;
}
.in-path   { background: #fce7f3; color: #be185d; }
.in-query  { background: #dbeafe; color: #1d4ed8; }
.in-header { background: #d1fae5; color: #047857; }
.in-cookie { background: #fef3c7; color: #92400e; }

/* Status codes */
code.status { padding: 2pt 7pt; border-radius: 4pt; font-weight: 700; font-size: 10pt; }
.s2xx { background: #dcfce7; color: #166534; }
.s4xx { background: #fef3c7; color: #92400e; }
.s5xx { background: #fee2e2; color: #991b1b; }

/* ── TOC ────────────────────────────────────────────────────────────────── */
.toc {
  background: #f9fafb; border: 1pt solid #e5e7eb; border-radius: 8pt;
  padding: 12pt 18pt; margin-bottom: 16pt;
}
.toc-title {
  font-size: 9.5pt; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1pt; color: #6b7280; border-bottom: 1pt solid #e5e7eb;
  padding-bottom: 5pt; margin-bottom: 6pt;
}
/* Each TOC row is a <p>; zero out its margin so Word doesn't add paragraph
   spacing on top of the CSS. Padding provides the only visual gap. */
.toc-section { font-size: 11pt; font-weight: 600; color: #111827; margin: 0; padding: 1pt 0; line-height: 1.3; }
.toc-item    { font-size: 10pt; color: #374151; margin: 0; padding: 0 0 0 14pt; line-height: 1.3; }
.toc-section a, .toc-item a { color: inherit; text-decoration: none; }
.toc-dot {
  display: inline-block; width: 7pt; height: 7pt; border-radius: 50%;
  vertical-align: middle; margin-right: 5pt;
}

/* ── Operation cards ────────────────────────────────────────────────────── */
.operation {
  border: 1pt solid #e5e7eb; border-radius: 8pt; margin: 8pt 0;
  overflow: hidden; page-break-inside: avoid;
}
.op-header {
  background: #f9fafb; padding: 9pt 14pt; border-bottom: 1pt solid #e5e7eb;
}
.op-path    { font-size: 12pt; font-weight: 700; font-family: 'Courier New', monospace; }
.op-summary { font-size: 11pt; color: #6b7280; margin-top: 3pt; }
.op-description { padding: 9pt 14pt; font-size: 11pt; color: #4b5563; border-bottom: 1pt solid #f3f4f6; }
.op-section { padding: 0 14pt 12pt; }
.section-label {
  font-size: 8.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8pt;
  color: #9ca3af; margin: 12pt 0 6pt; border-top: 1pt solid #f3f4f6; padding-top: 8pt;
}

/* ── Schema cards ───────────────────────────────────────────────────────── */
.schema-card {
  border: 1pt solid #e5e7eb; border-radius: 8pt; margin: 8pt 0;
  page-break-inside: avoid;
}
.schema-header {
  background: #f5f3ff; padding: 9pt 14pt; border-bottom: 1pt solid #e5e7eb;
  display: block;  /* not flex — safe for Word */
}
.schema-name { font-weight: 700; font-size: 13pt; color: #4c1d95; }
.schema-body { padding: 10pt 14pt; }

/* ── Security ───────────────────────────────────────────────────────────── */
.scheme-card {
  border: 1pt solid #e5e7eb; border-radius: 8pt; margin: 8pt 0;
  page-break-inside: avoid;
}
.scheme-header {
  background: #f0fdf4; padding: 9pt 14pt; border-bottom: 1pt solid #e5e7eb; display: block;
}
.scheme-name { font-weight: 700; font-size: 13pt; color: #065f46; }
.scheme-body { padding: 10pt 14pt; }

/* ── Composition / nesting ──────────────────────────────────────────────── */
.compose-label {
  font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5pt;
  color: #8b5cf6; margin: 8pt 0 4pt;
}
.nested-schema {
  margin-left: 14pt; border-left: 3pt solid #ede9fe; padding-left: 10pt; margin-top: 4pt;
}

/* ── Security chips inline ──────────────────────────────────────────────── */
.sec-chip {
  display: inline-block; background: #f0f9ff; border: 1pt solid #bae6fd;
  color: #0369a1; padding: 1pt 7pt; border-radius: 12pt; font-size: 9.5pt;
  font-weight: 600; margin: 1pt 2pt;
}

/* ── Print ──────────────────────────────────────────────────────────────── */
@media print {
  body { font-size: 10pt; }
  h1   { font-size: 18pt; }
  h2   { font-size: 14pt; margin-top: 12pt; }
  h3   { font-size: 12pt; margin-top: 8pt; }
  .toc { page-break-after: always; }
  .operation { margin: 5pt 0; }
  a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 9pt; color: #6b7280; }
  @page { margin: 20mm 15mm; }
}
`.trim();

function generateWordHTML(doc: OpenAPIDocument, locale: Locale = 'en'): string {
  const t = locales[locale];
  const { tagOrder, byTag, untagged, tagDescriptions, tagExternalDocs } = collectByTag(doc);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function schemaTypeHtmlW(schema: SchemaObject): string {
    if (schema.$ref) {
      const name = schema.$ref.split('/').pop() || '';
      return `<a href="#schema-${slug(name)}"><code>${esc(name)}</code></a>`;
    }
    return `<code>${esc(schemaTypeLabel(schema, doc))}</code>`;
  }

  function constraintsHtmlW(schema: SchemaObject): string {
    return schemaConstraints(schema)
      .map(c => `<code style="background:#f0fdf4;color:#166534;margin:1pt;padding:1pt 4pt">${esc(c)}</code>`)
      .join(' ');
  }

  function statusBadgeW(code: string): string {
    const cls = code.startsWith('2') ? 's2xx' : code.startsWith('4') ? 's4xx'
              : code.startsWith('5') ? 's5xx' : '';
    return `<code class="status ${cls}">${esc(code)}</code>`;
  }

  function securityHtmlW(reqs: Array<Record<string, string[]>>): string {
    if (!reqs.length) return `<span class="sec-chip">🔓 ${t.export.public}</span>`;
    return reqs.map(req =>
      Object.entries(req).map(([name, scopes]) =>
        `<span class="sec-chip">🔒 ${esc(name)}${scopes.length ? ` [${scopes.join(', ')}]` : ''}</span>`
      ).join('')
    ).join(' <span style="color:#9ca3af">or</span> ');
  }

  /**
   * Post-process renderMarkdown() output for Word (.doc) compatibility:
   * - Converts Shiki code blocks → plain <pre><code> (Word ignores complex CSS/spans)
   * - Converts Mermaid placeholders → <pre> showing raw diagram source
   * - Strips KaTeX SVG output → LaTeX source text from MathML annotation
   * - Removes <p> wrappers inside <li> (marked wraps loose-list items in <p>,
   *   which Word renders as an empty bullet followed by a separate paragraph)
   */
  function wordifyMarkdown(html: string): string {
    let s = html;

    // 1. Shiki: <div class="md-code-block">…shiki HTML…</div> → plain <pre><code>
    s = s.replace(
      /<div class="md-code-block">([\/\s\S]*?)<\/div>/g,
      (_, inner: string) => {
        // Each shiki line is <span class="line">…tokens…</span> separated by newlines.
        // Strip all tags and decode common entities to get plain text.
        const text = inner
          .replace(/<\/span>\s*\n?\s*(?=<span class="line">|<\/code>)/g, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
          .replace(/\n+$/, '');
        return `<pre style="background:#f3f4f6;padding:8pt 12pt;border-radius:4pt;font-size:9pt;white-space:pre-wrap;word-break:break-word;font-family:'Courier New',monospace"><code>${esc(text)}</code></pre>`;
      }
    );

    // 2. Mermaid placeholder: show raw diagram source as a styled <pre>
    s = s.replace(
      /<div class="md-mermaid"[^>]*>[\s\S]*?<code class="md-mermaid-source">([\/\s\S]*?)<\/code><\/div>/g,
      (_, src: string) =>
        `<pre style="background:#f0f4ff;padding:8pt 12pt;border-radius:4pt;font-size:9pt;font-family:'Courier New',monospace;border:1pt dashed #94a3b8;white-space:pre-wrap">${src}</pre>`
    );

    // 3. KaTeX math-block <div class="md-math-block">…</div> → LaTeX source
    s = s.replace(
      /<div class="md-math-block">([\s\S]*?)<\/div>/g,
      (_, inner: string) => {
        const tex = inner.match(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/)?.[1]?.trim() ?? '';
        return tex
          ? `<p style="text-align:center;font-style:italic;font-family:'Courier New',monospace;padding:6pt 0;color:#1e3a5f">$$${esc(tex)}$$</p>`
          : '';
      }
    );

    // 4. KaTeX inline <span class="katex">…</span> → LaTeX source
    s = s.replace(
      /<span class="katex(?:-display)?">[\s\S]*?<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>[\s\S]*?<\/span>/g,
      (_, tex: string) =>
        tex.trim() ? `<em style="font-family:'Courier New',monospace">$${esc(tex.trim())}$</em>` : ''
    );

    // 5. Unwrap <p> inside <li> — GFM "loose" lists wrap each item's content
    //    in <p>, which Word renders as an empty bullet followed by a separate
    //    paragraph. Strip those <p> wrappers so the text sits directly in <li>.
    //    Multiple <p>s within one <li> are joined with a <br> instead.
    s = s
      .replace(/<li>\s*<p>/g, '<li>')
      .replace(/<\/p>\s*<\/li>/g, '</li>')
      .replace(/<\/p>\s*<p>/g, '<br>');

    return s;
  }

  /** Render markdown and make the output Word-compatible */
  const wordMd = (text: string) => wordifyMarkdown(renderMarkdown(text));

  // Recursive schema renderer
  function renderSchemaHtmlW(schema: SchemaObject, depth = 0): string {
    if (schema.$ref) {
      const name = schema.$ref.split('/').pop() || '';
      return `<p style="margin:4pt 0">→ <a href="#schema-${slug(name)}"><code>${esc(name)}</code></a></p>`;
    }
    let html = '';
    const cs = constraintsHtmlW(schema);
    if (depth > 0) {
      const t = schemaTypeLabel(schema, doc);
      if (t !== 'any') html += `<div style="margin:3pt 0">${schemaTypeHtmlW(schema)} ${cs}</div>`;
      if (schema.description) html += `<div style="color:#6b7280;font-size:10pt;margin:2pt 0">${esc(schema.description)}</div>`;
    }
    for (const [kw, items] of [['allOf', schema.allOf], ['oneOf', schema.oneOf], ['anyOf', schema.anyOf]] as [string, SchemaObject[] | undefined][]) {
      if (!items?.length) continue;
      html += `<div class="compose-label">${kw}</div>`;
      items.forEach((s, i) => {
        html += `<div class="nested-schema"><div style="font-size:9pt;color:#8b5cf6;font-weight:600;margin-bottom:3pt">${t.export.option} ${i + 1}</div>${renderSchemaHtmlW(s, depth + 1)}</div>`;
      });
    }
    if (schema.not) html += `<div class="compose-label">not</div><div class="nested-schema">${renderSchemaHtmlW(schema.not, depth + 1)}</div>`;
    if (schema.enum) {
      html += `<div style="margin:4pt 0;font-size:10pt">${t.export.enum}: ${(schema.enum as unknown[]).map(v => `<code style="background:#f0fdf4;color:#166534">${esc(String(v))}</code>`).join(' ')}</div>`;
    }
    if (schema.properties && Object.keys(schema.properties).length) {
      const req = schema.required || [];
      const rows = Object.entries(schema.properties).map(([pName, pSchema]) => {
        const hasNested = pSchema.properties || pSchema.allOf || pSchema.oneOf || pSchema.anyOf || pSchema.items;
        const nested = hasNested ? `<div class="nested-schema" style="margin-top:4pt">${renderSchemaHtmlW(pSchema, depth + 1)}</div>` : '';
        return `<tr>
          <td><code>${esc(pName)}</code>${req.includes(pName) ? '<span style="color:#ef4444;font-size:8pt">*</span>' : ''}${pSchema.deprecated ? ' <span class="badge-depr">depr</span>' : ''}</td>
          <td>${schemaTypeHtmlW(pSchema)}</td>
          <td>${constraintsHtmlW(pSchema)}</td>
          <td>${esc(pSchema.description || '')}${nested}</td>
        </tr>`;
      }).join('');
      html += `<table><thead><tr><th>${t.export.property}</th><th>${t.export.type}</th><th>${t.export.constraints}</th><th>${t.export.description}</th></tr></thead><tbody>${rows}</tbody></table>`;
    }
    if (schema.items) {
      html += `<div style="margin:6pt 0;font-size:10pt"><strong>${t.export.items}:</strong> ${schemaTypeHtmlW(schema.items)}`;
      if (schema.items.properties) html += `<div class="nested-schema">${renderSchemaHtmlW(schema.items, depth + 1)}</div>`;
      html += `</div>`;
    }
    if (typeof schema.additionalProperties === 'object') {
      html += `<div style="margin:4pt 0;font-size:10pt"><strong>${t.export.additionalProperties}:</strong> ${schemaTypeHtmlW(schema.additionalProperties as SchemaObject)}</div>`;
    }
    return html;
  }

  function paramsTableW(params: ParameterObject[]): string {
    const rows = params.map(rawP => {
      const rawPAny = rawP as unknown as Record<string, unknown>;
      const p = rawPAny.$ref ? (resolveRef<ParameterObject>(rawPAny.$ref as string, doc) ?? rawP) : rawP;
      const schemaType = p.schema ? schemaTypeHtmlW(p.schema) : '';
      const cs = p.schema ? constraintsHtmlW(p.schema) : '';
      return `<tr>
        <td><code>${esc(p.name)}</code>${p.deprecated ? ' <span class="badge-depr">depr</span>' : ''}</td>
        <td><span class="in-badge in-${p.in}">${p.in}</span></td>
        <td>${schemaType}</td><td>${cs}</td>
        <td style="text-align:center;color:#ef4444">${p.required ? '✓' : ''}</td>
        <td>${esc(p.description || '')}</td>
      </tr>`;
    }).join('');
    return `<table><thead><tr><th>${t.export.name}</th><th>${t.export.paramIn}</th><th>${t.export.type}</th><th>${t.export.constraints}</th><th>${t.export.required.charAt(0).toUpperCase()}</th><th>${t.export.description}</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function renderOperationW(entry: OpEntry): string {
    const { kind, path, method, op } = entry;
    const opId = `op-${slug(method + '-' + path)}`;
    const { bg, fg } = METHOD_COLORS[method] ?? { bg: '#6b7280', fg: '#fff' };
    const pathLabel = kind === 'webhook'
      ? `${esc(path)} <span style="background:#ede9fe;color:#6d28d9;padding:1pt 6pt;border-radius:4pt;font-size:9pt;font-weight:700">webhook</span>`
      : esc(path);
    let html = `<div class="operation" id="${opId}">
      <div class="op-header">
        <span class="method-badge" style="background:${bg};color:${fg}">${method.toUpperCase()}</span>
        <span class="op-path" style="margin-left:8pt">${pathLabel}</span>
        ${op.deprecated ? ` <span class="badge-depr" style="margin-left:8pt">${t.export.deprecated}</span>` : ''}
        ${op.summary ? `<div class="op-summary">${esc(op.summary)}</div>` : ''}
      </div>`;
    if (op.description) html += `<div class="op-description">${wordMd(op.description)}</div>`;
    if (op.security !== undefined) {
      html += `<div style="padding:4pt 14pt 8pt;font-size:10pt">${t.export.security}: ${securityHtmlW(op.security)}</div>`;
    }
    if ((op.parameters as ParameterObject[] | undefined)?.length) {
      html += `<div class="op-section"><div class="section-label">${t.export.parameters}</div>${paramsTableW(op.parameters as ParameterObject[])}</div>`;
    }
    if (op.requestBody) {
      const rb = op.requestBody;
      html += `<div class="op-section"><div class="section-label">${t.export.requestBody}${rb.required ? ' <span style="color:#ef4444">*</span>' : ''}</div>`;
      if (rb.description) html += `<p style="font-size:11pt;color:#4b5563;margin-bottom:6pt">${esc(rb.description)}</p>`;
      for (const [ct, media] of Object.entries(rb.content || {})) {
        html += `<div style="margin-bottom:10pt"><span style="font-size:9.5pt;font-weight:700;padding:1pt 7pt;background:#f3f4f6;border-radius:4pt">${esc(ct)}</span>`;
        if (media.schema) html += `<div style="margin-top:6pt">${renderSchemaHtmlW(media.schema)}</div>`;
        html += `</div>`;
      }
      html += `</div>`;
    }
    if (op.responses && Object.keys(op.responses).length) {
      html += `<div class="op-section"><div class="section-label">${t.export.responses}</div>`;
      for (const [code, resp] of Object.entries(op.responses)) {
        html += `<div style="border:1pt solid #f3f4f6;border-radius:5pt;margin-bottom:6pt">
          <div style="padding:6pt 10pt;background:#f9fafb;border-bottom:1pt solid #f3f4f6">
            ${statusBadgeW(code)} <span style="font-size:11pt;color:#374151;margin-left:6pt">${esc(resp.description || '')}</span>
          </div>`;
        if (resp.content && Object.keys(resp.content).length) {
          html += `<div style="padding:6pt 10pt">`;
          for (const [ct, media] of Object.entries(resp.content)) {
            html += `<span style="font-size:9pt;font-weight:700;padding:1pt 6pt;background:#f3f4f6;border-radius:4pt">${esc(ct)}</span>`;
            if (media.schema) html += `<div style="margin-top:4pt">${renderSchemaHtmlW(media.schema)}</div>`;
          }
          html += `</div>`;
        }
        html += `</div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  }

  // ── TOC (linear block layout — no sidebar) ────────────────────────────────────
  // Each entry is wrapped in <p> so Word keeps it on its own line.
  // Word ignores CSS display:block on <a> (inline element), but always
  // breaks before and after block-level elements like <p>.
  function buildTocW(): string {
    // Helper: TOC link wrapped in a <p> so Word puts it on its own line
    const tocSection = (href: string, label: string) =>
      `<p class="toc-section"><a href="${href}">${label}</a></p>`;
    const tocItem = (href: string, label: string, extraStyle = '') =>
      `<p class="toc-item"${extraStyle ? ` style="${extraStyle}"` : ''}><a href="${href}">${label}</a></p>`;

    let html = `<div class="toc"><div class="toc-title">${t.export.contents}</div>`;
    html += tocSection('#api-info', t.export.overview);
    if (doc.servers?.length) html += tocSection('#servers', t.export.servers);
    if (tagOrder.length || untagged.length) {
      html += tocSection('#endpoints', t.export.endpoints);
      for (const tag of tagOrder) {
        html += tocItem(`#tag-${slug(tag)}`, esc(tag));
        for (const { method, path, op } of byTag[tag] || []) {
          const color = METHOD_COLORS[method]?.bg ?? '#6b7280';
          const dot = `<span class="toc-dot" style="background:${color};width:6pt;height:6pt;display:inline-block;border-radius:50%;vertical-align:middle;margin-right:4pt"></span>`;
          html += tocItem(`#op-${slug(method + '-' + path)}`, dot + esc(op.summary || path), 'padding-left:28pt');
        }
      }
      if (untagged.length) {
        html += tocItem('#tag-untagged', t.export.untagged);
        for (const { method, path, op } of untagged) {
          const color = METHOD_COLORS[method]?.bg ?? '#6b7280';
          const dot = `<span class="toc-dot" style="background:${color};width:6pt;height:6pt;display:inline-block;border-radius:50%;vertical-align:middle;margin-right:4pt"></span>`;
          html += tocItem(`#op-${slug(method + '-' + path)}`, dot + esc(op.summary || path), 'padding-left:28pt');
        }
      }
    }
    const schemas = doc.components?.schemas;
    if (schemas && Object.keys(schemas).length) {
      html += tocSection('#schemas', t.export.schemas);
      for (const name of Object.keys(schemas)) {
        html += tocItem(`#schema-${slug(name)}`, esc(name));
      }
    }
    if (doc.components?.securitySchemes && Object.keys(doc.components.securitySchemes).length) {
      html += tocSection('#security-schemes', t.export.securitySchemes);
    }
    html += `</div>`;
    return html;
  }

  // ── Overview ──────────────────────────────────────────────────────────────────
  function overviewW(): string {
    const metaRows: [string, string][] = [[t.export.openAPI, esc(doc.openapi)], [t.export.version, esc(doc.info.version)]];
    if (doc.info.termsOfService) metaRows.push([t.export.termsOfService, `<a href="${esc(doc.info.termsOfService)}">${esc(doc.info.termsOfService)}</a>`]);
    if (doc.info.contact) {
      const c = doc.info.contact;
      const parts = [c.name ? esc(c.name) : '', c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : '', c.url ? `<a href="${esc(c.url)}">${esc(c.url)}</a>` : ''].filter(Boolean);
      if (parts.length) metaRows.push([t.export.contact, parts.join(' · ')]);
    }
    if (doc.info.license?.name) {
      const l = doc.info.license;
      metaRows.push([t.export.license, l.url ? `<a href="${esc(l.url)}">${esc(l.name)}</a>` : esc(l.name)]);
    }
    let html = `<section id="api-info">
      <h1>${esc(doc.info.title)}</h1>
      <div style="margin-bottom:12pt">
        <span class="badge badge-version">v${esc(doc.info.version)}</span>
        <span class="badge badge-oas" style="margin-left:6pt">OAS ${esc(doc.openapi)}</span>
      </div>`;
    if (doc.info.summary) html += `<p style="font-size:13pt;color:#4b5563;margin:0 0 12pt">${esc(doc.info.summary)}</p>`;
    if (doc.info.description) html += `<div style="color:#374151;margin-bottom:14pt;line-height:1.7">${wordMd(doc.info.description)}</div>`;
    html += `<table style="width:auto"><tbody>${metaRows.map(([k, v]) => `<tr><td style="font-weight:700;color:#6b7280;padding-right:16pt;white-space:nowrap;border:none">${k}</td><td style="border:none">${v}</td></tr>`).join('')}</tbody></table>`;
    html += `</section>`;
    return html;
  }

  // ── Servers ───────────────────────────────────────────────────────────────────
  function serversW(): string {
    if (!doc.servers?.length) return '';
    let html = `<section><h2 id="servers">${t.export.servers}</h2>`;
    for (const s of doc.servers) {
      html += `<div style="background:#f9fafb;border:1pt solid #e5e7eb;border-radius:6pt;padding:10pt 14pt;margin:6pt 0">
        <code style="font-size:11.5pt;font-weight:700">${esc(s.url)}</code>
        ${s.description ? `<div style="color:#6b7280;font-size:10pt;margin-top:3pt">${esc(s.description)}</div>` : ''}`;
      if (s.variables && Object.keys(s.variables).length) {
        const rows = Object.entries(s.variables).map(([vn, vo]) =>
          `<tr><td><code>${esc(vn)}</code></td><td><code>${esc(vo.default)}</code></td><td>${vo.enum ? vo.enum.map(e => `<code>${esc(e)}</code>`).join(', ') : ''}</td><td>${esc(vo.description || '')}</td></tr>`
        ).join('');
        html += `<table style="margin-top:8pt"><thead><tr><th>${t.export.variable}</th><th>${t.export.default}</th><th>${t.export.enumValues}</th><th>${t.export.description}</th></tr></thead><tbody>${rows}</tbody></table>`;
      }
      html += `</div>`;
    }
    html += `</section>`;
    return html;
  }

  // ── Endpoints ─────────────────────────────────────────────────────────────────
  function endpointsW(): string {
    const allGroups = [
      ...tagOrder.map(tag => ({ tag, ops: byTag[tag] || [], id: `tag-${slug(tag)}` })),
      ...(untagged.length ? [{ tag: t.export.untagged, ops: untagged, id: 'tag-untagged' }] : []),
    ];
    if (!allGroups.some(g => g.ops.length)) return '';
    let html = `<section><h2 id="endpoints">${t.export.endpoints}</h2>`;
    for (const { tag, ops, id } of allGroups) {
      if (!ops.length) continue;
      html += `<div id="${id}"><h3>${esc(tag)}</h3>`;
      if (tagDescriptions[tag]) html += `<div style="color:#6b7280;margin-bottom:10pt">${wordMd(tagDescriptions[tag])}</div>`;
      if (tagExternalDocs[tag]) {
        const ed = tagExternalDocs[tag];
        html += `<p style="margin-bottom:10pt">📖 <a href="${esc(ed.url)}">${esc(ed.description || ed.url)}</a></p>`;
      }
      html += ops.map(renderOperationW).join('');
      html += `</div>`;
    }
    html += `</section>`;
    return html;
  }

  // ── Schemas ───────────────────────────────────────────────────────────────────
  function schemasW(): string {
    const schemas = doc.components?.schemas;
    if (!schemas || !Object.keys(schemas).length) return '';
    let html = `<section><h2 id="schemas">${t.export.schemas}</h2>`;
    for (const [name, schema] of Object.entries(schemas)) {
      const typeLabel = schemaTypeLabel(schema, doc);
      html += `<div class="schema-card" id="schema-${slug(name)}">
        <div class="schema-header">
          <span class="schema-name">${esc(name)}</span>
          ${typeLabel !== 'any' ? ` <code style="background:#ede9fe;color:#6d28d9;padding:1pt 7pt;border-radius:4pt;font-size:9.5pt;margin-left:8pt">${esc(typeLabel)}</code>` : ''}
          ${schema.deprecated ? ' <span class="badge-depr" style="margin-left:6pt">deprecated</span>' : ''}
        </div>
        <div class="schema-body">
          ${schema.description ? `<div style="color:#4b5563;margin-bottom:10pt">${esc(schema.description)}</div>` : ''}
          ${renderSchemaHtmlW(schema)}
        </div>
      </div>`;
    }
    html += `</section>`;
    return html;
  }

  // ── Security schemes ──────────────────────────────────────────────────────────
  function securitySchemesW(): string {
    const schemes = doc.components?.securitySchemes;
    if (!schemes || !Object.keys(schemes).length) return '';
    let html = `<section><h2 id="security-schemes">${t.export.securitySchemes}</h2>`;
    for (const [name, scheme] of Object.entries(schemes)) {
      html += `<div class="scheme-card">
        <div class="scheme-header">
          <span class="scheme-name">${esc(name)}</span>
          <span style="font-size:9.5pt;font-weight:700;padding:2pt 7pt;background:#d1fae5;color:#065f46;border-radius:4pt;margin-left:8pt">${esc(scheme.type)}</span>
        </div>
        <div class="scheme-body">`;
      if (scheme.description) html += `<p style="color:#4b5563;margin-bottom:8pt">${esc(scheme.description)}</p>`;
      const details: [string, string | undefined][] = [
        ['In', scheme.in], ['Parameter Name', scheme.name],
        ['HTTP Scheme', scheme.scheme], ['Bearer Format', scheme.bearerFormat],
        ['OpenID Connect URL', scheme.openIdConnectUrl],
      ];
      const dRows = details.filter(([, v]) => v).map(([k, v]) =>
        `<tr><td style="font-weight:700;color:#6b7280;border:none;padding-right:14pt;white-space:nowrap">${esc(k)}</td><td style="border:none"><code>${esc(v!)}</code></td></tr>`
      ).join('');
      if (dRows) html += `<table style="width:auto;margin-bottom:12pt"><tbody>${dRows}</tbody></table>`;
      if (scheme.flows) {
        const flows: [string, OAuthFlowObject | undefined][] = [
          ['Implicit', scheme.flows.implicit], ['Password', scheme.flows.password],
          ['Client Credentials', scheme.flows.clientCredentials], ['Authorization Code', scheme.flows.authorizationCode],
        ];
        for (const [flowName, flow] of flows) {
          if (!flow) continue;
          html += `<div style="border:1pt solid #d1fae5;border-radius:5pt;padding:8pt 12pt;margin:6pt 0;background:#fafffe">
            <div style="font-size:9.5pt;font-weight:700;text-transform:uppercase;color:#047857;margin-bottom:5pt">${esc(flowName)}</div>`;
          if (flow.authorizationUrl) html += `<div style="font-size:10pt;margin:2pt 0">Auth URL: <a href="${esc(flow.authorizationUrl)}">${esc(flow.authorizationUrl)}</a></div>`;
          if (flow.tokenUrl) html += `<div style="font-size:10pt;margin:2pt 0">Token URL: <a href="${esc(flow.tokenUrl)}">${esc(flow.tokenUrl)}</a></div>`;
          if (flow.scopes && Object.keys(flow.scopes).length) {
            html += `<div style="font-size:9.5pt;font-weight:700;color:#065f46;margin:6pt 0 3pt">Scopes</div>`;
            for (const [sc, desc] of Object.entries(flow.scopes)) {
              html += `<div style="margin:2pt 0;font-size:10pt"><code style="background:#d1fae5;color:#065f46">${esc(sc)}</code> <span style="color:#4b5563">${esc(desc)}</span></div>`;
            }
          }
          html += `</div>`;
        }
      }
      html += `</div></div>`;
    }
    if (doc.security?.length) {
      html += `<div style="margin-top:18pt"><h3>Global Security Requirement</h3><div style="margin-top:8pt">${securityHtmlW(doc.security)}</div></div>`;
    }
    html += `</section>`;
    return html;
  }

  // ── Assemble ──────────────────────────────────────────────────────────────────
  const body = [overviewW(), serversW(), endpointsW(), schemasW(), securitySchemesW()].join('\n');

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${esc(doc.info.title)} v${esc(doc.info.version)}</title>
  <!--[if gte mso 9]><xml>
  <w:WordDocument>
    <w:View>Normal</w:View><w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument></xml><![endif]-->
  <style>${WORD_CSS}
${MARKDOWN_CSS}</style>
</head>
<body>
${body}
</body>
</html>`;
}


