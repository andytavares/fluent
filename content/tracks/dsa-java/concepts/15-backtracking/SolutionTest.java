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

    // Combinations: order inside each combination doesn't matter either —
    // sort each inner list before comparing as a set of combinations.
    static Set<List<Integer>> asCombosSet(List<List<Integer>> combos) {
        var set = new HashSet<List<Integer>>();
        for (List<Integer> c : combos) {
            var sorted = new ArrayList<>(c);
            sorted.sort(null);
            set.add(sorted);
        }
        return set;
    }

    @SafeVarargs
    static Set<List<Integer>> combosOf(List<Integer>... lists) {
        var set = new HashSet<List<Integer>>();
        for (List<Integer> l : lists) set.add(l);
        return set;
    }

    public static void main(String[] args) {
        // letterCombinations
        check("letterCombinations: classic \"23\"",
              new HashSet<>(Solution.letterCombinations("23"))
                  .equals(Set.of("ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf")));
        check("letterCombinations: empty input returns [] (not [\"\"])",
              Solution.letterCombinations("").isEmpty());
        check("letterCombinations: single digit",
              new HashSet<>(Solution.letterCombinations("2")).equals(Set.of("a", "b", "c")));
        check("letterCombinations: four-letter digit 7",
              new HashSet<>(Solution.letterCombinations("7")).equals(Set.of("p", "q", "r", "s")));
        {
            Set<String> expected = new HashSet<>();
            for (char a : "pqrs".toCharArray())
                for (char b : "wxyz".toCharArray())
                    expected.add("" + a + b);
            check("letterCombinations: two four-letter digits \"79\" -> 16 combos",
                  new HashSet<>(Solution.letterCombinations("79")).equals(expected));
        }
        {
            List<String> result = Solution.letterCombinations("234");
            boolean lenOk = result.size() == 27;
            for (String s : result) if (s.length() != 3) lenOk = false;
            check("letterCombinations: three digits -> 27 strings of length 3",
                  lenOk && new HashSet<>(result).size() == 27);
        }

        // permute
        {
            Set<List<Integer>> expected = combosOf(
                List.of(1, 2, 3), List.of(1, 3, 2), List.of(2, 1, 3),
                List.of(2, 3, 1), List.of(3, 1, 2), List.of(3, 2, 1));
            check("permute: classic [1,2,3]", new HashSet<>(Solution.permute(new int[]{1, 2, 3})).equals(expected));
        }
        check("permute: two elements",
              new HashSet<>(Solution.permute(new int[]{0, 1})).equals(Set.of(List.of(0, 1), List.of(1, 0))));
        check("permute: single element",
              Solution.permute(new int[]{1}).equals(List.of(List.of(1))));
        check("permute: negative values",
              new HashSet<>(Solution.permute(new int[]{-1, 5})).equals(Set.of(List.of(-1, 5), List.of(5, -1))));
        {
            List<List<Integer>> result = Solution.permute(new int[]{1, 2});
            result.get(0).set(0, 999); // mutate the first result
            check("permute: results are independent lists (no shared reference)",
                  result.get(1).size() == 2 && result.get(1).get(0) != 999);
        }

        // combinationSum
        check("combinationSum: classic [2,3,6,7] target 7",
              asCombosSet(Solution.combinationSum(new int[]{2, 3, 6, 7}, 7))
                  .equals(combosOf(List.of(2, 2, 3), List.of(7))));
        check("combinationSum: [2,3,5] target 8",
              asCombosSet(Solution.combinationSum(new int[]{2, 3, 5}, 8))
                  .equals(combosOf(List.of(2, 2, 2, 2), List.of(2, 3, 3), List.of(3, 5))));
        check("combinationSum: no solution returns []",
              Solution.combinationSum(new int[]{2}, 1).isEmpty());
        check("combinationSum: candidate equal to target",
              asCombosSet(Solution.combinationSum(new int[]{5}, 5)).equals(combosOf(List.of(5))));
        check("combinationSum: deep reuse of a single candidate",
              asCombosSet(Solution.combinationSum(new int[]{2}, 8)).equals(combosOf(List.of(2, 2, 2, 2))));
        check("combinationSum: unsorted input",
              asCombosSet(Solution.combinationSum(new int[]{7, 6, 3, 2}, 7))
                  .equals(combosOf(List.of(2, 2, 3), List.of(7))));
        check("combinationSum: no duplicate combinations in different orders",
              asCombosSet(Solution.combinationSum(new int[]{2, 3}, 5)).equals(combosOf(List.of(2, 3))));

        // generateParenthesis
        check("generateParenthesis: n = 3",
              new HashSet<>(Solution.generateParenthesis(3))
                  .equals(Set.of("((()))", "(()())", "(())()", "()(())", "()()()")));
        check("generateParenthesis: n = 1",
              Solution.generateParenthesis(1).equals(List.of("()")));
        check("generateParenthesis: n = 2",
              new HashSet<>(Solution.generateParenthesis(2)).equals(Set.of("(())", "()()")));
        {
            List<String> result = Solution.generateParenthesis(4);
            boolean ok = result.size() == 14 && new HashSet<>(result).size() == 14;
            for (String s : result) {
                if (s.length() != 8) ok = false;
                int depth = 0;
                for (char ch : s.toCharArray()) {
                    depth += (ch == '(') ? 1 : -1;
                    if (depth < 0) ok = false;
                }
                if (depth != 0) ok = false;
            }
            check("generateParenthesis: n = 4 -> 14 distinct valid strings of length 8", ok);
        }

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
