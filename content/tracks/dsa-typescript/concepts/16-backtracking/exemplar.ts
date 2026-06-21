// Run: tsx exemplar.ts

export function subsets(nums: number[]): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, current: number[]): void {
    result.push([...current]);
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}

export function permutations(nums: number[]): number[][] {
  const result: number[][] = [];
  const used = new Array<boolean>(nums.length).fill(false);

  function backtrack(current: number[]): void {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(nums[i]);
      backtrack(current);
      current.pop();
      used[i] = false;
    }
  }

  backtrack([]);
  return result;
}

export function combinationSum(candidates: number[], target: number): number[][] {
  const result: number[][] = [];

  function backtrack(start: number, current: number[], remaining: number): void {
    if (remaining === 0) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) continue;
      current.push(candidates[i]);
      backtrack(i, current, remaining - candidates[i]); // i, not i+1 — allow reuse
      current.pop();
    }
  }

  backtrack(0, [], target);
  return result;
}
