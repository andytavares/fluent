import java.util.ArrayDeque;
import java.util.Deque;

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

    // In-order traversal of a BST is ascending, and the closest pair in a
    // sorted sequence is adjacent — so track only the previously visited
    // value and fold each in-order gap into the running minimum.
    // O(n) time, O(h) stack.
    public static int getMinimumDifference(TreeNode root) {
        int[] best = { Integer.MAX_VALUE };
        Integer[] prev = { null };
        walkMinDiff(root, prev, best);
        return best[0];
    }

    private static void walkMinDiff(TreeNode node, Integer[] prev, int[] best) {
        if (node == null) return;
        walkMinDiff(node.left, prev, best);
        if (prev[0] != null) best[0] = Math.min(best[0], node.val - prev[0]);
        prev[0] = node.val;
        walkMinDiff(node.right, prev, best);
    }

    // Iterative in-order with early exit: slide down the left spine pushing
    // ancestors, pop the next value in sorted order, stop at the k-th pop.
    // Nodes past the k-th are never touched.
    // O(h + k) time, O(h) stack.
    public static int kthSmallest(TreeNode root, int k) {
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode node = root;
        while (node != null || !stack.isEmpty()) {
            while (node != null) {
                stack.push(node);
                node = node.left;
            }
            node = stack.pop();
            k--;
            if (k == 0) return node.val;
            node = node.right;
        }
        return -1; // unreachable when 1 <= k <= node count
    }

    // Range propagation: every value in a subtree must lie strictly inside
    // (lo, hi). Recursing left tightens hi, recursing right tightens lo —
    // that is how a violation several levels below an ancestor is still
    // caught. The <= / >= comparisons reject duplicates. long bounds handle
    // node values at Integer.MIN_VALUE/MAX_VALUE.
    // O(n) time, O(h) stack.
    public static boolean isValidBST(TreeNode root) {
        return valid(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private static boolean valid(TreeNode node, long lo, long hi) {
        if (node == null) return true;
        if (node.val <= lo || node.val >= hi) return false;
        return valid(node.left, lo, node.val) && valid(node.right, node.val, hi);
    }

    public static void main(String[] args) {
        TreeNode bst = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(6));
        System.out.println(getMinimumDifference(bst)); // 1
        System.out.println(kthSmallest(bst, 3));        // 3
        System.out.println(isValidBST(bst));            // true
    }
}
