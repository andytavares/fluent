public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }

    static ListNode build(int... vals) {
        ListNode dummy = new ListNode(0);
        ListNode cur = dummy;
        for (int v : vals) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    static String stringify(ListNode head) {
        var sb = new StringBuilder();
        while (head != null) {
            sb.append(head.val);
            if (head.next != null) sb.append("->");
            head = head.next;
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        // reverseList
        check("reverse: [1,2,3,4,5] -> 5->4->3->2->1",
              stringify(Solution.reverseList(build(1,2,3,4,5))).equals("5->4->3->2->1"));
        check("reverse: [1,2] -> 2->1",
              stringify(Solution.reverseList(build(1,2))).equals("2->1"));
        check("reverse: [1] -> 1",
              stringify(Solution.reverseList(build(1))).equals("1"));
        check("reverse: empty -> null",
              Solution.reverseList(null) == null);

        // hasCycle
        check("cycle: no cycle [1,2,3]",   !Solution.hasCycle(build(1,2,3)));
        check("cycle: no cycle [1]",        !Solution.hasCycle(build(1)));
        check("cycle: empty list -> false", !Solution.hasCycle(null));

        ListNode cycled = build(1,2,3,4);
        ListNode tail = cycled;
        ListNode cycleTarget = cycled.next; // node val=2
        while (tail.next != null) tail = tail.next;
        tail.next = cycleTarget;
        check("cycle: has cycle", Solution.hasCycle(cycled));

        ListNode selfLoop = new ListNode(1);
        selfLoop.next = selfLoop;
        check("cycle: self loop", Solution.hasCycle(selfLoop));

        // mergeTwoSortedLists
        check("merge: [1,2,4] + [1,3,4] -> 1->1->2->3->4->4",
              stringify(Solution.mergeTwoSortedLists(build(1,2,4), build(1,3,4)))
                  .equals("1->1->2->3->4->4"));
        check("merge: [] + [] -> null",
              Solution.mergeTwoSortedLists(null, null) == null);
        check("merge: [] + [0] -> 0",
              stringify(Solution.mergeTwoSortedLists(null, build(0))).equals("0"));
        check("merge: [1,3,5] + [2,4,6] interleaved",
              stringify(Solution.mergeTwoSortedLists(build(1,3,5), build(2,4,6)))
                  .equals("1->2->3->4->5->6"));
        check("merge: [5] + [1,2,3] prepend",
              stringify(Solution.mergeTwoSortedLists(build(5), build(1,2,3)))
                  .equals("1->2->3->5"));
        check("merge: equal elements",
              stringify(Solution.mergeTwoSortedLists(build(2,2), build(2,2)))
                  .equals("2->2->2->2"));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
