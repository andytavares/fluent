import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

class Solution {

    // Every tree node has a value and two child pointers; missing children
    // are null, and an empty tree is null itself.
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

    // BFS with an ArrayDeque queue. levelSize snapshots queue.size() before
    // draining, so children enqueued mid-level always belong to the next one.
    // O(n) time, O(w) space where w is the widest level.
    public static List<List<Integer>> levelOrder(TreeNode root) {
        var result = new ArrayList<List<Integer>>();
        if (root == null) return result;

        var queue = new ArrayDeque<TreeNode>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            var level = new ArrayList<Integer>();
            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(level);
        }
        return result;
    }

    // Rightmost node per level: same level loop, but only the last node
    // drained from each level is recorded. Enqueue order is left-to-right,
    // so the last node of a level is its rightmost — even in a left subtree.
    // O(n) time, O(w) space.
    public static List<Integer> rightSideView(TreeNode root) {
        var result = new ArrayList<Integer>();
        if (root == null) return result;

        var queue = new ArrayDeque<TreeNode>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                if (i == levelSize - 1) result.add(node.val); // last of this level
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
        }
        return result;
    }

    // Zigzag is a presentation change, not a traversal change: children are
    // always enqueued left-then-right, and only the collected level is
    // reversed on odd depths.
    // O(n) time, O(w) space.
    public static List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        var result = new ArrayList<List<Integer>>();
        if (root == null) return result;

        var queue = new ArrayDeque<TreeNode>();
        queue.offer(root);
        boolean leftToRight = true;

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            var level = new ArrayList<Integer>();
            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            if (!leftToRight) java.util.Collections.reverse(level);
            result.add(level);
            leftToRight = !leftToRight;
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)));
        System.out.println(levelOrder(root));       // [[3],[9,20],[15,7]]
        System.out.println(rightSideView(root));    // [3,20,7]
        System.out.println(zigzagLevelOrder(root)); // [[3],[20,9],[15,7]]
    }
}
