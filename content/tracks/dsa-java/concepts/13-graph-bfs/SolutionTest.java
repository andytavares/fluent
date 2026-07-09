import java.util.List;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // minMutation
        check("minMutation: single mutation",
              Solution.minMutation("AACCGGTT", "AACCGGTA", new String[]{"AACCGGTA"}) == 1);
        check("minMutation: two mutations through the bank",
              Solution.minMutation("AACCGGTT", "AAACGGTA",
                  new String[]{"AACCGGTA", "AACCGCTA", "AAACGGTA"}) == 2);
        check("minMutation: start equals end is 0 even with an empty bank",
              Solution.minMutation("AACCGGTT", "AACCGGTT", new String[]{}) == 0);
        check("minMutation: end gene missing from the bank",
              Solution.minMutation("AACCGGTT", "AACCGGTA", new String[]{}) == -1);
        check("minMutation: end in bank but unreachable",
              Solution.minMutation("AACCTTGG", "AATTCCGG",
                  new String[]{"AATTCCGG", "AACCTGGG", "AACCCCGG", "AACCTACC"}) == -1);
        check("minMutation: takes the shortest of several routes",
              Solution.minMutation("AAAAAAAA", "AAAAAATT",
                  new String[]{"AAAAAAAT", "AAAAAATT", "AAAAAAAC", "AAAAAACT", "AAAAACTT"}) == 2);
        check("minMutation: one-step answer ignores longer paths",
              Solution.minMutation("AACCGGTT", "AACCGGTA",
                  new String[]{"AACCGGTA", "AACCGGAT", "AACCGGAA"}) == 1);

        // ladderLength
        check("ladderLength: classic five-word ladder",
              Solution.ladderLength("hit", "cog", List.of("hot", "dot", "dog", "lot", "log", "cog")) == 5);
        check("ladderLength: end word missing from the list",
              Solution.ladderLength("hit", "cog", List.of("hot", "dot", "dog", "lot", "log")) == 0);
        check("ladderLength: adjacent single-letter words",
              Solution.ladderLength("a", "c", List.of("a", "b", "c")) == 2);
        check("ladderLength: both words listed but no bridge exists",
              Solution.ladderLength("hot", "dog", List.of("hot", "dog")) == 0);
        check("ladderLength: three-word chain through one intermediate",
              Solution.ladderLength("hot", "dog", List.of("hot", "dog", "dot")) == 3);
        check("ladderLength: begin word need not be in the list",
              Solution.ladderLength("red", "tad", List.of("ted", "tad")) == 3);
        check("ladderLength: two equally short routes still return the length",
              Solution.ladderLength("hit", "cog", List.of("hot", "lot", "dot", "log", "dog", "cog")) == 5);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
