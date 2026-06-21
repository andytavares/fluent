// Run: tsx stub.ts

// Return all subsets (power set) of nums. No duplicate elements in input.
export function subsets(nums: number[]): number[][] {
  // TODO: backtrack from start index; at each call, record the current path
  return [];
}

// Return all permutations of the distinct integers in nums.
export function permutations(nums: number[]): number[][] {
  // TODO: backtrack with a boolean used[] array; all n elements must appear
  return [];
}

// Return all unique combinations that sum to target.
// The same candidate can be used multiple times.
export function combinationSum(candidates: number[], target: number): number[][] {
  // TODO: backtrack; allow reuse by passing i (not i+1) in recursive call; prune when sum < 0
  return [];
}

// Usage example:
// subsets([1,2,3])                          // 8 subsets
// permutations([1,2,3])                     // 6 permutations
// combinationSum([2,3,6,7], 7)              // [[2,2,3],[7]]
