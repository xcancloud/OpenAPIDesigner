export type Locale = 'en' | 'zh';

const translations = {
  en: {
    nav: { home: 'Home', guide: 'Guide', examples: 'Examples', api: 'API' },
    footer: {
      copyright: `© ${new Date().getFullYear()} OpenAPI Designer. Built with React & Tailwind CSS.`,
      github: 'GitHub',
      license: 'MIT License',
    },
  },
  zh: {
    nav: { home: '首页', guide: '指南', examples: '示例', api: 'API' },
    footer: {
      copyright: `© ${new Date().getFullYear()} OpenAPI Designer. 基于 React 和 Tailwind CSS 构建。`,
      github: 'GitHub',
      license: 'MIT 许可证',
    },
  },
} as const;

export function useTranslations(locale: Locale) {
  return translations[locale];
}
