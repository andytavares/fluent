import java.util.List;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // subsets
        var s1 = Solution.subsets(new int[]{1,2,3});
        check("subsets: [1,2,3] has 8 subsets", s1.size() == 8);
        check("subsets: contains empty set",     s1.contains(List.of()));
        check("subsets: contains [1]",           s1.contains(List.of(1)));
        check("subsets: contains [1,2,3]",       s1.contains(List.of(1,2,3)));
        check("subsets: contains [2,3]",         s1.contains(List.of(2,3)));

        var s2 = Solution.subsets(new int[]{});
        check("subsets: empty input -> [[]]", s2.size() == 1 && s2.contains(List.of()));

        var s3 = Solution.subsets(new int[]{1});
        check("subsets: [1] -> [[], [1]]", s3.size() == 2);

        // permutations
        var p1 = Solution.permutations(new int[]{1,2,3});
        check("perms: [1,2,3] has 6 permutations", p1.size() == 6);
        check("perms: contains [1,2,3]",  p1.contains(List.of(1,2,3)));
        check("perms: contains [3,2,1]",  p1.contains(List.of(3,2,1)));
        check("perms: contains [2,1,3]",  p1.contains(List.of(2,1,3)));

        var p2 = Solution.permutations(new int[]{1});
        check("perms: [1] -> [[1]]", p2.size() == 1 && p2.contains(List.of(1)));

        var p3 = Solution.permutations(new int[]{1,2});
        check("perms: [1,2] has 2 permutations", p3.size() == 2);

        // combinationSum
        var c1 = Solution.combinationSum(new int[]{2,3,6,7}, 7);
        check("combSum: [2,3,6,7] target=7 has 2 combos", c1.size() == 2);
        check("combSum: contains [7]",   c1.contains(List.of(7)));
        check("combSum: contains [2,2,3]", c1.contains(List.of(2,2,3)));

        var c2 = Solution.combinationSum(new int[]{2,3,5}, 8);
        check("combSum: [2,3,5] target=8 has 3 combos", c2.size() == 3);

        var c3 = Solution.combinationSum(new int[]{2}, 1);
        check("combSum: impossible -> empty", c3.isEmpty());

        var c4 = Solution.combinationSum(new int[]{1}, 3);
        check("combSum: [1] target=3 -> [[1,1,1]]",
              c4.size() == 1 && c4.contains(List.of(1,1,1)));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
