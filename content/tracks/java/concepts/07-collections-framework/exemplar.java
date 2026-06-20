import java.util.*;
import java.util.stream.*;

public class Solution {

    public static List<Integer> uniqueSorted(List<Integer> nums) {
        return nums.stream().distinct().sorted().collect(Collectors.toList());
    }

    public static Map<String, Integer> wordCount(List<String> words) {
        Map<String, Integer> map = new HashMap<>();
        for (String w : words) map.merge(w, 1, Integer::sum);
        return map;
    }

    public static List<String> topN(Map<String, Integer> counts, int n) {
        return counts.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue(Comparator.reverseOrder())
                .thenComparing(Map.Entry.comparingByKey()))
            .limit(n)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    public static boolean isAnagram(String a, String b) {
        if (a.length() != b.length()) return false;
        int[] freq = new int[128];
        for (char c : a.toLowerCase().toCharArray()) freq[c]++;
        for (char c : b.toLowerCase().toCharArray()) freq[c]--;
        for (int f : freq) if (f != 0) return false;
        return true;
    }

    public static Deque<Integer> toStack(List<Integer> items) {
        Deque<Integer> stack = new ArrayDeque<>();
        for (int item : items) stack.push(item);
        return stack;
    }

    public static void main(String[] args) {
        System.out.println(uniqueSorted(List.of(3, 1, 2, 1, 3)));
        System.out.println(wordCount(List.of("a", "b", "a")));
        System.out.println(isAnagram("listen", "silent"));
    }
}
