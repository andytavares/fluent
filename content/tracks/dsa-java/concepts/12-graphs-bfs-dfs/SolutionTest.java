import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static Map<String, List<String>> graphOf(Object... pairs) {
        var graph = new HashMap<String, List<String>>();
        for (int i = 0; i < pairs.length; i += 2) {
            @SuppressWarnings("unchecked")
            List<String> neighbors = (List<String>) pairs[i + 1];
            graph.put((String) pairs[i], neighbors);
        }
        return graph;
    }

    public static void main(String[] args) {
        // numIslands
        check("numIslands: one large island",
              Solution.numIslands(new char[][]{
                  {'1', '1', '1', '1', '0'},
                  {'1', '1', '0', '1', '0'},
                  {'1', '1', '0', '0', '0'},
                  {'0', '0', '0', '0', '0'}}) == 1);
        check("numIslands: three separate islands",
              Solution.numIslands(new char[][]{
                  {'1', '1', '0', '0', '0'},
                  {'1', '1', '0', '0', '0'},
                  {'0', '0', '1', '0', '0'},
                  {'0', '0', '0', '1', '1'}}) == 3);
        check("numIslands: single water cell",
              Solution.numIslands(new char[][]{{'0'}}) == 0);
        check("numIslands: single land cell",
              Solution.numIslands(new char[][]{{'1'}}) == 1);
        check("numIslands: all water",
              Solution.numIslands(new char[][]{{'0','0','0'},{'0','0','0'},{'0','0','0'}}) == 0);
        check("numIslands: all land is one island",
              Solution.numIslands(new char[][]{{'1','1','1'},{'1','1','1'},{'1','1','1'}}) == 1);
        check("numIslands: diagonal contact does not connect",
              Solution.numIslands(new char[][]{{'1','0'},{'0','1'}}) == 2);
        check("numIslands: ring-shaped island counts once",
              Solution.numIslands(new char[][]{{'1','1','1'},{'1','0','1'},{'1','1','1'}}) == 1);
        check("numIslands: snake-shaped island winds through the grid",
              Solution.numIslands(new char[][]{
                  {'1','1','1','1','1'},
                  {'0','0','0','0','1'},
                  {'1','1','1','1','1'},
                  {'1','0','0','0','0'},
                  {'1','1','1','1','1'}}) == 1);

        // cloneGraph
        {
            Map<String, List<String>> graph = graphOf(
                "1", List.of("2", "4"), "2", List.of("1", "3"),
                "3", List.of("2", "4"), "4", List.of("1", "3"));
            check("cloneGraph: clone deep-equals a 4-cycle", Solution.cloneGraph(graph).equals(graph));
        }
        {
            Map<String, List<String>> graph = graphOf("1", List.of("2"), "2", List.of("1"));
            check("cloneGraph: clone is a different outer object", Solution.cloneGraph(graph) != graph);
        }
        {
            Map<String, List<String>> graph = graphOf(
                "1", List.of("2", "4"), "2", List.of("1", "3"),
                "3", List.of("2", "4"), "4", List.of("1", "3"));
            Map<String, List<String>> clone = Solution.cloneGraph(graph);
            boolean allFresh = true;
            for (String key : graph.keySet()) {
                if (clone.get(key) == graph.get(key)) allFresh = false;
            }
            check("cloneGraph: every neighbor list is a fresh list", allFresh);
        }
        {
            Map<String, List<String>> graph = graphOf("1", List.of("2"), "2", List.of("1"));
            Map<String, List<String>> clone = Solution.cloneGraph(graph);
            clone.get("1").add("9");
            clone.put("3", List.of("1"));
            check("cloneGraph: mutating the clone leaves the original untouched",
                  graph.equals(graphOf("1", List.of("2"), "2", List.of("1"))));
        }
        {
            Map<String, List<String>> graph = new HashMap<>();
            Map<String, List<String>> clone = Solution.cloneGraph(graph);
            check("cloneGraph: empty graph returns a new empty map",
                  clone.isEmpty() && clone != graph);
        }
        {
            Map<String, List<String>> graph = graphOf("7", List.of());
            Map<String, List<String>> clone = Solution.cloneGraph(graph);
            check("cloneGraph: single node with no neighbors",
                  clone.equals(graphOf("7", List.of())) && clone.get("7") != graph.get("7"));
        }

        // canFinish
        check("canFinish: single prerequisite is satisfiable",
              Solution.canFinish(2, new int[][]{{1, 0}}));
        check("canFinish: mutual dependency is a cycle",
              !Solution.canFinish(2, new int[][]{{1, 0}, {0, 1}}));
        check("canFinish: no prerequisites at all",
              Solution.canFinish(3, new int[][]{}));
        check("canFinish: self-loop is a cycle",
              !Solution.canFinish(1, new int[][]{{0, 0}}));
        check("canFinish: long chain is satisfiable",
              Solution.canFinish(5, new int[][]{{1, 0}, {2, 1}, {3, 2}, {4, 3}}));
        check("canFinish: cycle among a subset blocks everything",
              !Solution.canFinish(6, new int[][]{{1, 0}, {2, 1}, {0, 2}, {4, 3}}));
        check("canFinish: duplicate pairs are harmless",
              Solution.canFinish(3, new int[][]{{1, 0}, {1, 0}, {2, 1}}));
        check("canFinish: cycle closed by the last edge",
              !Solution.canFinish(4, new int[][]{{1, 0}, {2, 1}, {3, 2}, {1, 3}}));
        check("canFinish: diamond dependency is acyclic",
              Solution.canFinish(4, new int[][]{{1, 0}, {2, 0}, {3, 1}, {3, 2}}));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
