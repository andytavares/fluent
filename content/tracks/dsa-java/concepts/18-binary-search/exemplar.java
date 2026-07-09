class Solution {

    public static int binarySearch(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if      (nums[mid] == target) return mid;
            else if (nums[mid] <  target) left  = mid + 1;
            else                          right = mid - 1;
        }
        return -1;
    }

    public static int searchInsertPosition(int[] nums, int target) {
        int left = 0, right = nums.length;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < target) left  = mid + 1;
            else                    right = mid;
        }
        return left;
    }

    public static int findMinInRotatedArray(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) left  = mid + 1;
            else                         right = mid;
        }
        return nums[left];
    }

    public static void main(String[] args) {
        System.out.println(binarySearch(new int[]{1,3,5,7,9}, 7));  // 3
        System.out.println(binarySearch(new int[]{1,3,5,7,9}, 4));  // -1
        System.out.println(searchInsertPosition(new int[]{1,3,5,6}, 5)); // 2
        System.out.println(searchInsertPosition(new int[]{1,3,5,6}, 2)); // 1
        System.out.println(findMinInRotatedArray(new int[]{3,4,5,1,2})); // 1
    }
}
