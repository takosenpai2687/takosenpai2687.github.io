---
title: Web兼容：屏蔽某些过于拉胯的浏览器 ♿
date: 2023-02-26 16:23:44
tags:
    - 前端
    - JS
categories:
    - 前端
cover: [static/BlockBrowsers/QQBrowser.jpg]
author: Tako Senpai
---

# Web 兼容：屏蔽某些过于拉胯的浏览器 ♿

## 前言

前一阵子部署了一个网站，主要服务对象是国内用户。有一部分手机用户在通过 QQ 和 百度贴吧 APP 分享了网站的链接后，会用这些 app 内置的阉割版浏览器打开我的网站。

这些浏览器因为种种原因，对现有的 WEB 标准进行了阉割，里面的兼容性问题层出不穷：黑色的按钮能显示成白的，背景颜色 rgba、filter 无效等等。想来想去也没有特别好的方案，最后还是一狠心，干脆直接屏蔽这些 app 吧。下面是我整理的几种常用 app 的内置浏览器检测方式。

## 手机 QQ 内置浏览器

腾讯的浏览器还是比较收敛的，没有篡改 ua。可以直接通过 `useragent` 来识别手机 QQ 内置浏览器。

```JS
if (navigator.userAgent.includes("QQ/")) {
    isQQ = true;
}
```

## 百度贴吧 APP

百度贴吧的浏览器修改了 `useragent`：

```
Mozilla/5.0 (Linux; Android 7.1.1; XXXXX; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/48.0.2564.116 Mobile Safari/537.36 T7/9.1
```

从 ua 里面是看不出跟百度有什么关系的。好在由于用户一般是从贴吧 APP 中直接打开的链接，我们可以通过 `document.referrer` 来判断是否是从贴吧打开的链接。

```JS
if (document.referrer.includes('tieba')) {
    isTieba = true;
}
```

## 微信 / QQ 浏览器

哦，您已经帮我屏蔽了。那没事了。

![](static/BlockBrowsers/WechatBrowser.png)

## 已知在上述浏览器中出现的兼容性问题

-   `backdrop-filter: blur()` 毛玻璃效果无效
-   `background-color: rgba()` rgba 颜色无效，显示为全透明或白色
-   `background-image` 部分用户截图可以看到背景图片显示为黑色，我的环境下没出现这种 bug，无法复现。
