import java.util.*;

public class SolutionTest {
    private static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // parseIntSafe
        Optional<Integer> p42  = Solution.parseIntSafe("42");
        Optional<Integer> pNeg = Solution.parseIntSafe("-7");
        Optional<Integer> pBad = Solution.parseIntSafe("abc");
        Optional<Integer> pFlt = Solution.parseIntSafe("3.14");

        check("parseIntSafe: 42 present",  p42.isPresent());
        check("parseIntSafe: 42 value",    p42.get() == 42);
        check("parseIntSafe: -7 present",  pNeg.isPresent());
        check("parseIntSafe: -7 value",    pNeg.get() == -7);
        check("parseIntSafe: abc empty",   pBad.isEmpty());
        check("parseIntSafe: 3.14 empty",  pFlt.isEmpty());

        // firstLongWord
        List<String> words = List.of("a", "hi", "hello", "world", "greetings");
        Optional<String> first5 = Solution.firstLongWord(words, 5);
        check("firstLongWord: present",       first5.isPresent());
        check("firstLongWord: correct word",  "hello".equals(first5.get()));
        check("firstLongWord: none match",    Solution.firstLongWord(words, 20).isEmpty());
        check("firstLongWord: empty list",    Solution.firstLongWord(List.of(), 1).isEmpty());
        check("firstLongWord: exact len",     Solution.firstLongWord(words, 2).get().equals("hi"));

        // sumOptionals
        List<Optional<Integer>> opts = List.of(Optional.of(1), Optional.empty(), Optional.of(3), Optional.of(5));
        check("sumOptionals: sum of present", Solution.sumOptionals(opts) == 9);
        check("sumOptionals: all empty",      Solution.sumOptionals(List.of(Optional.empty())) == 0);
        check("sumOptionals: empty list",     Solution.sumOptionals(List.of()) == 0);

        System.out.println("\n" + passed + " passed, " + failed + " failed");
        if (failed > 0) System.exit(1);
    }
}
