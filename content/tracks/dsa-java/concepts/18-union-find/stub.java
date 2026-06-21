import java.util.Arrays;

class Solution {

    static class UnionFind {
        public UnionFind(int n) {
            // TODO
        }

        public int find(int x) {
            // TODO
            return x;
        }

        public void union(int a, int b) {
            // TODO
        }

        public boolean connected(int a, int b) {
            // TODO
            return false;
        }
    }

    public static int numConnectedComponents(int n, int[][] edges) {
        // TODO
        return 0;
    }

    public static int earliestConnectionTime(int n, int[][] connections) {
        // TODO
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(numConnectedComponents(5, new int[][]{{0,1},{1,2},{3,4}})); // 2
        System.out.println(numConnectedComponents(5, new int[][]{{0,1},{1,2},{2,3},{3,4}})); // 1
        System.out.println(earliestConnectionTime(4,
            new int[][]{{20,0,1},{10,0,2},{30,1,3},{25,2,3}})); // 30
    }
}
