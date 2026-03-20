/**
 * Export utilities for OpenAPI documents.
 * Supports Markdown, HTML (print-ready), Word (.doc via HTML), and PDF (browser print).
 * Zero external dependencies — uses only standard browser APIs.
 */

import type { OpenAPIDocument, OperationObject, SchemaObject, ParameterObject } from '../types/openapi';
import { HTTP_METHODS } from '../types/openapi';

// ─── Private helpers ─────────────────────────────────────────────────────────

function sanitizeFilename(title: string): string {
  return (title || 'openapi')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase() || 'openapi';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeMd(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function schemaTypeName(schema: SchemaObject): string {
  if (schema.$ref) return schema.$ref.split('/').pop() || '$ref';
  if (Array.isArray(schema.type)) return (schema.type as string[]).join(' | ');
  if (typeof schema.type === 'string') return schema.type;
  return '';
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── Shared: collect operations grouped by tag ────────────────────────────────

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
} {
  const byTag: Record<string, OpEntry[]> = {};
  const untagged: OpEntry[] = [];
  const tagOrder: string[] = [];
  const tagDescriptions = Object.fromEntries(
    (doc.tags || []).map(t => [t.name, t.description || ''])
  );

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

  return { tagOrder: [...new Set(tagOrder)], byTag, untagged, tagDescriptions };
}

// ─── Markdown export ──────────────────────────────────────────────────────────

function generateMarkdown(doc: OpenAPIDocument): string {
  const L: string[] = [];
  const nl = () => L.push('');

  // Title + meta
  L.push(`# ${doc.info.title}`);
  nl();
  if (doc.info.summary) { L.push(`> ${doc.info.summary}`); nl(); }
  if (doc.info.description) { L.push(doc.info.description); nl(); }

  const metaRows: [string, string][] = [
    ['**Version**', doc.info.version],
    ['**OpenAPI**', doc.openapi],
  ];
  if (doc.info.termsOfService) metaRows.push(['**Terms of Service**', doc.info.termsOfService]);
  if (doc.info.contact?.name || doc.info.contact?.email) {
    const c = doc.info.contact;
    const val = [c.name, c.email ? `<${c.email}>` : '', c.url ? `(${c.url})` : ''].filter(Boolean).join(' ');
    metaRows.push(['**Contact**', val]);
  }
  if (doc.info.license?.name) {
    const l = doc.info.license;
    metaRows.push(['**License**', l.url ? `[${l.name}](${l.url})` : l.name]);
  }
  L.push('| | |');
  L.push('|---|---|');
  metaRows.forEach(([k, v]) => L.push(`| ${k} | ${escapeMd(v)} |`));
  nl();

  // Servers
  if (doc.servers?.length) {
    L.push('## Servers');
    nl();
    doc.servers.forEach(s => {
      L.push(`- \`${s.url}\`${s.description ? ` — ${s.description}` : ''}`);
    });
    nl();
  }

  // Endpoints grouped by tag
  const { tagOrder, byTag, untagged, tagDescriptions } = collectByTag(doc);
  const allGroups: Array<{ tag: string; ops: OpEntry[] }> = [
    ...tagOrder.map(tag => ({ tag, ops: byTag[tag] || [] })),
    ...(untagged.length ? [{ tag: '(untagged)', ops: untagged }] : []),
  ];

  if (allGroups.length > 0) {
    L.push('## Endpoints');
    nl();

    for (const { tag, ops } of allGroups) {
      if (!ops.length) continue;
      L.push(`### ${tag}`);
      nl();
      if (tagDescriptions[tag]) { L.push(tagDescriptions[tag]); nl(); }

      for (const { kind, path, method, op } of ops) {
        const label = kind === 'webhook'
          ? `${method.toUpperCase()} \`${path}\` *(webhook)*`
          : `${method.toUpperCase()} \`${path}\``;
        L.push(`#### ${label}`);
        nl();

        if (op.deprecated) { L.push('> ⚠️ **Deprecated**'); nl(); }
        if (op.summary) { L.push(`**${op.summary}**`); nl(); }
        if (op.description) { L.push(op.description); nl(); }
        if (op.operationId) { L.push(`- **operationId:** \`${op.operationId}\``); nl(); }

        // Parameters
        if (op.parameters?.length) {
          L.push('**Parameters**');
          nl();
          L.push('| Name | In | Type | Required | Description |');
          L.push('|------|----|------|:--------:|-------------|');
          for (const p of op.parameters as ParameterObject[]) {
            const t = p.schema ? schemaTypeName(p.schema) : '';
            L.push(`| \`${p.name}\` | ${p.in} | \`${t}\` | ${p.required ? '✓' : ''} | ${escapeMd(p.description || '')} |`);
          }
          nl();
        }

        // Request body
        if (op.requestBody) {
          L.push('**Request Body**');
          nl();
          if (op.requestBody.description) { L.push(op.requestBody.description); nl(); }
          const cts = Object.keys(op.requestBody.content || {});
          if (cts.length) { L.push(`Content-Type: \`${cts.join('`, `')}\``); nl(); }
        }

        // Responses
        if (op.responses && Object.keys(op.responses).length > 0) {
          L.push('**Responses**');
          nl();
          L.push('| Status | Description |');
          L.push('|--------|-------------|');
          for (const [code, resp] of Object.entries(op.responses)) {
            L.push(`| \`${code}\` | ${escapeMd(resp.description || '')} |`);
          }
          nl();
        }

        L.push('---');
        nl();
      }
    }
  }

  // Schemas
  if (doc.components?.schemas && Object.keys(doc.components.schemas).length > 0) {
    L.push('## Schemas');
    nl();

    for (const [name, schema] of Object.entries(doc.components.schemas)) {
      L.push(`### ${name}`);
      nl();
      if (schema.description) { L.push(schema.description); nl(); }

      const typeName = schemaTypeName(schema);
      if (typeName) L.push(`- **Type:** \`${typeName}\``);
      if (schema.enum) {
        L.push(`- **Enum:** ${(schema.enum as unknown[]).map(v => `\`${v}\``).join(', ')}`);
      }
      nl();

      if (schema.properties && Object.keys(schema.properties).length > 0) {
        L.push('| Property | Type | Required | Description |');
        L.push('|----------|------|:--------:|-------------|');
        const req = schema.required || [];
        for (const [pName, pSchema] of Object.entries(schema.properties)) {
          const t = schemaTypeName(pSchema);
          L.push(`| \`${pName}\` | \`${t}\` | ${req.includes(pName) ? '✓' : ''} | ${escapeMd(pSchema.description || '')} |`);
        }
        nl();
      }
    }
  }

  // Security schemes
  if (doc.components?.securitySchemes && Object.keys(doc.components.securitySchemes).length > 0) {
    L.push('## Security Schemes');
    nl();
    L.push('| Name | Type | Description |');
    L.push('|------|------|-------------|');
    for (const [name, scheme] of Object.entries(doc.components.securitySchemes)) {
      L.push(`| \`${name}\` | ${scheme.type} | ${escapeMd(scheme.description || '')} |`);
    }
    nl();
  }

  return L.join('\n');
}

