class Solution {

    // Every tree node has a value and two child pointers; missing children
    // are null, and an empty tree is null itself.
    static class TreeNode {
        int val;
        TreeNode left;
        TreeNode right;
        TreeNode() {}
        TreeNode(int val) { this.val = val; }
        TreeNode(int val, TreeNode left, TreeNode right) {
            this.val = val;
            this.left = left;
            this.right = right;
        }
    }

    // Returns the number of nodes on the longest root-to-leaf path.
    public static int maxDepth(TreeNode root) {
        // TODO: bottom-up — null is 0; otherwise 1 + max of the children's depths
        return 0;
    }

    // Returns true if p and q are structurally identical with equal values.
    public static boolean isSameTree(TreeNode p, TreeNode q) {
        // TODO: lockstep — both null true; one null false; compare vals,
        // then recurse on (p.left, q.left) and (p.right, q.right)
        return false;
    }

    // Mirrors the tree in place (swaps every node's children). Returns the root.
    public static TreeNode invertTree(TreeNode root) {
        // TODO: swap root.left and root.right (use a temp!), recurse into both,
        // return root
        return null;
    }

    // Returns true if some root-to-leaf path sums exactly to targetSum.
    public static boolean hasPathSum(TreeNode root, int targetSum) {
        // TODO: top-down — null is false; at a leaf (no children) compare
        // targetSum == root.val; otherwise recurse with targetSum - root.val
        return false;
    }

    public static void main(String[] args) {
        TreeNode t = new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)));
        System.out.println(maxDepth(t)); // 3
        System.out.println(isSameTree(new TreeNode(1, new TreeNode(2), new TreeNode(3)),
                                       new TreeNode(1, new TreeNode(2), new TreeNode(3)))); // true
        System.out.println(hasPathSum(new TreeNode(1, new TreeNode(2), new TreeNode(3)), 4)); // true (1 -> 3)
    }
}
