import java.util.Arrays;

class Solution {

    static class UnionFind {
        private final int[] parent;
        private final int[] rank;

        public UnionFind(int n) {
            parent = new int[n];
            rank   = new int[n];
            for (int i = 0; i < n; i++) parent[i] = i;
        }

        public int find(int x) {
            if (parent[x] != x) parent[x] = find(parent[x]); // path compression
            return parent[x];
        }

        public void union(int a, int b) {
            int rootA = find(a), rootB = find(b);
            if (rootA == rootB) return;
            // union by rank: attach smaller tree under larger tree
            if (rank[rootA] < rank[rootB]) { int tmp = rootA; rootA = rootB; rootB = tmp; }
            parent[rootB] = rootA;
            if (rank[rootA] == rank[rootB]) rank[rootA]++;
        }

        public boolean connected(int a, int b) {
            return find(a) == find(b);
        }
    }

    public static int numConnectedComponents(int n, int[][] edges) {
        var uf = new UnionFind(n);
        int components = n;
        for (int[] edge : edges) {
            if (uf.find(edge[0]) != uf.find(edge[1])) {
                uf.union(edge[0], edge[1]);
                components--;
            }
        }
        return components;
    }

    public static int earliestConnectionTime(int n, int[][] connections) {
        // connections[i] = [time, node1, node2]
        Arrays.sort(connections, (a, b) -> a[0] - b[0]);
        var uf = new UnionFind(n);
        int components = n;
        for (int[] conn : connections) {
            if (!uf.connected(conn[1], conn[2])) {
                uf.union(conn[1], conn[2]);
                components--;
                if (components == 1) return conn[0];
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(numConnectedComponents(5, new int[][]{{0,1},{1,2},{3,4}})); // 2
        System.out.println(numConnectedComponents(5, new int[][]{{0,1},{1,2},{2,3},{3,4}})); // 1
        System.out.println(earliestConnectionTime(4,
            new int[][]{{20,0,1},{10,0,2},{30,1,3},{25,2,3}})); // 30
    }
}
