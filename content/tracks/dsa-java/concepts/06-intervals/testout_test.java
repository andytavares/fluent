import java.util.Arrays;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // mergeIntervals
        check("mergeIntervals: classic example",
              Arrays.deepEquals(Solution.mergeIntervals(new int[][]{{1, 3}, {2, 6}, {8, 10}, {15, 18}}),
                  new int[][]{{1, 6}, {8, 10}, {15, 18}}));
        check("mergeIntervals: touching intervals merge",
              Arrays.deepEquals(Solution.mergeIntervals(new int[][]{{1, 4}, {4, 5}}), new int[][]{{1, 5}}));
        check("mergeIntervals: containment - later intervals inside the block",
              Arrays.deepEquals(Solution.mergeIntervals(new int[][]{{1, 10}, {2, 3}, {4, 5}}), new int[][]{{1, 10}}));
        check("mergeIntervals: empty input", Arrays.deepEquals(Solution.mergeIntervals(new int[][]{}), new int[0][]));
        check("mergeIntervals: single interval",
              Arrays.deepEquals(Solution.mergeIntervals(new int[][]{{3, 7}}), new int[][]{{3, 7}}));
        check("mergeIntervals: unsorted input gets sorted",
              Arrays.deepEquals(Solution.mergeIntervals(new int[][]{{8, 10}, {1, 3}, {15, 18}, {2, 6}}),
                  new int[][]{{1, 6}, {8, 10}, {15, 18}}));
        check("mergeIntervals: duplicate intervals collapse",
              Arrays.deepEquals(Solution.mergeIntervals(new int[][]{{1, 4}, {1, 4}}), new int[][]{{1, 4}}));
        check("mergeIntervals: zero-width intervals",
              Arrays.deepEquals(Solution.mergeIntervals(new int[][]{{5, 5}, {1, 1}}), new int[][]{{1, 1}, {5, 5}}));
        check("mergeIntervals: negative coordinates",
              Arrays.deepEquals(Solution.mergeIntervals(new int[][]{{-10, -5}, {-6, 0}, {2, 3}}),
                  new int[][]{{-10, 0}, {2, 3}}));
        check("mergeIntervals: numeric sort (two-digit starts)",
              Arrays.deepEquals(Solution.mergeIntervals(new int[][]{{10, 12}, {2, 3}}), new int[][]{{2, 3}, {10, 12}}));

        int[][] touching10k = new int[10000][];
        for (int i = 9999, idx = 0; i >= 0; i--, idx++) touching10k[idx] = new int[]{i, i + 1};
        check("mergeIntervals: 10k touching intervals collapse to one block",
              Arrays.deepEquals(Solution.mergeIntervals(touching10k), new int[][]{{0, 10000}}));

        int[][] disjoint10k = new int[10000][];
        for (int i = 9999, idx = 0; i >= 0; i--, idx++) disjoint10k[idx] = new int[]{i * 3, i * 3 + 1};
        int[][] disjointResult = Solution.mergeIntervals(disjoint10k);
        check("mergeIntervals: 10k disjoint intervals stay disjoint",
              disjointResult.length == 10000
                  && Arrays.equals(disjointResult[0], new int[]{0, 1})
                  && Arrays.equals(disjointResult[9999], new int[]{29997, 29998}));

        // insertInterval
        check("insertInterval: classic example",
              Arrays.deepEquals(Solution.insertInterval(new int[][]{{1, 3}, {6, 9}}, new int[]{2, 5}),
                  new int[][]{{1, 5}, {6, 9}}));
        check("insertInterval: swallows several intervals",
              Arrays.deepEquals(Solution.insertInterval(new int[][]{{1, 2}, {3, 5}, {6, 7}, {8, 10}, {12, 16}}, new int[]{4, 8}),
                  new int[][]{{1, 2}, {3, 10}, {12, 16}}));
        check("insertInterval: empty list",
              Arrays.deepEquals(Solution.insertInterval(new int[][]{}, new int[]{5, 7}), new int[][]{{5, 7}}));
        check("insertInterval: before everything, no overlap",
              Arrays.deepEquals(Solution.insertInterval(new int[][]{{3, 5}, {8, 9}}, new int[]{1, 2}),
                  new int[][]{{1, 2}, {3, 5}, {8, 9}}));
        check("insertInterval: after everything, no overlap",
              Arrays.deepEquals(Solution.insertInterval(new int[][]{{1, 2}, {4, 5}}, new int[]{7, 9}),
                  new int[][]{{1, 2}, {4, 5}, {7, 9}}));
        check("insertInterval: fully contained in an existing interval",
              Arrays.deepEquals(Solution.insertInterval(new int[][]{{1, 5}}, new int[]{2, 3}), new int[][]{{1, 5}}));
        check("insertInterval: swallows the whole list",
              Arrays.deepEquals(Solution.insertInterval(new int[][]{{2, 3}, {5, 6}, {8, 9}}, new int[]{1, 10}),
                  new int[][]{{1, 10}}));
        check("insertInterval: touching at the right endpoint merges",
              Arrays.deepEquals(Solution.insertInterval(new int[][]{{1, 5}}, new int[]{5, 7}), new int[][]{{1, 7}}));
        check("insertInterval: touching at the left endpoint merges",
              Arrays.deepEquals(Solution.insertInterval(new int[][]{{5, 8}}, new int[]{2, 5}), new int[][]{{2, 8}}));
        check("insertInterval: fills the exact gap between neighbors",
              Arrays.deepEquals(Solution.insertInterval(new int[][]{{1, 2}, {5, 6}}, new int[]{3, 4}),
                  new int[][]{{1, 2}, {3, 4}, {5, 6}}));

        int[][] bigList = new int[10000][];
        for (int i = 0; i < 10000; i++) bigList[i] = new int[]{i * 10, i * 10 + 5};
        int[][] bigResult = Solution.insertInterval(bigList, new int[]{50003, 50017});
        check("insertInterval: 10k intervals, merge deep inside",
              bigResult.length == 9999
                  && Arrays.equals(bigResult[5000], new int[]{50000, 50017})
                  && Arrays.equals(bigResult[5001], new int[]{50020, 50025}));

        // minArrows
        check("minArrows: classic example", Solution.minArrows(new int[][]{{10, 16}, {2, 8}, {1, 6}, {7, 12}}) == 2);
        check("minArrows: disjoint balloons need one arrow each", Solution.minArrows(new int[][]{{1, 2}, {3, 4}, {5, 6}}) == 3);
        check("minArrows: chain of touching balloons", Solution.minArrows(new int[][]{{1, 2}, {2, 3}, {3, 4}, {4, 5}}) == 2);
        check("minArrows: empty array", Solution.minArrows(new int[][]{}) == 0);
        check("minArrows: single balloon", Solution.minArrows(new int[][]{{3, 9}}) == 1);
        check("minArrows: all balloons share a common point", Solution.minArrows(new int[][]{{1, 10}, {5, 12}, {9, 20}, {10, 11}}) == 1);
        check("minArrows: nested balloons", Solution.minArrows(new int[][]{{1, 100}, {40, 60}, {50, 55}}) == 1);
        check("minArrows: negative coordinates", Solution.minArrows(new int[][]{{-10, -4}, {-6, 0}, {2, 3}}) == 2);
        check("minArrows: numeric sort on ends (two-digit ends)", Solution.minArrows(new int[][]{{3, 10}, {1, 2}}) == 2);
        check("minArrows: large coordinates near 2^31",
              Solution.minArrows(new int[][]{{Integer.MIN_VALUE, Integer.MAX_VALUE}, {0, 1}}) == 1);

        int[][] chains = new int[10000][];
        for (int i = 0; i < 5000; i++) chains[i] = new int[]{100 - i, 100 + i};
        for (int i = 0; i < 5000; i++) chains[5000 + i] = new int[]{90000 - i, 90000 + i};
        check("minArrows: 10k pairwise-overlapping chains", Solution.minArrows(chains) == 2);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
