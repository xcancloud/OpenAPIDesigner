# I18n Implementation Guide

## Status: Phase 1 Complete ✅

### Phase 1 Completed
- ✅ Added `export.*` keys to `I18nMessages` interface in `locales.ts`
- ✅ Added English values for all `export.*` keys
- ✅ Added Chinese translations for all `export.*` keys

### Remaining Work: Phase 2 & 3

This guide outlines how to complete the internationalization of export formats and panel placeholders.

---

## Phase 2: Export Functions i18n (exporters.ts)

### Overview

The file `src/app/components/openapi-designer/utils/exporters.ts` contains hardcoded English strings that need to be replaced with i18n keys. Since this is a utility file without React context, we'll import the `locales` directly.

### Approach

1. **Get current locale** in export handlers (PreviewPanel/Toolbar)
2. **Pass locale parameter** to all export functions
3. **Import locales** in exporters.ts (no React required)
4. **Replace strings** using `locales[locale].export.*`

### Step-by-step Changes

#### 2.1 Update exporters.ts signature

Modify all 5 main export functions to accept a `locale: Locale` parameter:

```typescript
// Current
export function downloadHtml(doc: OpenAPIDocument): void
export function downloadWord(doc: OpenAPIDocument): void

// Change to
export function downloadHtml(doc: OpenAPIDocument, locale: Locale = 'en'): void
export function downloadWord(doc: OpenAPIDocument, locale: Locale = 'en'): void
```

Also update `generateHTML()` and `generateWordHTML()`:

```typescript
function generateHTML(doc: OpenAPIDocument, locale: Locale): string {
  const t = locales[locale]; // Add this line
  // ... rest of code
}

function generateWordHTML(doc: OpenAPIDocument, locale: Locale): string {
  const t = locales[locale]; // Add this line
  // ... rest of code
}
```

#### 2.2 Import locales in exporters.ts

Add at the top of the file (after existing imports):

```typescript
import { locales, type Locale } from '../i18n/locales';
```

#### 2.3 Replace hardcoded strings in generateHTML()

**Examples to replace:**

| Line | From | To |
|------|------|-----|
| TOC builder | `'Contents'` | `t.export.contents` |
| TOC builder | `'Overview'` | `t.export.overview` |
| TOC builder | `'Servers'` | `t.export.servers` |
| TOC builder | `'Endpoints'` | `t.export.endpoints` |
| TOC builder | `'Untagged'` | `t.export.untagged` |
| TOC builder | `'Schemas'` | `t.export.schemas` |
| TOC builder | `'Security'` | `t.export.security` |
| overviewSection | `'OpenAPI'` | `t.export.openAPI` |
| overviewSection | `'Version'` | `t.export.version` |
| overviewSection | `'Terms of Service'` | `t.export.termsOfService` |
| overviewSection | `'Contact'` | `t.export.contact` |
| overviewSection | `'License'` | `t.export.license` |
| overviewSection | `'External Docs'` | `t.export.externalDocs` |
| serversSection | (table headers) | `t.export.variable`, `t.export.default`, `t.export.enumValues`, `t.export.description` |
| paramsTable | (table headers) | `t.export.name`, `t.export.paramIn`, `t.export.type`, `t.export.constraints`, `t.export.required`, `t.export.description` |
| operationsSection | `'Parameters'` | `t.export.parameters` |
| operationsSection | `'Request Body'` | `t.export.requestBody` |
| operationsSection | `'Responses'` | `t.export.responses` |
| operationsSection | `'Headers'` | `t.export.headers` |
| operationsSection | `'Security: '` | `t.export.security` |
| renderSchemaHtml | `'Example: '` | Keep as-is (not user-facing export) |
| renderSchemaHtml | `'Option'` | `t.export.option` |
| renderSchemaHtml | `'Enum: '` | `t.export.enum` |
| renderSchemaHtml table | (headers) | `t.export.property`, `t.export.type`, `t.export.constraints`, `t.export.description` |
| renderSchemaHtml | `'items: '` | `t.export.items` |
| renderSchemaHtml | `'additionalProperties: '` | `t.export.additionalProperties` |
| securityHtml | `'🔓 Public (no auth)'` | `'🔓 ' + t.export.public` |
| securitySchemesSection | (table headers and flow names) | `t.export.*` |
| componentsSection | `'Reusable Parameters'` | `t.export.reusableParameters` |
| componentsSection | `'Reusable Responses'` | `t.export.reusableResponses` |
| componentsSection | `'Reusable Request Bodies'` | `t.export.reusableRequestBodies` |

