import java.util.HashMap;

class Solution {

    public static int longestUniqueSubstring(String s) {
        var seen = new HashMap<Character, Integer>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (seen.containsKey(c) && seen.get(c) >= left) {
                left = seen.get(c) + 1;
            }
            seen.put(c, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }

    public static int maxSumSubarray(int[] nums, int k) {
        int sum = 0;
        for (int i = 0; i < k; i++) sum += nums[i];
        int max = sum;
        for (int right = k; right < nums.length; right++) {
            sum += nums[right] - nums[right - k];
            max = Math.max(max, sum);
        }
        return max;
    }

    public static String minWindowSubstring(String s, String t) {
        if (s.isEmpty() || t.isEmpty()) return "";

        var need = new HashMap<Character, Integer>();
        for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);

        var window = new HashMap<Character, Integer>();
        int left = 0, formed = 0, required = need.size();
        int bestLen = Integer.MAX_VALUE, bestLeft = 0;

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            window.merge(c, 1, Integer::sum);
            if (need.containsKey(c) && window.get(c).equals(need.get(c))) formed++;

            while (formed == required) {
                if (right - left + 1 < bestLen) {
                    bestLen = right - left + 1;
                    bestLeft = left;
                }
                char lc = s.charAt(left++);
                window.merge(lc, -1, Integer::sum);
                if (need.containsKey(lc) && window.get(lc) < need.get(lc)) formed--;
            }
        }
        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestLeft, bestLeft + bestLen);
    }

    public static void main(String[] args) {
        System.out.println(longestUniqueSubstring("abcabcbb")); // 3
        System.out.println(longestUniqueSubstring("bbbbb"));    // 1
        System.out.println(maxSumSubarray(new int[]{2,1,5,1,3,2}, 3)); // 9
        System.out.println(minWindowSubstring("ADOBECODEBANC", "ABC")); // BANC
    }
}
