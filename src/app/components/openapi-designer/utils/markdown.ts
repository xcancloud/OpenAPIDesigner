/**
 * Markdown → HTML renderer built on marked (CommonMark / GFM) with:
 *   • KaTeX for inline ($...$) and block ($$...$$) math
 *   • Shiki for syntax-highlighted code blocks
 *   • Mermaid diagram placeholder (rendered in MarkdownEditor via useEffect)
 *   • URL sanitisation and raw-HTML stripping for XSS safety
 */

import 'katex/dist/katex.min.css';
import katex from 'katex';
import { marked, type MarkedExtension, type Tokens } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { highlight, initHighlighter } from './shiki';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** HTML-escape a raw string (& < > ") */
export function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Escape for use inside an HTML attribute value (e.g. data-code="...") */
function escAttr(s: string): string {
  return escHtml(s).replace(/'/g, '&#39;');
}

/** Strip dangerous URL schemes for XSS prevention */
function sanitizeHref(href: string | null | undefined): string {
  if (!href) return '#';
  const proto = href.trim().match(/^([a-z][a-z\d+\-.]*:)/i)?.[1]?.toLowerCase();
  if (proto && !['http:', 'https:', 'mailto:', 'ftp:', 'tel:'].includes(proto)) {
    return '#';
  }
  return href;
}

// ─── Math extensions ─────────────────────────────────────────────────────────

const BLOCK_MATH: MarkedExtension = {
  extensions: [
    {
      name: 'blockMath',
      level: 'block',
      start: (src: string) => src.indexOf('$$'),
      tokenizer(src: string): Tokens.Generic | undefined {
        const m = src.match(/^\$\$([\s\S]+?)\$\$/);
        if (m) return { type: 'blockMath', raw: m[0], math: m[1].trim() };
      },
      renderer(token: Tokens.Generic): string {
        const math = token['math'] as string;
        try {
          return `<div class="md-math-block">${katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          })}</div>\n`;
        } catch {
          return `<div class="md-math-block md-math-error"><code>${escHtml(math)}</code></div>\n`;
        }
      },
    },
  ],
};

const INLINE_MATH: MarkedExtension = {
  extensions: [
    {
      name: 'inlineMath',
      level: 'inline',
      start: (src: string) => src.indexOf('$'),
      tokenizer(src: string): Tokens.Generic | undefined {
        if (src.startsWith('$$')) return; // block math has priority
        const m = src.match(/^\$([^$\n]{1,400}?)\$/);
        if (m) return { type: 'inlineMath', raw: m[0], math: m[1] };
      },
      renderer(token: Tokens.Generic): string {
        const math = token['math'] as string;
        try {
          return katex.renderToString(math, { displayMode: false, throwOnError: false });
        } catch {
          return `<span class="md-math-error">${escHtml(math)}</span>`;
        }
      },
    },
  ],
};

// ─── Per-render dark-mode state (safe: JS is single-threaded) ────────────────

let _isDark = false;

// ─── Code + HTML renderers ───────────────────────────────────────────────────

const CUSTOM_RENDERER: MarkedExtension = {
  renderer: {
    /** Mermaid blocks → placeholder div; others → Shiki or plain <pre> */
    code(token: Tokens.Code): string {
      const lang = (token.lang ?? '').trim();

      if (lang === 'mermaid') {
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        return `<div class="md-mermaid" id="${id}" data-code="${escAttr(token.text)}"><code class="md-mermaid-source">${escHtml(token.text)}</code></div>\n`;
      }

      const highlighted = highlight(token.text, lang, _isDark);
      if (highlighted) {
        return `<div class="md-code-block">${highlighted}</div>\n`;
      }
      // Shiki not ready yet — plain pre (progressive enhancement)
      return `<pre class="md-pre"><code class="${lang ? `language-${escHtml(lang)} ` : ''}md-code">${escHtml(token.text)}</code></pre>\n`;
    },

    /** Strip raw HTML from markdown input for XSS safety */
    html(): string {
      return '';
    },
  },
};

/** Sanitise link hrefs and add target/rel for external links */
const LINK_SANITIZER: MarkedExtension = {
  walkTokens(token: Tokens.Generic) {
    if (token.type === 'link') {
      (token as unknown as Tokens.Link).href = sanitizeHref(
        (token as unknown as Tokens.Link).href,
      );
    }
  },
  hooks: {
    postprocess(html: string): string {
      return html.replace(
        /<a\s+href="(https?:\/\/[^"]+)"/g,
        '<a rel="noopener noreferrer" target="_blank" href="$1"',
      );
    },
  },
};

// ─── One-time setup ───────────────────────────────────────────────────────────

let _ready = false;

function setup() {
  if (_ready) return;
  _ready = true;
  marked.use(gfmHeadingId({ prefix: 'md-' }));
  marked.use(BLOCK_MATH);
  marked.use(INLINE_MATH);
  marked.use(CUSTOM_RENDERER);
  marked.use(LINK_SANITIZER);
  marked.use({ gfm: true, breaks: false });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Warm up Shiki (WASM + language grammars). Call once on component mount.
 * After this resolves, code blocks will render with full syntax highlighting.
 */
export async function initMarkdown(): Promise<void> {
  setup();
  await initHighlighter();
}

/**
 * Convert CommonMark / GFM markdown to safe HTML.
 * Code blocks degrade to `<pre>` until initMarkdown() resolves (Shiki WASM ready).
 */
export function renderMarkdown(content: string, isDark = false): string {
  setup();
  _isDark = isDark;
  const trimmed = content?.trim();
  if (!trimmed) return '';
  return marked.parse(trimmed) as string;
}

/** Minimal CSS for standalone HTML export.
 * Consumers should also include katex/dist/katex.min.css and a Shiki theme CSS. */
export const MARKDOWN_CSS = `
.md-p{margin:.4em 0;line-height:1.7}
.md-h1,.md-h2,.md-h3,.md-h4,.md-h5,.md-h6{font-weight:700;line-height:1.3;margin:1em 0 .4em}
.md-h1{font-size:1.5em}.md-h2{font-size:1.25em}.md-h3{font-size:1.1em}
.md-pre,.md-code-block{border-radius:6px;overflow-x:auto;margin:.5em 0}
.md-pre{background:#1e1e2e;color:#cdd6f4;padding:.75em 1em}
.md-pre .md-code{background:none;padding:0;font-family:monospace;font-size:.875em}
.md-math-block{text-align:center;overflow-x:auto;margin:1em 0}
.md-math-error{color:red}
.md-mermaid{text-align:center;margin:.75em 0}
`.trim();
