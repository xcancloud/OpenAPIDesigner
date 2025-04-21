# OpenAPIDesigner

[English](README_en.md) | [中文](README.md)

[![Vue3](https://img.shields.io/badge/Vue-3.5.13-red)](https://cn.vuejs.org/guide/introduction)
[![UI](https://img.shields.io/badge/Ant%20Design-3.2.20-brightgreen)](https://2x.antdv.com/components/overview)
[![Open API](https://img.shields.io/badge/Open%20API-3.0.1-blue)](https://swagger.io/specification/)

OpenAPIDesigner is an open-source visual design tool for creating, editing and validating OpenAPI 3.0 specifications.

## ✨ Features

- Visual API specification designer
- Real-time OpenAPI schema validation
- Multi-framework integration (Vue/React/Plain JS)
- Dual-language support (English/Chinese)
- Dynamic API documentation preview

## 📦 Installation

```bash
npm install open-api-designer
```

## 🚀 Usage

### Basic HTML Integration

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <script type="module" src="your-entry-file.js"></script>
  </head>
  <body>
    <div class="openapi-container"></div>
  </body>
</html>
```

```javascript
import OpenApiDesigner from 'open-api-designer';
import 'open-api-designer/style.css';

const initialSpec = {
  openapi: "3.0.1",
  info: {
    title: "API Service",
    version: "1.0.0"
  }
};

const designer = new OpenApiDesigner('.openapi-container', {
  language: 'en', // 'en' | 'zh_CN' (default: 'en')
  openApiDoc: initialSpec
});
```

### Framework Integration

#### React Component

```jsx
import { useEffect } from 'react';
import OpenApiDesigner from 'open-api-designer';
import 'open-api-designer/style.css';

export default function ApiDesigner() {
  useEffect(() => {
    new OpenApiDesigner('.designer-container', {
      openApiDoc: {} // Your OpenAPI spec
    });
  }, []);

  return <div className="designer-container"></div>;
}
```

#### Vue Component

```vue
<script setup>
import { onMounted } from 'vue';
import OpenApiDesigner from 'open-api-designer';
import 'open-api-designer/style.css';

onMounted(() => {
  new OpenApiDesigner('.designer-container', {
    language: 'zh_CN',
    openApiDoc: {} // Your OpenAPI spec
  });
});
</script>

<template>
  <div class="designer-container"></div>
</template>
```

## ⚙️ Configuration

### Constructor Options

| Parameter          | Type     | Default | Description                     |
|--------------------|----------|---------|---------------------------------|
| `element`          | string   | -       | CSS selector for container      |
| `language`         | string   | 'en'    | UI language (en/zh_CN)          |
| `openApiDoc`       | object   | {}      | Initial OpenAPI specification   |
| `onMountedCallback`| function | -       | Post-initialization callback    |

### Core Methods

| Method          | Description                          |
|-----------------|--------------------------------------|
| `getDocApi()`   | Returns current OpenAPI JSON spec    |
| `updateData()`  | Update spec with new JSON data       |

## 🧪 Demo Preview

```bash
npm run build
npm run demo 

> open-api-designer@1.0.0 demo
> http-server -p 8080 & open http://127.0.0.1:8080/demo/index.html
```
Access demo at `http://127.0.0.1:8080/demo/index.html`

## 📜 License

Licensed under [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html).
