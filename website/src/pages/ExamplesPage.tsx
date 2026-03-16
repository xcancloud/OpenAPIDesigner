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

interface Example {
  title: string;
  desc: string;
  file: string;
  code: string;
}

const examples = (locale: Locale): Example[] => {
  const isZh = locale === 'zh';
  return [
    {
      title: isZh ? '基本用法' : 'Basic Usage',
      desc: isZh ? '最简单的使用方式——零配置即可启动。' : 'The simplest way to get started — zero configuration needed.',
      file: 'BasicUsage.tsx',
      code: `import { OpenAPIDesigner } from 'openapi-designer';

export default function BasicUsage() {
  return <OpenAPIDesigner />;
}`,
    },
    {
      title: isZh ? '自定义文档' : 'Custom Document',
      desc: isZh ? '传入一个已有的 OpenAPI 文档进行编辑。' : 'Load an existing OpenAPI document for editing.',
      file: 'CustomDocument.tsx',
      code: `import { OpenAPIDesigner } from 'openapi-designer';
import type { OpenAPIDocument } from 'openapi-designer';

const mySpec: OpenAPIDocument = {
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'A custom API specification',
  },
  paths: {
    '/users': {
      get: {
        summary: 'List users',
        operationId: 'listUsers',
        tags: ['Users'],
        responses: {
          '200': { description: 'Success' },
        },
      },
    },
  },
};

export default function CustomDocument() {
  return <OpenAPIDesigner initialDocument={mySpec} />;
}`,
    },
    {
      title: isZh ? '暗色主题' : 'Dark Theme',
      desc: isZh ? '使用暗色主题和中文语言。' : 'Use dark theme with Chinese locale.',
      file: 'DarkTheme.tsx',
      code: `import { OpenAPIDesigner } from 'openapi-designer';

export default function DarkTheme() {
  return (
    <OpenAPIDesigner
      defaultTheme="dark"
      defaultLocale="zh"
      className="h-screen"
    />
  );
}`,
    },
    {
      title: isZh ? '事件处理' : 'Event Handling',
      desc: isZh ? '监听文档变更并实现自动保存逻辑。' : 'Listen to document changes and implement auto-save logic.',
      file: 'EventHandling.tsx',
      code: `import { useState, useCallback } from 'react';
import { OpenAPIDesigner, createPetStoreDocument } from 'openapi-designer';
import type { OpenAPIDocument } from 'openapi-designer';

export default function EventHandling() {
  const [lastSaved, setLastSaved] = useState<string>('');

  const handleChange = useCallback((doc: OpenAPIDocument) => {
    // Auto-save to localStorage
    localStorage.setItem('my-api-spec', JSON.stringify(doc));
    setLastSaved(new Date().toLocaleTimeString());
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="px-4 py-2 text-sm text-gray-500 border-b">
        {lastSaved ? \`Last saved: \${lastSaved}\` : 'Not yet saved'}
      </div>
      <OpenAPIDesigner
        initialDocument={createPetStoreDocument()}
        onChange={handleChange}
        className="flex-1"
      />
    </div>
  );
}`,
    },
  ];
};

const text = (locale: Locale) =>
  locale === 'zh'
    ? { title: '示例', subtitle: '通过实际示例学习如何使用 OpenAPI Designer。' }
    : { title: 'Examples', subtitle: 'Learn how to use OpenAPI Designer through practical examples.' };

export default function ExamplesPage({ locale }: { locale: Locale }) {
  const t = text(locale);
  const exs = examples(locale);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">{t.subtitle}</p>

      <div className="mt-12 space-y-10">
        {exs.map((ex, i) => (
          <section key={i}>
            <h2 className="text-xl font-semibold">{ex.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground mb-4">{ex.desc}</p>
            <CodeBlock title={ex.file}>{ex.code}</CodeBlock>
          </section>
        ))}
      </div>
    </div>
  );
}
