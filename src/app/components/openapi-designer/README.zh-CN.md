# OpenAPI 设计器

一个功能完整的 OpenAPI 3.1 规范设计器 React 组件，支持可视化编辑、代码编辑器、双向同步、实时预览、规范校验、国际化及深色/浅色主题。

## 功能特性

- **可视化编辑器** - 通过直观的表单界面设计 API 端点、数据模型、参数和响应
- **代码编辑器** - 内置语法高亮的 YAML/JSON 编辑器，支持实时编辑和格式切换
- **双向同步** - 可视化编辑器与代码编辑器之间无缝同步
- **Schema 设计器** - 可视化 JSON Schema 设计，支持嵌套对象、数组、枚举、`$ref` 引用、`oneOf`/`allOf`/`anyOf` 组合
- **安全方案** - 配置 OAuth2、JWT（Bearer）、API Key、HTTP Basic、OpenID Connect、双向 TLS 等认证方案
- **实时校验** - 实时检测语法和语义错误，严格遵循 OpenAPI 3.1 规范
- **API 文档预览** - Swagger UI 风格的实时文档预览，支持端点分组、请求/响应示例
- **导入/导出** - 支持 YAML 和 JSON 文件的导入导出，兼容 OpenAPI 3.x 规范
- **国际化 (i18n)** - 内置中英文双语支持，可轻松扩展更多语言
- **深色/浅色主题** - 完整的深色和浅色主题支持，一键切换
- **撤销/重做** - 支持历史记录管理，可撤销和重做操作
- **标签管理** - 创建和管理 API 标签，用于端点分组

## 安装

```bash
npm install @openapi-designer/react
# 或
yarn add @openapi-designer/react
# 或
pnpm add @openapi-designer/react
```

## 快速开始

```tsx
import { OpenAPIDesigner } from '@openapi-designer/react';

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <OpenAPIDesigner
        defaultLocale="zh"
        defaultTheme="light"
        onChange={(doc) => {
          console.log('文档已更新:', doc);
        }}
      />
    </div>
  );
}
```

## API 参考

### `<OpenAPIDesigner />` 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|------|
| `initialDocument` | `OpenAPIDocument` | 宠物商店示例 | 初始加载的 OpenAPI 文档 |
| `defaultLocale` | `'zh' \| 'en'` | `'zh'` | 默认界面语言 |
| `defaultTheme` | `'light' \| 'dark'` | `'light'` | 默认主题模式 |
| `onChange` | `(doc: OpenAPIDocument) => void` | — | 文档变更回调函数 |
| `className` | `string` | — | 自定义 CSS 类名 |

### 导出的工具函数

```tsx
import {
  OpenAPIDesigner,
  createDefaultDocument,
  createPetStoreDocument,
} from '@openapi-designer/react';

// 创建空白 OpenAPI 3.1 文档
const blankDoc = createDefaultDocument();

// 创建宠物商店示例文档
const sampleDoc = createPetStoreDocument();
```

## 组件架构

```
OpenAPIDesigner/
├── OpenAPIDesigner.tsx      # 主组件入口
├── index.ts                 # 公开 API 导出
├── context/
│   └── DesignerContext.tsx   # 状态管理（国际化、主题、文档存储）
├── types/
│   └── openapi.ts           # OpenAPI 3.1 TypeScript 类型定义
├── i18n/
│   └── locales.ts           # 国际化消息（中文、英文）
├── utils/
│   └── validation.ts        # OpenAPI 规范校验引擎
└── panels/
    ├── Sidebar.tsx           # 导航侧边栏
    ├── Toolbar.tsx           # 顶部工具栏（撤销/重做、导入/导出）
    ├── InfoPanel.tsx         # API 基本信息编辑
    ├── ServersPanel.tsx      # 服务器配置
    ├── PathsPanel.tsx        # 接口路径与操作编辑器
    ├── SchemasPanel.tsx      # 数据模型设计器
    ├── SecurityPanel.tsx     # 安全方案编辑器
    ├── TagsPanel.tsx         # 标签管理
    ├── CodeEditorPanel.tsx   # YAML/JSON 代码编辑器
    ├── PreviewPanel.tsx      # API 文档预览
    └── ValidationPanel.tsx   # 规范校验结果
```

## 自定义配置

### 自定义初始文档

```tsx
const myApi = {
  openapi: '3.1.0',
  info: {
    title: '我的自定义 API',
    version: '2.0.0',
    description: '一个自定义的 API 规范',
  },
  servers: [{ url: 'https://api.myapp.com/v2' }],
  paths: {},
  components: { schemas: {} },
};

<OpenAPIDesigner initialDocument={myApi} />
```

### 添加新语言

在 `i18n/` 目录下的 `locales.ts` 文件中扩展：

```typescript
import { I18nMessages } from './locales';

const ja: I18nMessages = {
  appName: 'OpenAPI デザイナー',
  // ... 完整的翻译内容
};
```

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Tailwind CSS v4** - 样式方案
- **js-yaml** - YAML 解析/序列化
- **lucide-react** - 图标库
- **Radix UI** - 无障碍基础组件

## OpenAPI 3.1 规范覆盖

本设计器支持 OpenAPI 3.1 规范中的以下核心对象：

| 对象 | 支持状态 | 说明 |
|------|---------|------|
| Info | ✅ 完整支持 | 标题、版本、描述、联系人、许可证 |
| Servers | ✅ 完整支持 | 多服务器配置和变量 |
| Paths | ✅ 完整支持 | 路径、操作、参数、请求体、响应 |
| Components/Schemas | ✅ 完整支持 | 对象、数组、枚举、$ref 引用 |
| Security Schemes | ✅ 完整支持 | API Key、HTTP、OAuth2、OpenID Connect |
| Tags | ✅ 完整支持 | 标签定义和管理 |
| Webhooks | 🔜 计划中 | OpenAPI 3.1 新增特性 |

## 浏览器支持

- Chrome / Edge（最新 2 个版本）
- Firefox（最新 2 个版本）
- Safari（最新 2 个版本）

## 许可证

MIT
