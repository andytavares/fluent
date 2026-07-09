import java.util.Arrays;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // merge
        int[] m1 = {1, 2, 3, 0, 0, 0};
        Solution.merge(m1, 3, new int[]{2, 5, 6}, 3);
        check("merge: classic example mutates nums1 in place", Arrays.equals(m1, new int[]{1, 2, 2, 3, 5, 6}));

        int[] m2 = {1};
        Solution.merge(m2, 1, new int[]{}, 0);
        check("merge: n = 0 leaves nums1 unchanged", Arrays.equals(m2, new int[]{1}));

        int[] m3 = {0};
        Solution.merge(m3, 0, new int[]{2}, 1);
        check("merge: m = 0 copies nums2 across", Arrays.equals(m3, new int[]{2}));

        int[] m4 = {4, 5, 6, 0, 0, 0};
        Solution.merge(m4, 3, new int[]{1, 2, 3}, 3);
        check("merge: all of nums2 smaller than nums1", Arrays.equals(m4, new int[]{1, 2, 3, 4, 5, 6}));

        int[] m5 = {1, 1, 3, 0, 0, 0};
        Solution.merge(m5, 3, new int[]{1, 3, 3}, 3);
        check("merge: duplicates across both arrays", Arrays.equals(m5, new int[]{1, 1, 1, 3, 3, 3}));

        int[] m6 = {-5, 0, 2, 0, 0};
        Solution.merge(m6, 3, new int[]{-10, 1}, 2);
        check("merge: negative numbers", Arrays.equals(m6, new int[]{-10, -5, 0, 1, 2}));

        // removeDuplicates
        int[] d1 = {1, 1, 2};
        int k1 = Solution.removeDuplicates(d1);
        check("removeDuplicates: simple duplicates", k1 == 2 && Arrays.equals(Arrays.copyOfRange(d1, 0, k1), new int[]{1, 2}));

        int[] d2 = {0, 0, 1, 1, 1, 2, 2, 3, 3, 4};
        int k2 = Solution.removeDuplicates(d2);
        check("removeDuplicates: longer example", k2 == 5 && Arrays.equals(Arrays.copyOfRange(d2, 0, k2), new int[]{0, 1, 2, 3, 4}));

        int[] d3 = {1, 2, 3};
        int k3 = Solution.removeDuplicates(d3);
        check("removeDuplicates: no duplicates", k3 == 3 && Arrays.equals(Arrays.copyOfRange(d3, 0, k3), new int[]{1, 2, 3}));

        int[] d4 = {7, 7, 7};
        int k4 = Solution.removeDuplicates(d4);
        check("removeDuplicates: all elements identical", k4 == 1 && Arrays.equals(Arrays.copyOfRange(d4, 0, k4), new int[]{7}));

        int[] d5 = {5};
        int k5 = Solution.removeDuplicates(d5);
        check("removeDuplicates: single element", k5 == 1 && Arrays.equals(Arrays.copyOfRange(d5, 0, k5), new int[]{5}));

        check("removeDuplicates: empty array returns 0", Solution.removeDuplicates(new int[]{}) == 0);

        int[] d6 = {-3, -3, -1, 0, 0};
        int k6 = Solution.removeDuplicates(d6);
        check("removeDuplicates: negative values", k6 == 3 && Arrays.equals(Arrays.copyOfRange(d6, 0, k6), new int[]{-3, -1, 0}));

        // majorityElement
        check("majorityElement: simple majority", Solution.majorityElement(new int[]{3, 2, 3}) == 3);
        check("majorityElement: majority split across the array", Solution.majorityElement(new int[]{2, 2, 1, 1, 1, 2, 2}) == 2);
        check("majorityElement: single element", Solution.majorityElement(new int[]{5}) == 5);
        check("majorityElement: all elements identical", Solution.majorityElement(new int[]{4, 4, 4, 4}) == 4);
        check("majorityElement: negative majority", Solution.majorityElement(new int[]{-1, -1, 2, -1, 3}) == -1);
        check("majorityElement: majority concentrated at the end", Solution.majorityElement(new int[]{1, 2, 9, 9, 9}) == 9);

        // rotate
        int[] r1 = {1, 2, 3, 4, 5, 6, 7};
        Solution.rotate(r1, 3);
        check("rotate: classic example mutates in place", Arrays.equals(r1, new int[]{5, 6, 7, 1, 2, 3, 4}));

        int[] r2 = {-1, -100, 3, 99};
        Solution.rotate(r2, 2);
        check("rotate: negatives", Arrays.equals(r2, new int[]{3, 99, -1, -100}));

        int[] r3 = {1, 2, 3};
        Solution.rotate(r3, 0);
        check("rotate: k = 0 is a no-op", Arrays.equals(r3, new int[]{1, 2, 3}));

        int[] r4 = {1, 2, 3};
        Solution.rotate(r4, 3);
        check("rotate: k equal to length is a no-op", Arrays.equals(r4, new int[]{1, 2, 3}));

        int[] r5 = {1, 2};
        Solution.rotate(r5, 5);
        check("rotate: k larger than length wraps", Arrays.equals(r5, new int[]{2, 1}));

        int[] r6 = {42};
        Solution.rotate(r6, 10);
        check("rotate: single element", Arrays.equals(r6, new int[]{42}));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
