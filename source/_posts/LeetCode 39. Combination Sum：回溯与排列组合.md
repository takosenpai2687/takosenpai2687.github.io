---
title: LeetCode 39. Combination Sum：回溯与排列组合 🔍
date: 2024-05-01 17:49:31
tags:
    - 算法
categories:
    - 算法
cover: [static/Combinations/permutations-combinations-formulas.png]
author: Tako Senpai
---

# 39. Combination Sum：回溯与排列组合 🔍

## 题目描述

Given an array of **distinct** integers `candidates` and a target integer `target`, return a list of all **unique combinations** of `candidates` where the chosen numbers sum to `target`. You may return the combinations in **any order**.

The **same** number may be chosen from `candidates` an **unlimited number of times**. Two combinations are unique if the
**frequency**
of at least one of the chosen numbers is different.

The test cases are generated such that the number of unique combinations that sum up to `target` is less than `150` combinations for the given input.

## 思路

题目要求给出所有相加为 `target` 的组合，且同一元素允许重复使用。很容易想到暴力的解法是找出所有的可重复组合，然后筛选出相加为 `target` 的子集。考虑到排列组合也是经典的回溯问题，这里我们先复习一下排列和组合的算法实现。

## 排列（Permutation）的实现

回溯算法：外层的 for 循环负责从数组 nums 中选择每个可能的起始元素。它迭代数组中的每一个元素，考虑把这个元素作为当前排列的下一个成员。

在每一次循环中，我们递归调用 permute（深度+1），直到找出所有包含当前元素 nums[i] 的排列，然后撤回最后一个元素，使 curr 返回至递归前的状态，然后进行下一次循环。

```Java
// P(n, r) : 从 n 个元素中选 r 个
public static void permute(int[] nums, int depth, int r, boolean[] used, List<Integer> curr, List<List<Integer>> ans) {
    // 到达深度，添加所有 curr
    if (depth == r) {
        ans.add(new LinkedList<>(curr));
        return;
    }
    // 对于每一个 nums[i]，求包含它的所有组合
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        used[i] = true; // 锁定当前元素，子递归不再使用
        curr.add(nums[i]);
        permute(nums, depth + 1, r, used, curr, ans);
        curr.removeLast();
        used[i] = false; // 解锁当前元素，下次还能用
    }
}
```

## 组合（Combination）的实现

组合与排列不同的地方在于：组合不关心元素的顺序，因此可以减少一些不必要的递归调用。我们进行递归调用时，开始的索引应该从当前选中的元素的下一个开始，而不是从数组的开始。这样可以避免重复并且保证组合的生成是按照顺序的。

```Java
// C(n, r) : choose r from n
public static void combine(int[] nums, int depth, int r, int start, List<Integer> curr, List<List<Integer>> ans) {
    if (depth == r) {
        ans.add(new ArrayList<>(curr));
        return;
    }

    for (int i = start; i < nums.length; i++) {
        curr.add(nums[i]);
        combine(nums, depth + 1, r, i + 1, curr, ans);
        curr.removeLast();
    }
}
```

组合的代码就非常简单了，因为我们不考虑重复，所以不需要使用 used，每次递归中，在深度+1 的同时，start 的下标也+1，这样确保了不会重复。

## 可重复组合（Combination with Repetition）

对于可重复组合，我们只需要在组合的代码中修改下一次递归的 `start` 即可。之前的 `start` 为 `i+1`，表示不包含当前元素，将其替换为 `i`。

```Java
// C(n, r) : choose r from n
public static void combine(int[] nums, int depth, int r, int start, List<Integer> curr, List<List<Integer>> ans) {
    if (depth == r) {
        ans.add(new ArrayList<>(curr));
        return;
    }

    for (int i = start; i < nums.length; i++) {
        curr.add(nums[i]);
        combine(nums, depth + 1, r, i, curr, ans);
        curr.removeLast();
    }
}
```

## 解决问题

回到问题当中，我们要求找到所有相加为 `target` 的可重复组合。因为不是定长，所以我们的回溯中不引入 `r` 这个参数。将递归的退出条件更改为 `target == 0`，在每次递归中减少 `target` 的值。

另外，为了最大化性能。先将数组排序。这样，对于无解的情况，我们可以更早的在循环中退出。当当前元素 `nums[i]` 大于 `target` 时，就可以提前退出了。

```Java
class Solution {

    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        final List<List<Integer>> ans = new LinkedList<>();
        final List<Integer> curr = new LinkedList<>();
        Arrays.sort(candidates);
        backTrack(candidates, target, 0, curr, ans);
        return ans;
    }

    public void backTrack(int[] nums, int target, int start, List<Integer> curr, List<List<Integer>> ans) {
        if (target == 0) {
            ans.add(new ArrayList<>(curr));
            return;
        }
        for (int i = start; i < nums.length; i++) {
            if (nums[i] > target)
                break;
            curr.add(nums[i]);
            backTrack(nums, target - nums[i], i, curr, ans);
            curr.removeLast();
        }
    }
}

```

# 参考

YouTube: [花花酱 LeetCode 39. Combination Sum - 刷题找工作 EP81](https://www.youtube.com/watch?v=zIY2BWdsbFs)
