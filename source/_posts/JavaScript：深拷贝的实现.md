---
title: JavaScript：深拷贝的实现 ✂️
date: 2023-02-23 15:08:23
tags:
    - 前端
    - JS
categories:
    - 前端
cover: [static/DeepClone/CopyPaste.webp]
author: Tako Senpai
---

# JavaScript：深拷贝的实现 ✂️

## 赋值与浅拷贝

在开发中，我们有时会遇到需要拷贝数据的情况。对于基本数据类型，如 `number`, `string`, `undefined`, `null`, `boolean`, `bigint`等，我们可以直接赋值。而对于 `object` 类对象，如果依然用赋值的方式进行拷贝，则会遇到问题。

在 JavaScript 中，对象的浅拷贝与其源对象的属性共享相同引用。一言以蔽之，如果属性是基本类型，拷贝的就是基本类型的值，如果属性是引用类型，拷贝的就是内存地址。

下面就是一个浅拷贝的例子：

```JavaScript
let v1 = {x: 1, y: 1};
let v2 = v1;    // v2 => {x: 1, y: 10}
v2.x = 2;
console.log(v2);    // {x: 2, y: 1}
console.log(v1);    // {x: 2, y: 1}
```

用赋值的方式进行拷贝时，实际上拷贝的是对象的指针，而指针所指的对象是被共用的内存。这就是浅拷贝。

## 深拷贝可序列化的对象：JSON 法

要深拷贝可序列化的对象，一种简单的方法是使用 **JSON.stringify()** 加 **JSON.parse()** 进行序列化和反序列化，从而获得一个经过深拷贝的对象。

```JavaScript
const o1 = {pos: {x: 1, y: 1, z: 1}, vel: {x: 0, y: -1, z: 0}};
const o2 = JSON.parse(JSON.stringify(o1));
o2.pos.x += 1;
console.log(o1.pos);    // {x: 1, y: 1, z: 1}
console.log(o2.pos);    // {x: 2, y: 1, z: 1}
```

### 缺点

1. 无法处理循环引用的情况：如 Map, Set, Date, RegEx 等。

2. 不支持 JSON 序列化的属性会丢失，如 Function。

3. Date 对象会变成字符串类型。

举个例子：

```JavaScript
function fun () {console.log('hi');}
let a = {  x: 20, date: new Date(), fun};
let b = JSON.parse(JSON.stringify(a));
console.log(a);    // {x: 20, date: Thu Feb 23 2023 15:58:11 GMT+1100 (Australian Eastern Daylight Time), fun: ƒ}
console.log(b);    // {x: 20, date: '2023-02-23T04:58:11.038Z'}

a.self = a;
b = JSON.parse(JSON.stringify(a));
// Uncaught TypeError: Converting circular structure to JSON
//    --> starting at object with constructor 'Object'
//    --- property 'self' closes the circle
//    at JSON.stringify (<anonymous>)
```

可以看到，a.fun 因为是函数类型，所以在没报错的情况下被直接丢掉（大坑）。

对象 a 的 date 属性被转换成了 string 类型。这是由于 date 对象在序列化的过程中调用的是 `Date.prototype.toJSON` 方法。

而对于循环引用的情况，JSON.stringify() 会直接报错。

## 深拷贝可序列化的对象：结构化克隆

structuredClone 方法存在于全局作用域，直接调用即可。它使用了 [结构化克隆算法](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) 将一个可序列化的对象进行深拷贝。对于不可序列化的对象，将会抛出 `DOMException` 异常。

相较于 JSON 法，structuredClone 方法解决了循环引用的问题。对含有循环引用的对象使用 structuredClone 方法运行结果如下：

```JavaScript
let a = {  x: 20, date: new Date()};
a.self = a;
let b = structuredClone(a);
console.log(a);    // {x: 20, date: Thu Feb 23 2023 16:07:17 GMT+1100 (Australian Eastern Daylight Time), self: {…}}
console.log(b);    // {x: 20, date: Thu Feb 23 2023 16:07:17 GMT+1100 (Australian Eastern Daylight Time), self: {…}}
```

改变 a.self 并不会影响 b 或者 b.self 属性，因此实现了循环引用的深拷贝。

支持的类型：

