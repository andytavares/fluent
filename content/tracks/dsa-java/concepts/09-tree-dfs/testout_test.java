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

    // ArrayDeque rejects null elements, so a plain ArrayList with a head
    // index stands in as the queue here (it needs to hold nulls).
    static List<Integer> treeToArray(Solution.TreeNode root) {
        List<Integer> out = new ArrayList<>();
        if (root == null) return out;
        List<Solution.TreeNode> queue = new ArrayList<>();
        queue.add(root);
        int head = 0;
        while (head < queue.size()) {
            Solution.TreeNode node = queue.get(head++);
            if (node == null) {
                out.add(null);
                continue;
            }
            out.add(node.val);
            queue.add(node.left);
            queue.add(node.right);
        }
        while (!out.isEmpty() && out.get(out.size() - 1) == null) out.remove(out.size() - 1);
        return out;
    }

    static Solution.TreeNode leftChain(int n) {
        Solution.TreeNode root = null;
        for (int v = n; v >= 1; v--) {
            Solution.TreeNode node = new Solution.TreeNode(v);
            node.left = root;
            root = node;
        }
        return root;
    }

    static Solution.TreeNode perfectTree(int depth, int val) {
        if (depth == 0) return null;
        Solution.TreeNode node = new Solution.TreeNode(val);
        node.left = perfectTree(depth - 1, val);
        node.right = perfectTree(depth - 1, val);
        return node;
    }

    public static void main(String[] args) {
        // maxDepth
        check("maxDepth: classic tree",
              Solution.maxDepth(buildTree(new Integer[]{3, 9, 20, null, null, 15, 7})) == 3);
        check("maxDepth: empty tree", Solution.maxDepth(null) == 0);
        check("maxDepth: single node", Solution.maxDepth(buildTree(new Integer[]{1})) == 1);
        check("maxDepth: right-skewed chain",
              Solution.maxDepth(buildTree(new Integer[]{1, null, 2, null, 3})) == 3);
        check("maxDepth: left-skewed chain",
              Solution.maxDepth(buildTree(new Integer[]{1, 2, null, 3, null, 4})) == 4);
        check("maxDepth: deeper branch on one side",
              Solution.maxDepth(buildTree(new Integer[]{1, 2, 2, 3, null, null, 3, 4})) == 4);
        check("maxDepth: 2000-node skewed chain", Solution.maxDepth(leftChain(2000)) == 2000);
        check("maxDepth: perfect tree of depth 12", Solution.maxDepth(perfectTree(12, 7)) == 12);

        // isSameTree
        check("isSameTree: identical trees",
              Solution.isSameTree(buildTree(new Integer[]{1, 2, 3}), buildTree(new Integer[]{1, 2, 3})));
        check("isSameTree: mirrored shape, same values",
              !Solution.isSameTree(buildTree(new Integer[]{1, 2}), buildTree(new Integer[]{1, null, 2})));
        check("isSameTree: same shape, swapped values",
              !Solution.isSameTree(buildTree(new Integer[]{1, 2, 1}), buildTree(new Integer[]{1, 1, 2})));
        check("isSameTree: both empty", Solution.isSameTree(null, null));
        check("isSameTree: one empty",
              !Solution.isSameTree(buildTree(new Integer[]{1}), null)
              && !Solution.isSameTree(null, buildTree(new Integer[]{1})));
        check("isSameTree: equal multi-level trees",
              Solution.isSameTree(buildTree(new Integer[]{5, 4, 8, 11, null, 13, 4}),
                                   buildTree(new Integer[]{5, 4, 8, 11, null, 13, 4})));
        check("isSameTree: differ at a deep leaf",
              !Solution.isSameTree(buildTree(new Integer[]{5, 4, 8, 11, null, 13, 4}),
                                    buildTree(new Integer[]{5, 4, 8, 11, null, 13, 99})));
        check("isSameTree: equal perfect trees of depth 12",
              Solution.isSameTree(perfectTree(12, 3), perfectTree(12, 3)));
        {
            Solution.TreeNode a = perfectTree(12, 3);
            Solution.TreeNode b = perfectTree(12, 3);
            Solution.TreeNode node = b;
            while (node.right != null) node = node.right;
            node.val = 4;
            check("isSameTree: large trees differing at one deep leaf", !Solution.isSameTree(a, b));
        }
        check("isSameTree: extra node deep in one tree",
              !Solution.isSameTree(leftChain(500), leftChain(501)));

        // invertTree
        check("invertTree: classic full tree",
              treeToArray(Solution.invertTree(buildTree(new Integer[]{4, 2, 7, 1, 3, 6, 9})))
                  .equals(List.of(4, 7, 2, 9, 6, 3, 1)));
        check("invertTree: empty tree", Solution.invertTree(null) == null);
        check("invertTree: single node",
              treeToArray(Solution.invertTree(buildTree(new Integer[]{1}))).equals(List.of(1)));
        check("invertTree: three nodes",
              treeToArray(Solution.invertTree(buildTree(new Integer[]{2, 1, 3}))).equals(List.of(2, 3, 1)));
        {
            List<Integer> expected = new ArrayList<>();
            expected.add(1); expected.add(null); expected.add(2);
            check("invertTree: lone left child moves right",
                  treeToArray(Solution.invertTree(buildTree(new Integer[]{1, 2}))).equals(expected));
        }
        check("invertTree: lone right child moves left",
              treeToArray(Solution.invertTree(buildTree(new Integer[]{1, null, 2}))).equals(List.of(1, 2)));
        {
            Solution.TreeNode root = buildTree(new Integer[]{4, 2, 7});
            Solution.TreeNode result = Solution.invertTree(root);
            check("invertTree: mutates in place and returns the same root",
                  result == root && treeToArray(root).equals(List.of(4, 7, 2)));
        }
        {
            Integer[] values = {5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1};
            Solution.TreeNode root = buildTree(values);
            Solution.invertTree(Solution.invertTree(root));
            List<Integer> expected = new ArrayList<>();
            for (Integer v : values) expected.add(v);
            check("invertTree: inverting twice restores the tree", treeToArray(root).equals(expected));
        }
        {
            Solution.TreeNode root = Solution.invertTree(leftChain(1500));
            Solution.TreeNode node = root;
            int count = 0;
            boolean allLeftNull = true;
            while (node != null) {
                if (node.left != null) allLeftNull = false;
                count++;
                node = node.right;
            }
            check("invertTree: 1500-node skewed chain flips side", allLeftNull && count == 1500);
        }

        // hasPathSum
        check("hasPathSum: classic tree, target 22",
              Solution.hasPathSum(buildTree(new Integer[]{5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1}), 22));
        check("hasPathSum: no path hits the target",
              !Solution.hasPathSum(buildTree(new Integer[]{1, 2, 3}), 5));
        check("hasPathSum: empty tree, target 0", !Solution.hasPathSum(null, 0));
        check("hasPathSum: partial path does not count (1 is not a leaf)",
              !Solution.hasPathSum(buildTree(new Integer[]{1, 2}), 1));
        check("hasPathSum: path through a one-child node",
              Solution.hasPathSum(buildTree(new Integer[]{1, 2}), 3));
        check("hasPathSum: single node equals target",
              Solution.hasPathSum(buildTree(new Integer[]{1}), 1));
        check("hasPathSum: single node misses target",
              !Solution.hasPathSum(buildTree(new Integer[]{1}), 0));
        check("hasPathSum: negative values reach a negative target",
              Solution.hasPathSum(buildTree(new Integer[]{1, -2, -3, 1, 3, -2, null, -1}), -1));
        check("hasPathSum: all-negative chain",
              Solution.hasPathSum(buildTree(new Integer[]{-2, null, -3}), -5));
        {
            Solution.TreeNode root = leftChain(2000);
            check("hasPathSum: 2000-node chain, full-path sum",
                  Solution.hasPathSum(root, (2000 * 2001) / 2));
        }
        {
            Solution.TreeNode root = leftChain(2000);
            check("hasPathSum: 2000-node chain, prefix sum is not a path",
                  !Solution.hasPathSum(root, 1));
        }

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
