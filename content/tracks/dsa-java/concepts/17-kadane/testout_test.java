public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // maxSubArray
        check("maxSubArray: classic example",
              Solution.maxSubArray(new int[]{-2, 1, -3, 4, -1, 2, 1, -5, 4}) == 6);
        check("maxSubArray: single element",
              Solution.maxSubArray(new int[]{1}) == 1);
        check("maxSubArray: single negative element",
              Solution.maxSubArray(new int[]{-7}) == -7);
        check("maxSubArray: all positive — the whole array",
              Solution.maxSubArray(new int[]{5, 4, -1, 7, 8}) == 23);
        check("maxSubArray: all negative — largest element, never 0",
              Solution.maxSubArray(new int[]{-3, -1, -2}) == -1);
        check("maxSubArray: negative prefix must be dropped",
              Solution.maxSubArray(new int[]{-5, 3, 4}) == 7);
        check("maxSubArray: negative suffix must be ignored",
              Solution.maxSubArray(new int[]{3, 4, -10}) == 7);
        check("maxSubArray: zeros mixed with negatives",
              Solution.maxSubArray(new int[]{-1, 0, -2}) == 0);
        check("maxSubArray: dip worth crossing",
              Solution.maxSubArray(new int[]{4, -1, 5}) == 8);
        check("maxSubArray: dip not worth crossing",
              Solution.maxSubArray(new int[]{5, -10, 6}) == 6);
        check("maxSubArray: large input — one positive block hidden in noise",
              Solution.maxSubArray(largeBlockNoise()) == 1000);
        check("maxSubArray: large alternating input",
              Solution.maxSubArray(largeAlternating()) == 1);
        check("maxSubArray: two blocks joined by a shallow dip",
              Solution.maxSubArray(twoBlocksShallowDip()) == 997);

        // maxSubarraySumCircular
        check("circular: no wrap needed",
              Solution.maxSubarraySumCircular(new int[]{1, -2, 3, -2}) == 3);
        check("circular: wrap wins",
              Solution.maxSubarraySumCircular(new int[]{5, -3, 5}) == 10);
        check("circular: all negative — single element, not 0",
              Solution.maxSubarraySumCircular(new int[]{-3, -2, -3}) == -2);
        check("circular: single element",
              Solution.maxSubarraySumCircular(new int[]{7}) == 7);
        check("circular: single negative element",
              Solution.maxSubarraySumCircular(new int[]{-4}) == -4);
        check("circular: wrap combining suffix and prefix",
              Solution.maxSubarraySumCircular(new int[]{3, -1, 2, -1}) == 4);
        check("circular: all positive — whole circle",
              Solution.maxSubarraySumCircular(new int[]{1, 2, 3, 4}) == 10);
        check("circular: wrap skips the minimum middle",
              Solution.maxSubarraySumCircular(new int[]{-2, 4, -5, 4, -5, 9, 4}) == 15);
        check("circular: all zeros",
              Solution.maxSubarraySumCircular(new int[]{0, 0, 0}) == 0);
        check("circular: -2 and -1 only",
              Solution.maxSubarraySumCircular(new int[]{-2, -1}) == -1);
        check("circular: large input — block split across the boundary",
              Solution.maxSubarraySumCircular(blockSplitAcrossBoundary()) == 1000);
        check("circular: large all-negative input",
              Solution.maxSubarraySumCircular(largeAllNegative()) == -1);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }

    // 2000 x (-1), then 100 x 10, then 2000 x (-1): best is the block = 1000
    static int[] largeBlockNoise() {
        int[] a = new int[4100];
        int i = 0;
        for (int c = 0; c < 2000; c++) a[i++] = -1;
        for (int c = 0; c < 100; c++) a[i++] = 10;
        for (int c = 0; c < 2000; c++) a[i++] = -1;
        return a;
    }

    // [1,-2,1,-2,...]: no run beats a single 1
    static int[] largeAlternating() {
        int[] a = new int[10000];
        for (int i = 0; i < a.length; i++) a[i] = (i % 2 == 0) ? 1 : -2;
        return a;
    }

    // 50-sum block, dip of -3, 50-sum block -> cross the dip: 997
    static int[] twoBlocksShallowDip() {
        int[] a = new int[101];
        int i = 0;
        for (int c = 0; c < 50; c++) a[i++] = 10;
        a[i++] = -3;
        for (int c = 0; c < 50; c++) a[i++] = 10;
        return a;
    }

    // 50 tens at each end, -1s in the middle: wrap = 1000, non-wrap = 500
    static int[] blockSplitAcrossBoundary() {
        int[] a = new int[5100];
        int i = 0;
        for (int c = 0; c < 50; c++) a[i++] = 10;
        for (int c = 0; c < 5000; c++) a[i++] = -1;
        for (int c = 0; c < 50; c++) a[i++] = 10;
        return a;
    }

    // -1, -2, ..., -5000: wrapped formula would give 0 — the answer is the max element
    static int[] largeAllNegative() {
        int[] a = new int[5000];
        for (int i = 0; i < a.length; i++) a[i] = -(i + 1);
        return a;
    }
}
