function permutation<T>(
    nums: T[],
    depth: number,
    r: number, // number of choices
    used: boolean[],
    stack: T[],
    ans: T[][]
): void {
    if (depth === r) {
        ans.push([...stack]);
        return;
    }

    for (let i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        used[i] = true;
        stack.push(nums[i]);
        permutation(nums, depth + 1, r, used, stack, ans);
        stack.pop();
        used[i] = false;
    }
}

function factorial(n: number): number {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    let res = 1;
    for (let i = 1; i <= n; i++) {
        res *= i;
    }
    return res;
}

function pnr(n: number, r: number): number {
    if (n < 0 || r < 0 || n < r || !Number.isInteger(n) || !Number.isInteger(r))
        return NaN;
    return factorial(n) / factorial(n - r);
}

function testPermutation() {
    // 4 choose 3
    const nums = [1, 2, 3, 4];
    const r = 3;
    let ans: number[][] = [];
    permutation<number>(
        nums,
        0,
        3,
        new Array<boolean>(nums.length).fill(false),
        [],
        ans
    );
    // Verify
    console.log("answer: ", ans);
    console.log(`length: ${ans.length}`);
    console.log(`correct length: ${pnr(nums.length, r)}`);
}

testPermutation();
