public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // binarySearch
        check("bs: found at middle",    Solution.binarySearch(new int[]{1,3,5,7,9}, 5) == 2);
        check("bs: found at index 3",   Solution.binarySearch(new int[]{1,3,5,7,9}, 7) == 3);
        check("bs: found at index 0",   Solution.binarySearch(new int[]{1,3,5,7,9}, 1) == 0);
        check("bs: found at last",      Solution.binarySearch(new int[]{1,3,5,7,9}, 9) == 4);
        check("bs: not found -> -1",    Solution.binarySearch(new int[]{1,3,5,7,9}, 4) == -1);
        check("bs: single elem found",  Solution.binarySearch(new int[]{42}, 42) == 0);
        check("bs: single elem miss",   Solution.binarySearch(new int[]{42}, 1) == -1);
        check("bs: empty -> -1",        Solution.binarySearch(new int[]{}, 1) == -1);

        // searchInsertPosition
        check("sip: target exists",     Solution.searchInsertPosition(new int[]{1,3,5,6}, 5) == 2);
        check("sip: insert between",    Solution.searchInsertPosition(new int[]{1,3,5,6}, 2) == 1);
        check("sip: insert before all", Solution.searchInsertPosition(new int[]{1,3,5,6}, 0) == 0);
        check("sip: insert after all",  Solution.searchInsertPosition(new int[]{1,3,5,6}, 7) == 4);
        check("sip: single, insert before", Solution.searchInsertPosition(new int[]{5}, 3) == 0);
        check("sip: single, exact match",   Solution.searchInsertPosition(new int[]{5}, 5) == 0);

        // findMinInRotatedArray
        check("fmr: [3,4,5,1,2] -> 1",
              Solution.findMinInRotatedArray(new int[]{3,4,5,1,2}) == 1);
        check("fmr: [4,5,6,7,0,1,2] -> 0",
              Solution.findMinInRotatedArray(new int[]{4,5,6,7,0,1,2}) == 0);
        check("fmr: not rotated -> first element",
              Solution.findMinInRotatedArray(new int[]{11,13,15,17}) == 11);
        check("fmr: single element",
              Solution.findMinInRotatedArray(new int[]{1}) == 1);
        check("fmr: two elements, rotated",
              Solution.findMinInRotatedArray(new int[]{2,1}) == 1);
        check("fmr: rotated by 1",
              Solution.findMinInRotatedArray(new int[]{2,3,4,5,1}) == 1);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
