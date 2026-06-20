import java.util.*;

public class Solution {

    // uniqueSorted returns a sorted list of nums with duplicates removed.
    public static List<Integer> uniqueSorted(List<Integer> nums) {
        // TODO
        return new ArrayList<>();
    }

    // wordCount returns a map from each word to its frequency.
    public static Map<String, Integer> wordCount(List<String> words) {
        // TODO
        return new HashMap<>();
    }

    // topN returns the n keys with the highest counts, sorted descending by count,
    // breaking ties alphabetically.
    public static List<String> topN(Map<String, Integer> counts, int n) {
        // TODO
        return new ArrayList<>();
    }

    // isAnagram returns true if a and b are anagrams (same chars, same frequencies,
    // case-insensitive).
    public static boolean isAnagram(String a, String b) {
        // TODO
        return false;
    }

    // toStack returns an ArrayDeque with items pushed in order (last item on top).
    public static Deque<Integer> toStack(List<Integer> items) {
        // TODO
        return new ArrayDeque<>();
    }

    public static void main(String[] args) {
        System.out.println(uniqueSorted(List.of(3, 1, 2, 1, 3)));
        System.out.println(wordCount(List.of("a", "b", "a")));
        System.out.println(isAnagram("listen", "silent"));
    }
}
