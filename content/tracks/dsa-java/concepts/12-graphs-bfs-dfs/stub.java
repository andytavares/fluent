import java.util.HashMap;
import java.util.List;
import java.util.Map;

class Solution {

    // Returns the number of islands: maximal groups of '1' cells connected
    // horizontally or vertically. The grid may be mutated.
    public static int numIslands(char[][] grid) {
        // TODO: scan every cell; each fresh '1' is a new island — flood fill
        // from it (explicit stack, 4 directions), sinking reached '1's to '0'.
        // Bounds-check neighbors before indexing.
        return 0;
    }

    // Returns a deep copy of an undirected graph given as an adjacency map:
    // node label -> list of neighbor labels. No reference may be shared with
    // the input — not the outer map, not any neighbor list.
    public static Map<String, List<String>> cloneGraph(Map<String, List<String>> graph) {
        // TODO: one fresh container per level — a new outer map, and a new
        // list for every node's neighbors (a shallow copy still shares lists)
        return new HashMap<>();
    }

    // Returns true if all courses can be taken — i.e. the prerequisite graph
    // has no cycle. prerequisites[i] = [a, b] means b must be taken before a.
    public static boolean canFinish(int numCourses, int[][] prerequisites) {
        // TODO: Kahn's algorithm — adjacency b -> a plus indegree per course;
        // queue indegree-0 courses, peel and decrement dependents; finished
        // course count == numCourses means acyclic
        return false;
    }

    public static void main(String[] args) {
        char[][] grid = {
            {'1', '1', '0', '0', '0'},
            {'1', '1', '0', '0', '0'},
            {'0', '0', '1', '0', '0'},
            {'0', '0', '0', '1', '1'},
        };
        System.out.println(numIslands(grid)); // 3

        Map<String, List<String>> graph = new HashMap<>();
        graph.put("1", List.of("2", "4"));
        graph.put("2", List.of("1", "3"));
        graph.put("3", List.of("2", "4"));
        graph.put("4", List.of("1", "3"));
        System.out.println(cloneGraph(graph));

        System.out.println(canFinish(2, new int[][]{{1, 0}}));           // true
        System.out.println(canFinish(2, new int[][]{{1, 0}, {0, 1}}));   // false
    }
}
