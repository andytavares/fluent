public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // climbingStairs
        check("stairs: n=1 -> 1",   Solution.climbingStairs(1) == 1);
        check("stairs: n=2 -> 2",   Solution.climbingStairs(2) == 2);
        check("stairs: n=3 -> 3",   Solution.climbingStairs(3) == 3);
        check("stairs: n=4 -> 5",   Solution.climbingStairs(4) == 5);
        check("stairs: n=5 -> 8",   Solution.climbingStairs(5) == 8);
        check("stairs: n=10 -> 89", Solution.climbingStairs(10) == 89);

        // rob
        check("rob: [1,2,3,1] -> 4",     Solution.rob(new int[]{1,2,3,1}) == 4);
        check("rob: [2,7,9,3,1] -> 12",  Solution.rob(new int[]{2,7,9,3,1}) == 12);
        check("rob: [1] -> 1",            Solution.rob(new int[]{1}) == 1);
        check("rob: [1,2] -> 2",          Solution.rob(new int[]{1,2}) == 2);
        check("rob: [5,5,5,5] -> 10",     Solution.rob(new int[]{5,5,5,5}) == 10);
        check("rob: [0,0,0] -> 0",        Solution.rob(new int[]{0,0,0}) == 0);

        // coinChange
        check("coin: [1,5,10,25] 36 -> 3",
              Solution.coinChange(new int[]{1,5,10,25}, 36) == 3);
        check("coin: [1,2,5] 11 -> 3",
              Solution.coinChange(new int[]{1,2,5}, 11) == 3);
        check("coin: [2] 3 -> -1",
              Solution.coinChange(new int[]{2}, 3) == -1);
        check("coin: [1] 0 -> 0",
              Solution.coinChange(new int[]{1}, 0) == 0);
        check("coin: [1] 1 -> 1",
              Solution.coinChange(new int[]{1}, 1) == 1);
        check("coin: [5,10] 3 -> -1",
              Solution.coinChange(new int[]{5,10}, 3) == -1);
        check("coin: exact match [5] 5 -> 1",
              Solution.coinChange(new int[]{5}, 5) == 1);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
