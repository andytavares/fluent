import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static Solution.ListNode arrayToList(int... vals) {
        Solution.ListNode dummy = new Solution.ListNode(0);
        Solution.ListNode tail = dummy;
        for (int v : vals) {
            tail.next = new Solution.ListNode(v);
            tail = tail.next;
        }
        return dummy.next;
    }

    static List<Integer> listToArray(Solution.ListNode head) {
        List<Integer> out = new ArrayList<>();
        Solution.ListNode node = head;
        int limit = 100000;
        while (node != null && out.size() < limit) {
            out.add(node.val);
            node = node.next;
        }
        if (node != null) throw new RuntimeException("list longer than limit - possible cycle");
        return out;
    }

    static Solution.ListNode nodeAt(Solution.ListNode head, int i) {
        Solution.ListNode node = head;
        while (i-- > 0) node = node.next;
        return node;
    }

    public static void main(String[] args) {
        // hasCycle
        Solution.ListNode h1 = arrayToList(3, 2, 0, -4);
        nodeAt(h1, 3).next = nodeAt(h1, 1);
        check("hasCycle: cycle back into the middle", Solution.hasCycle(h1));

        Solution.ListNode h2 = arrayToList(1, 2);
        nodeAt(h2, 1).next = h2;
        check("hasCycle: two-node cycle", Solution.hasCycle(h2));

        check("hasCycle: acyclic list", !Solution.hasCycle(arrayToList(1, 2)));
        check("hasCycle: empty list", !Solution.hasCycle(null));
        check("hasCycle: single node, no cycle", !Solution.hasCycle(arrayToList(1)));

        Solution.ListNode selfLoop = new Solution.ListNode(1);
        selfLoop.next = selfLoop;
        check("hasCycle: single node self-loop", Solution.hasCycle(selfLoop));

        check("hasCycle: repeated values without a cycle (identity, not value)", !Solution.hasCycle(arrayToList(1, 1, 1)));

        int[] longVals = new int[10000];
        for (int i = 0; i < 10000; i++) longVals[i] = i % 7;
        check("hasCycle: long acyclic list", !Solution.hasCycle(arrayToList(longVals)));

        Solution.ListNode h4 = arrayToList(longVals);
        nodeAt(h4, 9999).next = nodeAt(h4, 9990);
        check("hasCycle: long list, tiny cycle at the end", Solution.hasCycle(h4));

        // addTwoNumbers
        check("addTwoNumbers: 342 + 465 = 807",
              listToArray(Solution.addTwoNumbers(arrayToList(2, 4, 3), arrayToList(5, 6, 4))).equals(List.of(7, 0, 8)));
        check("addTwoNumbers: 0 + 0 = 0",
              listToArray(Solution.addTwoNumbers(arrayToList(0), arrayToList(0))).equals(List.of(0)));
        check("addTwoNumbers: final carry adds a digit (99 + 1)",
              listToArray(Solution.addTwoNumbers(arrayToList(9, 9), arrayToList(1))).equals(List.of(0, 0, 1)));
        check("addTwoNumbers: carry chain across many digits",
              listToArray(Solution.addTwoNumbers(arrayToList(9, 9, 9, 9, 9, 9, 9), arrayToList(9, 9, 9, 9)))
                  .equals(List.of(8, 9, 9, 9, 0, 0, 0, 1)));
        check("addTwoNumbers: no carry at all",
              listToArray(Solution.addTwoNumbers(arrayToList(1, 2), arrayToList(3, 4))).equals(List.of(4, 6)));
        check("addTwoNumbers: single digits with carry (5 + 5)",
              listToArray(Solution.addTwoNumbers(arrayToList(5), arrayToList(5))).equals(List.of(0, 1)));

        int[] nines = new int[1000];
        java.util.Arrays.fill(nines, 9);
        List<Integer> expectedNines = new ArrayList<>();
        for (int i = 0; i < 1000; i++) expectedNines.add(0);
        expectedNines.add(1);
        check("addTwoNumbers: 1000-digit number plus 1 (carry ripples end to end)",
              listToArray(Solution.addTwoNumbers(arrayToList(nines), arrayToList(1))).equals(expectedNines));

        // mergeTwoLists
        check("mergeTwoLists: classic interleave",
              listToArray(Solution.mergeTwoLists(arrayToList(1, 2, 4), arrayToList(1, 3, 4))).equals(List.of(1, 1, 2, 3, 4, 4)));
        check("mergeTwoLists: both empty", Solution.mergeTwoLists(null, null) == null);
        check("mergeTwoLists: first empty", listToArray(Solution.mergeTwoLists(null, arrayToList(0))).equals(List.of(0)));
        check("mergeTwoLists: second empty", listToArray(Solution.mergeTwoLists(arrayToList(7), null)).equals(List.of(7)));
        check("mergeTwoLists: disjoint ranges",
              listToArray(Solution.mergeTwoLists(arrayToList(1, 2, 3), arrayToList(4, 5, 6))).equals(List.of(1, 2, 3, 4, 5, 6)));
        check("mergeTwoLists: negatives and duplicates",
              listToArray(Solution.mergeTwoLists(arrayToList(-3, 0, 0, 5), arrayToList(-3, 2))).equals(List.of(-3, -3, 0, 0, 2, 5)));

        Solution.ListNode l1 = arrayToList(1, 3, 5);
        Solution.ListNode l2 = arrayToList(2, 4);
        Set<Solution.ListNode> inputNodes = new HashSet<>();
        for (Solution.ListNode n = l1; n != null; n = n.next) inputNodes.add(n);
        for (Solution.ListNode n = l2; n != null; n = n.next) inputNodes.add(n);
        Solution.ListNode merged = Solution.mergeTwoLists(l1, l2);
        boolean allFromInputs = true;
        for (Solution.ListNode n = merged; n != null; n = n.next) {
            if (!inputNodes.contains(n)) allFromInputs = false;
        }
        check("mergeTwoLists: splices existing nodes, no new allocations",
              listToArray(merged).equals(List.of(1, 2, 3, 4, 5)) && allFromInputs);

        int[] evens = new int[5000];
        int[] odds = new int[5000];
        for (int i = 0; i < 5000; i++) { evens[i] = 2 * i; odds[i] = 2 * i + 1; }
        Solution.ListNode bigMerged = Solution.mergeTwoLists(arrayToList(evens), arrayToList(odds));
        List<Integer> expectedBig = new ArrayList<>();
        for (int i = 0; i < 10000; i++) expectedBig.add(i);
        check("mergeTwoLists: two 5000-node lists", listToArray(bigMerged).equals(expectedBig));

        // reverseBetween
        check("reverseBetween: middle window",
              listToArray(Solution.reverseBetween(arrayToList(1, 2, 3, 4, 5), 2, 4)).equals(List.of(1, 4, 3, 2, 5)));
        check("reverseBetween: single node, left == right",
              listToArray(Solution.reverseBetween(arrayToList(5), 1, 1)).equals(List.of(5)));
        check("reverseBetween: whole list",
              listToArray(Solution.reverseBetween(arrayToList(1, 2, 3), 1, 3)).equals(List.of(3, 2, 1)));
        check("reverseBetween: window starts at the head",
              listToArray(Solution.reverseBetween(arrayToList(1, 2, 3, 4), 1, 2)).equals(List.of(2, 1, 3, 4)));
        check("reverseBetween: window ends at the tail",
              listToArray(Solution.reverseBetween(arrayToList(1, 2, 3, 4), 3, 4)).equals(List.of(1, 2, 4, 3)));
        check("reverseBetween: left == right in the middle is a no-op",
              listToArray(Solution.reverseBetween(arrayToList(1, 2, 3), 2, 2)).equals(List.of(1, 2, 3)));
        check("reverseBetween: two-node full reversal",
              listToArray(Solution.reverseBetween(arrayToList(3, 5), 1, 2)).equals(List.of(5, 3)));

        int n5000 = 5000;
        int[] values = new int[n5000];
        for (int i = 0; i < n5000; i++) values[i] = i;
        Solution.ListNode largeWindow = Solution.reverseBetween(arrayToList(values), 1001, 4000);
        List<Integer> expectedWindow = new ArrayList<>();
        for (int i = 0; i < 1000; i++) expectedWindow.add(values[i]);
        for (int i = 3999; i >= 1000; i--) expectedWindow.add(values[i]);
        for (int i = 4000; i < n5000; i++) expectedWindow.add(values[i]);
        check("reverseBetween: large window inside a 5000-node list", listToArray(largeWindow).equals(expectedWindow));

        Solution.ListNode fullRev = Solution.reverseBetween(arrayToList(values), 1, n5000);
        List<Integer> expectedFull = new ArrayList<>();
        for (int i = n5000 - 1; i >= 0; i--) expectedFull.add(values[i]);
        check("reverseBetween: full reversal of a 5000-node list", listToArray(fullRev).equals(expectedFull));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
