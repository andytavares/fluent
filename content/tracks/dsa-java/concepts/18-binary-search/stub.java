class Solution {

    public static int binarySearch(int[] nums, int target) {
        // TODO
        return -1;
    }

    public static int searchInsertPosition(int[] nums, int target) {
        // TODO
        return 0;
    }

    public static int findMinInRotatedArray(int[] nums) {
        // TODO
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(binarySearch(new int[]{1,3,5,7,9}, 7));  // 3
        System.out.println(binarySearch(new int[]{1,3,5,7,9}, 4));  // -1
        System.out.println(searchInsertPosition(new int[]{1,3,5,6}, 5)); // 2
        System.out.println(searchInsertPosition(new int[]{1,3,5,6}, 2)); // 1
        System.out.println(findMinInRotatedArray(new int[]{3,4,5,1,2})); // 1
    }
}
