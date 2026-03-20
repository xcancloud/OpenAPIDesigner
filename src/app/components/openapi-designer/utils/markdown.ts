/**
 * Minimal, safe Markdown → HTML renderer.
 *
 * Handles: ATX headings, bold, italic, strikethrough, inline code,
 * fenced code blocks, blockquotes, ordered/unordered lists, links,
 * horizontal rules, and paragraphs.
 *
 * Security: all user text is HTML-escaped before insertion; only
 * a controlled, known-safe set of HTML tags is ever emitted.
 * javascript: and data: link schemes are stripped.
 */

/** HTML-escape a raw string (& < > ") */
export function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Apply inline Markdown to a string that has NOT yet been HTML-escaped. */
function applyInline(raw: string): string {
  // 1. HTML-escape first so user text can't inject HTML
  let s = escHtml(raw);

  // 2. Extract inline code spans (protect from bold/italic processing)
  const codeSlots: string[] = [];
  s = s.replace(/`([^`\n]+)`/g, (_, inner) => {
    const idx = codeSlots.length;
    codeSlots.push(`<code class="md-code">${inner}</code>`);
    return `\x01c${idx}\x01`;
  });

  // 3. Bold + Italic (order matters: combined first)
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  s = s.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  // Bold
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // Italic
  s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  s = s.replace(/_([^_\n]+)_/g, '<em>$1</em>');
  // Strikethrough
  s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // 4. Links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    // href already HTML-escaped; unescape & only for protocol check
    const safeHref = href.replace(/&amp;/g, '&');
    if (/^javascript:/i.test(safeHref.trim()) || /^data:/i.test(safeHref.trim())) {
      return escHtml(text);
    }
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });

  // 5. Restore code spans
  s = s.replace(/\x01c(\d+)\x01/g, (_, i) => codeSlots[Number(i)]);

  return s;
}

type ListType = 'ul' | 'ol';

/**
 * Convert Markdown text to safe HTML.
 * Returns an empty string for blank input.
 */
export function renderMarkdown(raw: string): string {
  if (!raw || !raw.trim()) return '';

  const lines = raw.split('\n');
  const out: string[] = [];
  let i = 0;

  // Fenced code block state
  let inCode = false;
  let codeLang = '';
  const codeLines: string[] = [];

  // List stack: tracks open list tags
  const listStack: ListType[] = [];

  // Pending paragraph lines (accumulated before flush)
  const paraLines: string[] = [];

  function flushPara() {
    if (!paraLines.length) return;
    const html = paraLines.map(applyInline).join('<br>');
    out.push(`<p class="md-p">${html}</p>`);
    paraLines.length = 0;
  }

  function closeLists() {
    while (listStack.length) out.push(`</${listStack.pop()}>`);
  }

  function openList(type: ListType) {
    const top = listStack[listStack.length - 1];
    if (top !== type) {
      if (top) out.push(`</${listStack.pop()}>`);
      out.push(type === 'ul' ? '<ul class="md-ul">' : '<ol class="md-ol">');
      listStack.push(type);
    }
  }

  while (i < lines.length) {
    const line = lines[i];

    // ── Fenced code block ──────────────────────────────────────────────────
    if (/^```/.test(line)) {
      if (inCode) {
        const escaped = escHtml(codeLines.join('\n'));
        out.push(`<pre class="md-pre"><code class="language-${codeLang}">${escaped}</code></pre>`);
        inCode = false;
        codeLang = '';
        codeLines.length = 0;
      } else {
        flushPara();
        closeLists();
        inCode = true;
        codeLang = escHtml(line.slice(3).trim());
      }
      i++;
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      i++;
      continue;
    }

    // ── ATX Heading ───────────────────────────────────────────────────────
    const hMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (hMatch) {
      flushPara();
      closeLists();
      const lvl = hMatch[1].length;
      out.push(`<h${lvl} class="md-h${lvl}">${applyInline(hMatch[2])}</h${lvl}>`);
      i++;
      continue;
    }

    // ── Horizontal rule ───────────────────────────────────────────────────
    if (/^[-*_]{3,}\s*$/.test(line)) {
      flushPara();
      closeLists();
      out.push('<hr class="md-hr">');
      i++;
      continue;
    }

    // ── Blockquote ────────────────────────────────────────────────────────
    if (/^>\s?/.test(line)) {
      flushPara();
      closeLists();
      out.push(`<blockquote class="md-bq">${applyInline(line.replace(/^>\s?/, ''))}</blockquote>`);
      i++;
      continue;
    }

    // ── Unordered list ────────────────────────────────────────────────────
    const ulMatch = line.match(/^\s*[-*+]\s+(.*)/);
    if (ulMatch) {
      flushPara();
      openList('ul');
      out.push(`<li class="md-li">${applyInline(ulMatch[1])}</li>`);
      i++;
      continue;
    }

    // ── Ordered list ──────────────────────────────────────────────────────
    const olMatch = line.match(/^\s*\d+\.\s+(.*)/);
    if (olMatch) {
      flushPara();
      openList('ol');
      out.push(`<li class="md-li">${applyInline(olMatch[1])}</li>`);
      i++;
      continue;
    }

    // ── Empty line ────────────────────────────────────────────────────────
    if (line.trim() === '') {
      flushPara();
      closeLists();
      i++;
      continue;
    }

    // ── Regular paragraph line ────────────────────────────────────────────
    if (listStack.length) closeLists();
    paraLines.push(line);
    i++;
  }

  // Flush any remaining content
  flushPara();
  closeLists();

  return out.join('\n');
}

/** CSS snippet that styles all md-* classes for use in HTML export */
export const MARKDOWN_CSS = `
.md-h1,.md-h2,.md-h3,.md-h4,.md-h5,.md-h6{font-weight:700;line-height:1.3;margin:12px 0 6px}
.md-h1{font-size:1.5em}.md-h2{font-size:1.25em}.md-h3{font-size:1.1em}
.md-h4,.md-h5,.md-h6{font-size:1em}
.md-p{margin:6px 0;line-height:1.7}
.md-ul,.md-ol{margin:6px 0;padding-left:20px}
.md-li{margin:2px 0}
.md-code{background:rgba(0,0,0,.06);border-radius:3px;padding:1px 5px;font-family:monospace;font-size:.92em}
.md-pre{background:#1e1e2e;color:#cdd6f4;border-radius:6px;padding:12px 16px;overflow-x:auto;margin:8px 0}
.md-pre code{background:none;padding:0;font-size:.875em;font-family:'Fira Code',Consolas,monospace}
.md-bq{border-left:3px solid #6366f1;margin:8px 0;padding:4px 12px;color:#6b7280;font-style:italic}
.md-hr{border:none;border-top:1px solid #e5e7eb;margin:12px 0}
`.trim();
