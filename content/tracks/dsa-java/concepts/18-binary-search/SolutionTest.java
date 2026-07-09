public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    // idx is a valid peak of nums (edges border -Infinity)
    static boolean isPeak(int[] nums, int idx) {
        if (idx < 0 || idx >= nums.length) return false;
        boolean leftOk = idx == 0 || nums[idx] > nums[idx - 1];
        boolean rightOk = idx == nums.length - 1 || nums[idx] > nums[idx + 1];
        return leftOk && rightOk;
    }

    public static void main(String[] args) {
        // searchInsert
        check("searchInsert: target present",
              Solution.searchInsert(new int[]{1, 3, 5, 6}, 5) == 2);
        check("searchInsert: target between elements",
              Solution.searchInsert(new int[]{1, 3, 5, 6}, 2) == 1);
        check("searchInsert: target larger than everything",
              Solution.searchInsert(new int[]{1, 3, 5, 6}, 7) == 4);
        check("searchInsert: target smaller than everything",
              Solution.searchInsert(new int[]{1, 3, 5, 6}, 0) == 0);
        check("searchInsert: empty array",
              Solution.searchInsert(new int[]{}, 4) == 0);
        check("searchInsert: single element, found",
              Solution.searchInsert(new int[]{5}, 5) == 0);
        check("searchInsert: single element, insert after",
              Solution.searchInsert(new int[]{5}, 9) == 1);
        check("searchInsert: negative values",
              Solution.searchInsert(new int[]{-10, -3, 0, 4}, -3) == 1
              && Solution.searchInsert(new int[]{-10, -3, 0, 4}, -2) == 2);

        // findPeakElement
        check("findPeakElement: single interior peak",
              Solution.findPeakElement(new int[]{1, 2, 3, 1}) == 2);
        check("findPeakElement: two peaks, either accepted",
              isPeak(new int[]{1, 2, 1, 3, 5, 6, 4},
                     Solution.findPeakElement(new int[]{1, 2, 1, 3, 5, 6, 4})));
        check("findPeakElement: single element",
              Solution.findPeakElement(new int[]{1}) == 0);
        check("findPeakElement: two elements, descending",
              Solution.findPeakElement(new int[]{2, 1}) == 0);
        check("findPeakElement: two elements, ascending",
              Solution.findPeakElement(new int[]{1, 2}) == 1);
        check("findPeakElement: strictly ascending — peak at the end",
              Solution.findPeakElement(new int[]{1, 2, 3, 4, 5}) == 4);
        check("findPeakElement: strictly descending — peak at the start",
              Solution.findPeakElement(new int[]{5, 4, 3, 2, 1}) == 0);
        check("findPeakElement: negative values",
              isPeak(new int[]{-5, -1, -3, -7},
                     Solution.findPeakElement(new int[]{-5, -1, -3, -7})));

        // searchRotated
        check("searchRotated: target in the rotated tail",
              Solution.searchRotated(new int[]{4, 5, 6, 7, 0, 1, 2}, 0) == 4);
        check("searchRotated: target absent",
              Solution.searchRotated(new int[]{4, 5, 6, 7, 0, 1, 2}, 3) == -1);
        check("searchRotated: target in the sorted head",
              Solution.searchRotated(new int[]{4, 5, 6, 7, 0, 1, 2}, 5) == 1);
        check("searchRotated: not rotated at all",
              Solution.searchRotated(new int[]{1, 2, 3}, 2) == 1);
        check("searchRotated: single element, found",
              Solution.searchRotated(new int[]{1}, 1) == 0);
        check("searchRotated: single element, absent",
              Solution.searchRotated(new int[]{1}, 0) == -1);
        check("searchRotated: two elements rotated",
              Solution.searchRotated(new int[]{3, 1}, 1) == 1
              && Solution.searchRotated(new int[]{3, 1}, 3) == 0);
        check("searchRotated: target at the pivot (minimum)",
              Solution.searchRotated(new int[]{5, 6, 7, 1, 2, 3}, 1) == 3);
        check("searchRotated: target at both ends",
              Solution.searchRotated(new int[]{6, 7, 8, 1, 2, 3}, 6) == 0
              && Solution.searchRotated(new int[]{6, 7, 8, 1, 2, 3}, 3) == 5);

        // searchRange
        check("searchRange: run in the middle",
              java.util.Arrays.equals(Solution.searchRange(new int[]{5, 7, 7, 8, 8, 10}, 8), new int[]{3, 4}));
        check("searchRange: target absent inside value range",
              java.util.Arrays.equals(Solution.searchRange(new int[]{5, 7, 7, 8, 8, 10}, 6), new int[]{-1, -1}));
        check("searchRange: empty array",
              java.util.Arrays.equals(Solution.searchRange(new int[]{}, 0), new int[]{-1, -1}));
        check("searchRange: whole array equals target",
              java.util.Arrays.equals(Solution.searchRange(new int[]{2, 2, 2}, 2), new int[]{0, 2}));
        check("searchRange: single occurrence",
              java.util.Arrays.equals(Solution.searchRange(new int[]{1, 4}, 4), new int[]{1, 1}));
        check("searchRange: target smaller than everything",
              java.util.Arrays.equals(Solution.searchRange(new int[]{3, 4, 5}, 1), new int[]{-1, -1}));
        check("searchRange: target larger than everything",
              java.util.Arrays.equals(Solution.searchRange(new int[]{3, 4, 5}, 9), new int[]{-1, -1}));
        check("searchRange: run at the start",
              java.util.Arrays.equals(Solution.searchRange(new int[]{1, 1, 2, 3}, 1), new int[]{0, 1}));
        check("searchRange: run at the end",
              java.util.Arrays.equals(Solution.searchRange(new int[]{1, 2, 3, 3, 3}, 3), new int[]{2, 4}));
        check("searchRange: negative values",
              java.util.Arrays.equals(Solution.searchRange(new int[]{-4, -4, -2, 0}, -4), new int[]{0, 1}));

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
