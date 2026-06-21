// Run: tsx exemplar.ts

export function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>(); // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    // Insert AFTER checking so the same index can't match itself
    seen.set(nums[i], i);
  }
  return null;
}

export function groupAnagrams(words: string[]): string[][] {
  const groups = new Map<string, string[]>();

  for (const word of words) {
    // Sorted characters form a canonical key shared by all anagrams
    const key = [...word].sort().join("");
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(word);
    } else {
      groups.set(key, [word]);
    }
  }
  return Array.from(groups.values());
}

export function longestConsecutiveSequence(nums: number[]): number {
  const set = new Set(nums); // O(n) — also deduplicates
  let longest = 0;

  for (const n of set) {
    // Only start a walk from the beginning of a sequence.
    // If n-1 exists, n is not the start — skip it.
    if (!set.has(n - 1)) {
      let length = 1;
      let current = n;
      while (set.has(current + 1)) {
        current++;
        length++;
      }
      longest = Math.max(longest, length);
    }
  }
  return longest;
}
