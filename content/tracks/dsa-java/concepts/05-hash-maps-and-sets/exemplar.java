import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

class Solution {

    /**
     * Returns true if t is an anagram of s (same characters, same multiplicities).
     * Count up over s, count down over t; with equal lengths, "never goes
     * negative" implies every count ends at exactly zero.
     * O(n) time, O(k) space for the alphabet used.
     */
    public static boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        Map<Character, Integer> counts = new HashMap<>();
        for (char c : s.toCharArray()) counts.merge(c, 1, Integer::sum);
        for (char c : t.toCharArray()) {
            Integer n = counts.get(c);
            if (n == null || n == 0) return false; // missing or already zero
            counts.put(c, n - 1);
        }
        return true;
    }

    /**
     * Groups anagrams by canonical key: the sorted string. Anagrams — and only
     * anagrams — share a key, so each bucket is exactly one group.
     * O(n · k log k) time, O(n · k) space.
     */
    public static List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String s : strs) {
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(groups.values());
    }

    /**
     * Returns the 0-based indexes [i, j] (i < j) of the pair summing to target.
     * Check the complement before inserting the current value — that's what
     * prevents pairing an element with itself while allowing duplicates.
     * O(n) time, O(n) space.
     */
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>(); // value -> index
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) return new int[]{seen.get(complement), i};
            seen.put(nums[i], i);
        }
        return new int[0]; // unreachable given the "exactly one solution" guarantee
    }

    /**
     * Returns the length of the longest run of consecutive integer values.
     * The run-start guard (skip n when n - 1 is present) means each run is
     * walked exactly once from its unique start — that's the O(n) proof.
     * O(n) time, O(n) space.
     */
    public static int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int n : nums) set.add(n);

        int best = 0;
        for (int n : set) {
            if (set.contains(n - 1)) continue; // mid-run — its start will count it
            int len = 1;
            while (set.contains(n + len)) len++;
            best = Math.max(best, len);
        }
        return best;
    }

    public static void main(String[] args) {
        System.out.println(isAnagram("anagram", "nagaram")); // true
        System.out.println(groupAnagrams(new String[]{"eat", "tea", "tan", "ate", "nat", "bat"}));
        // [["eat","tea","ate"],["tan","nat"],["bat"]] (any order)
        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9))); // [0,1]
        System.out.println(longestConsecutive(new int[]{100, 4, 200, 1, 3, 2})); // 4
    }
}
