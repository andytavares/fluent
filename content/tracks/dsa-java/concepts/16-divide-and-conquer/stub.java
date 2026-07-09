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

    // nums is sorted ascending, distinct. Returns the root of a
    // height-balanced BST containing exactly those values, or null for an
    // empty array. Any valid balanced arrangement is accepted.
    public static TreeNode sortedArrayToBST(int[] nums) {
        // TODO: recurse on inclusive index bounds (lo, hi) — NOT on a copied
        // sub-array; base case lo > hi -> null; mid = (lo + hi) / 2 becomes
        // the root, left = build(lo, mid - 1), right = build(mid + 1, hi)
        return null;
    }

    // Sorts a linked list ascending in O(n log n), relinking existing nodes
    // (no new node allocation). Returns the new head.
    public static ListNode sortList(ListNode head) {
        // TODO: merge sort — base case 0 or 1 nodes;
        // split with slow = head, fast = head.next (fast head start!),
        // cut with slow.next = null, recurse on both halves, then merge
        // with a dummy head + tail pointer
        return null;
    }

    // lists holds k sorted linked-list heads; entries may be null and the
    // array may be empty. Merges them into one sorted list in O(N log k),
    // reusing the existing nodes. Returns null if there are no nodes at all.
    public static ListNode mergeKLists(ListNode[] lists) {
        // TODO: pairwise rounds — while more than one list remains, merge
        // lists[i] with lists[i+1] (odd one passes through); reuse the same
        // two-list merge as sortList
        return null;
    }

    public static void main(String[] args) {
        System.out.println(sortedArrayToBST(new int[]{1, 2, 3}));

        ListNode head = new ListNode(4, new ListNode(2, new ListNode(1, new ListNode(3))));
        ListNode sorted = sortList(head);
        for (ListNode n = sorted; n != null; n = n.next) System.out.print(n.val + " ");
        System.out.println();
    }
}
