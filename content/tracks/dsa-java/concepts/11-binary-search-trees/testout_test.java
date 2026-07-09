import java.util.ArrayDeque;
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

    // Balanced BST built from a sorted array of values.
    static Solution.TreeNode buildBalanced(int[] values, int lo, int hi) {
        if (lo > hi) return null;
        int mid = (lo + hi) >>> 1;
        Solution.TreeNode node = new Solution.TreeNode(values[mid]);
        node.left = buildBalanced(values, lo, mid - 1);
        node.right = buildBalanced(values, mid + 1, hi);
        return node;
    }

    public static void main(String[] args) {
        // getMinimumDifference
        check("getMinimumDifference: classic example",
              Solution.getMinimumDifference(buildTree(new Integer[]{4, 2, 6, 1, 3})) == 1);
        check("getMinimumDifference: closest pair deep on the right",
              Solution.getMinimumDifference(buildTree(new Integer[]{1, 0, 48, null, null, 12, 49})) == 1);
        check("getMinimumDifference: exactly two nodes",
              Solution.getMinimumDifference(buildTree(new Integer[]{1, null, 5})) == 4);
        check("getMinimumDifference: negative values",
              Solution.getMinimumDifference(buildTree(new Integer[]{0, -3})) == 3);
        check("getMinimumDifference: evenly spaced values",
              Solution.getMinimumDifference(buildTree(new Integer[]{10, 5, 15})) == 5);
        check("getMinimumDifference: closest pair crosses subtrees",
              Solution.getMinimumDifference(buildTree(new Integer[]{5, 3, 8, 1, 4})) == 1);
        {
            int[] values = new int[1023];
            for (int i = 0; i < 1022; i++) values[i] = i * 10;
            values[1022] = 5005;
            java.util.Arrays.sort(values);
            check("getMinimumDifference: 1023-node balanced BST, one tight pair",
                  Solution.getMinimumDifference(buildBalanced(values, 0, values.length - 1)) == 5);
        }

        // kthSmallest
        check("kthSmallest: k = 1 returns the minimum",
              Solution.kthSmallest(buildTree(new Integer[]{3, 1, 4, null, 2}), 1) == 1);
        check("kthSmallest: middle k",
              Solution.kthSmallest(buildTree(new Integer[]{5, 3, 6, 2, 4, null, null, 1}), 3) == 3);
        check("kthSmallest: k = node count returns the maximum",
              Solution.kthSmallest(buildTree(new Integer[]{4, 2, 6, 1, 3}), 5) == 6);
        check("kthSmallest: single-node tree",
              Solution.kthSmallest(buildTree(new Integer[]{7}), 1) == 7);
        check("kthSmallest: left-skewed chain",
              Solution.kthSmallest(buildTree(new Integer[]{3, 2, null, 1}), 2) == 2);
        check("kthSmallest: right-skewed chain",
              Solution.kthSmallest(buildTree(new Integer[]{1, null, 2, null, 3}), 3) == 3);
        {
            int[] values = new int[4095];
            for (int i = 0; i < 4095; i++) values[i] = i * 2 + 1;
            Solution.TreeNode root = buildBalanced(values, 0, values.length - 1);
            check("kthSmallest: 4095-node balanced BST at several ranks",
                  Solution.kthSmallest(root, 1) == 1
                  && Solution.kthSmallest(root, 2048) == 4095
                  && Solution.kthSmallest(root, 4095) == 8189);
        }

        // isValidBST
        check("isValidBST: simple valid tree",
              Solution.isValidBST(buildTree(new Integer[]{2, 1, 3})));
        check("isValidBST: classic invalid tree",
              !Solution.isValidBST(buildTree(new Integer[]{5, 1, 4, null, null, 3, 6})));
        check("isValidBST: violation against an ancestor, not the parent",
              !Solution.isValidBST(buildTree(new Integer[]{5, 4, 6, null, null, 3, 7})));
        check("isValidBST: value in right subtree smaller than the root",
              !Solution.isValidBST(buildTree(new Integer[]{10, 5, 15, null, null, 6, 20})));
        check("isValidBST: value in left subtree larger than the root",
              !Solution.isValidBST(buildTree(new Integer[]{10, 5, 15, 1, 12})));
        check("isValidBST: empty tree is valid", Solution.isValidBST(null));
        check("isValidBST: single node is valid", Solution.isValidBST(buildTree(new Integer[]{1})));
        check("isValidBST: duplicate child is invalid",
              !Solution.isValidBST(buildTree(new Integer[]{2, 2})));
        check("isValidBST: duplicate on the right is invalid too",
              !Solution.isValidBST(buildTree(new Integer[]{2, null, 2})));
        check("isValidBST: larger valid tree",
              Solution.isValidBST(buildTree(new Integer[]{8, 4, 12, 2, 6, 10, 14})));
        check("isValidBST: single node at the 32-bit integer maximum",
              Solution.isValidBST(buildTree(new Integer[]{2147483647})));
        {
            int[] values = new int[2047];
            for (int i = 0; i < 2047; i++) values[i] = i;
            check("isValidBST: 2047-node balanced BST is valid",
                  Solution.isValidBST(buildBalanced(values, 0, values.length - 1)));
        }
        {
            int[] values = new int[2047];
            for (int i = 0; i < 2047; i++) values[i] = i;
            Solution.TreeNode root = buildBalanced(values, 0, values.length - 1);
            Solution.TreeNode node = root;
            while (node.left != null) node = node.left;
            node.val = 999999;
            check("isValidBST: one corrupted leaf deep in a large tree", !Solution.isValidBST(root));
        }

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
