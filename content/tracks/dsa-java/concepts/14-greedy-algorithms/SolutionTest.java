import java.util.Arrays;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static boolean intervalsEqual(int[][] a, int[][] b) {
        if (a.length != b.length) return false;
        for (int i = 0; i < a.length; i++) {
            if (!Arrays.equals(a[i], b[i])) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        // canJump
        check("jump: [2,3,1,1,4] -> true",  Solution.canJump(new int[]{2,3,1,1,4}));
        check("jump: [3,2,1,0,4] -> false", !Solution.canJump(new int[]{3,2,1,0,4}));
        check("jump: [0] single -> true",    Solution.canJump(new int[]{0}));
        check("jump: [1,0,1] -> false",     !Solution.canJump(new int[]{1,0,1}));
        check("jump: [2,0,0] -> true",       Solution.canJump(new int[]{2,0,0}));
        check("jump: [1,1,1,0] -> true",     Solution.canJump(new int[]{1,1,1,0}));
        check("jump: [0,1] -> false",       !Solution.canJump(new int[]{0,1}));

        // mergeIntervals
        check("merge: [[1,3],[2,6],[8,10],[15,18]]",
              intervalsEqual(
                  Solution.mergeIntervals(new int[][]{{1,3},{2,6},{8,10},{15,18}}),
                  new int[][]{{1,6},{8,10},{15,18}}));
        check("merge: [[1,4],[4,5]] -> [[1,5]]",
              intervalsEqual(
                  Solution.mergeIntervals(new int[][]{{1,4},{4,5}}),
                  new int[][]{{1,5}}));
        check("merge: single interval",
              intervalsEqual(
                  Solution.mergeIntervals(new int[][]{{3,7}}),
                  new int[][]{{3,7}}));
        check("merge: no overlaps",
              intervalsEqual(
                  Solution.mergeIntervals(new int[][]{{1,2},{3,4},{5,6}}),
                  new int[][]{{1,2},{3,4},{5,6}}));
        check("merge: fully contained",
              intervalsEqual(
                  Solution.mergeIntervals(new int[][]{{1,10},{2,5}}),
                  new int[][]{{1,10}}));
        check("merge: unsorted input",
              intervalsEqual(
                  Solution.mergeIntervals(new int[][]{{2,6},{1,3}}),
                  new int[][]{{1,6}}));

        // taskScheduler
        check("task: [A*3,B*3] n=2 -> 8",
              Solution.taskScheduler(new char[]{'A','A','A','B','B','B'}, 2) == 8);
        check("task: [A*3,B*3] n=0 -> 6 (no idle needed)",
              Solution.taskScheduler(new char[]{'A','A','A','B','B','B'}, 0) == 6);
        check("task: [A*3,B*3,C*3] n=2 -> 9 (no idle: slots filled by B,C)",
              Solution.taskScheduler(new char[]{'A','A','A','B','B','B','C','C','C'}, 2) == 9);
        check("task: single task [A] n=5 -> 1",
              Solution.taskScheduler(new char[]{'A'}, 5) == 1);
        check("task: [A*2] n=2 -> 3 (A->idle->A)",
              Solution.taskScheduler(new char[]{'A','A'}, 2) == 3);
        check("task: many tasks fill idle slots",
              Solution.taskScheduler(
                  new char[]{'A','A','A','B','B','B','C','D','E','F'}, 2) == 10);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
