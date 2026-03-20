import React, { useState } from 'react';
import { Link } from 'react-router';
import {
  BookOpen, Code, Eye, Shield, Box, Route,
  Languages, Zap,
  Download, CheckCircle2, ArrowRight,
  Terminal,
  Layers, Palette, Globe, Command, Keyboard, Save,
  MousePointer2, RefreshCw, FileJson, Braces
} from 'lucide-react';

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all group">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-[14px] text-foreground mb-1" style={{ fontWeight: 600 }}>{title}</h3>
      <p className="text-[13px] text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-[#0d1117]">
      <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[11px] text-[#8b949e] ml-2 flex-1">{language}</span>
        <button
          onClick={handleCopy}
          className="text-[10px] text-[#8b949e] hover:text-[#c9d1d9] transition-colors px-2 py-0.5 rounded hover:bg-[#30363d]"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-[12px] leading-relaxed text-[#c9d1d9] font-mono overflow-x-auto">
        {code}
      </pre>
    </div>
  );
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-[28px] text-foreground" style={{ fontWeight: 700, color }}>{value}</div>
      <div className="text-[12px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

export function DocsPage() {
  const [locale, setLocale] = useState<'en' | 'zh'>('en');
  const isZh = locale === 'zh';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen size={16} className="text-primary-foreground" />
            </div>
            <span className="text-[14px] text-foreground" style={{ fontWeight: 600 }}>OpenAPI Designer</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary" style={{ fontWeight: 500 }}>v1.1.0</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-[13px] text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">{isZh ? '功能' : 'Features'}</a>
            <a href="#installation" className="hover:text-foreground transition-colors">{isZh ? '安装' : 'Install'}</a>
            <a href="#api" className="hover:text-foreground transition-colors">API</a>
            <a href="#changelog" className="hover:text-foreground transition-colors">{isZh ? '更新' : 'Changelog'}</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] text-muted-foreground hover:bg-muted transition-colors"
            >
              <Globe size={14} />
              {locale === 'en' ? '中文' : 'English'}
            </button>
            <Link
              to="/"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] hover:opacity-90 transition-opacity"
            >
              {isZh ? '打开设计器' : 'Open Designer'}
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[12px] mb-6" style={{ fontWeight: 500 }}>
            <Zap size={12} />
            {isZh ? '基于 OpenAPI 3.1 规范' : 'Built on OpenAPI 3.1 Specification'}
          </div>
          <h1 className="text-foreground mb-4" style={{ fontSize: '2.75rem', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            {isZh ? (
              <>可视化 API 接口<br />设计与文档工具</>
            ) : (
              <>Visual API Interface<br />Design & Documentation</>
            )}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8" style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            {isZh
              ? '一个功能完整的 OpenAPI 3.1 规范设计器 React 组件。支持可视化编辑、代码编辑器、双向同步、实时预览、规范校验、国际化及深色主题。'
              : 'A full-featured OpenAPI 3.1 specification designer React component. Supports visual editing, code editor, bidirectional sync, live preview, validation, i18n, and dark theme.'
            }
          </p>
          <div className="flex items-center justify-center gap-3 mb-12">
            <Link
              to="/"
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-primary text-primary-foreground text-[14px] hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              style={{ fontWeight: 500 }}
            >
              <MousePointer2 size={14} />
              {isZh ? '立即体验' : 'Try It Now'}
            </Link>
            <a
              href="#installation"
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl border border-border text-foreground text-[14px] hover:bg-muted transition-colors"
              style={{ fontWeight: 500 }}
            >
              {isZh ? '快速开始' : 'Get Started'}
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12">
            <StatCard value="9" label={isZh ? '编辑面板' : 'Editor Panels'} color="#6366f1" />
            <div className="w-px h-10 bg-border" />
            <StatCard value="2" label={isZh ? '语言支持' : 'Languages'} color="#22c55e" />
            <div className="w-px h-10 bg-border" />
            <StatCard value="3.1" label="OpenAPI" color="#f59e0b" />
            <div className="w-px h-10 bg-border" />
            <StatCard value="0" label={isZh ? '外部依赖' : 'Ext. Dependencies'} color="#ec4899" />
          </div>
        </div>
      </section>

      {/* Live Preview Banner */}
      <section className="py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-purple-500/5 rounded-2xl border border-primary/20 p-8 flex items-center justify-between">
            <div>
              <h3 className="text-foreground mb-1" style={{ fontWeight: 600 }}>
                {isZh ? '在线预览' : 'Live Preview'}
              </h3>
              <p className="text-[13px] text-muted-foreground">
                {isZh
                  ? '立即体验完整功能的 OpenAPI 设计器，包含 Petstore 示例数据。'
                  : 'Experience the fully-featured OpenAPI designer with Petstore sample data.'}
              </p>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-[13px] hover:opacity-90 transition-opacity shrink-0"
              style={{ fontWeight: 500 }}
            >
              <Eye size={14} />
              {isZh ? '打开设计器' : 'Open Designer'}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-foreground mb-2" style={{ fontWeight: 700 }}>
            {isZh ? '核心功能' : 'Core Features'}
          </h2>
          <p className="text-center text-muted-foreground mb-10 text-[14px]">
            {isZh ? '涵盖 API 设计全流程的专业工具集' : 'Professional toolset covering the entire API design workflow'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Eye size={18} className="text-primary" />}
              title={isZh ? '可视化编辑器' : 'Visual Editor'}
              description={isZh
                ? '通过直观的表单界面设计 API 端点、数据模型、参数和响应。'
                : 'Design API endpoints, schemas, parameters, and responses through intuitive forms.'
              }
            />
            <FeatureCard
              icon={<Code size={18} className="text-primary" />}
              title={isZh ? '代码编辑器' : 'Code Editor'}
              description={isZh
                ? '内置语法高亮的 YAML/JSON 编辑器，支持实时编辑和格式切换。'
                : 'Built-in syntax-highlighted YAML/JSON editor with real-time editing and format switching.'
              }
            />
            <FeatureCard
              icon={<RefreshCw size={18} className="text-primary" />}
              title={isZh ? '双向同步' : 'Bidirectional Sync'}
              description={isZh
                ? '可视化编辑器与代码编辑器之间无缝同步，实时更新。'
                : 'Seamless synchronization between visual editor and code editor in real-time.'
              }
            />
            <FeatureCard
              icon={<Box size={18} className="text-primary" />}
              title={isZh ? 'Schema 设计器' : 'Schema Designer'}
              description={isZh
                ? '可视化设计 JSON Schema，支持嵌套对象、数组、枚举、$ref 引用等。'
                : 'Visual JSON Schema designer supporting nested objects, arrays, enums, $ref references.'
              }
            />
            <FeatureCard
              icon={<Shield size={18} className="text-primary" />}
              title={isZh ? '安全方案' : 'Security Schemes'}
              description={isZh
                ? '支持 OAuth2、JWT、API Key、HTTP Basic 等多种认证方案配置。'
                : 'Configure OAuth2, JWT, API Key, HTTP Basic, and other authentication schemes.'
              }
            />
            <FeatureCard
              icon={<CheckCircle2 size={18} className="text-primary" />}
              title={isZh ? '实时校验' : 'Live Validation'}
              description={isZh
                ? '实时检测语法和语义错误，严格遵循 OpenAPI 3.1 规范。'
                : 'Real-time syntax and semantic error detection following OpenAPI 3.1 specification.'
              }
            />
            <FeatureCard
              icon={<Command size={18} className="text-primary" />}
              title={isZh ? '命令面板' : 'Command Palette'}
              description={isZh
                ? '使用 ⌘K 快速搜索和导航 API 端点、数据模型和操作。'
                : 'Use ⌘K to quickly search and navigate API endpoints, schemas, and actions.'
              }
            />
            <FeatureCard
              icon={<Palette size={18} className="text-primary" />}
              title={isZh ? '深色/浅色主题' : 'Dark/Light Theme'}
              description={isZh
                ? '支持深色和浅色两种主题模式，自动记忆用户偏好。'
                : 'Support for both dark and light theme modes with automatic preference persistence.'
              }
            />
            <FeatureCard
              icon={<Languages size={18} className="text-primary" />}
              title={isZh ? '国际化支持' : 'Internationalization'}
              description={isZh
                ? '内置中英文双语支持，可轻松扩展更多语言。'
                : 'Built-in Chinese/English bilingual support with easy extensibility for more languages.'
              }
            />
            <FeatureCard
              icon={<Download size={18} className="text-primary" />}
              title={isZh ? '导入/导出' : 'Import/Export'}
              description={isZh
                ? '支持 YAML/JSON 文件的导入和导出，兼容 OpenAPI 3.x 规范。'
                : 'Support YAML/JSON file import and export, compatible with OpenAPI 3.x specifications.'
              }
            />
            <FeatureCard
              icon={<Save size={18} className="text-primary" />}
              title={isZh ? '自动保存' : 'Auto Save'}
              description={isZh
                ? '自动保存到 localStorage，撤销/重做历史记录（最多 50 步）。'
                : 'Auto-save to localStorage with undo/redo history (up to 50 steps).'
              }
            />
            <FeatureCard
              icon={<Braces size={18} className="text-primary" />}
              title={isZh ? 'Mock API 调试' : 'Mock API Testing'}
              description={isZh
                ? '预览面板支持 Mock API 试用功能，生成基于 Schema 的模拟响应。'
                : 'Preview panel supports Mock API try-it-out with schema-based mock responses.'
              }
            />
          </div>
        </div>
      </section>

      {/* Installation */}
      <section id="installation" className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-foreground mb-8 text-center" style={{ fontWeight: 700 }}>
            {isZh ? '快速开始' : 'Quick Start'}
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-[14px] text-foreground mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <Terminal size={16} className="text-muted-foreground" />
                {isZh ? '1. 安装组件' : '1. Install Component'}
              </h3>
              <CodeBlock
                language="bash"
                code={`npm install @openapi-designer/react\n# or\nyarn add @openapi-designer/react\n# or\npnpm add @openapi-designer/react`}
              />
            </div>

            <div>
              <h3 className="text-[14px] text-foreground mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <Code size={16} className="text-muted-foreground" />
                {isZh ? '2. 基础用法' : '2. Basic Usage'}
              </h3>
              <CodeBlock
                language="tsx"
                code={`import { OpenAPIDesigner } from '@openapi-designer/react';

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <OpenAPIDesigner
        defaultLocale="zh"
        defaultTheme="light"
        onChange={(doc) => {
          console.log('Document updated:', doc);
        }}
      />
    </div>
  );
}`}
              />
            </div>

            <div>
              <h3 className="text-[14px] text-foreground mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <Layers size={16} className="text-muted-foreground" />
                {isZh ? '3. 自定义初始文档' : '3. Custom Initial Document'}
              </h3>
              <CodeBlock
                language="tsx"
                code={`import { OpenAPIDesigner, createDefaultDocument } from '@openapi-designer/react';

const myDoc = {
  ...createDefaultDocument(),
  info: {
    title: 'My Custom API',
    version: '2.0.0',
    description: 'Custom API specification',
  },
};

function App() {
  return (
    <OpenAPIDesigner
      initialDocument={myDoc}
      defaultLocale="en"
      defaultTheme="dark"
    />
  );
}`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section id="api" className="py-16 px-6 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-foreground mb-8 text-center" style={{ fontWeight: 700 }}>
            {isZh ? 'API 参考' : 'API Reference'}
          </h2>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 bg-muted/40 border-b border-border">
              <h3 className="text-[14px] text-foreground font-mono" style={{ fontWeight: 600 }}>
                {'<OpenAPIDesigner />'}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {[
                { prop: 'initialDocument', type: 'OpenAPIDocument', default: 'Petstore sample', desc: isZh ? '初始加载的 OpenAPI 文档' : 'Initial OpenAPI document to load' },
                { prop: 'defaultLocale', type: "'zh' | 'en'", default: "'zh'", desc: isZh ? '默认语言' : 'Default locale' },
                { prop: 'defaultTheme', type: "'light' | 'dark'", default: "'light'", desc: isZh ? '默认主题' : 'Default theme' },
                { prop: 'onChange', type: '(doc: OpenAPIDocument) => void', default: '—', desc: isZh ? '文档变更回调' : 'Document change callback' },
                { prop: 'className', type: 'string', default: '—', desc: isZh ? '自定义 CSS 类名' : 'Custom CSS class name' },
              ].map(({ prop, type, default: def, desc }) => (
                <div key={prop} className="px-5 py-3 grid grid-cols-12 gap-4 text-[12px]">
                  <div className="col-span-3 font-mono text-foreground" style={{ fontWeight: 500 }}>{prop}</div>
                  <div className="col-span-3 font-mono text-primary">{type}</div>
                  <div className="col-span-2 text-muted-foreground">{def}</div>
                  <div className="col-span-4 text-muted-foreground">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hooks Reference */}
          <div className="mt-8 bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 bg-muted/40 border-b border-border">
              <h3 className="text-[14px] text-foreground font-mono" style={{ fontWeight: 600 }}>
                {isZh ? '内置 Hooks' : 'Built-in Hooks'}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {[
                { hook: 'useDesigner()', desc: isZh ? '获取文档状态和操作方法（state, dispatch, undo, redo 等）' : 'Access document state and actions (state, dispatch, undo, redo, etc.)' },
                { hook: 'useI18n()', desc: isZh ? '获取国际化上下文（locale, setLocale, t）' : 'Access i18n context (locale, setLocale, t)' },
                { hook: 'useTheme()', desc: isZh ? '获取主题上下文（theme, setTheme, toggleTheme）' : 'Access theme context (theme, setTheme, toggleTheme)' },
              ].map(({ hook, desc }) => (
                <div key={hook} className="px-5 py-3 flex items-center gap-4 text-[12px]">
                  <code className="font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">{hook}</code>
                  <span className="text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mt-8 bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 bg-muted/40 border-b border-border flex items-center gap-2">
              <Keyboard size={14} className="text-muted-foreground" />
              <h3 className="text-[14px] text-foreground" style={{ fontWeight: 600 }}>
                {isZh ? '快捷键' : 'Keyboard Shortcuts'}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {[
                { keys: '⌘ / Ctrl + K', desc: isZh ? '打开命令面板' : 'Open command palette' },
                { keys: '⌘ / Ctrl + Z', desc: isZh ? '撤销' : 'Undo' },
                { keys: '⌘ / Ctrl + Shift + Z', desc: isZh ? '重做' : 'Redo' },
                { keys: '⌘ / Ctrl + S', desc: isZh ? '保存（自动保存已启用）' : 'Save (auto-save enabled)' },
              ].map(({ keys, desc }) => (
                <div key={keys} className="px-5 py-3 flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">{desc}</span>
                  <kbd className="font-mono text-[11px] px-2 py-0.5 rounded bg-muted text-foreground border border-border">{keys}</kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture */}
          <div className="mt-8 bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-3 bg-muted/40 border-b border-border flex items-center gap-2">
              <FileJson size={14} className="text-muted-foreground" />
              <h3 className="text-[14px] text-foreground" style={{ fontWeight: 600 }}>
                {isZh ? '编辑面板' : 'Editor Panels'}
              </h3>
            </div>
            <div className="divide-y divide-border">
              {[
                { panel: isZh ? '基本信息' : 'Info', desc: isZh ? 'API 标题、版本、描述、联系人、许可证' : 'API title, version, description, contact, license' },
                { panel: isZh ? '服务器' : 'Servers', desc: isZh ? '服务器 URL、描述、变量配置' : 'Server URLs, descriptions, variable configuration' },
                { panel: isZh ? '接口路径' : 'Paths', desc: isZh ? 'HTTP 方法、参数、请求体、响应定义' : 'HTTP methods, parameters, request bodies, response definitions' },
                { panel: isZh ? '数据模型' : 'Schemas', desc: isZh ? 'JSON Schema 可视化编辑，支持嵌套和 $ref' : 'Visual JSON Schema editing with nesting and $ref support' },
                { panel: isZh ? '安全方案' : 'Security', desc: isZh ? 'API Key、HTTP、OAuth2、OpenID Connect 配置' : 'API Key, HTTP, OAuth2, OpenID Connect configuration' },
                { panel: isZh ? '标签' : 'Tags', desc: isZh ? '标签管理和分组' : 'Tag management and grouping' },
                { panel: isZh ? '代码编辑器' : 'Code Editor', desc: isZh ? 'YAML/JSON 语法高亮编辑器，双向同步' : 'YAML/JSON syntax-highlighted editor with bidirectional sync' },
                { panel: isZh ? '预览' : 'Preview', desc: isZh ? 'Swagger 风格的 API 文档预览和 Mock 调试' : 'Swagger-style API doc preview with Mock API testing' },
                { panel: isZh ? '校验' : 'Validation', desc: isZh ? '实时错误检测和快速导航修复' : 'Real-time error detection with quick navigation to fix' },
              ].map(({ panel, desc }) => (
                <div key={panel} className="px-5 py-2.5 flex items-center gap-4 text-[12px]">
                  <span className="text-foreground min-w-[80px]" style={{ fontWeight: 500 }}>{panel}</span>
                  <span className="text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Changelog */}
      <section id="changelog" className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-foreground mb-8 text-center" style={{ fontWeight: 700 }}>
            {isZh ? '更新日志' : "What's New"}
          </h2>
          <div className="space-y-4">
            {[
              {
                version: '1.1.0',
                date: '2026-03-16',
                tag: isZh ? '最新版' : 'Latest',
                items: isZh
                  ? ['新增命令面板（⌘K）快速搜索和导航', '新增 localStorage 自动保存', '新增侧边栏折叠和徽章计数', '新增键盘快捷键支持', '新增 Mock API 试用功能', '新增校验结果快速跳转', '新增 Toast 通知反馈', '修复撤销/重做历史记录重复问题', '改进主题和语言偏好记忆']
                  : ['Added command palette (⌘K) for quick search and navigation', 'Added localStorage auto-save', 'Added sidebar collapse and badge counts', 'Added keyboard shortcut support', 'Added Mock API Try-It-Out feature', 'Added validation quick navigation', 'Added Toast notification feedback', 'Fixed undo/redo history duplication issue', 'Improved theme and locale preference persistence'],
              },
              {
                version: '1.0.0',
                date: '2026-03-15',
                items: isZh
                  ? ['初始版本发布', '9 个编辑面板：基本信息、服务器、路径、Schema、安全、标签、代码、预览、校验', 'YAML/JSON 代码编辑器（语法高亮）', '中英文双语 + 深色/浅色主题', '导入/导出 + Petstore 示例']
                  : ['Initial release', '9 editor panels: Info, Servers, Paths, Schemas, Security, Tags, Code, Preview, Validation', 'YAML/JSON code editor with syntax highlighting', 'Chinese/English i18n + Dark/Light theme', 'Import/Export + Petstore sample data'],
              },
            ].map(({ version, date, tag, items }) => (
              <div key={version} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[14px] text-foreground font-mono" style={{ fontWeight: 600 }}>v{version}</span>
                  <span className="text-[12px] text-muted-foreground">{date}</span>
                  {tag && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600" style={{ fontWeight: 500 }}>
                      {tag}
                    </span>
                  )}
                </div>
                <ul className="space-y-1.5">
                  {items.map((item, i) => (
                    <li key={i} className="text-[13px] text-muted-foreground flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-green-500 mt-1 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-muted/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-foreground mb-3" style={{ fontWeight: 700 }}>
            {isZh ? '准备好开始了吗？' : 'Ready to Get Started?'}
          </h2>
          <p className="text-muted-foreground mb-6 text-[14px]">
            {isZh
              ? '立即体验 OpenAPI Designer，开始设计你的 API 接口文档。'
              : 'Try OpenAPI Designer now and start designing your API documentation.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground text-[14px] hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            style={{ fontWeight: 500 }}
          >
            {isZh ? '打开设计器' : 'Open Designer'}
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-[12px] text-muted-foreground">
          <span>OpenAPI Designer &copy; 2026. {isZh ? '基于 OpenAPI 3.1 规范构建。' : 'Built on OpenAPI 3.1 Specification.'}</span>
          <span>React + TypeScript + Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
}
