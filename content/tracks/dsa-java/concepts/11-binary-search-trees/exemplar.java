import java.util.ArrayDeque;

class Solution {

    // TreeNode is defined in SolutionTest.java — used here directly.

    public static boolean isValidBST(TreeNode root) {
        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private static boolean validate(TreeNode node, long min, long max) {
        if (node == null) return true;
        if (node.val <= min || node.val >= max) return false;
        return validate(node.left,  min,      node.val)
            && validate(node.right, node.val, max);
    }

    public static int kthSmallest(TreeNode root, int k) {
        var stack = new ArrayDeque<TreeNode>();
        TreeNode curr = root;
        int count = 0;
        while (curr != null || !stack.isEmpty()) {
            while (curr != null) { stack.push(curr); curr = curr.left; }
            curr = stack.pop();
            if (++count == k) return curr.val;
            curr = curr.right;
        }
        return -1;
    }

    public static TreeNode buildBSTFromPreorder(int[] preorder) {
        int[] index = {0};
        return build(preorder, index, Integer.MIN_VALUE, Integer.MAX_VALUE);
    }

    private static TreeNode build(int[] pre, int[] idx, int min, int max) {
        if (idx[0] == pre.length) return null;
        int val = pre[idx[0]];
        if (val <= min || val >= max) return null;
        idx[0]++;
        TreeNode node = new TreeNode(val);
        node.left  = build(pre, idx, min, val);
        node.right = build(pre, idx, val, max);
        return node;
    }
}
