public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
        TreeNode(int val, TreeNode left, TreeNode right) {
            this.val = val; this.left = left; this.right = right;
        }
    }

    //       5
    //      / \
    //     3   7
    //    / \ / \
    //   2  4 6  8
    static TreeNode validBST() {
        return new TreeNode(5,
            new TreeNode(3, new TreeNode(2), new TreeNode(4)),
            new TreeNode(7, new TreeNode(6), new TreeNode(8)));
    }

    // Collect inorder values to verify a BST is structurally correct
    static java.util.List<Integer> inorder(TreeNode root) {
        var result = new java.util.ArrayList<Integer>();
        java.util.Deque<TreeNode> stack = new java.util.ArrayDeque<>();
        TreeNode curr = root;
        while (curr != null || !stack.isEmpty()) {
            while (curr != null) { stack.push(curr); curr = curr.left; }
            curr = stack.pop(); result.add(curr.val); curr = curr.right;
        }
        return result;
    }

    public static void main(String[] args) {
        // isValidBST
        check("validBST: correct tree -> true",    Solution.isValidBST(validBST()));
        check("validBST: null -> true",             Solution.isValidBST(null));
        check("validBST: single node -> true",      Solution.isValidBST(new TreeNode(1)));
        check("validBST: [5,1,4] -> false",
              !Solution.isValidBST(new TreeNode(5, new TreeNode(1), new TreeNode(4))));
        check("validBST: deep violation [5,3,7] with 3.right=7 -> false",
              !Solution.isValidBST(new TreeNode(5,
                  new TreeNode(3, null, new TreeNode(7)), new TreeNode(7))));
        check("validBST: Integer.MAX_VALUE node -> true",
              Solution.isValidBST(new TreeNode(Integer.MAX_VALUE)));
        check("validBST: Integer.MIN_VALUE node -> true",
              Solution.isValidBST(new TreeNode(Integer.MIN_VALUE)));

        // kthSmallest — inorder of validBST() is [2,3,4,5,6,7,8]
        check("kth: k=1 -> 2", Solution.kthSmallest(validBST(), 1) == 2);
        check("kth: k=3 -> 4", Solution.kthSmallest(validBST(), 3) == 4);
        check("kth: k=4 -> 5", Solution.kthSmallest(validBST(), 4) == 5);
        check("kth: k=7 -> 8", Solution.kthSmallest(validBST(), 7) == 8);
        check("kth: single node k=1 -> 42",
              Solution.kthSmallest(new TreeNode(42), 1) == 42);

        // buildBSTFromPreorder
        // Preorder [8,5,1,7,10,12] should give inorder [1,5,7,8,10,12]
        TreeNode bst1 = Solution.buildBSTFromPreorder(new int[]{8,5,1,7,10,12});
        check("buildBST: root is 8", bst1 != null && bst1.val == 8);
        check("buildBST: inorder is sorted",
              inorder(bst1).equals(java.util.List.of(1,5,7,8,10,12)));

        TreeNode bst2 = Solution.buildBSTFromPreorder(new int[]{1,3});
        check("buildBST: [1,3] -> root=1, right=3",
              bst2 != null && bst2.val == 1 && bst2.right != null && bst2.right.val == 3);

        TreeNode bst3 = Solution.buildBSTFromPreorder(new int[]{5});
        check("buildBST: single -> root=5, no children",
              bst3 != null && bst3.val == 5 && bst3.left == null && bst3.right == null);

        // Verify BST property of built tree
        check("buildBST: isValidBST on result", Solution.isValidBST(bst1));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
