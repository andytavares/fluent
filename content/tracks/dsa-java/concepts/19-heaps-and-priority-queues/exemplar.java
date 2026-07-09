import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

class Solution {

    /**
     * Returns the k-th largest element via a min-heap of the k largest seen so
     * far: the head is always the eviction candidate, so polling when the heap
     * exceeds k discards only elements provably outside the top k.
     * O(n log k) time, O(k) space.
     */
    public static int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int x : nums) {
            heap.offer(x);
            if (heap.size() > k) heap.poll();
        }
        return heap.peek();
    }

    /**
     * Best-first frontier walk over the (virtual) m x n grid of index pairs.
     * Seed the first min(k, m) rows at column 0; each poll offers only its row
     * successor, so every cell has exactly one path into the heap — no
     * visited-set, no duplicates.
     * O(k log k) time, O(min(k, m)) heap space.
     */
    public static List<int[]> kSmallestPairs(int[] nums1, int[] nums2, int k) {
        List<int[]> result = new ArrayList<>();
        if (nums1.length == 0 || nums2.length == 0 || k <= 0) return result;

        // Heap of [i, j] index pairs ordered by nums1[i] + nums2[j].
        PriorityQueue<int[]> heap = new PriorityQueue<>(
            Comparator.comparingInt(p -> nums1[p[0]] + nums2[p[1]])
        );
        int rows = Math.min(k, nums1.length);
        for (int i = 0; i < rows; i++) heap.offer(new int[]{i, 0});

        while (result.size() < k && !heap.isEmpty()) {
            int[] top = heap.poll();
            int i = top[0], j = top[1];
            result.add(new int[]{nums1[i], nums2[j]});
            if (j + 1 < nums2.length) heap.offer(new int[]{i, j + 1});
        }
        return result;
    }

    /**
     * Streaming median over two heaps. Invariants: every element of `low`
     * (max-heap, smaller half) <= every element of `high` (min-heap, larger
     * half), and low.size() - high.size() is 0 or 1. The heads then bracket
     * the middle of the sorted order at all times.
     * addNum O(log n), findMedian O(1).
     */
    static class MedianFinder {
        private final PriorityQueue<Integer> low = new PriorityQueue<>(Comparator.reverseOrder());
        private final PriorityQueue<Integer> high = new PriorityQueue<>();

        public void addNum(int num) {
            if (low.isEmpty() || num <= low.peek()) {
                low.offer(num);
            } else {
                high.offer(num);
            }
            // Rebalance with at most one head transfer; ordering survives because
            // only boundary elements cross.
            if (low.size() > high.size() + 1) {
                high.offer(low.poll());
            } else if (high.size() > low.size()) {
                low.offer(high.poll());
            }
        }

        public double findMedian() {
            if (low.size() > high.size()) return low.peek();
            return (low.peek() + high.peek()) / 2.0;
        }
    }

    public static void main(String[] args) {
        System.out.println(findKthLargest(new int[]{3, 2, 1, 5, 6, 4}, 2)); // 5

        System.out.println(kSmallestPairs(new int[]{1, 7, 11}, new int[]{2, 4, 6}, 3));

        MedianFinder mf = new MedianFinder();
        mf.addNum(1); mf.addNum(2);
        System.out.println(mf.findMedian()); // 1.5
        mf.addNum(3);
        System.out.println(mf.findMedian()); // 2.0
    }
}
