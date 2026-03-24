import {
  Paintbrush,
  Code2,
  Database,
  ShieldCheck,
  Eye,
  Languages,
} from 'lucide-react';
import type { Locale } from '../i18n';
import { OpenAPIDesigner, createPetStoreDocument } from '@/app/components/openapi-designer';

const text = (locale: Locale) =>
  locale === 'zh'
    ? {
        heroTitle: 'OpenAPI 设计器',
        heroSubtitle: '一个强大的 React 组件，用于可视化设计 OpenAPI 3.1 规范。包含可视化编辑器、代码编辑器、实时验证等功能。',
        getStarted: '快速开始',
        viewGithub: '查看 GitHub',
        featuresTitle: '核心功能',
        featuresSubtitle: '一站式 API 设计所需的一切工具',
        features: [
          { title: '可视化编辑器', desc: '通过直观的表单界面设计 API 端点、参数和响应。' },
          { title: '代码编辑器', desc: '内置 YAML/JSON 代码编辑器，支持双向实时同步。' },
          { title: 'Schema 设计器', desc: '完整的 JSON Schema 支持，包括 oneOf、allOf、anyOf 组合。' },
          { title: '实时验证', desc: '根据 OpenAPI 3.1 规范自动验证文档，即时反馈错误。' },
          { title: 'API 预览', desc: 'Swagger UI 风格的文档预览，随设计实时更新。' },
          { title: '国际化与主题', desc: '开箱即用的中英文支持和亮色/暗色主题切换。' },
        ],
        demoTitle: '实时演示预览',
        demoSubtitle: '在下方预览 OpenAPI Designer 的完整功能',
        techTitle: '技术栈',
      }
    : {
        heroTitle: 'OpenAPI Designer',
        heroSubtitle:
          'A powerful React component for designing OpenAPI 3.1 specifications visually. Visual editor, code editor, live validation, and more.',
        getStarted: 'Get Started',
        viewGithub: 'View on GitHub',
        featuresTitle: 'Key Features',
        featuresSubtitle: 'Everything you need to design APIs in one place',
        features: [
          { title: 'Visual Editor', desc: 'Design API endpoints, parameters, and responses through an intuitive form-based interface.' },
          { title: 'Code Editor', desc: 'Built-in YAML/JSON code editor with bidirectional real-time synchronization.' },
          { title: 'Schema Designer', desc: 'Full JSON Schema support including oneOf, allOf, and anyOf compositions.' },
          { title: 'Live Validation', desc: 'Automatic validation against OpenAPI 3.1 spec with instant error feedback.' },
          { title: 'API Preview', desc: 'Swagger UI-style documentation preview that updates live as you design.' },
          { title: 'i18n & Themes', desc: 'Built-in English and Chinese support with light and dark theme toggling.' },
        ],
        demoTitle: 'Live Demo Preview',
        demoSubtitle: 'Preview the full OpenAPI Designer experience below',
        techTitle: 'Tech Stack',
      };

const featureIcons = [Paintbrush, Code2, Database, ShieldCheck, Eye, Languages];
const techBadges = ['React 18', 'TypeScript', 'Tailwind CSS v4', 'Vite 6', 'Radix UI', 'Lucide Icons'];

export default function HomePage({ locale }: { locale: Locale }) {
  const t = text(locale);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-500/5 dark:via-purple-500/3" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            OpenAPI 3.1 {locale === 'zh' ? '兼容' : 'Compatible'}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {t.heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            {t.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#guide"
              className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-colors"
            >
              {t.getStarted}
            </a>
            <a
              href="https://github.com/xcancloud/OpenAPIDesigner"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
            >
              {t.viewGithub}
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight">{t.featuresTitle}</h2>
          <p className="mt-3 text-muted-foreground">{t.featuresSubtitle}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.map((f, i) => {
            const Icon = featureIcons[i];
            return (
              <div
                key={i}
                className="group rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Demo Preview */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">{t.demoTitle}</h2>
          <p className="mt-3 text-muted-foreground">{t.demoSubtitle}</p>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-muted-foreground font-mono">OpenAPI Designer</span>
          </div>
          <div className="h-[min(72vh,880px)] min-h-[480px] bg-background">
            <OpenAPIDesigner
              key={locale}
              initialDocument={createPetStoreDocument()}
              defaultLocale={locale}
              className="h-full"
            />
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-8">{t.techTitle}</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {techBadges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground"
            >
              {badge}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
