# OpenAPIDesigner

[English](README.md) | [中文](README_zh.md)

[![Vue3](https://img.shields.io/badge/Vue-3.5.13-red)](https://cn.vuejs.org/guide/introduction)
[![UI](https://img.shields.io/badge/Ant%20Design-3.2.20-brightgreen)](https://2x.antdv.com/components/overview)
[![Style](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-green)](https://tailwindcss.com/docs)
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
<div class="openapi-container">

</div>
</body>
</html>
```

```javascript
import OpenApiDesigner from 'open-api-designer';

const initialSpec = {
  openapi: "3.0.1",
  info: {
    title: "API Docs",
    version: "1.0.0"
  }
};

const wrap = document.querySelector('.openapi-container');


const designer = new OpenApiDesigner();

wrap.innerHTML= `<${designer.compName}> </${designer.compName}>`
custom.setAttribute('open-api-doc', JSON.stringify(initialSpec));
```

### Framework Integration

#### React

```jsx
import OpenApiDesigner from 'open-api-designer';

function renderCustomElement(tagName, props) {
  return React.createElement(tagName, props);
}

export default function ApiDesigner() {
  const designInstance = new OpenApiDesigner({});
  return renderCustomElement(designInstance.compName, {'open-api-doc': 'https://generator3.swagger.io/openapi.json'})
}
```

#### Vue

```vue
import { onMounted, ref } from 'vue';
import OpenApiDesigner from 'open-api-designer';

const designInstance = ref();
onMounted(() => {
  designInstance.value = new OpenApiDesigner();
});

const changeLanguage = () => {
  designInstance.value && designInstance.value.changeLanguage('en')
}

<template>
  <component :is="designInstance.compName" open-api-doc="{}"></component>
</template>

```

## ⚙️ Configuration Options

### Constructor Parameters

| Parameter         | Type     | Default | Description                  |
|-------------------|----------|---------|------------------------------|
| `defaultFontSize` | string   | 13      | Default font size for display |

### Attribute Parameters

| Parameter         | Type     | Default | Description                          |
|-------------------|----------|---------|---------------------------------------|
| `open-api-doc`    | string   | '{}'    | OpenAPI documentation JSON data or URL to JSON file |
| `language`        | string   | en      | UI language (en/zh_CN)                |

### Core Methods

| Method               | Description                               |
|----------------------|-------------------------------------------|
| `getDocApi()`        | Get current OpenAPI JSON specification    |
| `updateData()`       | Update specification data                 |
| `changeLanguage(value)` | Change language (en/zh_CN)               |

## 🧪 Demo Preview

```bash
npm run build
npm run demo 

> open-api-designer@1.0.0 demo
> http-server -p 8080 & open http://127.0.0.1:8080/demo/index.html
```
Access demo at `http://127.0.0.1:8080/demo/index.html`

## 📜 License

Licensed under [Apache-2.0 license](http://www.apache.org/licenses/).
