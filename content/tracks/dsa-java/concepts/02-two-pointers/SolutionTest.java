import java.util.Arrays;
import java.util.List;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // isPalindrome
        check("palindrome: classic sentence",
              Solution.isPalindrome("A man, a plan, a canal: Panama"));
        check("palindrome: simple word",
              Solution.isPalindrome("racecar"));
        check("palindrome: single char",
              Solution.isPalindrome("a"));
        check("palindrome: empty string",
              Solution.isPalindrome(""));
        check("palindrome: all punctuation",
              Solution.isPalindrome(",.!"));
        check("not palindrome: race a car",
              !Solution.isPalindrome("race a car"));
        check("not palindrome: hello",
              !Solution.isPalindrome("hello"));

        // containerWithMostWater
        check("container: [1,8,6,2,5,4,8,3,7] = 49",
              Solution.containerWithMostWater(new int[]{1,8,6,2,5,4,8,3,7}) == 49);
        check("container: [1,1] = 1",
              Solution.containerWithMostWater(new int[]{1,1}) == 1);
        check("container: [4,3,2,1,4] = 16",
              Solution.containerWithMostWater(new int[]{4,3,2,1,4}) == 16);
        check("container: two elements [2,10] = 2",
              Solution.containerWithMostWater(new int[]{2,10}) == 2);
        check("container: descending [5,4,3,2,1] = 4",
              Solution.containerWithMostWater(new int[]{5,4,3,2,1}) == 4);

        // threeSum
        List<List<Integer>> ts1 = Solution.threeSum(new int[]{-1, 0, 1, 2, -1, -4});
        check("threeSum: [-1,0,1,2,-1,-4] has 2 triplets", ts1.size() == 2);
        check("threeSum: contains [-1,-1,2]", ts1.contains(List.of(-1, -1, 2)));
        check("threeSum: contains [-1,0,1]", ts1.contains(List.of(-1, 0, 1)));

        List<List<Integer>> ts2 = Solution.threeSum(new int[]{0, 0, 0});
        check("threeSum: [0,0,0] = [[0,0,0]]", ts2.equals(List.of(List.of(0, 0, 0))));

        List<List<Integer>> ts3 = Solution.threeSum(new int[]{1, 2, 3});
        check("threeSum: no valid triplets -> empty", ts3.isEmpty());

        List<List<Integer>> ts4 = Solution.threeSum(new int[]{-2, 0, 1, 1, 2});
        check("threeSum: [-2,0,1,1,2] has 2 triplets", ts4.size() == 2);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
