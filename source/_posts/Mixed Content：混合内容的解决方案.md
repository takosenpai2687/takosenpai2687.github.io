---
title: Mixed Content：混合内容的解决方案 🍸
date: 2023-01-27 16:11:04
tags:
    - 前端
    - JavaScript
    - 浏览器
categories:
    - 前端
cover: [static/MixedContent/mixed-content.png]
author: Tako Senpai
---

# Mixed Content：混合内容的解决方案

## 前言

在我开发 [TakoTako](https://tako-tako.netlify.app) 的时候，遇到了一个混合内容的错误。有一个功能需要获取一个来自 **HTTP** 服务器的图片资源，而我的网站使用的是 **HTTPS** 协议。打开 Chrome 控制台可以看到 `Warning` 如下：

```
Mixed Content: The page at '<URL>' was loaded over HTTPS,
but requested an insecure image '<URL>'.
This content should also be served over HTTPS.
```

## 什么是 Mixed Content

对混合内容的保护来自于浏览器的安全策略。当用户以 **HTTPS** 访问一个页面时，他们与服务器的连接会以 [TLS](https://developer.mozilla.org/zh-CN/docs/Glossary/TLS) 加密。这样做可以有效防止窃听以及 [中间人攻击](https://baike.baidu.com/item/%E4%B8%AD%E9%97%B4%E4%BA%BA%E6%94%BB%E5%87%BB/1739730?fr=aladdin) 。一个含有 **HTTP** 明文内容的 **HTTPS** 页面被称为 **混合内容（Mixed Content）** 。这样的页面只有部分内容被加密，没有被加密的内容会受到窃听和中间人攻击，不利于页面的安全。

## Mixed Content 的类型

混合内容有两种类型：**被动/显示型混合内容（mixed passive/display content）** 和 **主动型混合内容（mixed active content）**。两者的不同之处在于受到中间人攻击的威胁程度。

### 被动/显示型混合内容

被动型混合内容指的是包含于 **HTTPS** 中的静态 **HTTP** 内容。这些内容无法对页面上的其它内容进行更改，因此威胁程度相对较低。会被视为被动型混合内容的 HTTP 请求有：

-   `<img>`
-   `<audio>`
-   `<video>`
-   `<object>`

### 主动型混合内容

主动型混合内容指的是有权访问其余的 **HTTPS** 页面的内容。这种混合内容可以改变页面的行为，窃取用户信息，因此威胁更大。 会被视为主动型混合内容的 HTTP 请求有：

-   `<script>`
-   `<link>`
-   `<iframe>`
-   `<XMLHttpRequest>`
-   `fetch()`
-   所有用到 `url` 的 CSS 值（ `@font-face`, `cursor`, `background-image` 等 ）

## 解决方案

基于上面由 MDN 给出的关于安全策略的描述，对混合内容页面的最佳解决方案就是把所有的请求都升级为 **HTTPS** 请求。

### 方案一：直接修改协议（ 适用于自己有权管理的资源 ）

如果有对请求资源的管理权，直接在后端把资源请求接口的协议改为 HTTPS。然后前端只需要改一下 URL 即可。

例如以下 URL：

`http://some.random.site/some-random-resource`

将其替换为

`https://some.random.site/some-random-resource`

### 方案二：请求转发（ 适用于来自第三方且不支持 HTTPS 的资源 ）

来自第三方的资源如果不支持 HTTPS 协议，这时候就需要后端进行请求转发了。

在我的 **TakoTako** 中，使用了 Netlify 云函数进行了请求转发。将 **HTTP** 的请求任务交给后端，将返回的结果经由 **HTTPS** 转发回前端。云函数的部分代码如下：

```JavaScript
import fetch from "node-fetch";


export const handler = async function (event, context) {
    let { url } = event.queryStringParameters;
    // Fetch Image
    let image;
    try {
        const result = await fetch(url);
        image = await result.buffer();
    } catch (error) {
        console.log("error", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message,
            }),
        };
    }

    return {
        statusCode: 200,
        headers: {
            "Content-type": "image/jpeg",
        },
        body: image.toString("base64"),
        isBase64Encoded: true,
    };
};

```

可以看到，前端将 URL 写进了请求的查询参数里。后端在拿到 URL 之后，对请求的 URL 进行了一次 Fetch。得到的图片资源转换为 base64 字符串，返回给前端。

## 参考

[MDN：混合内容](https://developer.mozilla.org/zh-TW/docs/Web/Security/Mixed_content)

[封面图片来源](https://outspokenmedia.com/https/mixed-content/)
