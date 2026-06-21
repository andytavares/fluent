public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
        TreeNode(int val, TreeNode left, TreeNode right) {
            this.val = val; this.left = left; this.right = right;
        }
    }

    // Build a complete binary tree from level-order values; -1 means null
    static TreeNode build(int... vals) {
        if (vals.length == 0 || vals[0] == -1) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.offer(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode node = q.poll();
            if (i < vals.length && vals[i] != -1) { node.left  = new TreeNode(vals[i]); q.offer(node.left);  }
            i++;
            if (i < vals.length && vals[i] != -1) { node.right = new TreeNode(vals[i]); q.offer(node.right); }
            i++;
        }
        return root;
    }

    public static void main(String[] args) {
        // maxDepth
        check("depth: [3,9,20,-1,-1,15,7] -> 3",
              Solution.maxDepth(build(3,9,20,-1,-1,15,7)) == 3);
        check("depth: [1,2,3,4,5] -> 3",
              Solution.maxDepth(build(1,2,3,4,5)) == 3);
        check("depth: null -> 0",   Solution.maxDepth(null) == 0);
        check("depth: single -> 1", Solution.maxDepth(build(1)) == 1);
        check("depth: left-chain [1,2,-1,3] -> 3",
              Solution.maxDepth(build(1,2,-1,3)) == 3);

        // hasPathSum
        TreeNode pathTree = build(5,4,8,11,-1,13,4,7,2,-1,-1,-1,-1,-1,1);
        check("pathSum: 22 exists",           Solution.hasPathSum(pathTree, 22));
        check("pathSum: 26 exists",           Solution.hasPathSum(pathTree, 26));
        check("pathSum: 18 does not exist",   !Solution.hasPathSum(pathTree, 18));
        check("pathSum: null root -> false",  !Solution.hasPathSum(null, 0));
        check("pathSum: leaf matches target", Solution.hasPathSum(build(7), 7));
        check("pathSum: leaf misses target",  !Solution.hasPathSum(build(7), 5));

        // lowestCommonAncestor — use actual node references
        TreeNode n2  = new TreeNode(2);
        TreeNode n4  = new TreeNode(4);
        TreeNode n5  = new TreeNode(5);
        TreeNode n6  = new TreeNode(6);
        TreeNode n7  = new TreeNode(7);
        TreeNode n8  = new TreeNode(8);
        TreeNode n9  = new TreeNode(9);
        // Tree structure:
        //          6
        //         / \
        //        2   8
        //       / \ / \
        //      0  4 7  9
        //        / \
        //       3   5
        TreeNode n0 = new TreeNode(0);
        TreeNode n3 = new TreeNode(3);
        n4.left = n3; n4.right = n5;
        n2.left = n0; n2.right = n4;
        n8.left = n7; n8.right = n9;
        n6.left = n2; n6.right = n8;

        check("lca: 2 and 8 -> 6 (root)",
              Solution.lowestCommonAncestor(n6, n2, n8) == n6);
        check("lca: 2 and 4 -> 2",
              Solution.lowestCommonAncestor(n6, n2, n4) == n2);
        check("lca: 3 and 5 -> 4",
              Solution.lowestCommonAncestor(n6, n3, n5) == n4);
        check("lca: 7 and 9 -> 8",
              Solution.lowestCommonAncestor(n6, n7, n9) == n8);
        check("lca: single node is own LCA",
              Solution.lowestCommonAncestor(n6, n6, n2) == n6);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
