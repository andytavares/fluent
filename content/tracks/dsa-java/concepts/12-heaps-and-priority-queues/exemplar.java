import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.PriorityQueue;

class Solution {

    // ListNode is defined in SolutionTest.java — used here directly.

    static class MinHeap {
        private final ArrayList<Integer> data = new ArrayList<>();

        public void push(int val) {
            data.add(val);
            siftUp(data.size() - 1);
        }

        public int pop() {
            int top = data.get(0);
            int last = data.remove(data.size() - 1);
            if (!data.isEmpty()) { data.set(0, last); siftDown(0); }
            return top;
        }

        public int peek() {
            return data.get(0);
        }

        private void siftUp(int i) {
            while (i > 0) {
                int parent = (i - 1) / 2;
                if (data.get(parent) <= data.get(i)) break;
                Collections.swap(data, i, parent);
                i = parent;
            }
        }

        private void siftDown(int i) {
            int n = data.size();
            while (true) {
                int smallest = i, l = 2 * i + 1, r = 2 * i + 2;
                if (l < n && data.get(l) < data.get(smallest)) smallest = l;
                if (r < n && data.get(r) < data.get(smallest)) smallest = r;
                if (smallest == i) break;
                Collections.swap(data, i, smallest);
                i = smallest;
            }
        }
    }

    public static int[] kLargestElements(int[] nums, int k) {
        var heap = new PriorityQueue<Integer>(); // min-heap
        for (int n : nums) {
            heap.offer(n);
            if (heap.size() > k) heap.poll();
        }
        return heap.stream().mapToInt(Integer::intValue).toArray();
    }

    public static ListNode mergeKSortedLists(ListNode[] lists) {
        var heap = new PriorityQueue<ListNode>((a, b) -> Integer.compare(a.val, b.val));
        for (ListNode head : lists) {
            if (head != null) heap.offer(head);
        }
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        while (!heap.isEmpty()) {
            tail.next = heap.poll();
            tail = tail.next;
            if (tail.next != null) heap.offer(tail.next);
        }
        return dummy.next;
    }

    public static void main(String[] args) {
        var heap = new MinHeap();
        heap.push(3); heap.push(1); heap.push(4); heap.push(1);
        System.out.println(heap.peek()); // 1
        System.out.println(heap.pop());  // 1
        System.out.println(Arrays.toString(kLargestElements(new int[]{3,2,1,5,6,4}, 2)));
    }
}
