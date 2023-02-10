---
title: CSS 修炼日记：提瓦特的星空 ⭐
date: 2023-02-07 19:01:23
tags:
    - 前端
    - CSS
categories:
    - 前端
cover: [static/TeyvatStars/step-4.png]
author: Tako Senpai
---

# CSS 修炼日记：提瓦特的星空 ⭐

## 前言

大家好，我是练习时长两年半的前端练习生 Tako。最近在上网冲浪 🏄 的时候，无意间发现了一位大佬做的 [圣遗物强化模拟器](https://github.com/DioMao/genshin_ArtifactsUpgradeSim_vue)，其中强化界面的星空背景非常有趣。恰好最近我也在研究制作 [TakoTako](https://tako-tako.netlify.app/genshin) 原神圣遗物的模块，遂萌生了学习一下的想法。

下图为 [TakoTako](https://tako-tako.netlify.app/genshin) 中制作完成后的效果：

![](static/TeyvatStars/tako-stars.png)

在原版的基础上做了改进，增加了星空颜色变化的效果（gif 已加速）：

![](static/TeyvatStars/stars-move.gif)

## 开始：组件结构

首先写一下 HTML 结构。

```HTML
<div class="stars-container stars-bg">
    <div class="stars-box">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
    </div>
    <div class="fog"></div>
    <div class="horizon"></div>
</div>
```

我们用一个`div.stars-container`包裹所有的子组件。这个星空组件由三个部分组成：

-   stars-box：包含 3 组星星，每组星星的密度，位置，速度各不相同，以达到 3D 的效果。
    -   stars
    -   stars2
    -   stars3
-   fog：雾气效果，由一个雾气材质贴图提供。
-   horizon：发光的地平线效果，由 linear-gradient 渐变实现。

## CSS：星空颜色背景 🌃

CSS 部分，首先我们来实现一下最简单的星空颜色背景。

```SCSS
.stars-container {
    background-image: linear-gradient(180deg, #703519, #7d5326);
    animation: stars-bg-change 12s linear infinite;

    div {
        position: absolute;
        width: 100%;
        height: 100%;
    }
}
```

在动画中使用 `hue-rotate()` 给它加上颜色的变换，一个周期转 360 度。

```SCSS
@keyframes stars-bg-change {
    0% {
        filter: hue-rotate(0deg) brightness(0.8);
        -webkit-filter: hue-rotate(0deg) brightness(0.8);
    }

    50% {
        filter: hue-rotate(180deg) brightness(0.8);
        -webkit-filter: hue-rotate(180deg) brightness(0.8);
    }

    50% {
        filter: hue-rotate(360deg) brightness(0.8);
        -webkit-filter: hue-rotate(360deg) brightness(0.8);
    }
}
```

到这一步的效果如图：

![](static/TeyvatStars/step-1.png)

## CSS：地平线 🌅

地平线实际上就是一个半透明的纵向渐变（自下而上）。中间为比较醒目的白色，两边为纯透明。给它一个相对较矮的高度（30%），放置在靠下方的位置。

```SCSS
.horizon {
    background-image: linear-gradient(
        0,
        rgba(0, 0, 0, 0),
        rgba(255, 255, 255, 0.6),
        rgba(0, 0, 0, 0)
    );
    opacity: 0.3;
    height: 30% !important;
    left: 0;
    bottom: 5rem;
}
```

到这一步的效果如图：

![](static/TeyvatStars/step-2.png)

## CSS：雾气效果 ☁️

雾气效果需要使用下面的材质贴图：

![](static/TeyvatStars/fog.png)

对 `div.fog` 套用这个背景图片，给它一个差不多的宽高，并且 `repeat`。

CSS 代码如下：

```SCSS
.fog {
    background-image: url(fog.png);
    background-size: 150rem 60rem;
    animation: fog-move 50s linear infinite;
    opacity: 0.8;
    top: 0;
    left: 0;
}
```

再加个动画让它动起来 🏃：

```SCSS
@keyframes fog-move {
    0% {
        background-position-x: 150rem;
        background-position-x: 90rem;
    }

    100% {
        background-position-x: 0;
        background-position-y: 0;
    }
}
```

到这一步的效果如图：

![](static/TeyvatStars/step-3.png)

## CSS：加点星星 ⭐!

星星的原理其实很简单：给三个盒子各随机生成一堆白色的 `box-shadow` 属性，再给每个盒子一个不同速度、不同相位的动画，来模拟斗转星移的效果。`box-shadow`的代码实在太多，下面只展示前几行和其他关键的 CSS 属性（大佬好像也是借鉴的别人的，但实在找不到原作者了 o(╥﹏╥)o）。

```SCSS
#stars {
    width: 0.0625rem;
    height: 0.0625rem;
    background: transparent;
    animation: animStar 50s linear infinite
    box-shadow: 87.9375rem 31.9375rem #fff, 100.6875rem 7.4375rem #fff,
        105.375rem 59.75rem #fff, 72.6875rem 120.5625rem #fff,
        57rem 77.625rem #fff, 30.625rem 29.3125rem #fff,
        54.3125rem 26.5625rem #fff, 90.4375rem 55.6875rem #fff,
        26.375rem 122.5rem #fff, 32.3125rem 124.6875rem #fff,
        46.125rem 10.6875rem #fff, 83rem 104.25rem #fff,
        // 以下省略 1000 行。。。
}
```

这部分完整 CSS 代码请参考：

https://github.com/takosenpai2687/takosenpai2687.github.io/blob/master/source/static/TeyvatStars/stars.css

接下来让星星 ⭐ 动起来：

```SCSS
@keyframes animStar {
  from {
    transform: translateX(0rem);
  }

  to {
    transform: translateX(125rem);
  }
}
```

到这一步的效果如图：

![](static/TeyvatStars/step-4.png)

## 结语

> 谁说提瓦特的星空是虚假的，我派蒙第一个不服！

下一期将带来派蒙和她的五个玩具。提前预告一下效果图：

![](static/TeyvatStars/paimon.gif)

## 参考

[本文完整代码](https://github.com/takosenpai2687/takosenpai2687.github.io/blob/master/source/static/TeyvatStars/index.html)

[TakoTako 原神页](https://tako-tako.netlify.app/genshin)

[原神圣遗物模拟器](https://github.com/DioMao/genshin_ArtifactsUpgradeSim_vue)

[CSS 星星效果](https://codepen.io/shuangcs/pen/gKbQEj)
