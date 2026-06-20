import java.util.*;

public class SolutionTest {
    private static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // uniqueSorted
        List<Integer> us = Solution.uniqueSorted(List.of(3, 1, 2, 1, 3));
        check("uniqueSorted: size", us.size() == 3);
        check("uniqueSorted: sorted", us.equals(List.of(1, 2, 3)));

        check("uniqueSorted: empty",    Solution.uniqueSorted(List.of()).isEmpty());
        check("uniqueSorted: all same", Solution.uniqueSorted(List.of(5, 5, 5)).equals(List.of(5)));

        // wordCount
        Map<String, Integer> wc = Solution.wordCount(List.of("a", "b", "a", "c", "b", "a"));
        check("wordCount: a=3", wc.getOrDefault("a", 0) == 3);
        check("wordCount: b=2", wc.getOrDefault("b", 0) == 2);
        check("wordCount: c=1", wc.getOrDefault("c", 0) == 1);
        check("wordCount: empty", Solution.wordCount(List.of()).isEmpty());

        // topN
        Map<String, Integer> counts = new HashMap<>();
        counts.put("apple", 5); counts.put("banana", 3); counts.put("cherry", 5); counts.put("date", 1);
        List<String> top2 = Solution.topN(counts, 2);
        check("topN: size 2", top2.size() == 2);
        check("topN: tie broken alphabetically", top2.equals(List.of("apple", "cherry")));
        check("topN: n=1 highest", Solution.topN(counts, 1).equals(List.of("apple")));

        // isAnagram
        check("isAnagram: listen/silent", Solution.isAnagram("listen", "silent"));
        check("isAnagram: case-insensitive", Solution.isAnagram("Listen", "Silent"));
        check("isAnagram: not anagram", !Solution.isAnagram("hello", "world"));
        check("isAnagram: different lengths", !Solution.isAnagram("ab", "abc"));
        check("isAnagram: empty strings", Solution.isAnagram("", ""));

        // toStack
        Deque<Integer> stack = Solution.toStack(List.of(1, 2, 3));
        check("toStack: peek returns last pushed", stack.peek() == 3);
        stack.pop();
        check("toStack: second element after pop", stack.peek() == 2);

        System.out.println("\n" + passed + " passed, " + failed + " failed");
        if (failed > 0) System.exit(1);
    }
}
