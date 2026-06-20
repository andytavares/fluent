import java.util.*;

public class SolutionTest {
    private static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        List<String> words = List.of("the", "quick", "brown", "fox", "jumps", "over");

        // longWords
        List<String> long4 = Solution.longWords(words, 4);
        check("longWords: size",  long4.size() == 4);
        check("longWords: sorted", long4.equals(List.of("brown", "jumps", "over", "quick")));
        check("longWords: empty result", Solution.longWords(words, 10).isEmpty());
        check("longWords: all match", Solution.longWords(words, 1).size() == 6);

        // groupByLength
        Map<Integer, List<String>> grouped = Solution.groupByLength(words);
        check("groupByLength: 3-letter words", grouped.get(3).containsAll(List.of("the", "fox")));
        check("groupByLength: 5-letter words", grouped.get(5).containsAll(List.of("quick", "brown", "jumps")));
        check("groupByLength: 4-letter words", grouped.get(4).contains("over"));

        // averageOfEvens
        OptionalDouble avg = Solution.averageOfEvens(List.of(1, 2, 3, 4, 5, 6));
        check("averageOfEvens: present",  avg.isPresent());
        check("averageOfEvens: value",    Math.abs(avg.getAsDouble() - 4.0) < 1e-9);
        check("averageOfEvens: no evens", !Solution.averageOfEvens(List.of(1, 3, 5)).isPresent());
        check("averageOfEvens: empty",    !Solution.averageOfEvens(List.of()).isPresent());

        System.out.println("\n" + passed + " passed, " + failed + " failed");
        if (failed > 0) System.exit(1);
    }
}
