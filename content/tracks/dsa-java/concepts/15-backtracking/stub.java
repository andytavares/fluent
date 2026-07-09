import java.util.ArrayList;
import java.util.List;

class Solution {

    // digits is a string of characters '2'-'9', possibly empty.
    // Returns every letter string spelled by the digits (phone keypad):
    // 2->abc 3->def 4->ghi 5->jkl 6->mno 7->pqrs 8->tuv 9->wxyz.
    // "" -> [] (not [""]).
    public static List<String> letterCombinations(String digits) {
        // TODO: guard the empty input first (return empty list);
        // recurse on position i, appending each letter of digits[i] —
        // build the current string with a StringBuilder and undo the
        // append (setLength) after each recursive call
        return new ArrayList<>();
    }

    // nums is an array of distinct integers. Returns all permutations, any order.
    public static List<List<Integer>> permute(int[] nums) {
        // TODO: shared path + used[] boolean array;
        // record a copy of path when path.size() == nums.length;
        // choose -> recurse -> pop AND unmark used[i]
        return new ArrayList<>();
    }

    // candidates are distinct positive integers; target is a positive
    // integer. Returns all unique combinations summing to target; each
    // candidate may be reused unlimited times.
    public static List<List<Integer>> combinationSum(int[] candidates, int target) {
        // TODO: sort ascending; bt(start, remaining, path);
        // break when candidates[i] > remaining;
        // recurse with i (NOT i + 1) so the same candidate can repeat
        return new ArrayList<>();
    }

    // Returns all well-formed strings of n pairs of parentheses.
    public static List<String> generateParenthesis(int n) {
        // TODO: recurse with (current, open, close);
        // add '(' while open < n, add ')' while close < open;
        // record when current.length() == 2 * n
        return new ArrayList<>();
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
