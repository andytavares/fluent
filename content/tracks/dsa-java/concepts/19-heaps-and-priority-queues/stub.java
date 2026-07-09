import java.util.ArrayList;
import java.util.Collections;
import java.util.PriorityQueue;

class Solution {

    // ListNode is defined in SolutionTest.java — use it freely here.

    static class MinHeap {
        private final ArrayList<Integer> data = new ArrayList<>();

        public void push(int val) {
            // TODO
        }

        public int pop() {
            // TODO
            return 0;
        }

        public int peek() {
            // TODO
            return 0;
        }
    }

    public static int[] kLargestElements(int[] nums, int k) {
        // TODO
        return new int[k];
    }

    public static ListNode mergeKSortedLists(ListNode[] lists) {
        // TODO
        return null;
    }

    public static void main(String[] args) {
        var heap = new MinHeap();
        heap.push(3); heap.push(1); heap.push(4); heap.push(1);
        System.out.println(heap.peek()); // 1
        System.out.println(heap.pop());  // 1
        System.out.println(java.util.Arrays.toString(
            kLargestElements(new int[]{3,2,1,5,6,4}, 2))); // [5,6] or [6,5]
    }
}
