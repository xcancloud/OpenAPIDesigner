# OpenAPIDesigner

[English](README.md) | [中文](README_zh.md)

[![Vue3](https://img.shields.io/badge/Vue-3.5.13-red)](https://cn.vuejs.org/guide/introduction)
[![UI](https://img.shields.io/badge/Ant%20Design-3.2.20-brightgreen)](https://2x.antdv.com/components/overview)
[![Style](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-green)](https://tailwindcss.com/docs)
[![Open API](https://img.shields.io/badge/Open%20API-3.0.1-blue)](https://swagger.io/specification/)

OpenAPIDesigner 是一款开源的 OpenAPI 3.0 规范可视化设计工具，支持创建、编辑和验证接口文档。

## ✨ 核心功能

- 可视化 API 规范设计器
- 实时 OpenAPI 模式验证
- 多框架集成支持（Vue/React/原生JS）
- 双语界面支持（英文/中文）
- 动态 API 文档预览

## 📦 安装

```bash
npm install open-api-designer
```

## 🚀 使用指南

### 基础 HTML 集成

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
    title: "API 服务",
    version: "1.0.0"
  }
};

const wrap = document.querySelector('.openapi-container');


const designer = new OpenApiDesigner();

wrap.innerHTML= `<${designer.compName}> </${designer.compName}>`
custom.setAttribute('open-api-doc', JSON.stringify(initialSpec));
```

### 框架集成

#### React 组件

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

#### Vue 组件

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

## ⚙️ 配置选项

### 构造器参数

| 参数              | 类型       | 默认值   | 说明                          |
|-------------------|------------|----------|-------------------------------|
| `defaultFontSize`| string  | 13       |         |

### attribute 参数

| 参数              | 类型       | 默认值   | 说明                          |
|-------------------|------------|----------|-------------------------------|
| `open-api-doc`    | string     | '{}'     | 文档JSON 数据; 或者 json 地址    |
| `language`        | string     | en       | 界面语言（en/zh_CN）             |


### 核心方法

| 方法                     | 说明                               |
|-------------------------|-----------------------------------|
| `getDocApi()`           | 获取当前OpenAPI JSON规范           |
| `updateData()`          | 更新规范数据                       |
| `changeLanguage(value)` | 更换语言 (en/zh_CN)                 |

## 🧪 演示预览

```bash
npm run build
npm run demo 

> open-api-designer@1.0.0 demo
> http-server -p 8080 & open http://127.0.0.1:8080/demo/index.html
```
访问 `http://127.0.0.1:8080/demo/index.html` 查看演示

## 📜 许可协议

基于 [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html) 协议授权。
