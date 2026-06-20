import java.util.List;

public class SolutionTest {
    private static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // Pair
        Solution.Pair<String, Integer> p = new Solution.Pair<>("hello", 42);
        check("getFirst",  "hello".equals(p.getFirst()));
        check("getSecond", p.getSecond() == 42);

        Solution.Pair<Integer, String> swapped = p.swap();
        check("swap first",  swapped.getFirst() == 42);
        check("swap second", "hello".equals(swapped.getSecond()));

        // min
        check("min int",    Solution.min(3, 7) == 3);
        check("min int eq", Solution.min(5, 5) == 5);
        check("min string", "apple".equals(Solution.min("apple", "banana")));
        check("min double", Solution.min(1.5, 2.5) == 1.5);

        // repeat
        List<String> r3 = Solution.repeat("x", 3);
        check("repeat size 3",   r3.size() == 3);
        check("repeat values",   r3.stream().allMatch("x"::equals));
        check("repeat size 0",   Solution.repeat("z", 0).isEmpty());
        check("repeat size 1",   Solution.repeat(99, 1).equals(List.of(99)));

        System.out.println("\n" + passed + " passed, " + failed + " failed");
        if (failed > 0) System.exit(1);
    }
}
