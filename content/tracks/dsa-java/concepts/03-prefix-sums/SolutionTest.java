import java.util.Arrays;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // buildPrefixSum
        int[] p1 = Solution.buildPrefixSum(new int[]{1, 2, 3, 4, 5});
        check("buildPrefix: length is n+1", p1.length == 6);
        check("buildPrefix: sentinel is 0", p1[0] == 0);
        check("buildPrefix: [0]=0,[1]=1,[2]=3,[3]=6,[4]=10,[5]=15",
              Arrays.equals(p1, new int[]{0,1,3,6,10,15}));

        int[] p2 = Solution.buildPrefixSum(new int[]{});
        check("buildPrefix: empty array -> length 1", p2.length == 1 && p2[0] == 0);

        // rangeSum
        check("rangeSum: [1..3] = 9", Solution.rangeSum(p1, 1, 3) == 9);
        check("rangeSum: [0..0] = 1", Solution.rangeSum(p1, 0, 0) == 1);
        check("rangeSum: [0..4] = 15", Solution.rangeSum(p1, 0, 4) == 15);
        check("rangeSum: [2..2] = 3", Solution.rangeSum(p1, 2, 2) == 3);

        // subarraySumEqualsK
        check("subK: [1,1,1] k=2 -> 2",
              Solution.subarraySumEqualsK(new int[]{1,1,1}, 2) == 2);
        check("subK: [1,2,3] k=3 -> 2",
              Solution.subarraySumEqualsK(new int[]{1,2,3}, 3) == 2);
        check("subK: [1] k=1 -> 1",
              Solution.subarraySumEqualsK(new int[]{1}, 1) == 1);
        check("subK: [1] k=2 -> 0",
              Solution.subarraySumEqualsK(new int[]{1}, 2) == 0);
        check("subK: negatives [-1,1,0] k=0 -> 3",
              Solution.subarraySumEqualsK(new int[]{-1,1,0}, 0) == 3);
        check("subK: [0,0,0,0] k=0 -> 10",
              Solution.subarraySumEqualsK(new int[]{0,0,0,0}, 0) == 10);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
