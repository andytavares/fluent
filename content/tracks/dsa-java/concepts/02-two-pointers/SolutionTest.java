import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    // Sort triplets for order-independent comparison.
    static List<List<Integer>> sortTriplets(List<List<Integer>> triplets) {
        List<List<Integer>> copy = new ArrayList<>();
        for (List<Integer> t : triplets) {
            List<Integer> inner = new ArrayList<>(t);
            inner.sort(Comparator.naturalOrder());
            copy.add(inner);
        }
        copy.sort((a, b) -> {
            for (int i = 0; i < 3; i++) {
                if (!a.get(i).equals(b.get(i))) return a.get(i) - b.get(i);
            }
            return 0;
        });
        return copy;
    }

    public static void main(String[] args) {
        // isPalindrome
        check("palindrome: classic sentence", Solution.isPalindrome("A man, a plan, a canal: Panama"));
        check("not palindrome: race a car", !Solution.isPalindrome("race a car"));
        check("palindrome: single space", Solution.isPalindrome(" "));
        check("palindrome: empty string", Solution.isPalindrome(""));
        check("palindrome: simple word", Solution.isPalindrome("racecar"));
        check("palindrome: digits only", Solution.isPalindrome("12321"));
        check("not palindrome: digit vs letter", !Solution.isPalindrome("0P"));
        check("palindrome: mixed punctuation", Solution.isPalindrome("Was it a car or a cat I saw?"));
        check("palindrome: single character", Solution.isPalindrome("a"));
        check("not palindrome: two different chars", !Solution.isPalindrome("ab"));

        // twoSumII
        check("twoSumII: classic example", Arrays.equals(Solution.twoSumII(new int[]{2, 7, 11, 15}, 9), new int[]{1, 2}));
        check("twoSumII: pair not adjacent", Arrays.equals(Solution.twoSumII(new int[]{2, 3, 4}, 6), new int[]{1, 3}));
        check("twoSumII: negative numbers", Arrays.equals(Solution.twoSumII(new int[]{-1, 0}, -1), new int[]{1, 2}));
        check("twoSumII: duplicate values form the pair", Arrays.equals(Solution.twoSumII(new int[]{1, 1, 2}, 2), new int[]{1, 2}));
        check("twoSumII: pair at the two ends", Arrays.equals(Solution.twoSumII(new int[]{1, 3, 5, 10}, 11), new int[]{1, 4}));
        check("twoSumII: pair in the middle", Arrays.equals(Solution.twoSumII(new int[]{1, 4, 6, 20}, 10), new int[]{2, 3}));

        // containerWithMostWater
        check("container: classic example = 49", Solution.containerWithMostWater(new int[]{1, 8, 6, 2, 5, 4, 8, 3, 7}) == 49);
        check("container: two elements equal", Solution.containerWithMostWater(new int[]{1, 1}) == 1);
        check("container: two elements unequal", Solution.containerWithMostWater(new int[]{4, 3}) == 3);
        check("container: ascending heights", Solution.containerWithMostWater(new int[]{1, 2, 3, 4, 5}) == 6);
        check("container: all same height", Solution.containerWithMostWater(new int[]{5, 5, 5, 5}) == 15);
        check("container: best pair not at ends", Solution.containerWithMostWater(new int[]{1, 5, 4, 5, 1}) == 10);
        check("container: includes zero height", Solution.containerWithMostWater(new int[]{0, 2, 0}) == 0);

        // threeSum
        List<List<Integer>> ts1 = sortTriplets(Solution.threeSum(new int[]{-1, 0, 1, 2, -1, -4}));
        List<List<Integer>> expected1 = sortTriplets(List.of(List.of(-1, -1, 2), List.of(-1, 0, 1)));
        check("threeSum: classic example", ts1.equals(expected1));

        check("threeSum: no valid triplets", Solution.threeSum(new int[]{0, 1, 1}).isEmpty());

        check("threeSum: all zeros", sortTriplets(Solution.threeSum(new int[]{0, 0, 0})).equals(List.of(List.of(0, 0, 0))));

        List<List<Integer>> ts2 = sortTriplets(Solution.threeSum(new int[]{-2, 0, 0, 2, 2}));
        check("threeSum: heavy duplicates yield one triplet", ts2.equals(List.of(List.of(-2, 0, 2))));

        check("threeSum: empty array", Solution.threeSum(new int[]{}).isEmpty());
        check("threeSum: two elements", Solution.threeSum(new int[]{0, 0}).isEmpty());
        check("threeSum: all positive no solution", Solution.threeSum(new int[]{1, 2, 3, 4}).isEmpty());
        check("threeSum: all negative no solution", Solution.threeSum(new int[]{-4, -3, -2, -1}).isEmpty());

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
