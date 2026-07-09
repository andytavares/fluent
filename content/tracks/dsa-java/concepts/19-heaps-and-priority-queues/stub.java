import java.util.ArrayList;
import java.util.List;
import java.util.PriorityQueue;

class Solution {

    /**
     * Returns the k-th largest element of nums (duplicates count separately).
     */
    public static int findKthLargest(int[] nums, int k) {
        // TODO: min-heap of the k largest — offer each num, poll when size() > k;
        // the head is the answer
        return 0;
    }

    /**
     * Returns the k pairs {u, v} (u from nums1, v from nums2) with the smallest
     * sums, ordered by sum ascending. Fewer than k pairs exist -> return all.
     */
    public static List<int[]> kSmallestPairs(int[] nums1, int[] nums2, int k) {
        // TODO: heap of {i, j} index pairs compared by nums1[i] + nums2[j];
        // seed (i, 0) for the first min(k, nums1.length) rows, then poll and
        // offer only the row successor (i, j + 1)
        return new ArrayList<>();
    }

    /**
     * Streaming median over two heaps: a max-heap `low` (smaller half) and a
     * min-heap `high` (larger half); low may hold at most one extra element.
     */
    static class MedianFinder {

        public MedianFinder() {
            // TODO: low = new PriorityQueue<>(Comparator.reverseOrder());
            // high = new PriorityQueue<>();
        }

        public void addNum(int num) {
            // TODO: offer into low when empty or num <= low.peek(), else into high;
            // then rebalance — low may exceed high by at most one, high never leads
        }

        public double findMedian() {
            // TODO: odd count -> low.peek(); even -> (low.peek() + high.peek()) / 2.0
            return 0;
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
