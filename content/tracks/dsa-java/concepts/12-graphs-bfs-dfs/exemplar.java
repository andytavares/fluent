import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

class Solution {

    public static int numIslands(char[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    dfs(grid, r, c);
                    count++;
                }
            }
        }
        return count;
    }

    private static void dfs(char[][] grid, int r, int c) {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid, r+1, c); dfs(grid, r-1, c);
        dfs(grid, r, c+1); dfs(grid, r, c-1);
    }

    public static boolean canFinish(int numCourses, int[][] prerequisites) {
        var graph = new ArrayList<List<Integer>>();
        for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
        for (int[] pre : prerequisites) graph.get(pre[1]).add(pre[0]);

        int[] state = new int[numCourses];
        for (int i = 0; i < numCourses; i++) {
            if (hasCycle(graph, state, i)) return false;
        }
        return true;
    }

    private static boolean hasCycle(List<List<Integer>> graph, int[] state, int node) {
        if (state[node] == 1) return true;
        if (state[node] == 2) return false;
        state[node] = 1;
        for (int neighbor : graph.get(node)) {
            if (hasCycle(graph, state, neighbor)) return true;
        }
        state[node] = 2;
        return false;
    }

    public static int wordLadderLength(String beginWord, String endWord, List<String> wordList) {
        var wordSet = new HashSet<>(wordList);
        if (!wordSet.contains(endWord)) return 0;

        var queue = new ArrayDeque<String>();
        queue.offer(beginWord);
        wordSet.remove(beginWord);
        int steps = 1;

        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                String word = queue.poll();
                if (word.equals(endWord)) return steps;
                char[] chars = word.toCharArray();
                for (int j = 0; j < chars.length; j++) {
                    char original = chars[j];
                    for (char c = 'a'; c <= 'z'; c++) {
                        chars[j] = c;
                        String next = new String(chars);
                        if (wordSet.contains(next)) {
                            queue.offer(next);
                            wordSet.remove(next);
                        }
                    }
                    chars[j] = original;
                }
            }
            steps++;
        }
        return 0;
    }

    public static void main(String[] args) {
        char[][] grid = {
            {'1','1','1','1','0'},
            {'1','1','0','1','0'},
            {'1','1','0','0','0'},
            {'0','0','0','0','0'}
        };
        System.out.println(numIslands(grid)); // 1
        System.out.println(canFinish(2, new int[][]{{1,0}}));      // true
        System.out.println(canFinish(2, new int[][]{{1,0},{0,1}})); // false
        System.out.println(wordLadderLength("hit", "cog",
            List.of("hot","dot","dog","lot","log","cog"))); // 5
    }
}
