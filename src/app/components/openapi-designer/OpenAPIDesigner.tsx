import React from 'react';
import { DesignerProvider } from './context/DesignerContext';
import { useDesigner } from './context/DesignerContext';
import { Sidebar } from './panels/Sidebar';
import { Toolbar } from './panels/Toolbar';
import { InfoPanel } from './panels/InfoPanel';
import { ServersPanel } from './panels/ServersPanel';
import { PathsPanel } from './panels/PathsPanel';
import { SchemasPanel } from './panels/SchemasPanel';
import { SecurityPanel } from './panels/SecurityPanel';
import { TagsPanel } from './panels/TagsPanel';
import { CodeEditorPanel } from './panels/CodeEditorPanel';
import { PreviewPanel } from './panels/PreviewPanel';
import { ValidationPanel } from './panels/ValidationPanel';
import { CommandPalette } from './panels/CommandPalette';
import type { OpenAPIDocument } from './types/openapi';
import type { Locale } from './i18n/locales';
import { ScrollArea } from '../ui/scroll-area';
import { Toaster } from 'sonner';

// ==================== Props ====================
export interface OpenAPIDesignerProps {
  /** Initial OpenAPI document to load */
  initialDocument?: OpenAPIDocument;
  /** Default locale */
  defaultLocale?: Locale;
  /** Default theme */
  defaultTheme?: 'light' | 'dark';
  /** Callback when document changes */
  onChange?: (doc: OpenAPIDocument) => void;
  /** Custom class name */
  className?: string;
}

// ==================== Internal Layout ====================
function DesignerLayout({ onChange }: { onChange?: (doc: OpenAPIDocument) => void }) {
  const { state } = useDesigner();

  // Keep a stable ref to the latest onChange so the effect doesn't re-run when the
  // consumer passes a new arrow function on every render (which would otherwise trigger
  // an infinite update loop: document change → onChange → parent setState → new onChange
  // reference → effect re-runs → onChange called again → ...).
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Only depend on state.document — the ref always holds the latest callback.
  React.useEffect(() => {
    onChangeRef.current?.(state.document);
  }, [state.document]);

  const renderPanel = () => {
    switch (state.activePanel) {
      case 'info':
        return <InfoPanel />;
      case 'servers':
        return <ServersPanel />;
      case 'paths':
        return <PathsPanel />;
      case 'schemas':
        return <SchemasPanel />;
      case 'security':
        return <SecurityPanel />;
      case 'tags':
        return <TagsPanel />;
      case 'code':
        return <CodeEditorPanel />;
      case 'preview':
        return <PreviewPanel />;
      case 'validation':
        return <ValidationPanel />;
      default:
        return <InfoPanel />;
    }
  };

  const isFullHeight = state.activePanel === 'code';

  return (
    <div className="flex h-full w-full bg-background overflow-hidden rounded-xl border border-border shadow-sm">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Toolbar />
        {isFullHeight ? (
          <div className="flex-1 overflow-hidden">
            {renderPanel()}
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="p-6 max-w-5xl">
              {renderPanel()}
            </div>
          </ScrollArea>
        )}
      </div>
      <CommandPalette />
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}

// ==================== Main Export ====================
export function OpenAPIDesigner({
  initialDocument,
  defaultLocale = 'zh',
  defaultTheme = 'light',
  onChange,
  className,
}: OpenAPIDesignerProps) {
  return (
    <div className={`h-full w-full ${className || ''}`}>
      <DesignerProvider
        initialDocument={initialDocument}
        defaultLocale={defaultLocale}
        defaultTheme={defaultTheme}
      >
        <DesignerLayout onChange={onChange} />
      </DesignerProvider>
    </div>
  );
}

// Re-export types for consumers
export type { OpenAPIDocument } from './types/openapi';
export type { Locale } from './i18n/locales';
export { createDefaultDocument, createPetStoreDocument } from './types/openapi';