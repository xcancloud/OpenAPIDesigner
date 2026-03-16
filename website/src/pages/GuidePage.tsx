import { Terminal, Lightbulb } from 'lucide-react';
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

const text = (locale: Locale) =>
  locale === 'zh'
    ? {
        title: '快速开始',
        subtitle: '只需几步即可将 OpenAPI Designer 集成到你的项目中。',
        installTitle: '安装',
        installDesc: '使用你喜欢的包管理器安装组件及其依赖：',
        quickStartTitle: '快速开始',
        quickStartDesc: '在 React 应用中导入并使用 OpenAPI Designer：',
        propsTitle: 'Props 参考',
        propsDesc: 'OpenAPIDesigner 组件接受以下 props：',
        tipsTitle: '使用提示',
        tips: [
          '使用 onChange 回调来跟踪文档变更并实现自动保存。',
          '通过 initialDocument 属性预加载现有的 OpenAPI 规范。',
          '通过 defaultTheme 属性来匹配你应用的主题。',
          '该组件完全支持 TypeScript，所有类型均已导出。',
        ],
        propName: '属性',
        propType: '类型',
        propDefault: '默认值',
        propDesc: '说明',
      }
    : {
        title: 'Getting Started',
        subtitle: 'Integrate OpenAPI Designer into your project in just a few steps.',
        installTitle: 'Installation',
        installDesc: 'Install the component and its dependencies using your preferred package manager:',
        quickStartTitle: 'Quick Start',
        quickStartDesc: 'Import and use OpenAPI Designer in your React application:',
        propsTitle: 'Props Reference',
        propsDesc: 'The OpenAPIDesigner component accepts the following props:',
        tipsTitle: 'Tips',
        tips: [
          'Use the onChange callback to track document changes and implement auto-saving.',
          'Pre-load an existing OpenAPI spec via the initialDocument prop.',
          'Match your application theme using the defaultTheme prop.',
          'The component is fully typed — all TypeScript types are exported.',
        ],
        propName: 'Prop',
        propType: 'Type',
        propDefault: 'Default',
        propDesc: 'Description',
      };

const propsData = (locale: Locale) =>
  locale === 'zh'
    ? [
        { name: 'initialDocument', type: 'OpenAPIDocument', default: 'undefined', desc: '挂载时预加载的 OpenAPI 文档' },
        { name: 'defaultLocale', type: "'zh' | 'en'", default: "'en'", desc: 'UI 语言' },
        { name: 'defaultTheme', type: "'light' | 'dark'", default: "'light'", desc: '颜色主题' },
        { name: 'onChange', type: '(doc: OpenAPIDocument) => void', default: 'undefined', desc: '文档变更时触发的回调' },
        { name: 'className', type: 'string', default: 'undefined', desc: '应用于根元素的额外 CSS 类名' },
      ]
    : [
        { name: 'initialDocument', type: 'OpenAPIDocument', default: 'undefined', desc: 'Pre-populated OpenAPI document to load on mount' },
        { name: 'defaultLocale', type: "'zh' | 'en'", default: "'en'", desc: 'UI language' },
        { name: 'defaultTheme', type: "'light' | 'dark'", default: "'light'", desc: 'Color theme' },
        { name: 'onChange', type: '(doc: OpenAPIDocument) => void', default: 'undefined', desc: 'Callback fired on every document change' },
        { name: 'className', type: 'string', default: 'undefined', desc: 'Additional CSS class applied to the root element' },
      ];

const installCode = `# npm
npm install openapi-designer

# yarn
yarn add openapi-designer

# pnpm
pnpm add openapi-designer`;

const quickStartCode = `import { OpenAPIDesigner } from 'openapi-designer';
import { createPetStoreDocument } from 'openapi-designer';

function App() {
  return (
    <OpenAPIDesigner
      initialDocument={createPetStoreDocument()}
      defaultLocale="en"
      defaultTheme="light"
      onChange={(doc) => console.log('Document updated:', doc)}
      className="h-screen"
    />
  );
}`;

export default function GuidePage({ locale }: { locale: Locale }) {
  const t = text(locale);
  const props = propsData(locale);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">{t.subtitle}</p>

      {/* Installation */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-2">{t.installTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t.installDesc}</p>
        <CodeBlock title="Terminal">{installCode}</CodeBlock>
      </section>

      {/* Quick Start */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-2">{t.quickStartTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t.quickStartDesc}</p>
        <CodeBlock title="App.tsx">{quickStartCode}</CodeBlock>
      </section>

      {/* Props Table */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-2">{t.propsTitle}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t.propsDesc}</p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold">{t.propName}</th>
                <th className="px-4 py-3 text-left font-semibold">{t.propType}</th>
                <th className="px-4 py-3 text-left font-semibold">{t.propDefault}</th>
                <th className="px-4 py-3 text-left font-semibold">{t.propDesc}</th>
              </tr>
            </thead>
            <tbody>
              {props.map((p) => (
                <tr key={p.name} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-600 dark:text-indigo-400">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.type}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.default}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tips */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{t.tipsTitle}</h2>
        <div className="space-y-3">
          {t.tips.map((tip, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-sm text-muted-foreground">{tip}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
