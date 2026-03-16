<div align="center">

# OpenAPIDesigner

[![Build Status](https://img.shields.io/github/actions/workflow/status/nicepkg/OpenAPIDesigner/ci.yml?branch=main&style=flat-square)](https://github.com/nicepkg/OpenAPIDesigner/actions)
[![npm version](https://img.shields.io/npm/v/openapi-designer?style=flat-square)](https://www.npmjs.com/package/openapi-designer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)

A visual OpenAPI 3.1 specification designer built with React. Design, edit, and preview your API documentation — all in one component.

[English](./README.md) · [简体中文](./README.zh-CN.md) · [Live Demo](https://nicepkg.github.io/OpenAPIDesigner/) · [Documentation](./website/)

<!-- screenshot -->

</div>

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Exported Utilities](#exported-utilities)
- [Component Architecture](#component-architecture)
- [Sub-Projects](#sub-projects)
- [Customization](#customization)
- [Technology Stack](#technology-stack)
- [Browser Support](#browser-support)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Visual Editor** — Design API endpoints, schemas, parameters, and responses through an intuitive UI
- **Code Editor** — Built-in YAML/JSON editor with syntax highlighting
- **Bidirectional Sync** — Visual and code editors stay in sync automatically
- **Schema Designer** — Full JSON Schema support including `oneOf`, `allOf`, `anyOf`, and `not`
- **Security Schemes** — OAuth2, JWT, API Key, HTTP Basic, OpenID Connect, Mutual TLS
- **Live Validation** — Real-time validation against the OpenAPI 3.1 specification
- **API Documentation Preview** — Swagger UI–style documentation preview
- **Import / Export** — Load and save specifications in YAML or JSON
- **Internationalization** — Chinese and English out of the box
- **Themes** — Dark and light themes with seamless switching
- **Undo / Redo** — Full history support for all edits
- **Tags Management** — Organize endpoints with tags
- **Command Palette** — Quick navigation and actions via keyboard shortcut

## Quick Start

### Installation

```bash
npm install openapi-designer
```

### Basic Usage

```tsx
import { OpenAPIDesigner } from 'openapi-designer';

function App() {
  return (
    <OpenAPIDesigner
      defaultLocale="en"
      defaultTheme="light"
      onChange={(doc) => console.log(doc)}
    />
  );
}
```

### Using a Starter Document

```tsx
import { OpenAPIDesigner, createPetStoreDocument } from 'openapi-designer';

function App() {
  return (
    <OpenAPIDesigner
      initialDocument={createPetStoreDocument()}
      onChange={(doc) => console.log(doc)}
    />
  );
}
```

## API Reference

### `<OpenAPIDesigner />` Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `initialDocument` | `OpenAPIDocument` | `undefined` | Pre-populated OpenAPI document to load on mount |
| `defaultLocale` | `'zh' \| 'en'` | `'en'` | UI language |
| `defaultTheme` | `'light' \| 'dark'` | `'light'` | Color theme |
| `onChange` | `(doc: OpenAPIDocument) => void` | `undefined` | Callback fired on every document change |
| `className` | `string` | `undefined` | Additional CSS class applied to the root element |

### TypeScript Interface

```tsx
interface OpenAPIDesignerProps {
  initialDocument?: OpenAPIDocument;
  defaultLocale?: 'zh' | 'en';
  defaultTheme?: 'light' | 'dark';
  onChange?: (doc: OpenAPIDocument) => void;
  className?: string;
}
```

## Exported Utilities

| Function | Description |
| --- | --- |
| `createDefaultDocument()` | Returns a minimal, valid OpenAPI 3.1 document |
| `createPetStoreDocument()` | Returns a feature-rich Pet Store example document |

## Component Architecture

```
┌──────────────────────────────────────────────────┐
│                 OpenAPIDesigner                   │
│                                                  │
│  ┌─────────────┐  ┌───────────────────────────┐  │
│  │  Toolbar     │  │  Command Palette          │  │
│  └─────────────┘  └───────────────────────────┘  │
│                                                  │
│  ┌──────────────────┬───────────────────────┐    │
│  │  Visual Editor   │   Code Editor         │    │
│  │                  │   (YAML / JSON)       │    │
│  │  • Paths         │                       │    │
│  │  • Schemas       │                       │    │
│  │  • Parameters    ◄──── Bidirectional ───►│    │
│  │  • Responses     │       Sync            │    │
│  │  • Security      │                       │    │
│  │  • Tags          │                       │    │
│  └──────────────────┴───────────────────────┘    │
│                                                  │
│  ┌──────────────────┬───────────────────────┐    │
│  │  Validation      │  Documentation        │    │
│  │  Panel           │  Preview              │    │
│  └──────────────────┴───────────────────────┘    │
└──────────────────────────────────────────────────┘
```

## Sub-Projects

| Directory | Description |
| --- | --- |
| [`example/`](./example/) | Example demo application showcasing component usage |
| [`website/`](./website/) | Documentation website with guides and API docs |

## Customization

### Loading a Custom Document

```tsx
const myDoc: OpenAPIDocument = {
  openapi: '3.1.0',
  info: { title: 'My API', version: '1.0.0' },
  paths: {},
};

<OpenAPIDesigner initialDocument={myDoc} />;
```

### Adding Languages

The built-in i18n system supports Chinese (`zh`) and English (`en`). To contribute a new locale:

1. Create a new locale file under `src/app/components/openapi-designer/i18n/`.
2. Copy an existing locale (e.g., `en.ts`) and translate all keys.
3. Register the locale in the i18n configuration.
4. Submit a pull request.

## Technology Stack

| Category | Technologies |
| --- | --- |
| Framework | React 18, TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI (shadcn/ui) |
| Icons | Lucide React |
| YAML Processing | js-yaml |
| Build Tool | Vite |

## Browser Support

| Browser | Supported Version |
| --- | --- |
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/my-feature`.
3. Commit your changes: `git commit -m 'feat: add my feature'`.
4. Push to the branch: `git push origin feat/my-feature`.
5. Open a pull request.

Please make sure your code passes the existing linting and build checks before submitting.

## License

[MIT](./LICENSE) © OpenAPIDesigner Contributors
  