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

    // Bottom-up: each call answers for its whole subtree; null anchors at 0.
    // O(n) time, O(h) space.
    public static int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }

    // Lockstep recursion on a pair of nodes; the null combinations come first,
    // and && short-circuits on the first mismatch.
    // O(min(m, n)) time, O(h) space.
    public static boolean isSameTree(TreeNode p, TreeNode q) {
        if (p == null && q == null) return true;
        if (p == null || q == null) return false;
        return p.val == q.val
            && isSameTree(p.left, q.left)
            && isSameTree(p.right, q.right);
    }

    // Mirrors the tree in place (swaps every node's children). Returns the root.
    // One swap per node.
    // O(n) time, O(h) space.
    public static TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode temp = root.left;
        root.left = root.right;
        root.right = temp;
        invertTree(root.left);
        invertTree(root.right);
        return root;
    }

    // Top-down: subtract while descending; decide only at a real leaf.
    // The null case doubles as "an empty tree has no paths".
    // O(n) time, O(h) space.
    public static boolean hasPathSum(TreeNode root, int targetSum) {
        if (root == null) return false;
        if (root.left == null && root.right == null) return targetSum == root.val;
        return hasPathSum(root.left, targetSum - root.val)
            || hasPathSum(root.right, targetSum - root.val);
    }

    public static void main(String[] args) {
        TreeNode t = new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)));
        System.out.println(maxDepth(t)); // 3
        System.out.println(isSameTree(new TreeNode(1, new TreeNode(2), new TreeNode(3)),
                                       new TreeNode(1, new TreeNode(2), new TreeNode(3)))); // true
        System.out.println(hasPathSum(new TreeNode(1, new TreeNode(2), new TreeNode(3)), 4)); // true (1 -> 3)
    }
}
