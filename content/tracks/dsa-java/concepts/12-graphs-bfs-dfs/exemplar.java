import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class Solution {

    private static final int[][] DIRS = { {1, 0}, {-1, 0}, {0, 1}, {0, -1} };

    // Scan every cell; each fresh '1' starts a new island, and an iterative
    // flood fill sinks the whole island to '0' so it is never recounted.
    // Cells are marked when pushed (not when popped) so nothing enters the
    // stack twice. The explicit stack keeps snake-shaped islands from
    // overflowing the call stack.
    // O(rows * cols) time, O(rows * cols) worst-case stack.
    public static int numIslands(char[][] grid) {
        int rows = grid.length;
        int cols = grid[0].length;
        int count = 0;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != '1') continue;
                count++;
                var stack = new ArrayDeque<int[]>();
                stack.push(new int[]{r, c});
                grid[r][c] = '0';
                while (!stack.isEmpty()) {
                    int[] cur = stack.pop();
                    for (int[] d : DIRS) {
                        int nr = cur[0] + d[0];
                        int nc = cur[1] + d[1];
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1') {
                            grid[nr][nc] = '0';
                            stack.push(new int[]{nr, nc});
                        }
                    }
                }
            }
        }
        return count;
    }

    // Deep copy of an adjacency map: one fresh container per level — a new
    // outer map and a new list per node. A shallow copy of the outer map
    // would still share the neighbor lists, so mutating the clone would
    // corrupt the original.
    // O(V + E) time and space.
    public static Map<String, List<String>> cloneGraph(Map<String, List<String>> graph) {
        var clone = new HashMap<String, List<String>>();
        for (var entry : graph.entrySet()) {
            clone.put(entry.getKey(), new ArrayList<>(entry.getValue()));
        }
        return clone;
    }

    // Kahn's topological sort: a course enters the queue exactly when its
    // last prerequisite is taken. Courses on a cycle never reach indegree 0,
    // so the graph is acyclic iff every course gets processed.
    // O(V + E) time and space.
    public static boolean canFinish(int numCourses, int[][] prerequisites) {
        var adj = new ArrayList<List<Integer>>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        int[] indegree = new int[numCourses];
        for (int[] pre : prerequisites) {
            int course = pre[0];
            int prereq = pre[1];
            adj.get(prereq).add(course); // edge prereq -> course
            indegree[course]++;
        }

        var queue = new ArrayDeque<Integer>();
        for (int i = 0; i < numCourses; i++) {
            if (indegree[i] == 0) queue.offer(i);
        }

        int processed = 0;
        while (!queue.isEmpty()) {
            int course = queue.poll();
            processed++;
            for (int next : adj.get(course)) {
                if (--indegree[next] == 0) queue.offer(next);
            }
        }
        return processed == numCourses;
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
