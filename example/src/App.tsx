import React, { useState, useCallback } from 'react'
import { Sun, Moon, Globe, FileText, PawPrint } from 'lucide-react'
import {
  OpenAPIDesigner,
  createDefaultDocument,
  createPetStoreDocument,
} from '@components/openapi-designer'
import type { OpenAPIDocument, Locale } from '@components/openapi-designer'

type Theme = 'light' | 'dark'
type SampleDoc = 'blank' | 'petstore'

export default function App() {
  const [theme, setTheme] = useState<Theme>('light')
  const [locale, setLocale] = useState<Locale>('en')
  const [sampleKey, setSampleKey] = useState<SampleDoc>('blank')
  const [document, setDocument] = useState<OpenAPIDocument>(createDefaultDocument())
  const [docVersion, setDocVersion] = useState(0)

  const handleDocChange = useCallback((doc: OpenAPIDocument) => {
    setDocument(doc)
  }, [])

  const switchDocument = useCallback((key: SampleDoc) => {
    setSampleKey(key)
    const doc = key === 'petstore' ? createPetStoreDocument() : createDefaultDocument()
    setDocument(doc)
    setDocVersion((v) => v + 1)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }, [])

  const toggleLocale = useCallback(() => {
    setLocale((l) => (l === 'en' ? 'zh' : 'en'))
  }, [])

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="flex h-screen flex-col bg-background text-foreground">
        {/* Header */}
        <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-border bg-gradient-to-r from-indigo-600 to-purple-600 px-4 dark:from-indigo-800 dark:to-purple-900">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-base font-semibold text-white">
              OpenAPI Designer
              <span className="ml-2 rounded-md bg-white/20 px-2 py-0.5 text-xs font-normal">
                Example
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Sample Document Switcher */}
            <div className="flex items-center rounded-lg bg-white/15 p-0.5">
              <button
                onClick={() => switchDocument('blank')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  sampleKey === 'blank'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Blank
              </button>
              <button
                onClick={() => switchDocument('petstore')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  sampleKey === 'petstore'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <PawPrint className="h-3.5 w-3.5" />
                Petstore
              </button>
            </div>

            <div className="mx-1 h-5 w-px bg-white/25" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              className="flex h-8 items-center gap-1 rounded-lg px-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              title={locale === 'en' ? 'Switch to Chinese' : 'Switch to English'}
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">{locale}</span>
            </button>
          </div>
        </header>

        {/* Designer */}
        <main className="min-h-0 flex-1">
          <OpenAPIDesigner
            key={docVersion}
            initialDocument={document}
            defaultLocale={locale}
            defaultTheme={theme}
            onChange={handleDocChange}
            className="h-full"
          />
        </main>

        {/* Footer Status Bar */}
        <footer className="flex h-7 shrink-0 items-center justify-between border-t border-border bg-muted/50 px-4 text-xs text-muted-foreground">
          <span>
            {document.info.title} v{document.info.version}
          </span>
          <span>
            OpenAPI {document.openapi} &middot;{' '}
            {Object.keys(document.paths ?? {}).length} paths &middot;{' '}
            {Object.keys(document.components?.schemas ?? {}).length} schemas
          </span>
        </footer>
      </div>
    </div>
  )
}
