import java.util.Arrays;
import java.util.List;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static boolean pairsMatch(List<int[]> result, int[] nums1, int[] nums2, int[] expectedSums) {
        if (result.size() != expectedSums.length) return false;
        for (int idx = 0; idx < result.size(); idx++) {
            int[] pair = result.get(idx);
            if (pair.length != 2) return false;
            if (!contains(nums1, pair[0]) || !contains(nums2, pair[1])) return false;
            if (pair[0] + pair[1] != expectedSums[idx]) return false;
        }
        return true;
    }

    static boolean contains(int[] arr, int value) {
        for (int x : arr) if (x == value) return true;
        return false;
    }

    static long nextSeed(long seed) {
        return (seed * 48271) % 2147483647L;
    }

    static boolean largeFindKthLargest() {
        int n = 10000;
        int[] nums = new int[n];
        long seed = 7;
        for (int i = 0; i < n; i++) {
            seed = nextSeed(seed);
            nums[i] = (int) (seed % 100000);
        }
        int[] sortedDesc = nums.clone();
        Arrays.sort(sortedDesc);
        // reverse to descending
        for (int i = 0, j = sortedDesc.length - 1; i < j; i++, j--) {
            int tmp = sortedDesc[i]; sortedDesc[i] = sortedDesc[j]; sortedDesc[j] = tmp;
        }
        return Solution.findKthLargest(nums, 2500) == sortedDesc[2499];
    }

    static boolean largeKSmallestPairsNoMaterialize() {
        int[] nums1 = new int[5000];
        int[] nums2 = new int[5000];
        for (int i = 0; i < 5000; i++) {
            nums1[i] = i * 3;
            nums2[i] = i * 3 + 1;
        }
        int[] expectedSums = {1, 4, 4, 7, 7, 7, 10, 10, 10, 10};
        return pairsMatch(Solution.kSmallestPairs(nums1, nums2, 10), nums1, nums2, expectedSums);
    }

    static boolean longPseudoRandomMedianStream() {
        Solution.MedianFinder mf = new Solution.MedianFinder();
        int[] seen = new int[1000];
        long seed = 3;
        for (int i = 0; i < 1000; i++) {
            seed = nextSeed(seed);
            int x = (int) (seed % 500) - 250;
            mf.addNum(x);
            seen[i] = x;
            if (i % 97 == 0) {
                int[] sorted = Arrays.copyOfRange(seen, 0, i + 1);
                Arrays.sort(sorted);
                int m = sorted.length;
                double expected = (m % 2 == 1)
                    ? sorted[(m - 1) / 2]
                    : (sorted[m / 2 - 1] + sorted[m / 2]) / 2.0;
                if (mf.findMedian() != expected) return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        // findKthLargest
        check("findKthLargest: classic example",
              Solution.findKthLargest(new int[]{3, 2, 1, 5, 6, 4}, 2) == 5);
        check("findKthLargest: duplicates count separately",
              Solution.findKthLargest(new int[]{3, 2, 3, 1, 2, 4, 5, 5, 6}, 4) == 4);
        check("findKthLargest: k = 1 is the maximum",
              Solution.findKthLargest(new int[]{2, 9, 4}, 1) == 9);
        check("findKthLargest: k = length is the minimum",
              Solution.findKthLargest(new int[]{2, 9, 4}, 3) == 2);
        check("findKthLargest: single element",
              Solution.findKthLargest(new int[]{1}, 1) == 1);
        check("findKthLargest: all duplicates",
              Solution.findKthLargest(new int[]{7, 7, 7}, 2) == 7);
        check("findKthLargest: negative numbers",
              Solution.findKthLargest(new int[]{-1, -5, -3}, 2) == -3);
        check("findKthLargest: large input, deep k", largeFindKthLargest());

        // kSmallestPairs
        check("kSmallestPairs: classic example",
              pairsMatch(Solution.kSmallestPairs(new int[]{1, 7, 11}, new int[]{2, 4, 6}, 3),
                         new int[]{1, 7, 11}, new int[]{2, 4, 6}, new int[]{3, 5, 7}));
        check("kSmallestPairs: duplicate values, equal sums",
              pairsMatch(Solution.kSmallestPairs(new int[]{1, 1, 2}, new int[]{1, 2, 3}, 2),
                         new int[]{1, 1, 2}, new int[]{1, 2, 3}, new int[]{2, 2}));
        check("kSmallestPairs: k exceeds total pairs — return them all",
              pairsMatch(Solution.kSmallestPairs(new int[]{1, 2}, new int[]{3}, 3),
                         new int[]{1, 2}, new int[]{3}, new int[]{4, 5}));
        check("kSmallestPairs: k = 1",
              Solution.kSmallestPairs(new int[]{1, 7}, new int[]{2, 4}, 1).size() == 1
              && Solution.kSmallestPairs(new int[]{1, 7}, new int[]{2, 4}, 1).get(0)[0] == 1
              && Solution.kSmallestPairs(new int[]{1, 7}, new int[]{2, 4}, 1).get(0)[1] == 2);
        check("kSmallestPairs: empty nums1",
              Solution.kSmallestPairs(new int[]{}, new int[]{1, 2}, 5).isEmpty());
        check("kSmallestPairs: empty nums2",
              Solution.kSmallestPairs(new int[]{1, 2}, new int[]{}, 5).isEmpty());
        check("kSmallestPairs: negative numbers",
              pairsMatch(Solution.kSmallestPairs(new int[]{-10, -4, 0}, new int[]{-5, 3}, 3),
                         new int[]{-10, -4, 0}, new int[]{-5, 3}, new int[]{-15, -9, -7}));
        check("kSmallestPairs: exact k equals total pairs",
              pairsMatch(Solution.kSmallestPairs(new int[]{1, 2}, new int[]{1, 2}, 4),
                         new int[]{1, 2}, new int[]{1, 2}, new int[]{2, 3, 3, 4}));
        check("kSmallestPairs: large arrays, small k — must not materialize the grid",
              largeKSmallestPairsNoMaterialize());

        // MedianFinder
        Solution.MedianFinder mf1 = new Solution.MedianFinder();
        mf1.addNum(1);
        mf1.addNum(2);
        check("MedianFinder: classic sequence step 1", mf1.findMedian() == 1.5);
        mf1.addNum(3);
        check("MedianFinder: classic sequence step 2", mf1.findMedian() == 2.0);

        Solution.MedianFinder mf2 = new Solution.MedianFinder();
        mf2.addNum(7);
        check("MedianFinder: single element", mf2.findMedian() == 7.0);

        Solution.MedianFinder mf3 = new Solution.MedianFinder();
        for (int x : new int[]{5, 4, 3, 2, 1}) mf3.addNum(x);
        check("MedianFinder: descending insertion order", mf3.findMedian() == 3.0);

        Solution.MedianFinder mf4 = new Solution.MedianFinder();
        for (int x : new int[]{2, 2, 2}) mf4.addNum(x);
        check("MedianFinder: duplicates", mf4.findMedian() == 2.0);

        Solution.MedianFinder mf5 = new Solution.MedianFinder();
        for (int x : new int[]{-1, -2, -3, -4}) mf5.addNum(x);
        check("MedianFinder: negative numbers", mf5.findMedian() == -2.5);

        Solution.MedianFinder mf6 = new Solution.MedianFinder();
        int[] stream = {6, 10, 2, 6, 5};
        double[] expected = {6.0, 8.0, 6.0, 6.0, 6.0};
        boolean tracksAll = true;
        for (int i = 0; i < stream.length; i++) {
            mf6.addNum(stream[i]);
            if (mf6.findMedian() != expected[i]) tracksAll = false;
        }
        check("MedianFinder: median tracks every step", tracksAll);
        check("MedianFinder: long pseudo-random stream matches a sorted oracle",
              longPseudoRandomMedianStream());

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
