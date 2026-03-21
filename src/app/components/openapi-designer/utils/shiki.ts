/**
 * Shiki singleton for syntax highlighting.
 * Initialised lazily on first call to initHighlighter().
 * highlight() falls back to '' until the highlighter is ready (safe – callers
 * can then display plain <pre><code> until the promise resolves).
 */
import { createHighlighter, type Highlighter } from 'shiki';

const LANGS = [
  'javascript', 'typescript', 'jsx', 'tsx',
  'json', 'yaml', 'html', 'css', 'scss',
  'bash', 'sh', 'shell',
  'python', 'go', 'rust', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby',
  'sql', 'xml', 'toml', 'dockerfile', 'http', 'markdown', 'text', 'plaintext',
] as const;

type ShikiLang = (typeof LANGS)[number];

let _instance: Highlighter | null = null;
let _pending: Promise<Highlighter> | null = null;

export function initHighlighter(): Promise<void> {
  if (_instance) return Promise.resolve();
  if (_pending) return _pending.then(() => undefined);
  _pending = createHighlighter({
    themes: ['github-dark', 'github-light'],
    langs: [...LANGS],
  }).then(h => {
    _instance = h;
    return h;
  });
  return _pending.then(() => undefined);
}

export function highlight(code: string, lang: string, dark: boolean): string {
  if (!_instance) return '';
  const safeLang: ShikiLang = (LANGS as readonly string[]).includes(lang)
    ? (lang as ShikiLang)
    : 'text';
  try {
    return _instance.codeToHtml(code, {
      lang: safeLang,
      theme: dark ? 'github-dark' : 'github-light',
    });
  } catch {
    return '';
  }
}
