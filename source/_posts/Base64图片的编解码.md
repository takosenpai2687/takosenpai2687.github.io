---
title: Base64 图片的编解码 🖼️
date: 2023-02-10 17:49:31
tags:
    - 前端
    - JS
categories:
    - 前端
cover: [static/Base64/cover.webp]
author: Tako Senpai
---

# Base64 图片的编解码 🖼️

## 前言

众所周知，在前端展示一张图片，通常有两种方式：一种是使用 `<img>` 标签，另一种则是使用 `background-image` 样式属性。二者都需要指定一个指向图片资源的 URL。对于已知的 URL 我们通常不会遇到问题。但如果我们需要预览一个用户上传的图片，或者图片本身是由 Base64 编码的 ASCII 字符串呢？这种时候就需要对图片的数据进行相应处理了。

## 什么是 Base64 ？

来自我们的好朋友 MDN 的定义：

> Base64 是一组相似的二进制到文本（binary-to-text）的编码规则，使得二进制数据在解释成 radix-64 的表现形式后能够用 ASCII 字符串的格式表示出来。

也就是说，Base64 可以把 0 和 1 构成的二进制字节，转换成可读的 ASCII 字符串。

Base64 编码选择了 64 个在多种编码里最常用的字符，即 `A-Z`，`a-z`，`0-9` 外加两个符号 `+` 和 `/`。完整的表格如下：

![](static/Base64/base64-char.png)

每个 Base64 字符实际上代表了原始数据中的 6 个比特位，因此 Base64 编码的数据会比原始数据大 33%。比如 3 字节的二进制数据会被编码成 4 字节的 Base64 字符串。

## 显示 Base64 的图片

对 Base64 的图片我们需要将它转换为浏览器可以识别的 Data URL。

Data URL 由四个部分组成：前缀（data:）、指示数据类型的 MIME 类型、如果非文本则为可选的 base64 标记、数据本身：

```
data:[<mediatype>][;base64],<data>
```

例如：一个 jpg 格式的图片，其 Base64 的 DataURL 格式为：（base64数据用XXXX代替）

```
data:image/jpeg;charset=utf-8;base64,XXXX...
```

## 栗子一 🌰：预览用户上传的图片

HTML 结构如下：

```HTML
<input type="file" accept="image/*" onchange="handleUpload()" />
<img id="preview" src="" alt="" />
```

对 `<input>` 上传的文件，我们使用 Web API 中 `FileReader` 的 `readAsDataURL()` 对所得文件进行 Base64 编码，当读取完毕时，将所得的 `Base64 DataURL` 作为 `<img>` 的 src 即可。如果是 `background-image` 则使用 `url(${所得Base64字符串})`。

```JavaScript
function handleUpload() {
    const input = document.querySelector("input");
    const preview = document.querySelector("img");
    let file = input.files;
    if (file && file[0]) {
        let reader = new FileReader();
        reader.onloadend = async (e) => {
            let image = e.target.result;
            preview.src = image;
        };
        reader.readAsDataURL(file[0]);
    }
}
```

## 栗子二 🌰：NodeJS 图片转发

还有一个应用场景，也是我在前文 [Mixed Content：混合内容的解决方案](https://takosenpai2687.github.io/2023/01/27/Mixed%20Content%EF%BC%9A%E6%B7%B7%E5%90%88%E5%86%85%E5%AE%B9%E7%9A%84%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88/) 中提到的图片转发服务器。简而言之就是在后端请求一个第三方的图片，转换成 Base64 之后再返回给前端。

在 TakoTako 的实际运行了一个月后，我发现 Netlify 的云函数的调用次数限制还是太苛刻了，因此想到了把图片转发接口合并到一个返回内容为 JSON 的接口里。

由于返回内容是 JSON，我们要包含一个图片的字段，就必须使用 Base64 字符串了。下面是 NodeJS 后端的代码：

```JavaScript
import fetch from "node-fetch";

export const handler = async function (event, context) {
    // ...
    // Fetch Char Image
    const imagePromise = fetch(info.profile_url);
    const resBody = {
        // ... 其它字段
        image: await imagePromise
            .then((r) => r.buffer())
            .then((buf) => buf.toString("base64")),
    };

    return {
        statusCode: 200,
        body: JSON.stringify(resBody),
        headers: {
            "Content-Type": "application/json",
        },
    };
};
```

在前端我们请求到了 JSON 以后，将 Base64 图片转换为 Data URL：

```JavaScript
// 获取 Base64 图片
const { image } = await fetch(
    API,
    {
        headers: {
            "Content-Type": "application/json",
        },
    }
).then((r) => r.json());
// 转换为 DataURL
this.customImageURL = 'data:image/jpeg;charset=utf-8;base64,' + image;
```
