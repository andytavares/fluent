import java.util.Arrays;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // isValidParentheses — valid
        check("valid: ()",         Solution.isValidParentheses("()"));
        check("valid: ()[]{}",     Solution.isValidParentheses("()[]{}"));
        check("valid: {[]}",       Solution.isValidParentheses("{[]}"));
        check("valid: empty",      Solution.isValidParentheses(""));
        check("valid: ((()))",     Solution.isValidParentheses("((()))"));

        // isValidParentheses — invalid
        check("invalid: ([)]",     !Solution.isValidParentheses("([)]"));
        check("invalid: (]",       !Solution.isValidParentheses("(]"));
        check("invalid: ]",        !Solution.isValidParentheses("]"));
        check("invalid: ([",       !Solution.isValidParentheses("(["));
        check("invalid: )()",      !Solution.isValidParentheses(")()"));

        // dailyTemperatures
        check("dt: classic case",
              Arrays.equals(Solution.dailyTemperatures(new int[]{73,74,75,71,69,72,76,73}),
                            new int[]{1,1,4,2,1,1,0,0}));
        check("dt: strictly increasing",
              Arrays.equals(Solution.dailyTemperatures(new int[]{30,40,50,60}),
                            new int[]{1,1,1,0}));
        check("dt: strictly decreasing",
              Arrays.equals(Solution.dailyTemperatures(new int[]{90,80,70,60}),
                            new int[]{0,0,0,0}));
        check("dt: single element",
              Arrays.equals(Solution.dailyTemperatures(new int[]{50}), new int[]{0}));

        // largestRectangleInHistogram
        check("histogram: [2,1,5,6,2,3] -> 10",
              Solution.largestRectangleInHistogram(new int[]{2,1,5,6,2,3}) == 10);
        check("histogram: [2,4] -> 4",
              Solution.largestRectangleInHistogram(new int[]{2,4}) == 4);
        check("histogram: uniform [3,3,3,3] -> 12",
              Solution.largestRectangleInHistogram(new int[]{3,3,3,3}) == 12);
        check("histogram: single bar [5] -> 5",
              Solution.largestRectangleInHistogram(new int[]{5}) == 5);
        check("histogram: valley [6,2,5,4,5,1,6] -> 10",
              Solution.largestRectangleInHistogram(new int[]{6,2,5,4,5,1,6}) == 10);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
