import java.util.Arrays;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // slidingWindowMaximum
        check("swm: classic case",
              Arrays.equals(Solution.slidingWindowMaximum(new int[]{1,3,-1,-3,5,3,6,7}, 3),
                            new int[]{3,3,5,5,6,7}));
        check("swm: single element k=1",
              Arrays.equals(Solution.slidingWindowMaximum(new int[]{1}, 1), new int[]{1}));
        check("swm: k equals length",
              Arrays.equals(Solution.slidingWindowMaximum(new int[]{3,1,4,1,5}, 5), new int[]{5}));
        check("swm: decreasing",
              Arrays.equals(Solution.slidingWindowMaximum(new int[]{5,4,3,2,1}, 2),
                            new int[]{5,4,3,2}));
        check("swm: increasing",
              Arrays.equals(Solution.slidingWindowMaximum(new int[]{1,2,3,4,5}, 2),
                            new int[]{2,3,4,5}));
        check("swm: all same",
              Arrays.equals(Solution.slidingWindowMaximum(new int[]{3,3,3}, 2), new int[]{3,3}));

        // RecentCounter
        var rc = new Solution.RecentCounter();
        check("rc: ping(1) -> 1",    rc.ping(1) == 1);
        check("rc: ping(100) -> 2",  rc.ping(100) == 2);
        check("rc: ping(3001) -> 3", rc.ping(3001) == 3);
        check("rc: ping(3002) -> 3", rc.ping(3002) == 3);

        var rc2 = new Solution.RecentCounter();
        check("rc: ping(0) -> 1",              rc2.ping(0) == 1);
        check("rc: ping(3001) evicts first",   rc2.ping(3001) == 1);

        // rottingOranges
        check("rot: classic case -> 4",
              Solution.rottingOranges(new int[][]{{2,1,1},{1,1,0},{0,1,1}}) == 4);
        check("rot: already all rotten -> 0",
              Solution.rottingOranges(new int[][]{{0,2}}) == 0);
        check("rot: isolated fresh -> -1",
              Solution.rottingOranges(new int[][]{{2,1,1},{0,1,1},{1,0,1}}) == -1);
        check("rot: no fresh oranges -> 0",
              Solution.rottingOranges(new int[][]{{0,2,0},{0,0,0}}) == 0);
        check("rot: single fresh adjacent to rotten -> 1",
              Solution.rottingOranges(new int[][]{{2,1}}) == 1);
        check("rot: all empty -> 0",
              Solution.rottingOranges(new int[][]{{0,0},{0,0}}) == 0);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
