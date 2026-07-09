import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static Solution.ListNode fromArray(int... values) {
        Solution.ListNode dummy = new Solution.ListNode(0);
        Solution.ListNode tail = dummy;
        for (int v : values) {
            tail.next = new Solution.ListNode(v);
            tail = tail.next;
        }
        return dummy.next;
    }

    static Solution.ListNode fromList(List<Integer> values) {
        Solution.ListNode dummy = new Solution.ListNode(0);
        Solution.ListNode tail = dummy;
        for (int v : values) {
            tail.next = new Solution.ListNode(v);
            tail = tail.next;
        }
        return dummy.next;
    }

    static List<Integer> toArray(Solution.ListNode head) {
        List<Integer> out = new ArrayList<>();
        for (Solution.ListNode n = head; n != null; n = n.next) out.add(n.val);
        return out;
    }

    static Set<Solution.ListNode> collectNodes(Solution.ListNode head) {
        var set = new HashSet<Solution.ListNode>();
        for (Solution.ListNode n = head; n != null; n = n.next) set.add(n);
        return set;
    }

    static boolean reusesNodes(Solution.ListNode head, Set<Solution.ListNode> allowed) {
        int count = 0;
        for (Solution.ListNode n = head; n != null; n = n.next) {
            if (!allowed.contains(n)) return false;
            count++;
        }
        return count == allowed.size();
    }

    static void inorder(Solution.TreeNode root, List<Integer> out) {
        if (root == null) return;
        inorder(root.left, out);
        out.add(root.val);
        inorder(root.right, out);
    }

    static int balancedHeight(Solution.TreeNode root) {
        if (root == null) return 0;
        int l = balancedHeight(root.left);
        if (l == -1) return -1;
        int r = balancedHeight(root.right);
        if (r == -1) return -1;
        if (Math.abs(l - r) > 1) return -1;
        return Math.max(l, r) + 1;
    }

    static boolean isBalancedBST(Solution.TreeNode root, List<Integer> sortedValues) {
        List<Integer> in = new ArrayList<>();
        inorder(root, in);
        return in.equals(sortedValues) && balancedHeight(root) != -1;
    }

    // Deterministic shuffle (Park-Miller LCG Fisher-Yates), matching the JS suite.
    static List<Integer> shuffled(List<Integer> values) {
        List<Integer> arr = new ArrayList<>(values);
        long x = 42;
        for (int i = arr.size() - 1; i > 0; i--) {
            x = (x * 48271) % 2147483647;
            int j = (int) (x % (i + 1));
            Collections.swap(arr, i, j);
        }
        return arr;
    }

    public static void main(String[] args) {
        // sortedArrayToBST
        check("sortedArrayToBST: empty array returns null",
              Solution.sortedArrayToBST(new int[]{}) == null);
        {
            Solution.TreeNode root = Solution.sortedArrayToBST(new int[]{7});
            check("sortedArrayToBST: single element is a leaf",
                  root.val == 7 && root.left == null && root.right == null);
        }
        check("sortedArrayToBST: two elements",
              isBalancedBST(Solution.sortedArrayToBST(new int[]{1, 2}), List.of(1, 2)));
        check("sortedArrayToBST: three elements",
              isBalancedBST(Solution.sortedArrayToBST(new int[]{1, 2, 3}), List.of(1, 2, 3)));
        check("sortedArrayToBST: classic [-10,-3,0,5,9]",
              isBalancedBST(Solution.sortedArrayToBST(new int[]{-10, -3, 0, 5, 9}),
                             List.of(-10, -3, 0, 5, 9)));
        {
            int[] nums = new int[15];
            List<Integer> expected = new ArrayList<>();
            for (int i = 0; i < 15; i++) { nums[i] = i + 1; expected.add(i + 1); }
            check("sortedArrayToBST: 15 elements build a balanced tree",
                  isBalancedBST(Solution.sortedArrayToBST(nums), expected));
        }
        {
            int[] nums = new int[100];
            List<Integer> expected = new ArrayList<>();
            for (int i = 0; i < 100; i++) { nums[i] = i * 3 - 50; expected.add(nums[i]); }
            Solution.TreeNode root = Solution.sortedArrayToBST(nums);
            check("sortedArrayToBST: 100 elements — unbalanced insertion would fail here",
                  isBalancedBST(root, expected) && balancedHeight(root) <= 9);
        }
        {
            int[] nums = new int[1023];
            List<Integer> expected = new ArrayList<>();
            for (int i = 0; i < 1023; i++) { nums[i] = i; expected.add(i); }
            Solution.TreeNode root = Solution.sortedArrayToBST(nums);
            int h = balancedHeight(root);
            check("sortedArrayToBST: 1023 elements stay balanced and logarithmic",
                  isBalancedBST(root, expected) && h >= 10 && h <= 14);
        }

        // sortList
        check("sortList: null returns null", Solution.sortList(null) == null);
        {
            Solution.ListNode head = fromArray(5);
            Solution.ListNode sorted = Solution.sortList(head);
            check("sortList: single node returned as-is",
                  sorted == head && toArray(sorted).equals(List.of(5)));
        }
        check("sortList: two nodes out of order",
              toArray(Solution.sortList(fromArray(2, 1))).equals(List.of(1, 2)));
        check("sortList: classic 4->2->1->3",
              toArray(Solution.sortList(fromArray(4, 2, 1, 3))).equals(List.of(1, 2, 3, 4)));
        check("sortList: negatives and duplicates",
              toArray(Solution.sortList(fromArray(-1, 5, 3, 4, 0, 3))).equals(List.of(-1, 0, 3, 3, 4, 5)));
        check("sortList: already sorted",
              toArray(Solution.sortList(fromArray(1, 2, 3, 4, 5))).equals(List.of(1, 2, 3, 4, 5)));
        check("sortList: reverse sorted",
              toArray(Solution.sortList(fromArray(5, 4, 3, 2, 1))).equals(List.of(1, 2, 3, 4, 5)));
        {
            Solution.ListNode head = fromArray(3, 1, 2);
            Set<Solution.ListNode> original = collectNodes(head);
            Solution.ListNode sorted = Solution.sortList(head);
            check("sortList: relinks the original nodes (no new allocation)",
                  toArray(sorted).equals(List.of(1, 2, 3)) && reusesNodes(sorted, original));
        }
        {
            List<Integer> expected = new ArrayList<>();
            for (int i = 0; i < 2000; i++) expected.add(i);
            Solution.ListNode head = fromList(shuffled(expected));
            Set<Solution.ListNode> original = collectNodes(head);
            Solution.ListNode sorted = Solution.sortList(head);
            check("sortList: 2000 shuffled values — O(n log n) or bust",
                  toArray(sorted).equals(expected) && reusesNodes(sorted, original));
        }
        check("sortList: all values equal",
              toArray(Solution.sortList(fromArray(9, 9, 9, 9))).equals(List.of(9, 9, 9, 9)));

        // mergeKLists
        check("mergeKLists: empty array returns null",
              Solution.mergeKLists(new Solution.ListNode[]{}) == null);
        check("mergeKLists: [null] returns null",
              Solution.mergeKLists(new Solution.ListNode[]{null}) == null);
        check("mergeKLists: all entries null returns null",
              Solution.mergeKLists(new Solution.ListNode[]{null, null, null}) == null);
        check("mergeKLists: classic three lists",
              toArray(Solution.mergeKLists(new Solution.ListNode[]{
                  fromArray(1, 4, 5), fromArray(1, 3, 4), fromArray(2, 6)
              })).equals(List.of(1, 1, 2, 3, 4, 4, 5, 6)));
        check("mergeKLists: single list passes through",
              toArray(Solution.mergeKLists(new Solution.ListNode[]{fromArray(1, 2, 3)}))
                  .equals(List.of(1, 2, 3)));
        check("mergeKLists: nulls mixed with real lists",
              toArray(Solution.mergeKLists(new Solution.ListNode[]{
                  null, fromArray(2, 4), null, fromArray(1, 3)
              })).equals(List.of(1, 2, 3, 4)));
        check("mergeKLists: k single-node lists",
              toArray(Solution.mergeKLists(new Solution.ListNode[]{
                  fromArray(5), fromArray(1), fromArray(4), fromArray(2), fromArray(3)
              })).equals(List.of(1, 2, 3, 4, 5)));
        check("mergeKLists: duplicates across lists",
              toArray(Solution.mergeKLists(new Solution.ListNode[]{
                  fromArray(1, 1, 2), fromArray(1, 2, 2)
              })).equals(List.of(1, 1, 1, 2, 2, 2)));
        {
            Solution.ListNode l1 = fromArray(1, 4);
            Solution.ListNode l2 = fromArray(2, 3);
            Set<Solution.ListNode> original = new HashSet<>(collectNodes(l1));
            original.addAll(collectNodes(l2));
            Solution.ListNode merged = Solution.mergeKLists(new Solution.ListNode[]{l1, l2});
            check("mergeKLists: reuses the original nodes (no new allocation)",
                  toArray(merged).equals(List.of(1, 2, 3, 4)) && reusesNodes(merged, original));
        }
        {
            int k = 64, len = 50;
            Solution.ListNode[] lists = new Solution.ListNode[k];
            Set<Solution.ListNode> allNodes = new HashSet<>();
            for (int i = 0; i < k; i++) {
                int[] values = new int[len];
                for (int j = 0; j < len; j++) values[j] = i + j * k;
                Solution.ListNode head = fromArray(values);
                allNodes.addAll(collectNodes(head));
                lists[i] = head;
            }
            Solution.ListNode merged = Solution.mergeKLists(lists);
            List<Integer> expected = new ArrayList<>();
            for (int i = 0; i < k * len; i++) expected.add(i);
            check("mergeKLists: 64 interleaved lists of 50 nodes each",
                  toArray(merged).equals(expected) && reusesNodes(merged, allNodes));
        }
        {
            List<Integer> nineNine = new ArrayList<>();
            for (int i = 0; i < 99; i++) nineNine.add(i);
            Solution.ListNode[] lists = new Solution.ListNode[]{
                fromArray(100),
                fromList(nineNine),
                null,
                fromArray(50, 150),
            };
            List<Integer> expected = new ArrayList<>(nineNine);
            expected.add(50); expected.add(100); expected.add(150);
            Collections.sort(expected);
            check("mergeKLists: lists of wildly different lengths",
                  toArray(Solution.mergeKLists(lists)).equals(expected));
        }

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
