function clone(src, map = new Map()) {
    if (!src || typeof src !== "object") return src;
    let clonedRes = Array.isArray(src) ? [] : {};
    if (map.has(src)) return map.get(src);
    map.set(src, clonedRes);
    Object.keys(src).forEach((key) => (clonedRes[key] = clone(src[key], map)));
    return clonedRes;
}
