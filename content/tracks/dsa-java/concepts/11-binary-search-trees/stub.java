class Solution {

    // Every tree node has a value and two child pointers; missing children
    // are null, and an empty tree is null itself.
    // BST invariant: for every node, ALL left-subtree values < node.val <
    // ALL right-subtree values (strict — duplicates are invalid).
    static class TreeNode {
        int val;
        TreeNode left;
        TreeNode right;
        TreeNode(int val) { this.val = val; }
        TreeNode(int val, TreeNode left, TreeNode right) {
            this.val = val;
            this.left = left;
            this.right = right;
        }
    }

    // root is a valid BST with at least two nodes.
    // Returns the smallest absolute difference between any two node values.
    public static int getMinimumDifference(TreeNode root) {
        // TODO: in-order traversal with a prev tracker — the closest pair in
        // a sorted sequence is adjacent, so compare each value only to prev
        return 0;
    }

    // root is a valid BST; 1 <= k <= number of nodes.
    // Returns the k-th smallest value in the BST.
    public static int kthSmallest(TreeNode root, int k) {
        // TODO: iterative in-order with an explicit Deque<TreeNode> stack;
        // slide left, pop, decrement k — return the popped value at k == 0
        return 0;
    }

    // Returns true if the tree satisfies the BST invariant.
    public static boolean isValidBST(TreeNode root) {
        // TODO: propagate (lo, hi) bounds — left tightens hi, right tightens
        // lo; checking only parent vs child misses violations against an
        // ancestor. Use long bounds to accommodate Integer.MIN/MAX_VALUE.
        return false;
    }

    public static void main(String[] args) {
        TreeNode bst = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(6));
        System.out.println(getMinimumDifference(bst)); // 1
        System.out.println(kthSmallest(bst, 3));        // 3
        System.out.println(isValidBST(bst));            // true
    }
}
