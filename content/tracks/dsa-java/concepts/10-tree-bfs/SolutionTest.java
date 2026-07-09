import java.util.ArrayDeque;
import java.util.List;
import java.util.Queue;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    // Builds a tree from a level-order array; null marks an absent child
    // (children of absent nodes are omitted).
    static Solution.TreeNode buildTree(Integer[] values) {
        if (values.length == 0 || values[0] == null) return null;
        Solution.TreeNode root = new Solution.TreeNode(values[0]);
        Queue<Solution.TreeNode> queue = new ArrayDeque<>();
        queue.offer(root);
        int i = 1;
        while (!queue.isEmpty() && i < values.length) {
            Solution.TreeNode node = queue.poll();
            if (i < values.length) {
                Integer v = values[i++];
                if (v != null) {
                    node.left = new Solution.TreeNode(v);
                    queue.offer(node.left);
                }
            }
            if (i < values.length) {
                Integer v = values[i++];
                if (v != null) {
                    node.right = new Solution.TreeNode(v);
                    queue.offer(node.right);
                }
            }
        }
        return root;
    }

    public static void main(String[] args) {
        // levelOrder
        check("levelOrder: classic three-level tree",
              Solution.levelOrder(buildTree(new Integer[]{3, 9, 20, null, null, 15, 7}))
                  .equals(List.of(List.of(3), List.of(9, 20), List.of(15, 7))));
        check("levelOrder: empty tree returns []",
              Solution.levelOrder(null).isEmpty());
        check("levelOrder: single node",
              Solution.levelOrder(buildTree(new Integer[]{1})).equals(List.of(List.of(1))));
        check("levelOrder: left-skewed chain — one node per level",
              Solution.levelOrder(buildTree(new Integer[]{1, 2, null, 3}))
                  .equals(List.of(List.of(1), List.of(2), List.of(3))));
        check("levelOrder: right-skewed chain",
              Solution.levelOrder(buildTree(new Integer[]{1, null, 2, null, 3}))
                  .equals(List.of(List.of(1), List.of(2), List.of(3))));
        check("levelOrder: negative values",
              Solution.levelOrder(buildTree(new Integer[]{-1, -2, -3}))
                  .equals(List.of(List.of(-1), List.of(-2, -3))));
        check("levelOrder: full three-level tree keeps left-to-right order",
              Solution.levelOrder(buildTree(new Integer[]{1, 2, 3, 4, 5, 6, 7}))
                  .equals(List.of(List.of(1), List.of(2, 3), List.of(4, 5, 6, 7))));

        // rightSideView
        check("rightSideView: classic example",
              Solution.rightSideView(buildTree(new Integer[]{1, 2, 3, null, 5, null, 4}))
                  .equals(List.of(1, 3, 4)));
        check("rightSideView: empty tree returns []",
              Solution.rightSideView(null).isEmpty());
        check("rightSideView: single node",
              Solution.rightSideView(buildTree(new Integer[]{7})).equals(List.of(7)));
        check("rightSideView: right-only chain",
              Solution.rightSideView(buildTree(new Integer[]{1, null, 3})).equals(List.of(1, 3)));
        check("rightSideView: left-only chain is fully visible",
              Solution.rightSideView(buildTree(new Integer[]{1, 2, null, 3})).equals(List.of(1, 2, 3)));
        check("rightSideView: left-subtree node visible when right side ends",
              Solution.rightSideView(buildTree(new Integer[]{1, 2, 3, 4})).equals(List.of(1, 3, 4)));

        // zigzagLevelOrder
        check("zigzagLevelOrder: classic three-level tree",
              Solution.zigzagLevelOrder(buildTree(new Integer[]{3, 9, 20, null, null, 15, 7}))
                  .equals(List.of(List.of(3), List.of(20, 9), List.of(15, 7))));
        check("zigzagLevelOrder: empty tree returns []",
              Solution.zigzagLevelOrder(null).isEmpty());
        check("zigzagLevelOrder: single node",
              Solution.zigzagLevelOrder(buildTree(new Integer[]{1})).equals(List.of(List.of(1))));
        check("zigzagLevelOrder: full three-level tree",
              Solution.zigzagLevelOrder(buildTree(new Integer[]{1, 2, 3, 4, 5, 6, 7}))
                  .equals(List.of(List.of(1), List.of(3, 2), List.of(4, 5, 6, 7))));
        check("zigzagLevelOrder: four levels flip direction twice",
              Solution.zigzagLevelOrder(buildTree(new Integer[]{1, 2, 3, 4, null, null, 5, 6, null, null, 7}))
                  .equals(List.of(List.of(1), List.of(3, 2), List.of(4, 5), List.of(7, 6))));
        check("zigzagLevelOrder: single-node levels are unaffected by direction",
              Solution.zigzagLevelOrder(buildTree(new Integer[]{1, 2, null, 3}))
                  .equals(List.of(List.of(1), List.of(2), List.of(3))));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
