// Run: tsx stub.ts

// Return the indices [i, j] where nums[i] + nums[j] === target, or null.
// Do not use the same index twice.
export function twoSum(nums: number[], target: number): [number, number] | null {
  // TODO: Map<number, number> mapping value → index; check complement before inserting
  return null;
}

// Group strings that are anagrams of each other into nested arrays.
export function groupAnagrams(words: string[]): string[][] {
  // TODO: sort each word's chars as canonical key, bucket into Map<string, string[]>
  return [];
}

// Return the length of the longest consecutive integer sequence.
// Must run in O(n) — use a Set, and only start walks from sequence beginnings.
export function longestConsecutiveSequence(nums: number[]): number {
  // TODO: put all nums in a Set; for each n where n-1 is NOT in set, walk forward
  return 0;
}

// Usage examples (uncomment to test manually):
// console.log(twoSum([2,7,11,15], 9));                              // [0,1]
// console.log(groupAnagrams(["eat","tea","tan","ate","nat","bat"])); // 3 groups
// console.log(longestConsecutiveSequence([100,4,200,1,3,2]));       // 4
