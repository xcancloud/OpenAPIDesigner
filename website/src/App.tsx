import { useState, useEffect, useCallback } from 'react';
import { Moon, Sun, Globe, Menu, X } from 'lucide-react';
import { type Locale, useTranslations } from './i18n';
import HomePage from './pages/HomePage';
import GuidePage from './pages/GuidePage';
import ExamplesPage from './pages/ExamplesPage';
import ApiPage from './pages/ApiPage';

type Page = '#home' | '#guide' | '#examples' | '#api';

const navItems: { hash: Page; key: 'home' | 'guide' | 'examples' | 'api' }[] = [
  { hash: '#home', key: 'home' },
  { hash: '#guide', key: 'guide' },
  { hash: '#examples', key: 'examples' },
  { hash: '#api', key: 'api' },
];

export default function App() {
  const [page, setPage] = useState<Page>((window.location.hash as Page) || '#home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );
  const [locale, setLocale] = useState<Locale>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations(locale);

  useEffect(() => {
    const handler = () => {
      const hash = (window.location.hash || '#home') as Page;
      setPage(hash);
      setMobileMenuOpen(false);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')), []);
  const toggleLocale = useCallback(() => setLocale((prev) => (prev === 'en' ? 'zh' : 'en')), []);

  const renderPage = () => {
    switch (page) {
      case '#guide':
        return <GuidePage locale={locale} />;
      case '#examples':
        return <ExamplesPage locale={locale} />;
      case '#api':
        return <ApiPage locale={locale} />;
      default:
        return <HomePage locale={locale} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#home" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-bold">
              OA
            </span>
            <span className="hidden sm:inline">OpenAPI Designer</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ hash, key }) => (
              <a
                key={hash}
                href={hash}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  page === hash
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {t.nav[key]}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLocale}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium">{locale === 'en' ? 'EN' : '中文'}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
            {navItems.map(({ hash, key }) => (
              <a
                key={hash}
                href={hash}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  page === hash
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {t.nav[key]}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">{renderPage()}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p>{t.footer.copyright}</p>
          <div className="flex gap-4">
            <a
              href="https://github.com/xcancloud/OpenAPIDesigner"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {t.footer.github}
            </a>
            <span className="text-border">|</span>
            <span>{t.footer.license}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
