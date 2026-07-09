import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

class Solution {

    /** Returns true if t is an anagram of s (same characters, same multiplicities). */
    public static boolean isAnagram(String s, String t) {
        // TODO: lengths must match; count up over s, count down over t -
        // a missing/zero count during the count-down means false
        return false;
    }

    /** Groups anagrams together. Group order and order within groups don't matter. */
    public static List<List<String>> groupAnagrams(String[] strs) {
        // TODO: Map keyed by each string's canonical form (sorted char[] as a String);
        // append to the bucket, return new ArrayList<>(map.values())
        return new ArrayList<>();
    }

    /**
     * Returns the 0-based indexes [i, j] (i < j) of the two positions summing to
     * target. Exactly one solution exists.
     */
    public static int[] twoSum(int[] nums, int target) {
        // TODO: Map value -> index; check the complement BEFORE inserting nums[i]
        return new int[0];
    }

    /** Returns the length of the longest run of consecutive integer values. */
    public static int longestConsecutive(int[] nums) {
        // TODO: Set of all values; only count upward from run starts
        // (values with no n - 1 in the set) to stay O(n)
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(isAnagram("anagram", "nagaram")); // true
        System.out.println(groupAnagrams(new String[]{"eat", "tea", "tan", "ate", "nat", "bat"}));
        // [["eat","tea","ate"],["tan","nat"],["bat"]] (any order)
        System.out.println(java.util.Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9))); // [0,1]
        System.out.println(longestConsecutive(new int[]{100, 4, 200, 1, 3, 2})); // 4
    }
}
