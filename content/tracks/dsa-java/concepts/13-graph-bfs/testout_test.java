import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
        check("minMutation: start equals end is 0 with a populated bank",
              Solution.minMutation("AACCGGTT", "AACCGGTT", new String[]{"AACCGGTA"}) == 0);
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
        {
            List<String> bankList = new ArrayList<>();
            for (int i = 1; i <= 8; i++) {
                bankList.add("T".repeat(i) + "A".repeat(8 - i));
            }
            check("minMutation: eight-step chain flips every position",
                  Solution.minMutation("AAAAAAAA", "TTTTTTTT", bankList.toArray(new String[0])) == 8);
        }
        {
            String[] bank = {
                "TAAAAAAA", "TTAAAAAA", "TTTAAAAA", "TTTTAAAA",
                "CAAAAAAA", "CCAAAAAA", "CCCAAAAA",
                "GAAAAAAA", "GGAAAAAA",
            };
            check("minMutation: decoy branches do not distract the search",
                  Solution.minMutation("AAAAAAAA", "TTTTAAAA", bank) == 4);
        }

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
        {
            // Build a path from "aaaa" to "zzzz": flip position 0..3 to the
            // next letter, one flip per step — 100 edges, 101 words.
            List<String> words = new ArrayList<>();
            char[] current = {'a', 'a', 'a', 'a'};
            for (char code = 'b'; code <= 'z'; code++) {
                for (int pos = 0; pos < 4; pos++) {
                    current[pos] = code;
                    words.add(new String(current));
                }
            }
            Set<String> chainSet = new HashSet<>(words);
            for (char a = 'a'; a <= 'z'; a++) {
                for (char b = 'a'; b <= 'z'; b++) {
                    String w = "" + a + "zz" + b;
                    if (!chainSet.contains(w)) words.add(w);
                }
            }
            check("ladderLength: 101-word chain with a decoy cluster",
                  Solution.ladderLength("aaaa", "zzzz", words) == 101);
        }
        {
            // 600+ words, none of which connect "mmmm" to "zzzz"
            List<String> words = new ArrayList<>();
            words.add("zzzz");
            for (char a = 'a'; a <= 't'; a++) {
                for (char b = 'a'; b <= 't'; b++) {
                    words.add("a" + a + b + "b");
                }
            }
            check("ladderLength: large unreachable list returns 0 quickly",
                  Solution.ladderLength("mmmm", "zzzz", words) == 0);
        }

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