**Key locations in files:**
- Line ~900: `buildToc()` function
- Line ~920: `overviewSection()`
- Line ~930: `serversSection()`
- Line ~950: `endpointsSection()`
- Line ~970: `schemasSection()`
- Line ~800-850: `renderSchemaHtml()` function
- Line ~600-700: `paramsTable()`, `requestBodyHtml()`, `responsesHtml()`

#### 2.4 Repeat for generateWordHTML()

Apply the same string replacements to the `generateWordHTML()` function (starts around line 1334).

#### 2.5 Update export callers

Find all calls to export functions and pass the locale:

**In PreviewPanel.tsx:**
```typescript
// Find where downloadHtml/downloadWord are called
// Add locale parameter
const currentLocale = useLocale(); // Get from i18n context or hook
downloadHtml(doc, currentLocale);
downloadWord(doc, currentLocale);
```

**In Toolbar or command palette (wherever users click export):**
```typescript
// Similar pattern - pass the active locale
```

---

## Phase 3: Panel Placeholder i18n

### Overview

Many input fields have hardcoded placeholder example texts. These need i18n keys added to `locales.ts` and referenced in the panels.

### Files to Update

1. **src/app/components/openapi-designer/panels/InfoPanel.tsx**
2. **src/app/components/openapi-designer/panels/ServersPanel.tsx**
3. **src/app/components/openapi-designer/panels/PathsPanel.tsx**
4. **src/app/components/openapi-designer/panels/SchemasPanel.tsx**
5. **src/app/components/openapi-designer/panels/SecurityPanel.tsx** (if exists)

### Step 1: Add placeholder keys to locales.ts

Add a new `placeholders` object to `I18nMessages`:

```typescript
export interface I18nMessages {
  // ... existing keys ...
  placeholders: {
    apiTitle: string; // "Petstore API"
    apiVersion: string; // "1.0.0"
    apiSummary: string; // "A simple API for managing pets"
    apiDescription: string; // "Describe your API in detail..."
    termsOfService: string; // "https://example.com/terms"
    openApiVersion: string; // "3.1.0"
    contactName: string; // "API Support Team"
    contactEmail: string; // "support@example.com"
    contactUrl: string; // "https://example.com/support"
    licenseName: string; // "Apache 2.0"
    licenseIdentifier: string; // "Apache-2.0"
    licenseUrl: string; // "https://www.apache.org/licenses/LICENSE-2.0"
    serverUrl: string; // "https://api.example.com/v1"
    serverDescription: string; // Description placeholder
    variableEnum: string; // "val1, val2"
    operationSummary: string; // "e.g. List all pets"
    operationId: string; // "listPets"
    pathUrl: string; // "e.g. /pets/{petId}"
    propertyDescription: string; // "Describe this property..."
    schemaDescription: string; // "Describe this schema..."
    regexPattern: string; // "^[a-z]+$"
    enumValues: string; // "val1, val2, val3"
  };
}
```

