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

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
