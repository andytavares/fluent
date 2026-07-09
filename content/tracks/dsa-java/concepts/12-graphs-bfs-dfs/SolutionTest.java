import java.util.List;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // numIslands
        check("islands: classic 4x5 -> 1",
              Solution.numIslands(new char[][]{
                  {'1','1','1','1','0'},
                  {'1','1','0','1','0'},
                  {'1','1','0','0','0'},
                  {'0','0','0','0','0'}}) == 1);
        check("islands: 3 separate",
              Solution.numIslands(new char[][]{
                  {'1','1','0','0','0'},
                  {'1','1','0','0','0'},
                  {'0','0','1','0','0'},
                  {'0','0','0','1','1'}}) == 3);
        check("islands: all water -> 0",
              Solution.numIslands(new char[][]{{'0','0'},{'0','0'}}) == 0);
        check("islands: all land -> 1",
              Solution.numIslands(new char[][]{{'1','1'},{'1','1'}}) == 1);
        check("islands: single cell -> 1",
              Solution.numIslands(new char[][]{{'1'}}) == 1);
        check("islands: diagonal [1,0],[0,1] -> 2",
              Solution.numIslands(new char[][]{{'1','0'},{'0','1'}}) == 2);

        // canFinish
        check("finish: simple prereq -> true",
              Solution.canFinish(2, new int[][]{{1,0}}));
        check("finish: direct cycle -> false",
              !Solution.canFinish(2, new int[][]{{1,0},{0,1}}));
        check("finish: no prereqs -> true",
              Solution.canFinish(3, new int[][]{}));
        check("finish: self-loop -> false",
              !Solution.canFinish(1, new int[][]{{0,0}}));
        check("finish: diamond DAG -> true",
              Solution.canFinish(4, new int[][]{{1,0},{2,0},{3,1},{3,2}}));
        check("finish: longer cycle -> false",
              !Solution.canFinish(3, new int[][]{{0,1},{1,2},{2,0}}));

        // wordLadderLength
        check("ladder: hit->cog = 5",
              Solution.wordLadderLength("hit", "cog",
                  List.of("hot","dot","dog","lot","log","cog")) == 5);
        check("ladder: hit->cog missing endWord = 0",
              Solution.wordLadderLength("hit", "cog",
                  List.of("hot","dot","dog","lot","log")) == 0);
        check("ladder: a->c, [a,b,c] = 2",
              Solution.wordLadderLength("a", "c", List.of("a","b","c")) == 2);
        check("ladder: same begin and end in list = 1",
              Solution.wordLadderLength("hot", "hot", List.of("hot")) == 1);
        check("ladder: no path -> 0",
              Solution.wordLadderLength("hit", "cog", List.of("hot","dot","lot","log")) == 0);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
