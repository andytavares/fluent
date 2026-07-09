import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

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

    // Perfect binary tree of the given depth; values are heap indexes 1..2^depth-1.
    static Solution.TreeNode buildPerfect(int depth, int index) {
        if (depth == 0) return null;
        Solution.TreeNode node = new Solution.TreeNode(index);
        node.left = buildPerfect(depth - 1, index * 2);
        node.right = buildPerfect(depth - 1, index * 2 + 1);
        return node;
    }

    // Chain of `length` nodes alternating left/right children, values 0..length-1.
    static Solution.TreeNode buildChain(int length) {
        if (length == 0) return null;
        Solution.TreeNode root = new Solution.TreeNode(0);
        Solution.TreeNode node = root;
        for (int v = 1; v < length; v++) {
            Solution.TreeNode child = new Solution.TreeNode(v);
            if (v % 2 == 0) node.left = child;
            else node.right = child;
            node = child;
        }
        return root;
    }

    public static void main(String[] args) {
        // levelOrder
        check("levelOrder: classic three-level tree",
              Solution.levelOrder(buildTree(new Integer[]{3, 9, 20, null, null, 15, 7}))
                  .equals(List.of(List.of(3), List.of(9, 20), List.of(15, 7))));
        check("levelOrder: empty tree returns []", Solution.levelOrder(null).isEmpty());
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
        {
            List<List<Integer>> result = Solution.levelOrder(buildPerfect(10, 1));
            boolean ok = result.size() == 10;
            for (int d = 0; ok && d < 10; d++) {
                List<Integer> expected = new ArrayList<>();
                int base = 1 << d;
                for (int i = 0; i < base; i++) expected.add(base + i);
                ok = result.get(d).equals(expected);
            }
            check("levelOrder: perfect depth-10 tree — every level complete and ordered", ok);
        }
        {
            List<List<Integer>> result = Solution.levelOrder(buildChain(1500));
            check("levelOrder: 1500-node zigzag chain — one value per level",
                  result.size() == 1500
                  && result.get(0).equals(List.of(0))
                  && result.get(1499).equals(List.of(1499))
                  && result.get(777).equals(List.of(777)));
        }

        // rightSideView
        check("rightSideView: classic example",
              Solution.rightSideView(buildTree(new Integer[]{1, 2, 3, null, 5, null, 4}))
                  .equals(List.of(1, 3, 4)));
        check("rightSideView: empty tree returns []", Solution.rightSideView(null).isEmpty());
        check("rightSideView: single node",
              Solution.rightSideView(buildTree(new Integer[]{7})).equals(List.of(7)));
        check("rightSideView: right-only chain",
              Solution.rightSideView(buildTree(new Integer[]{1, null, 3})).equals(List.of(1, 3)));
        check("rightSideView: left-only chain is fully visible",
              Solution.rightSideView(buildTree(new Integer[]{1, 2, null, 3})).equals(List.of(1, 2, 3)));
        check("rightSideView: left-subtree node visible when right side ends",
              Solution.rightSideView(buildTree(new Integer[]{1, 2, 3, 4})).equals(List.of(1, 3, 4)));
        check("rightSideView: view switches between subtrees on the way down",
              Solution.rightSideView(buildTree(new Integer[]{1, 2, 3, null, 4, null, null, 5}))
                  .equals(List.of(1, 3, 4, 5)));
        {
            List<Integer> expected = new ArrayList<>();
            for (int d = 0; d < 10; d++) expected.add((1 << (d + 1)) - 1);
            check("rightSideView: perfect depth-10 tree — rightmost heap indexes",
                  Solution.rightSideView(buildPerfect(10, 1)).equals(expected));
        }
        {
            List<Integer> expected = new ArrayList<>();
            for (int i = 0; i < 1500; i++) expected.add(i);
            check("rightSideView: 1500-node chain shows every value",
                  Solution.rightSideView(buildChain(1500)).equals(expected));
        }

        // zigzagLevelOrder
        check("zigzagLevelOrder: classic three-level tree",
              Solution.zigzagLevelOrder(buildTree(new Integer[]{3, 9, 20, null, null, 15, 7}))
                  .equals(List.of(List.of(3), List.of(20, 9), List.of(15, 7))));
        check("zigzagLevelOrder: empty tree returns []", Solution.zigzagLevelOrder(null).isEmpty());
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
        {
            List<List<Integer>> result = Solution.zigzagLevelOrder(buildPerfect(10, 1));
            boolean ok = result.size() == 10;
            for (int d = 0; ok && d < 10; d++) {
                List<Integer> level = new ArrayList<>();
                int base = 1 << d;
                for (int i = 0; i < base; i++) level.add(base + i);
                if (d % 2 == 1) java.util.Collections.reverse(level);
                ok = result.get(d).equals(level);
            }
            check("zigzagLevelOrder: perfect depth-10 tree — odd levels reversed", ok);
        }

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