Add English values:
```typescript
export const en: I18nMessages = {
  // ... existing ...
  placeholders: {
    apiTitle: 'Petstore API',
    apiVersion: '1.0.0',
    apiSummary: 'A simple API for managing pets',
    apiDescription: 'Describe your API in detail. **Markdown** is fully supported.',
    termsOfService: 'https://example.com/terms',
    openApiVersion: '3.1.0',
    contactName: 'API Support Team',
    contactEmail: 'support@example.com',
    contactUrl: 'https://example.com/support',
    licenseName: 'Apache 2.0',
    licenseIdentifier: 'Apache-2.0',
    licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
    serverUrl: 'https://api.example.com/v1',
    serverDescription: 'Type a description...',
    variableEnum: 'val1, val2',
    operationSummary: 'e.g. List all pets',
    operationId: 'listPets',
    pathUrl: 'e.g. /pets/{petId}',
    propertyDescription: 'Describe this property. Markdown supported.',
    schemaDescription: 'Describe this schema. **Markdown** is supported.',
    regexPattern: '^[a-z]+$',
    enumValues: 'val1, val2, val3',
  },
};
```

Add Chinese translations:
```typescript
export const zh: I18nMessages = {
  // ... existing ...
  placeholders: {
    apiTitle: '宠物商店 API',
    apiVersion: '1.0.0',
    apiSummary: '一个简单的宠物管理 API',
    apiDescription: '详细描述您的 API。支持 **Markdown** 格式化。',
    termsOfService: 'https://example.com/terms',
    openApiVersion: '3.1.0',
    contactName: 'API 支持团队',
    contactEmail: 'support@example.com',
    contactUrl: 'https://example.com/support',
    licenseName: 'Apache 2.0',
    licenseIdentifier: 'Apache-2.0',
    licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
    serverUrl: 'https://api.example.com/v1',
    serverDescription: '输入描述...',
    variableEnum: 'val1, val2',
    operationSummary: '例如：获取所有宠物',
    operationId: 'listPets',
    pathUrl: '例如：/pets/{petId}',
    propertyDescription: '描述此属性。支持 Markdown。',
    schemaDescription: '描述此数据模型。支持 **Markdown**。',
    regexPattern: '^[a-z]+$',
    enumValues: 'val1, val2, val3',
  },
};
```

### Step 2: Update panels to use i18n placeholders

**InfoPanel.tsx example:**

```typescript
// Current
<InputField 
  value={doc.info.title} 
  onChange={(v) => update('info.title', v)} 
  placeholder="Petstore API" 
/>

// Change to
<InputField 
  value={doc.info.title} 
  onChange={(v) => update('info.title', v)} 
  placeholder={t.placeholders.apiTitle} 
/>
```

Apply this pattern to all inputs with hardcoded placeholders.

**SchemasPanel.tsx example:**

```typescript
// Current
placeholder="Describe this property. Markdown supported."

// Change to
placeholder={t.placeholders.propertyDescription}
```

---

## Testing Checklist

After implementing all changes:

1. ✅ Switch UI language to Chinese → verify export documents have Chinese labels
2. ✅ Switch UI language to English → verify export documents have English labels
3. ✅ Export HTML, Word, Markdown → check all section headers, table headers, labels are translated
4. ✅ Check panel inputs → placeholders should match selected language
5. ✅ Verify no hardcoded English strings remain in export output

---

## Files Modified Summary

| File | Type | Changes |
|------|------|---------|
| locales.ts | Type Defs | +1 interface export.* |
| locales.ts | Translations | +50 strings (en + zh) |
| exporters.ts | Functions | +locale param, -hardcoded strings, +i18n lookups |
| InfoPanel.tsx | Placeholders | ~10 placeholders → t.placeholders.* |
| ServersPanel.tsx | Placeholders | ~3 placeholders → t.placeholders.* |
| PathsPanel.tsx | Placeholders | ~2 placeholders → t.placeholders.* |
| SchemasPanel.tsx | Placeholders | ~5 placeholders → t.placeholders.* |
| PreviewPanel.tsx (or export caller) | Export handlers | Add locale param to downloadHtml/downloadWord calls |

---

## Questions?

Refer to existing patterns:
- How `useI18n()` hook is used in panels
- How `locales` dictionary is accessed in utilities
- How `Locale` type is imported and passed

