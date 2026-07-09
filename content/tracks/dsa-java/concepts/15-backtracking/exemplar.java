import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

class Solution {

    private static final Map<Character, String> KEYPAD = Map.of(
        '2', "abc", '3', "def", '4', "ghi", '5', "jkl",
        '6', "mno", '7', "pqrs", '8', "tuv", '9', "wxyz");

    // One choice per slot: position i picks one letter of digits.charAt(i).
    // The StringBuilder append/setLength pair is the choose/unchoose step.
    // O(n * 4^n) time, O(n) recursion depth.
    public static List<String> letterCombinations(String digits) {
        var result = new ArrayList<String>();
        if (digits.isEmpty()) return result;
        letterCombinationsHelper(digits, 0, new StringBuilder(), result);
        return result;
    }

    private static void letterCombinationsHelper(String digits, int i, StringBuilder current, List<String> result) {
        if (i == digits.length()) {
            result.add(current.toString());
            return;
        }
        String letters = KEYPAD.get(digits.charAt(i));
        for (int j = 0; j < letters.length(); j++) {
            current.append(letters.charAt(j));
            letterCombinationsHelper(digits, i + 1, current, result);
            current.setLength(current.length() - 1);
        }
    }

    // Permutations via a shared path and a used[] array: each level picks
    // any element not yet on the path.
    // O(n * n!) time, O(n) recursion depth.
    public static List<List<Integer>> permute(int[] nums) {
        var result = new ArrayList<List<Integer>>();
        var path = new ArrayList<Integer>();
        boolean[] used = new boolean[nums.length];
        permuteHelper(nums, path, used, result);
        return result;
    }

    private static void permuteHelper(int[] nums, List<Integer> path, boolean[] used, List<List<Integer>> result) {
        if (path.size() == nums.length) {
            result.add(new ArrayList<>(path)); // snapshot — path is shared and mutated
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.add(nums[i]);
            permuteHelper(nums, path, used, result);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }

    // Start-index recursion with reuse: recursing with i (not i + 1) lets
    // the same candidate repeat, while never going below i keeps every
    // combination non-decreasing — that canonical form is what prevents
    // duplicates. Sorting enables the break-style prune.
    // O(b^(t/m)) worst case.
    public static List<List<Integer>> combinationSum(int[] candidates, int target) {
        int[] sorted = candidates.clone();
        Arrays.sort(sorted);
        var result = new ArrayList<List<Integer>>();
        combinationSumHelper(sorted, target, 0, new ArrayList<>(), result);
        return result;
    }

    private static void combinationSumHelper(int[] sorted, int remaining, int start,
                                              List<Integer> path, List<List<Integer>> result) {
        if (remaining == 0) {
            result.add(new ArrayList<>(path));
            return;
        }
        for (int i = start; i < sorted.length; i++) {
            if (sorted[i] > remaining) break; // sorted -> every later candidate is bigger
            path.add(sorted[i]);
            combinationSumHelper(sorted, remaining - sorted[i], i, path, result); // i, not i + 1: reuse allowed
            path.remove(path.size() - 1);
        }
    }

    // Constraint counters: "(" is legal while open < n, ")" while close < open.
    // The guards make invalid strings unreachable, so every leaf is well-formed.
    // O(4^n / sqrt(n)) time (Catalan count), O(n) recursion depth.
    public static List<String> generateParenthesis(int n) {
        var result = new ArrayList<String>();
        generateParenthesisHelper(n, new StringBuilder(), 0, 0, result);
        return result;
    }

    private static void generateParenthesisHelper(int n, StringBuilder current, int open, int close, List<String> result) {
        if (current.length() == 2 * n) {
            result.add(current.toString());
            return;
        }
        if (open < n) {
            current.append('(');
            generateParenthesisHelper(n, current, open + 1, close, result);
            current.setLength(current.length() - 1);
        }
        if (close < open) {
            current.append(')');
            generateParenthesisHelper(n, current, open, close + 1, result);
            current.setLength(current.length() - 1);
        }
    }

    public static void main(String[] args) {
        System.out.println(letterCombinations("23"));
        // [ad, ae, af, bd, be, bf, cd, ce, cf]

        System.out.println(permute(new int[]{1, 2, 3}));
        // [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

        System.out.println(combinationSum(new int[]{2, 3, 6, 7}, 7));
        // [[2,2,3],[7]]

        System.out.println(generateParenthesis(3));
        // [((())), (()()), (())(), ()(()), ()()()]
    }
}
