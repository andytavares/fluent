public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // UnionFind — basic operations
        var uf = new Solution.UnionFind(5);
        check("uf: each node is own component initially", !uf.connected(0, 1));
        uf.union(0, 1);
        check("uf: 0 and 1 connected after union",    uf.connected(0, 1));
        check("uf: 0 and 2 not yet connected",        !uf.connected(0, 2));
        uf.union(1, 2);
        check("uf: 0 and 2 connected transitively",   uf.connected(0, 2));
        check("uf: find(0) == find(2)",                uf.find(0) == uf.find(2));
        uf.union(3, 4);
        check("uf: 3 and 4 connected",                uf.connected(3, 4));
        check("uf: 0 and 3 not connected",            !uf.connected(0, 3));
        uf.union(2, 3);
        check("uf: all nodes connected after full union", uf.connected(0, 4));

        // UnionFind — self-union is a no-op
        var uf2 = new Solution.UnionFind(3);
        uf2.union(0, 0);
        check("uf: self-union leaves find(0) as own root", uf2.find(0) == 0);
        check("uf: self-union does not connect 0 and 1",  !uf2.connected(0, 1));

        // numConnectedComponents
        check("ncc: 5 nodes 2 edges -> 2 components",
              Solution.numConnectedComponents(5, new int[][]{{0,1},{1,2},{3,4}}) == 2);
        check("ncc: 5 nodes, linear chain -> 1 component",
              Solution.numConnectedComponents(5, new int[][]{{0,1},{1,2},{2,3},{3,4}}) == 1);
        check("ncc: no edges -> n components",
              Solution.numConnectedComponents(4, new int[][]{}) == 4);
        check("ncc: single node -> 1 component",
              Solution.numConnectedComponents(1, new int[][]{}) == 1);
        check("ncc: fully connected star -> 1 component",
              Solution.numConnectedComponents(4, new int[][]{{0,1},{0,2},{0,3}}) == 1);
        check("ncc: duplicate edge doesn't reduce count",
              Solution.numConnectedComponents(3, new int[][]{{0,1},{0,1}}) == 2);

        // earliestConnectionTime
        check("ect: 4 nodes -> time 30",
              Solution.earliestConnectionTime(4,
                  new int[][]{{20,0,1},{10,0,2},{30,1,3},{25,2,3}}) == 30);
        check("ect: 2 nodes, 1 connection -> that time",
              Solution.earliestConnectionTime(2, new int[][]{{5,0,1}}) == 5);
        check("ect: connections unsorted -> sort by time internally",
              Solution.earliestConnectionTime(3,
                  new int[][]{{100,1,2},{50,0,1},{75,0,2}}) == 75);
        check("ect: impossible (graph is disconnected) -> -1",
              Solution.earliestConnectionTime(4, new int[][]{{1,0,1},{2,2,3}}) == -1);
        check("ect: redundant edges -> picks minimum spanning time",
              Solution.earliestConnectionTime(3,
                  new int[][]{{1,0,1},{2,1,2},{100,0,2}}) == 2);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
