class Solution {

    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
        ListNode(int val, ListNode next) { this.val = val; this.next = next; }
    }

    /**
     * Returns true if the list contains a cycle.
     * Floyd's fast/slow: fast gains one node per step inside a cycle, so the
     * pointers must meet; if fast reaches null, the list terminates.
     * O(n) time, O(1) space.
     */
    public static boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true; // identity, never value comparison
        }
        return false;
    }

    /**
     * Adds two numbers stored as reverse-order digit lists (head = ones digit).
     * Reverse order means the walk adds digits exactly as carries propagate.
     * O(max(m, n)) time, O(1) space beyond the output.
     */
    public static ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        int carry = 0;
        while (l1 != null || l2 != null || carry != 0) {
            int sum = (l1 != null ? l1.val : 0) + (l2 != null ? l2.val : 0) + carry;
            tail.next = new ListNode(sum % 10);
            tail = tail.next;
            carry = sum / 10;
            if (l1 != null) l1 = l1.next;
            if (l2 != null) l2 = l2.next;
        }
        return dummy.next;
    }

    /**
     * Merges two sorted lists by splicing the existing nodes. Returns the head.
     * The dummy head absorbs the "which list starts the result?" question, and
     * attaching the leftover list whole avoids walking it.
     * O(m + n) time, O(1) space.
     */
    public static ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                tail.next = list1;
                list1 = list1.next;
            } else {
                tail.next = list2;
                list2 = list2.next;
            }
            tail = tail.next;
        }
        tail.next = (list1 != null) ? list1 : list2;
        return dummy.next;
    }

    /**
     * Reverses positions left..right (1-indexed) in place. Returns the head.
     * Front-insertion: anchor prev before the window, then move the node after
     * `start` to the window's front, right-left times — the window ends up
     * reversed and already spliced.
     * O(n) time, O(1) space, one pass.
     */
    public static ListNode reverseBetween(ListNode head, int left, int right) {
        ListNode dummy = new ListNode(0, head);
        ListNode prev = dummy;
        for (int i = 0; i < left - 1; i++) prev = prev.next;

        ListNode start = prev.next; // becomes the window's tail
        for (int i = 0; i < right - left; i++) {
            ListNode move = start.next;
            start.next = move.next;
            move.next = prev.next;
            prev.next = move;
        }
        return dummy.next;
    }

    static ListNode list(int... vals) {
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        for (int v : vals) { tail.next = new ListNode(v); tail = tail.next; }
        return dummy.next;
    }

    static void printList(ListNode head) {
        StringBuilder sb = new StringBuilder();
        for (ListNode n = head; n != null; n = n.next) {
            sb.append(n.val);
            if (n.next != null) sb.append("->");
        }
        System.out.println(sb);
    }

    public static void main(String[] args) {
        ListNode cyclic = list(3, 2, 0, -4);
        cyclic.next.next.next.next = cyclic.next; // -4 loops back to 2
        System.out.println(hasCycle(cyclic)); // true

        printList(addTwoNumbers(list(2, 4, 3), list(5, 6, 4))); // 7->0->8
        printList(mergeTwoLists(list(1, 2, 4), list(1, 3, 4))); // 1->1->2->3->4->4
        printList(reverseBetween(list(1, 2, 3, 4, 5), 2, 4));   // 1->4->3->2->5
    }
}
