import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {

    public static List<List<Integer>> subsets(int[] nums) {
        var result = new ArrayList<List<Integer>>();
        subsetsHelper(nums, 0, new ArrayList<>(), result);
        return result;
    }

    private static void subsetsHelper(int[] nums, int start, List<Integer> current,
                                      List<List<Integer>> result) {
        result.add(new ArrayList<>(current));
        for (int i = start; i < nums.length; i++) {
            current.add(nums[i]);
            subsetsHelper(nums, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    public static List<List<Integer>> permutations(int[] nums) {
        var result = new ArrayList<List<Integer>>();
        permuteHelper(nums, 0, result);
        return result;
    }

    private static void permuteHelper(int[] nums, int start, List<List<Integer>> result) {
        if (start == nums.length) {
            var perm = new ArrayList<Integer>();
            for (int n : nums) perm.add(n);
            result.add(perm);
            return;
        }
        for (int i = start; i < nums.length; i++) {
            swap(nums, start, i);
            permuteHelper(nums, start + 1, result);
            swap(nums, start, i);
        }
    }

    private static void swap(int[] nums, int i, int j) {
        int tmp = nums[i]; nums[i] = nums[j]; nums[j] = tmp;
    }

    public static List<List<Integer>> combinationSum(int[] candidates, int target) {
        Arrays.sort(candidates);
        var result = new ArrayList<List<Integer>>();
        combinationSumHelper(candidates, target, 0, new ArrayList<>(), result);
        return result;
    }

    private static void combinationSumHelper(int[] candidates, int target, int start,
                                             List<Integer> current, List<List<Integer>> result) {
        if (target == 0) { result.add(new ArrayList<>(current)); return; }
        for (int i = start; i < candidates.length; i++) {
            if (candidates[i] > target) break;
            current.add(candidates[i]);
            combinationSumHelper(candidates, target - candidates[i], i, current, result);
            current.remove(current.size() - 1);
        }
    }

    public static void main(String[] args) {
        System.out.println(subsets(new int[]{1,2,3}));
        System.out.println(permutations(new int[]{1,2,3}));
        System.out.println(combinationSum(new int[]{2,3,6,7}, 7));
    }
}
