class Solution {

    // Binary tree node: absent children are null.
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

    // Singly linked list node: the last node's next is null.
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
        ListNode(int val, ListNode next) {
            this.val = val;
            this.next = next;
        }
    }

    // Builds a height-balanced BST by making the middle element the root and
    // recursing on the halves: sortedness gives the BST property for free,
    // and halving bounds the subtree height difference by 1 at every node.
    // Recursing on index bounds (not sub-array copies) keeps it O(n).
    // O(n) time, O(log n) recursion depth.
    public static TreeNode sortedArrayToBST(int[] nums) {
        return buildBST(nums, 0, nums.length - 1);
    }

    private static TreeNode buildBST(int[] nums, int lo, int hi) {
        if (lo > hi) return null;
        int mid = (lo + hi) / 2;
        return new TreeNode(nums[mid], buildBST(nums, lo, mid - 1), buildBST(nums, mid + 1, hi));
    }

    // Merges two sorted lists by relinking existing nodes: dummy head + tail
    // pointer, always appending the smaller front node, then splicing the
    // leftover run. Handles null inputs naturally. O(|a| + |b|) time.
    private static ListNode mergeTwo(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) {
                tail.next = a;
                a = a.next;
            } else {
                tail.next = b;
                b = b.next;
            }
            tail = tail.next;
        }
        tail.next = (a != null) ? a : b;
        return dummy.next;
    }

    // Merge sort on a linked list: fast/slow split (fast starts at head.next
    // so a 2-node list splits 1 + 1), CUT the list so the halves are
    // independent, recurse, then merge. Only pointers move — no nodes are
    // allocated.
    // O(n log n) time, O(log n) recursion stack.
    public static ListNode sortList(ListNode head) {
        if (head == null || head.next == null) return head;

        ListNode slow = head;
        ListNode fast = head.next;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode mid = slow.next;
        slow.next = null; // cut — without this the recursion never shrinks

        return mergeTwo(sortList(head), sortList(mid));
    }

    // Merges k sorted lists by pairwise rounds: each round halves the list
    // count, and every node is touched once per round -> O(N log k) total,
    // versus O(N*k) for sequential folding.
    // O(N log k) time, O(1) extra space beyond the round arrays.
    public static ListNode mergeKLists(ListNode[] lists) {
        if (lists.length == 0) return null;
        ListNode[] current = lists;
        while (current.length > 1) {
            ListNode[] merged = new ListNode[(current.length + 1) / 2];
            for (int i = 0, j = 0; i < current.length; i += 2, j++) {
                merged[j] = (i + 1 < current.length) ? mergeTwo(current[i], current[i + 1]) : current[i];
            }
            current = merged;
        }
        return current[0];
    }

    public static void main(String[] args) {
        System.out.println(sortedArrayToBST(new int[]{1, 2, 3}));

        ListNode head = new ListNode(4, new ListNode(2, new ListNode(1, new ListNode(3))));
        ListNode sorted = sortList(head);
        for (ListNode n = sorted; n != null; n = n.next) System.out.print(n.val + " ");
        System.out.println();
    }
}