-   [Array](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)
-   [ArrayBuffer](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
-   [Boolean](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Boolean)
-   [DataView](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   [Date](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   [Error（仅限部分）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error)
-   [Map](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map)
-   [Object 对象：仅限简单对象（如使用对象字面量创建的）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   除 symbol 以外的[基本类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures#%E5%8E%9F%E5%A7%8B%E5%80%BC)
-   [RegExp](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp)：lastIndex 字段不会被保留。
-   [Set](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set)
-   [String](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String)
-   [TypedArray](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)

### 缺点

1. structuredClone 法作为 JSON 的上位替代，同样只支持可序列化的对象。如果对象中有 `function` 类型的属性，会报错：

    ```JavaScript
    function fun () {console.log('hi');}
    const a = { x: 20, date: new Date(), fun };
    const b = structuredClone(a);
    // ERROR: Uncaught DOMException: Failed to execute 'structuredClone' on 'Window': function fun () {console.log('hi');} could not be cloned.
    ```

2. 克隆 DOM 节点（Node）也会抛出异常。
3. 一些特定对象的属性不会被保留：

    - RegExp 对象的 `lastIndex` 属性。
    - 属性描述符，setters 以及 getters（以及其他类似元数据的功能）同样不会被复制。例如，如果一个对象用属性描述符标记为 read-only，它将会被复制为 read-write，因为这是默认的情况下。
    - 原形链上的属性也不会被追踪以及复制。

## 手写深拷贝：散装版

先来个热身，用递归法手写一个简单的深拷贝。在每次递归时，简单地判断一下是否为 object 类型，然后判断是否为数组。之后使用 `for ... in` 对 对象/数组 进行遍历，挨个拷贝。

```JavaScript
function clone(src) {
    if (typeof src === 'object') {
        let clonedRes = Array.isArray(src)? []: {};
        for (const key in src) {
            clonedRes[key] = clone(src[key]);
        }
        return clonedRes;
    } else {
        return src;
    }
}
```

## 手写深拷贝：青春版

散装版代码有个明显的问题，那就是没有考虑到循环引用。对于有循环引用的对象，浏览器会报错：

> Uncaught RangeError: Maximum call stack size exceeded

解决方法就是使用一个 map 来存储已经拷贝过的对象指针。对于已经拷贝过的，我们不再递归而是直接 return 掉；对于没有拷贝过的，我们再递归拷贝。这样就不会陷入回调地狱。

```JavaScript
function clone(src, map = new Map()) {
    if (typeof src === 'object') {
        let clonedRes = Array.isArray(src)? []: {};
        if (map.get(src)) {
            return map.get(src);
        }
        map.set(src, clonedRes);
        for (const key in src) {
            clonedRes[key] = clone(src[key], map);
        }
        return clonedRes;
    } else {
        return src;
    }
}
```

## 手写深拷贝：精装版

青春版的代码解决了循环引用的问题。接下来我们扣一扣细节，做一些性能优化。

-   使用 `for ... in` 循环并不是最优的选择。可以使用 `Object.keys().forEach` 代替。

-   开始对 object 的检查没有考虑到 null，因为`typeof null` 也是 `'object'`。

-   使用 `map.get()` 检查 value 是否存在并不严谨，因为 value 本身有可能是 false 或者 null 值。我们可以用 `map.has()` 代替。

```JavaScript
function clone(src, map = new Map()) {
    if (!src || typeof src !== "object") return src;
    let clonedRes = Array.isArray(src) ? [] : {};
    if (map.has(src)) return map.get(src);
    map.set(src, clonedRes);
    Object.keys(src).forEach((key) => (clonedRes[key] = clone(src[key], map)));
    return clonedRes;
}
```

## 碎碎念

-   网上看到一些文章，建议使用弱引用的 WeakMap 来替代强引用的 Map，以最大限度地发挥垃圾回收机制，提高性能。个人认为没有必要。因为在这个案例中，无论是 WeakMap 还是 Map，都是存在于函数的块级作用域内的，因此它们的垃圾回收时机是一致的，并不会带来性能上的差别。

-   `for ... in` 为什么比 `Object.keys().forEach()`慢呢？这是因为 `for ... in` 会枚举原型链上的属性，也就是说会把继承的属性也枚举出来。有些代码会修改原型链的信息，比如我自己有时会用的 `NodeList.prototype.forEach = Array.prototype.forEach`，那么使用 `for ... in` 循环会把这些额外内容也显示出来：

```JavaScript
NodeList.prototype.forEach = Array.prototype.forEach;
const arr = document.querySelectorAll('a');
for (let k in arr) {

}
```

-   除了上面的 `Object.keys().forEach` 以外，我们还可以使用 ES6 的 `for ... of` 来枚举 `Object.entries()`，性能是一样的：

```JavaScript
for(const [k,v] of Object.entries(src)) {
    clonedRes[k] = clone(v, map);
}
```

-   一句话总结一下：日常使用的话无脑 `structuredClone`，如果 `structuredClone` 解决不了，那就在类里自己实现拷贝函数，具体案例具体分析。

## 参考

青春版深拷贝来源：[如何写出一个惊艳面试官的深拷贝? - 掘金](https://juejin.cn/post/6844903929705136141)
