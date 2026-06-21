import java.util.ArrayList;
import java.util.List;

class Solution {

    public static int numIslands(char[][] grid) {
        // TODO
        return 0;
    }

    public static boolean canFinish(int numCourses, int[][] prerequisites) {
        // TODO
        return false;
    }

    public static int wordLadderLength(String beginWord, String endWord, List<String> wordList) {
        // TODO
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
