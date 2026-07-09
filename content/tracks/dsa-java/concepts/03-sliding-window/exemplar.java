import java.util.HashMap;
import java.util.Map;

class Solution {

    /**
     * Returns the length of the shortest contiguous subarray with sum >= target,
     * or 0 if none exists. Shrink-while-valid: positives make the sum monotone,
     * so once the window goes invalid only expanding right can revive it.
     * O(n) time, O(1) space.
     */
    public static int minSubArrayLen(int target, int[] nums) {
        int left = 0;
        int sum = 0;
        int best = Integer.MAX_VALUE;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum >= target) {
                best = Math.min(best, right - left + 1);
                sum -= nums[left++];
            }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }

    /**
     * Returns the length of the longest substring without repeating characters.
     * Grow-then-repair: a last-seen-index map turns the repair into a single
     * left-jump; the >= left guard ignores stale entries behind the window.
     * O(n) time, O(min(n, alphabet)) space.
     */
    public static int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> lastSeen = new HashMap<>();
        int left = 0;
        int best = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (lastSeen.containsKey(c) && lastSeen.get(c) >= left) {
                left = lastSeen.get(c) + 1;
            }
            lastSeen.put(c, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }

    /**
     * Returns the shortest substring of s containing every character of t
     * (duplicates included), or "" if no such window exists.
     * need/window/formed machinery: formed counts distinct characters at their
     * required frequency, making the validity check O(1) per move.
     * O(|s| + |t|) time, O(alphabet of t) space.
     */
    public static String minWindow(String s, String t) {
        if (t.isEmpty() || t.length() > s.length()) return "";

        Map<Character, Integer> need = new HashMap<>();
        for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);

        Map<Character, Integer> window = new HashMap<>();
        int formed = 0;
        int left = 0;
        int bestLen = Integer.MAX_VALUE;
        int bestStart = 0;

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (need.containsKey(c)) {
                int count = window.merge(c, 1, Integer::sum);
                if (count == need.get(c)) formed++;
            }

            while (formed == need.size()) {
                if (right - left + 1 < bestLen) {
                    bestLen = right - left + 1;
                    bestStart = left;
                }
                char out = s.charAt(left++);
                if (need.containsKey(out)) {
                    int count = window.merge(out, -1, Integer::sum);
                    if (count < need.get(out)) formed--;
                }
            }
        }

        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestStart, bestStart + bestLen);
    }

    public static void main(String[] args) {
        System.out.println(minSubArrayLen(7, new int[]{2, 3, 1, 2, 4, 3})); // 2
        System.out.println(lengthOfLongestSubstring("abcabcbb")); // 3
        System.out.println(minWindow("ADOBECODEBANC", "ABC")); // "BANC"
    }
}