export function downloadMarkdown(doc: OpenAPIDocument): void {
  downloadBlob(
    generateMarkdown(doc),
    `${sanitizeFilename(doc.info.title)}.md`,
    'text/markdown; charset=utf-8'
  );
}

// ─── HTML export (shared by both HTML download and PDF print) ─────────────────

const METHOD_BADGE_COLORS: Record<string, string> = {
  get: '#10b981',
  post: '#3b82f6',
  put: '#f59e0b',
  patch: '#8b5cf6',
  delete: '#ef4444',
  head: '#6b7280',
  options: '#6b7280',
  trace: '#6b7280',
};

function generateHTML(doc: OpenAPIDocument): string {
  // ── inner helpers (HTML-specific) ──────────────────────────────────────────
  function methodBadge(method: string): string {
    const bg = METHOD_BADGE_COLORS[method] || '#6b7280';
    return `<span style="display:inline-block;background:${bg};color:#fff;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.5px;min-width:56px;text-align:center;vertical-align:middle">${method.toUpperCase()}</span>`;
  }

  function paramsTable(params: ParameterObject[]): string {
    const rows = params.map(p => {
      const t = p.schema ? schemaTypeName(p.schema) : '';
      const inBadge = `<span class="badge-in badge-${p.in}">${p.in}</span>`;
      return `<tr>
        <td><code>${escapeHtml(p.name)}</code></td>
        <td>${inBadge}</td>
        <td><code>${escapeHtml(t)}</code></td>
        <td style="text-align:center">${p.required ? '<span style="color:#ef4444;font-weight:700">✓</span>' : ''}</td>
        <td>${escapeHtml(p.description || '')}</td>
      </tr>`;
    }).join('');
    return `<table class="data-table">
      <thead><tr><th>Name</th><th>In</th><th>Type</th><th>Req</th><th>Description</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function responsesTable(responses: Record<string, { description: string }>): string {
    const rows = Object.entries(responses).map(([code, resp]) => {
      const cls = code.startsWith('2') ? 'code-ok' : code.startsWith('4') ? 'code-warn' : code.startsWith('5') ? 'code-err' : '';
      return `<tr>
        <td><code class="${cls}">${escapeHtml(code)}</code></td>
        <td>${escapeHtml(resp.description || '')}</td>
      </tr>`;
    }).join('');
    return `<table class="data-table">
      <thead><tr><th>Status</th><th>Description</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function schemaPropsTable(properties: Record<string, SchemaObject>, required: string[]): string {
    const rows = Object.entries(properties).map(([pName, pSchema]) => {
      const t = schemaTypeName(pSchema);
      const req = required.includes(pName) ? '<span style="color:#ef4444;font-weight:700">*</span>' : '';
      return `<tr>
        <td><code>${escapeHtml(pName)}</code>${req}</td>
        <td><code>${escapeHtml(t)}</code></td>
        <td>${escapeHtml(pSchema.description || '')}</td>
      </tr>`;
    }).join('');
    return `<table class="data-table">
      <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function renderOperation(entry: OpEntry): string {
    const { kind, path, method, op } = entry;
    const pathLabel = kind === 'webhook' ? `[webhook] ${path}` : path;
    let html = `<div class="operation">
      <div class="op-header">
        ${methodBadge(method)}
        <code class="op-path">${escapeHtml(pathLabel)}</code>
        ${op.summary ? `<span class="op-summary">${escapeHtml(op.summary)}</span>` : ''}
        ${op.deprecated ? `<span class="badge-deprecated">Deprecated</span>` : ''}
      </div>`;

    if (op.description) html += `<p class="op-body">${escapeHtml(op.description).replace(/\n/g, '<br>')}</p>`;
    if (op.operationId) html += `<p class="op-body op-meta"><strong>operationId:</strong> <code>${escapeHtml(op.operationId)}</code></p>`;

    if ((op.parameters as ParameterObject[] | undefined)?.length) {
      html += `<div class="op-section"><div class="section-label">Parameters</div>${paramsTable(op.parameters as ParameterObject[])}</div>`;
    }
    if (op.requestBody) {
      let rb = `<div class="op-section"><div class="section-label">Request Body</div>`;
      if (op.requestBody.description) rb += `<p class="op-body">${escapeHtml(op.requestBody.description)}</p>`;
      const cts = Object.keys(op.requestBody.content || {});
      if (cts.length) rb += `<p class="op-body op-meta"><strong>Content-Type:</strong> <code>${escapeHtml(cts.join(', '))}</code></p>`;
      rb += `</div>`;
      html += rb;
    }
    if (op.responses && Object.keys(op.responses).length > 0) {
      html += `<div class="op-section"><div class="section-label">Responses</div>${responsesTable(op.responses as Record<string, { description: string }>)}</div>`;
    }

    html += `</div>`;
    return html;
  }

  // ── Build sections ─────────────────────────────────────────────────────────
  const { tagOrder, byTag, untagged, tagDescriptions } = collectByTag(doc);
  let endpointsSections = '';

  for (const tag of tagOrder) {
    const ops = byTag[tag] || [];
    if (!ops.length) continue;
    endpointsSections += `<section>
      <h2>${escapeHtml(tag)}</h2>
      ${tagDescriptions[tag] ? `<p class="tag-desc">${escapeHtml(tagDescriptions[tag])}</p>` : ''}
      ${ops.map(renderOperation).join('')}
    </section>`;
  }

  if (untagged.length) {
    endpointsSections += `<section>
      <h2>(Untagged)</h2>
      ${untagged.map(renderOperation).join('')}
    </section>`;
  }

  // Schemas section
  let schemasSection = '';
  if (doc.components?.schemas && Object.keys(doc.components.schemas).length > 0) {
    const schemaCards = Object.entries(doc.components.schemas).map(([name, schema]) => {
      const typeName = schemaTypeName(schema);
      return `<div class="operation">
        <div class="op-header">
          <span class="badge-schema">SCHEMA</span>
          <strong>${escapeHtml(name)}</strong>
          ${typeName ? `<code style="font-size:11px;color:#6b7280">${escapeHtml(typeName)}</code>` : ''}
        </div>
        ${schema.description ? `<p class="op-body">${escapeHtml(schema.description)}</p>` : ''}
        ${schema.enum ? `<p class="op-body op-meta"><strong>Enum:</strong> ${(schema.enum as unknown[]).map(v => `<code>${escapeHtml(String(v))}</code>`).join(' | ')}</p>` : ''}
        ${schema.properties && Object.keys(schema.properties).length > 0 ? `<div class="op-section">${schemaPropsTable(schema.properties, schema.required || [])}</div>` : ''}
      </div>`;
    }).join('');
    schemasSection = `<section><h2>Schemas</h2>${schemaCards}</section>`;
  }

  // Security schemes section
  let securitySection = '';
  if (doc.components?.securitySchemes && Object.keys(doc.components.securitySchemes).length > 0) {
    const rows = Object.entries(doc.components.securitySchemes).map(([name, scheme]) => `
      <tr>
        <td><code>${escapeHtml(name)}</code></td>
        <td><span class="badge-in">${escapeHtml(scheme.type)}</span></td>
        <td>${escapeHtml(scheme.description || '')}</td>
      </tr>`).join('');
    securitySection = `<section><h2>Security Schemes</h2>
      <table class="data-table">
        <thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>`;
  }

  // Meta info table
  const metaRows: [string, string][] = [
    ['OpenAPI', doc.openapi],
    ['Version', doc.info.version],
  ];
  if (doc.info.termsOfService) metaRows.push(['Terms of Service', `<a href="${escapeHtml(doc.info.termsOfService)}">${escapeHtml(doc.info.termsOfService)}</a>`]);
  if (doc.info.contact?.name || doc.info.contact?.email) {
    const c = doc.info.contact;
    const parts = [c.name ? escapeHtml(c.name) : '', c.email ? `&lt;${escapeHtml(c.email)}&gt;` : '', c.url ? `<a href="${escapeHtml(c.url)}">${escapeHtml(c.url)}</a>` : ''].filter(Boolean);
    metaRows.push(['Contact', parts.join(' ')]);
  }
  if (doc.info.license?.name) {
    const l = doc.info.license;
    metaRows.push(['License', l.url ? `<a href="${escapeHtml(l.url)}">${escapeHtml(l.name)}</a>` : escapeHtml(l.name)]);
  }
  const metaTableHtml = `<table class="meta-table">
    ${metaRows.map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${v}</td></tr>`).join('')}
  </table>`;

  const serversHtml = doc.servers?.length
    ? `<section><h2>Servers</h2>${doc.servers.map(s => `
        <div class="server-row">
          <code>${escapeHtml(s.url)}</code>
          ${s.description ? `<span class="server-desc">— ${escapeHtml(s.description)}</span>` : ''}
        </div>`).join('')}
      </section>`
    : '';

  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      font-size: 13px; color: #111827; line-height: 1.65; background: #fff;
    }
    .page { max-width: 920px; margin: 0 auto; padding: 48px 32px; }
    h1 { font-size: 30px; font-weight: 800; color: #030712; margin-bottom: 6px; }
    h2 { font-size: 17px; font-weight: 700; color: #111827; margin: 32px 0 12px;
         border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    p { color: #4b5563; margin: 6px 0; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code {
      background: #f3f4f6; border-radius: 4px; padding: 1px 5px;
      font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace; font-size: 12px;
    }
    /* Meta table */
    .meta-table { border-collapse: collapse; margin: 16px 0 24px; }
    .meta-table th { text-align: left; padding: 5px 14px 5px 0; color: #6b7280; font-weight: 600;
                     font-size: 12px; white-space: nowrap; }
    .meta-table td { padding: 5px 0; color: #111827; }
    /* Servers */
    .server-row { margin: 8px 0; display: flex; align-items: center; gap: 10px; }
    .server-desc { color: #6b7280; font-size: 12px; }
    /* Tag description */
    .tag-desc { color: #6b7280; font-size: 13px; margin-bottom: 12px; }
    /* Operation card */
    .operation {
      border: 1px solid #e5e7eb; border-radius: 8px; margin: 10px 0; overflow: hidden;
      page-break-inside: avoid;
    }
    .op-header {
      display: flex; align-items: center; gap: 10px; padding: 10px 14px;
      background: #f9fafb; flex-wrap: wrap; border-bottom: 1px solid #f3f4f6;
    }
    .op-path { font-size: 13px; font-weight: 600; background: none; padding: 0; }
    .op-summary { font-size: 12px; color: #6b7280; flex: 1; }
    .op-body { padding: 8px 14px; font-size: 12px; color: #4b5563; }
    .op-meta { color: #374151; }
    .op-section { padding: 0 14px 12px; }
    .section-label {
      font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;
      color: #9ca3af; margin: 10px 0 6px;
    }
    /* Data tables */
    .data-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .data-table th {
      background: #f9fafb; text-align: left; padding: 6px 10px;
      border-bottom: 2px solid #e5e7eb; color: #374151;
      font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px;
    }
    .data-table td { padding: 6px 10px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    .data-table tr:last-child td { border-bottom: none; }
    /* Badges */
    .badge-in        { display:inline-block; padding:1px 7px; border-radius:3px; font-size:10px; font-weight:700; background:#e0e7ff; color:#3730a3; }
    .badge-query     { background:#dbeafe; color:#1d4ed8; }
    .badge-path      { background:#fce7f3; color:#be185d; }
    .badge-header    { background:#d1fae5; color:#047857; }
    .badge-cookie    { background:#fef3c7; color:#92400e; }
    .badge-deprecated { background:#fef9c3; color:#92400e; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700; }
    .badge-schema    { background:#ede9fe; color:#6d28d9; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700; }
    .code-ok   { background:#d1fae5; color:#065f46; padding:2px 6px; border-radius:4px; }
    .code-warn { background:#fef3c7; color:#92400e; padding:2px 6px; border-radius:4px; }
    .code-err  { background:#fee2e2; color:#991b1b; padding:2px 6px; border-radius:4px; }
    /* Print */
    @media print {
      body { font-size: 11px; }
      .page { padding: 16px; max-width: 100%; }
      .operation { break-inside: avoid; margin: 6px 0; }
      section { break-before: auto; }
      h2 { margin: 20px 0 8px; }
    }
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(doc.info.title)} — API Documentation</title>
  <style>${css}</style>
</head>
<body>
  <div class="page">
    <h1>${escapeHtml(doc.info.title)}</h1>
    ${doc.info.summary ? `<p style="font-size:15px;color:#4b5563;margin:6px 0 14px">${escapeHtml(doc.info.summary)}</p>` : ''}
    ${doc.info.description ? `<p style="margin:6px 0 14px">${escapeHtml(doc.info.description).replace(/\n/g, '<br>')}</p>` : ''}
    ${metaTableHtml}
    ${serversHtml}
    ${endpointsSections}
    ${schemasSection}
    ${securitySection}
  </div>
</body>
</html>`;
}

// ─── Public export functions ──────────────────────────────────────────────────

export function downloadHtml(doc: OpenAPIDocument): void {
  downloadBlob(
    generateHTML(doc),
    `${sanitizeFilename(doc.info.title)}.html`,
    'text/html; charset=utf-8'
  );
}

/**
 * Opens the API documentation in a new browser tab and immediately triggers
 * the browser's print dialog. The user can choose "Save as PDF" from there.
 */
export function printPdf(doc: OpenAPIDocument): void {
  const html = generateHTML(doc);
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // Fallback: download as HTML if popup was blocked
    downloadHtml(doc);
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  // Give the browser a moment to finish rendering before opening print dialog
  printWindow.addEventListener('load', () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  });
  // Also trigger after a longer delay in case 'load' already fired
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 800);
}

/**
 * Downloads as a .doc file (HTML-based). MS Word, LibreOffice Writer, and
 * Google Docs can all open this format.
 */
export function downloadWord(doc: OpenAPIDocument): void {
  // Prepend the BOM and Word-compatible meta charset so Word renders correctly
  const html = generateHTML(doc);
  downloadBlob(
    '\ufeff' + html,
    `${sanitizeFilename(doc.info.title)}.doc`,
    'application/msword'
  );
}
