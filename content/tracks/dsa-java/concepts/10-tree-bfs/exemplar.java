import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

class Solution {

    // TreeNode is defined in SolutionTest.java — used here directly.

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
                if (node.left  != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(level);
        }
        return result;
    }

    public static List<Integer> rightSideView(TreeNode root) {
        var result = new ArrayList<Integer>();
        if (root == null) return result;

        var queue = new ArrayDeque<TreeNode>();
        queue.offer(root);

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                if (i == levelSize - 1) result.add(node.val);
                if (node.left  != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
        }
        return result;
    }

    public static List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        var result = new ArrayList<List<Integer>>();
        if (root == null) return result;

        var queue = new ArrayDeque<TreeNode>();
        queue.offer(root);
        boolean leftToRight = true;

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            var level = new ArrayDeque<Integer>();
            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                if (leftToRight) level.addLast(node.val);
                else             level.addFirst(node.val);
                if (node.left  != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(new ArrayList<>(level));
            leftToRight = !leftToRight;
        }
        return result;
    }
}
