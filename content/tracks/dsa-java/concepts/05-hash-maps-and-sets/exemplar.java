import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

class Solution {

    public static int[] twoSum(int[] nums, int target) {
        var seen = new HashMap<Integer, Integer>(); // value -> index
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[]{};
    }

    public static List<List<String>> groupAnagrams(String[] words) {
        var groups = new HashMap<String, List<String>>();
        for (String word : words) {
            char[] chars = word.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(word);
        }
        return new ArrayList<>(groups.values());
    }

    public static int longestConsecutiveSequence(int[] nums) {
        var set = new HashSet<Integer>();
        for (int n : nums) set.add(n);

        int longest = 0;
        for (int n : set) {
            if (!set.contains(n - 1)) { // n is the start of a sequence
                int length = 1;
                while (set.contains(n + length)) length++;
                longest = Math.max(longest, length);
            }
        }
        return longest;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[]{2,7,11,15}, 9))); // [0, 1]
        System.out.println(groupAnagrams(new String[]{"eat","tea","tan","ate","nat","bat"}));
        System.out.println(longestConsecutiveSequence(new int[]{100,4,200,1,3,2})); // 4
    }
}
