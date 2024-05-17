---
title: JavaScript 位运算的一个坑
date: 2024-05-18 6:23:00
tags:
    - 前端
    - JS
categories:
    - 前端
cover: [static/Bitwise/image.png]
author: Tako Senpai
---

# JavaScript 位运算的一个坑

## 前言

主流的编程语言都支持位运算，JavaScript 也不例外。然而，由于 JavaScript 中所有的数字类型都被统一定义为 64 位浮点数（Number），这在实际进行位运算时可能会带来一些意想不到的结果。

## 整数溢出的问题

考虑以下代码，我们用位运算来求 `2^31`：

```JavaScript
const a = 1 << 31;  // 输出：-2147483648
const b = Math.pow(2, 31);  // 输出：2147483648
```

为什么会这样呢？原来 JavaScript 中虽然定义了 Number 为 64 位浮点数（double)，但在进行位运算时，会先将数字转换为 32 位有符号整数，然后再进行位运算，最后再返回 64 位。

因此，我们在进行位运算，特别是左移操作时，要确保不会发生整数溢出的情况，否则炫技不成反而翻车 (0\_<)。比如，有些人可能喜欢这样取整：

```JavaScript
const aFloat = 3.5;
const aInt = aFloat >> 0;   // 输出：3
```

但是如果整数溢出了会输出什么呢？

```JavaScript
const aFloat = Math.pow(2, 31) + 0.5; // 输出：2147483648.5
const aInt = aFloat >> 0; // 输出：-2147483648，装杯失败
const aRealInt = Math.floor(aFloat); // 输出：2147483648
```

## 大整数的位运算

可是如果我们有时候就是想要对大整数进行位运算呢？考虑以下代码：

```JavaScript
const a1 = Math.pow(2, 32); // 没有溢出
const a2 = Math.pow(2, 32); // 没有溢出
const isEqual = !!(a1 & a2); // 输出：false
```

可以看到，即便我们很小心的使用 pow 来代替左移，但 `a & a` 得到的结果依然是 false。这是因为在执行位运算时，JavaScript 会将数字转换为32位整数，而这个转换过程会导致数据丢失，从而产生不确定的结果。

为了解决大数字的位运算，就需要引入 `BigInt` 类了。好消息是 `BigInt` 本身也支持位运算符，因此写起来也并不麻烦。和 `Number` 一样，`BigInt` 也支持初始化和直接声明（以 n 结尾）：

```JavaScript
const a1 = 1n << 31n;    // 注意：操作符两边都必须是 BigInt
const a2 = BigInt(1) << BigInt(31);
const isEqual = !!(a1 & a2) //输出：true
```

## 关于性能

正是由于 JavaScript 位运算时多余的 32 位转换的一步，我们日常写代码时尽量不要用位运算来“提升性能”。这些 tricks 在一些早期的 C++ 编译器中或许有效，但在 JavaScript 中可能反而会变慢。大多数的语言如 JavaScript，Java，C++ 都会在编译器级别对常见的运算进行优化，所以放心使用正常的 Math 库即可，不要玩花里胡哨的。
