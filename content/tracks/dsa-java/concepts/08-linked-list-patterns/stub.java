class Solution {

    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
        ListNode(int val, ListNode next) { this.val = val; this.next = next; }
    }

    /** Returns true if the list contains a cycle. */
    public static boolean hasCycle(ListNode head) {
        // TODO: Floyd's fast/slow - slow moves 1, fast moves 2
        // loop while fast != null && fast.next != null; compare node identity (==)
        return false;
    }

    /**
     * Adds two numbers stored as reverse-order digit lists (head = ones digit).
     * Returns the sum in the same format.
     */
    public static ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        // TODO: dummy head + carry; loop while l1 != null || l2 != null || carry != 0
        // digit = sum % 10, carry = sum / 10
        return null;
    }

    /** Merges two sorted lists by splicing the existing nodes. Returns the head. */
    public static ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // TODO: dummy head + tail; attach the smaller head each step,
        // then attach the leftover list; return dummy.next
        return null;
    }

    /** Reverses positions left..right (1-indexed) in place. Returns the head. */
    public static ListNode reverseBetween(ListNode head, int left, int right) {
        // TODO: dummy head; walk prev to position left-1; front-insert the node
        // after start, right-left times; return dummy.next
        return null;
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
