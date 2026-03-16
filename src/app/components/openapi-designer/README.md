# OpenAPI Designer

A full-featured OpenAPI 3.1 specification designer React component with visual editing, code editor, bidirectional sync, live preview, validation, i18n support, and dark/light theme.

## Features

- **Visual Editor** - Design API endpoints, schemas, parameters, and responses through intuitive form-based interfaces
- **Code Editor** - Built-in syntax-highlighted YAML/JSON editor with real-time editing and format switching
- **Bidirectional Sync** - Seamless synchronization between visual editor and code editor
- **Schema Designer** - Visual JSON Schema designer supporting nested objects, arrays, enums, `$ref` references, `oneOf`/`allOf`/`anyOf` composition
- **Security Schemes** - Configure OAuth2, JWT (Bearer), API Key, HTTP Basic, OpenID Connect, and Mutual TLS authentication schemes
- **Live Validation** - Real-time syntax and semantic error detection following OpenAPI 3.1 specification
- **API Documentation Preview** - Swagger UI-style live documentation preview with endpoint grouping, request/response examples
- **Import/Export** - YAML and JSON file import/export with support for OpenAPI 3.x specifications
- **Internationalization (i18n)** - Built-in Chinese and English bilingual support with easy extensibility
- **Dark/Light Theme** - Full dark and light theme support with one-click switching
- **Undo/Redo** - History management with undo and redo support
- **Tags Management** - Create and manage API tags for endpoint grouping

## Installation

```bash
npm install @openapi-designer/react
# or
yarn add @openapi-designer/react
# or
pnpm add @openapi-designer/react
```

## Quick Start

```tsx
import { OpenAPIDesigner } from '@openapi-designer/react';

function App() {
  return (
    <div style={{ height: '100vh' }}>
      <OpenAPIDesigner
        defaultLocale="en"
        defaultTheme="light"
        onChange={(doc) => {
          console.log('Document updated:', doc);
        }}
      />
    </div>
  );
}
```

## API Reference

### `<OpenAPIDesigner />` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialDocument` | `OpenAPIDocument` | Petstore sample | Initial OpenAPI document to load |
| `defaultLocale` | `'zh' \| 'en'` | `'zh'` | Default interface language |
| `defaultTheme` | `'light' \| 'dark'` | `'light'` | Default theme mode |
| `onChange` | `(doc: OpenAPIDocument) => void` | — | Callback when document changes |
| `className` | `string` | — | Custom CSS class name |

### Exported Utilities

```tsx
import {
  OpenAPIDesigner,
  createDefaultDocument,
  createPetStoreDocument,
} from '@openapi-designer/react';

// Create a blank OpenAPI 3.1 document
const blankDoc = createDefaultDocument();

// Create a sample Petstore API document
const sampleDoc = createPetStoreDocument();
```

## Component Architecture

```
OpenAPIDesigner/
├── OpenAPIDesigner.tsx      # Main component entry
├── index.ts                 # Public API exports
├── context/
│   └── DesignerContext.tsx   # State management (i18n, theme, document store)
├── types/
│   └── openapi.ts           # TypeScript type definitions for OpenAPI 3.1
├── i18n/
│   └── locales.ts           # Internationalization messages (en, zh)
├── utils/
│   └── validation.ts        # OpenAPI specification validation engine
└── panels/
    ├── Sidebar.tsx           # Navigation sidebar
    ├── Toolbar.tsx           # Top toolbar (undo/redo, import/export)
    ├── InfoPanel.tsx         # API info editor
    ├── ServersPanel.tsx      # Servers configuration
    ├── PathsPanel.tsx        # Paths & operations editor
    ├── SchemasPanel.tsx      # Schema/model designer
    ├── SecurityPanel.tsx     # Security schemes editor
    ├── TagsPanel.tsx         # Tags management
    ├── CodeEditorPanel.tsx   # YAML/JSON code editor
    ├── PreviewPanel.tsx      # API documentation preview
    └── ValidationPanel.tsx   # Specification validation results
```

## Customization

### Custom Initial Document

```tsx
const myApi = {
  openapi: '3.1.0',
  info: {
    title: 'My Custom API',
    version: '2.0.0',
    description: 'A custom API specification',
  },
  servers: [{ url: 'https://api.myapp.com/v2' }],
  paths: {},
  components: { schemas: {} },
};

<OpenAPIDesigner initialDocument={myApi} />
```

### Adding New Languages

Extend the `locales.ts` file in `i18n/` directory:

```typescript
import { I18nMessages } from './locales';

const ja: I18nMessages = {
  appName: 'OpenAPI デザイナー',
  // ... complete translations
};
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **js-yaml** - YAML parsing/serialization
- **lucide-react** - Icon library
- **Radix UI** - Accessible primitives

## Browser Support

- Chrome / Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## License

MIT
