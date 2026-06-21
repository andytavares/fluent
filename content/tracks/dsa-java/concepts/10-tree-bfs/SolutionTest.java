import java.util.List;

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
    }

    static TreeNode build(int... vals) {
        if (vals.length == 0 || vals[0] == -1) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.offer(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode node = q.poll();
            if (i < vals.length && vals[i] != -1) { node.left  = new TreeNode(vals[i]); q.offer(node.left);  }
            i++;
            if (i < vals.length && vals[i] != -1) { node.right = new TreeNode(vals[i]); q.offer(node.right); }
            i++;
        }
        return root;
    }

    public static void main(String[] args) {
        // levelOrder
        check("lo: [3,9,20,-1,-1,15,7]",
              Solution.levelOrder(build(3,9,20,-1,-1,15,7))
                  .equals(List.of(List.of(3), List.of(9,20), List.of(15,7))));
        check("lo: single node",
              Solution.levelOrder(build(1)).equals(List.of(List.of(1))));
        check("lo: null -> []",
              Solution.levelOrder(null).isEmpty());
        check("lo: [1,2,3,4,5]",
              Solution.levelOrder(build(1,2,3,4,5))
                  .equals(List.of(List.of(1), List.of(2,3), List.of(4,5))));
        check("lo: right chain [1,-1,2,-1,3]",
              Solution.levelOrder(build(1,-1,2,-1,3))
                  .equals(List.of(List.of(1), List.of(2), List.of(3))));

        // rightSideView
        check("rsv: [1,2,3,-1,5,-1,4] -> [1,3,4]",
              Solution.rightSideView(build(1,2,3,-1,5,-1,4))
                  .equals(List.of(1,3,4)));
        check("rsv: [1,-1,3] -> [1,3]",
              Solution.rightSideView(build(1,-1,3)).equals(List.of(1,3)));
        check("rsv: null -> []",
              Solution.rightSideView(null).isEmpty());
        check("rsv: single -> [root]",
              Solution.rightSideView(build(5)).equals(List.of(5)));
        check("rsv: [3,9,20,-1,-1,15,7] -> [3,20,7]",
              Solution.rightSideView(build(3,9,20,-1,-1,15,7)).equals(List.of(3,20,7)));
        check("rsv: left-spine [1,2,-1,3] -> [1,2,3]",
              Solution.rightSideView(build(1,2,-1,3)).equals(List.of(1,2,3)));

        // zigzagLevelOrder
        check("zz: [3,9,20,-1,-1,15,7] -> [[3],[20,9],[15,7]]",
              Solution.zigzagLevelOrder(build(3,9,20,-1,-1,15,7))
                  .equals(List.of(List.of(3), List.of(20,9), List.of(15,7))));
        check("zz: null -> []",
              Solution.zigzagLevelOrder(null).isEmpty());
        check("zz: single -> [[root]]",
              Solution.zigzagLevelOrder(build(1)).equals(List.of(List.of(1))));
        check("zz: [1,2,3,4,5] -> [[1],[3,2],[4,5]]",
              Solution.zigzagLevelOrder(build(1,2,3,4,5))
                  .equals(List.of(List.of(1), List.of(3,2), List.of(4,5))));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
