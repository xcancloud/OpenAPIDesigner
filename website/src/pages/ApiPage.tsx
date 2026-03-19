import { Terminal } from 'lucide-react';
import type { Locale } from '../i18n';

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {title && (
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2">
          <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
        </div>
      )}
      <pre className="overflow-x-auto bg-[#1e1e2e] p-4 text-sm leading-relaxed">
        <code className="text-gray-300 font-mono">{children}</code>
      </pre>
    </div>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 ${
                    j === 0
                      ? 'font-mono text-xs text-indigo-600 dark:text-indigo-400'
                      : j === 1
                        ? 'font-mono text-xs'
                        : 'text-muted-foreground'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const text = (locale: Locale) =>
  locale === 'zh'
    ? {
        title: 'API 参考',
        subtitle: 'OpenAPI Designer 组件的完整 API 文档。',
        propsTitle: 'OpenAPIDesignerProps',
        propsDesc: '主组件接受的所有属性。',
        headers: ['属性', '类型', '默认值', '说明'],
        typesTitle: 'OpenAPIDocument 类型',
        typesDesc: '核心文档类型定义，遵循 OpenAPI 3.1 规范。',
        utilitiesTitle: '工具函数',
        utilitiesDesc: '导出的工具函数，用于快速创建文档。',
        archTitle: '组件架构',
        archDesc: '组件内部结构概览。',
      }
    : {
        title: 'API Reference',
        subtitle: 'Complete API documentation for the OpenAPI Designer component.',
        propsTitle: 'OpenAPIDesignerProps',
        propsDesc: 'All props accepted by the main component.',
        headers: ['Prop', 'Type', 'Default', 'Description'],
        typesTitle: 'OpenAPIDocument Type',
        typesDesc: 'The core document type following the OpenAPI 3.1 specification.',
        utilitiesTitle: 'Utility Functions',
        utilitiesDesc: 'Exported utility functions for quick document creation.',
        archTitle: 'Component Architecture',
        archDesc: 'An overview of the internal component structure.',
      };

const propsRows = (locale: Locale): string[][] =>
  locale === 'zh'
    ? [
        ['initialDocument', 'OpenAPIDocument', 'undefined', '挂载时预加载的 OpenAPI 文档'],
        ['defaultLocale', "'zh' | 'en'", "'en'", 'UI 语言'],
        ['defaultTheme', "'light' | 'dark'", "'light'", '颜色主题'],
        ['onChange', '(doc: OpenAPIDocument) => void', 'undefined', '文档变更时触发的回调'],
        ['className', 'string', 'undefined', '应用于根元素的额外 CSS 类名'],
      ]
    : [
        ['initialDocument', 'OpenAPIDocument', 'undefined', 'Pre-populated OpenAPI document to load on mount'],
        ['defaultLocale', "'zh' | 'en'", "'en'", 'UI language'],
        ['defaultTheme', "'light' | 'dark'", "'light'", 'Color theme'],
        ['onChange', '(doc: OpenAPIDocument) => void', 'undefined', 'Callback fired on every document change'],
        ['className', 'string', 'undefined', 'Additional CSS class applied to the root element'],
      ];

const documentTypeCode = `interface OpenAPIDocument {
  openapi: string;                          // e.g. "3.1.0"
  info: InfoObject;                         // title, version, description, ...
  jsonSchemaDialect?: string;
  servers?: ServerObject[];
  paths?: PathsObject;                      // Record<string, PathItemObject>
  webhooks?: Record<string, PathItemObject>;
  components?: ComponentsObject;            // schemas, responses, parameters, ...
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
}`;

const utilitiesCode = `// Create a minimal blank OpenAPI 3.1 document
import { createDefaultDocument } from 'openapi-designer';
const blank = createDefaultDocument();

// Create a feature-rich Pet Store example
import { createPetStoreDocument } from 'openapi-designer';
const petStore = createPetStoreDocument();`;

const architectureDiagram = `┌──────────────────────────────────────────────┐
│              OpenAPIDesigner                  │
│  ┌─────────────────────────────────────────┐  │
│  │          DesignerContext                 │  │
│  │  (state, dispatch, undo/redo, i18n)     │  │
│  └────────────────┬────────────────────────┘  │
│                   │                           │
│  ┌────────────────┼────────────────────────┐  │
│  │   ┌────────┐   │   ┌────────────────┐   │  │
│  │   │Sidebar │   │   │  Main Content  │   │  │
│  │   │        │   │   │                │   │  │
│  │   │ • Info │   │   │ ┌────────────┐ │   │  │
│  │   │ • Paths│   │   │ │  Toolbar   │ │   │  │
│  │   │ •Server│   │   │ └────────────┘ │   │  │
│  │   │ •Schema│   │   │ ┌────────────┐ │   │  │
│  │   │ • Tags │   │   │ │Active Panel│ │   │  │
│  │   │ • Sec. │   │   │ │            │ │   │  │
│  │   └────────┘   │   │ │ InfoPanel  │ │   │  │
│  │                │   │ │ PathsPanel │ │   │  │
│  │                │   │ │ CodeEditor │ │   │  │
│  │                │   │ │ Preview    │ │   │  │
│  │                │   │ │ Validation │ │   │  │
│  │                │   │ └────────────┘ │   │  │
│  │                │   └────────────────┘   │  │
│  └────────────────┴────────────────────────┘  │
└──────────────────────────────────────────────┘`;

export default function ApiPage({ locale }: { locale: Locale }) {
  const t = text(locale);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">{t.subtitle}</p>

      {/* Props */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-2">{t.propsTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t.propsDesc}</p>
        <Table headers={t.headers} rows={propsRows(locale)} />
      </section>

      {/* Types */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-2">{t.typesTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t.typesDesc}</p>
        <CodeBlock title="types/openapi.ts">{documentTypeCode}</CodeBlock>
      </section>

      {/* Utilities */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-2">{t.utilitiesTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t.utilitiesDesc}</p>
        <CodeBlock title="Utility Functions">{utilitiesCode}</CodeBlock>
      </section>

      {/* Architecture */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-2">{t.archTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t.archDesc}</p>
        <CodeBlock title="Architecture">{architectureDiagram}</CodeBlock>
      </section>
    </div>
  );
}
