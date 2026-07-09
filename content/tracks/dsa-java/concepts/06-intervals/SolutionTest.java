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

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
