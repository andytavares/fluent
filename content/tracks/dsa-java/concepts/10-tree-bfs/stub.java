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

    // Returns node values grouped by depth, top to bottom, left to right.
    public static List<List<Integer>> levelOrder(TreeNode root) {
        // TODO: queue BFS; snapshot queue.size() before draining each level
        // so children pushed mid-level land in the *next* level
        return new ArrayList<>();
    }

    // Returns the rightmost node value at each depth, top to bottom.
    public static List<Integer> rightSideView(TreeNode root) {
        // TODO: same level loop; record only the value drained last in each
        // level (not the right spine — a left-subtree node can be visible)
        return new ArrayList<>();
    }

    // Returns the level order traversal with alternating direction per level.
    public static List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        // TODO: enqueue left-then-right at every depth; reverse the collected
        // level on odd depths (never reorder the queue itself)
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)));
        System.out.println(levelOrder(root));       // [[3],[9,20],[15,7]]
        System.out.println(rightSideView(root));    // [3,20,7]
        System.out.println(zigzagLevelOrder(root)); // [[3],[20,9],[15,7]]
    }
}
