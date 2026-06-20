import java.util.*;
import java.util.function.*;

public class SolutionTest {
    private static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // filterAndTransform
        List<String> words = List.of("apple", "hi", "banana", "ok", "cherry");
        List<String> result = Solution.filterAndTransform(words, Solution.longerThan(3), String::toUpperCase);
        check("filterAndTransform: count",   result.size() == 3);
        check("filterAndTransform: values",  result.containsAll(List.of("APPLE", "BANANA", "CHERRY")));
        check("filterAndTransform: no short words", !result.contains("HI") && !result.contains("OK"));
        check("filterAndTransform: empty",   Solution.filterAndTransform(List.of(), Solution.longerThan(0), s -> s).isEmpty());

        // applyToAll
        List<Integer> nums = List.of(1, 2, 3, 4);
        check("applyToAll: doubles",  Solution.applyToAll(nums, n -> n * 2).equals(List.of(2, 4, 6, 8)));
        check("applyToAll: identity", Solution.applyToAll(nums, n -> n).equals(nums));
        check("applyToAll: empty",    Solution.applyToAll(List.of(), n -> n).isEmpty());

        // byLengthThenAlpha
        Comparator<String> cmp = Solution.byLengthThenAlpha();
        check("byLengthThenAlpha: length first", cmp.compare("hi", "apple") < 0);
        check("byLengthThenAlpha: alpha tie-break", cmp.compare("apple", "mango") < 0);
        List<String> sorted = new ArrayList<>(List.of("banana", "apple", "hi", "ok", "cherry"));
        sorted.sort(cmp);
        check("byLengthThenAlpha: full sort", sorted.equals(List.of("hi", "ok", "apple", "mango", "banana")));

        // longerThan
        Predicate<String> gt3 = Solution.longerThan(3);
        check("longerThan: true for 5-char", gt3.test("apple"));
        check("longerThan: false for 2-char", !gt3.test("hi"));
        check("longerThan: false for exactly n", !gt3.test("abc") || gt3.test("abcd"));

        // pipeline
        List<Function<String, String>> fns = List.of(String::trim, String::toUpperCase, s -> s + "!");
        check("pipeline: applies in order", "HELLO!".equals(Solution.pipeline(fns).apply("  hello  ")));
        check("pipeline: empty = identity", "x".equals(Solution.pipeline(List.of()).apply("x")));
        check("pipeline: single fn",       "WORLD".equals(Solution.pipeline(List.of(String::toUpperCase)).apply("world")));

        System.out.println("\n" + passed + " passed, " + failed + " failed");
        if (failed > 0) System.exit(1);
    }
}
