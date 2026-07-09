import java.util.Arrays;

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
        ListNode dummy = new ListNode(0), cur = dummy;
        for (int v : vals) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    static String stringify(ListNode head) {
        var sb = new StringBuilder();
        while (head != null) { sb.append(head.val); if (head.next != null) sb.append("->"); head = head.next; }
        return sb.toString();
    }

    public static void main(String[] args) {
        // MinHeap
        var h = new Solution.MinHeap();
        h.push(5); h.push(3); h.push(8); h.push(1); h.push(4);
        check("heap peek -> 1",          h.peek() == 1);
        check("heap pop -> 1",           h.pop() == 1);
        check("heap pop -> 3",           h.pop() == 3);
        check("heap peek after pops -> 4", h.peek() == 4);
        check("heap pop -> 4",           h.pop() == 4);
        check("heap pop -> 5",           h.pop() == 5);
        check("heap pop -> 8",           h.pop() == 8);

        var h2 = new Solution.MinHeap();
        h2.push(2); h2.push(2); h2.push(1);
        check("heap dups: pop -> 1",     h2.pop() == 1);
        check("heap dups: pop -> 2",     h2.pop() == 2);
        check("heap dups: pop -> 2",     h2.pop() == 2);

        var h3 = new Solution.MinHeap();
        h3.push(42);
        check("heap single peek -> 42",  h3.peek() == 42);
        check("heap single pop -> 42",   h3.pop() == 42);

        // kLargestElements
        int[] k2 = Solution.kLargestElements(new int[]{3,2,1,5,6,4}, 2);
        Arrays.sort(k2);
        check("kLargest: k=2 -> {5,6}",  Arrays.equals(k2, new int[]{5,6}));

        int[] k4 = Solution.kLargestElements(new int[]{3,2,3,1,2,4,5,5,6}, 4);
        Arrays.sort(k4);
        check("kLargest: k=4 -> {4,5,5,6}", Arrays.equals(k4, new int[]{4,5,5,6}));

        check("kLargest: k=1 -> max",
              Solution.kLargestElements(new int[]{1,2,3}, 1)[0] == 3);

        int[] kAll = Solution.kLargestElements(new int[]{7,5,3}, 3);
        Arrays.sort(kAll);
        check("kLargest: k=len -> all", Arrays.equals(kAll, new int[]{3,5,7}));

        // mergeKSortedLists
        Solution.ListNode[] lists1 = {build(1,4,5), build(1,3,4), build(2,6)};
        check("mergeK: classic 3 lists",
              stringify(Solution.mergeKSortedLists(lists1))
                  .equals("1->1->2->3->4->4->5->6"));

        Solution.ListNode[] lists2 = {};
        check("mergeK: empty array -> null",
              Solution.mergeKSortedLists(lists2) == null);

        Solution.ListNode[] lists3 = {null};
        check("mergeK: array of null -> null",
              Solution.mergeKSortedLists(lists3) == null);

        Solution.ListNode[] lists4 = {build(1,2,3)};
        check("mergeK: single list passthrough",
              stringify(Solution.mergeKSortedLists(lists4)).equals("1->2->3"));

        Solution.ListNode[] lists5 = {build(1), build(0)};
        check("mergeK: two single-node lists",
              stringify(Solution.mergeKSortedLists(lists5)).equals("0->1"));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
