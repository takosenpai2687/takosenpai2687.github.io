---
title: WebAPI：使用 MutationObserver 监听 DOM 变化
date: 2023-02-05 17:54:04
tags:
    - 前端
    - JavaScript
    - Web API
categories:
    - 前端
cover: [static/MutationObserver/cover.png]
author: Tako Senpai
---

# WebAPI：使用 MutationObserver 监听 DOM 变化

## 前言

最近在写一个 **TamperMonkey** 脚本的时候遇到了一个小问题：页面上有一些组件的内容是延迟加载的，比如需要通过 AJAX 请求来获取的数据。这时，如果我们的脚本依然选择在`window.load`时调用，会获取不到想要的 DOM 节点或者数据。

那么如何在一个 DOM 节点数据更新了之后再调用我们的脚本呢？这时候就要用到 [MutationObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver) 这个 WebAPI 了。

## 什么是 MutationObserver ?

引用一下 MDN 的官方文档描述：

> MutationObserver 接口提供了监视对 DOM 树所做更改的能力。它被设计为旧的 Mutation Events 功能的替代品，该功能是 DOM3 Events 规范的一部分。

## 使用方法

### 1. 创建一个新的 Mutation 监听器

创建一个 **Observer** 对象时，需要传入一个回调函数，在里面可以获取到所有发生了更新的节点，通过遍历这些节点来执行我们想要的操作。

```JavaScript
let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (!mutation.addedNodes) return;

        for (let i = 0; i < mutation.addedNodes.length; i++) {
            // 这里的node就是发生了改变的Node
            let node = mutation.addedNodes[i];
        }
    });
});
```

### 2. 开始监听

有了 **Observer** 对象之后，我们需要调用 **observe()** 方法。

第一个参数是观察的对象，一般来说用 **document.body** 即可。当然为了性能考虑，可以根据实际情况来缩小观察的范围。

第二个参数为选项，详情可以查看[官方文档](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver/observe)。

一般来说，我们要监听的是整个子树的变化，因此**subtree**和**childList**需要选上，前者监听整个子树的所有属性，后者监听子节点的增删变化。

**attributes**可以观察节点属性的变化。

**characterData**可以观察节点上所有字符的变化，这对 **innerText** 的监听非常有用。

```JavaScript
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: true,
});
```

### 3. 结束监听

要结束监听时，只需要调用 **disconnect()** 即可。

```JavaScript
observer.disconnect();
```

## 一个栗子 🌰

回到开始提到的 TamperMonkey 脚本。这个案例起源于我的 Netlify 网站后台的统计数据界面。

页面上有一个`table`元素，里面有一些经过了编码的 URL，统计了一些界面的访问量。而我的目标是把这些经过了编码的 URL 转换为未经过编码的 URL，也就是把 URL 中的%XX 转换为中文字符。

由于`table`的数据是懒加载的，那么我们使用 MutationObserver 来观察节点的加载情况。当`table`的内容发生变化时，执行我们的脚本。

完整代码如下：

```JavaScript
function convert() {
    const links = document.querySelectorAll(
        "#main .layout-masonry tbody tr td:first-child div a"
    );
    [].forEach.call(links, (link) => {
        const text = link.innerText;
        link.innerHTML = decodeURI(text);
    });
}

function init() {
    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (!mutation.addedNodes) return;

            for (let i = 0; i < mutation.addedNodes.length; i++) {
                let node = mutation.addedNodes[i];
                if (node.tagName == "TABLE") {
                    convert();
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: true,
    });
}

window.onload = init;

```

可以看到，对于所有变化的节点，我们只关注标签名为`TABLE`的节点的变化。这里因为要监听`innerText`，所以我们在选项里加上了`characterData`。

## 参考

[MDN：MutationObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)

[封面图片来源](https://shuvohabib.medium.com/listening-to-dom-changes-by-javascript-web-api-mutation-observer-hint-its-the-best-practice-3ee92dc8aac6)
