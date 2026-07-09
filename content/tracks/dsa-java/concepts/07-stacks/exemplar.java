import java.util.ArrayDeque;
import java.util.Arrays;

class Solution {

    public static boolean isValidParentheses(String s) {
        var stack = new ArrayDeque<Character>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (c == ')' && top != '(') return false;
                if (c == ']' && top != '[') return false;
                if (c == '}' && top != '{') return false;
            }
        }
        return stack.isEmpty();
    }

    public static int[] dailyTemperatures(int[] temps) {
        int n = temps.length;
        int[] result = new int[n];
        var stack = new ArrayDeque<Integer>();
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && temps[i] > temps[stack.peek()]) {
                int idx = stack.pop();
                result[idx] = i - idx;
            }
            stack.push(i);
        }
        return result;
    }

    public static int largestRectangleInHistogram(int[] heights) {
        var stack = new ArrayDeque<Integer>();
        stack.push(-1); // sentinel left boundary

        int maxArea = 0;
        int[] extended = Arrays.copyOf(heights, heights.length + 1); // trailing 0 flushes stack

        for (int i = 0; i < extended.length; i++) {
            while (stack.peek() != -1 && extended[i] < extended[stack.peek()]) {
                int h = extended[stack.pop()];
                int w = i - stack.peek() - 1;
                maxArea = Math.max(maxArea, h * w);
            }
            stack.push(i);
        }
        return maxArea;
    }

    public static void main(String[] args) {
        System.out.println(isValidParentheses("()[]{}")); // true
        System.out.println(isValidParentheses("([)]"));   // false
        System.out.println(Arrays.toString(dailyTemperatures(
            new int[]{73,74,75,71,69,72,76,73}))); // [1,1,4,2,1,1,0,0]
        System.out.println(largestRectangleInHistogram(new int[]{2,1,5,6,2,3})); // 10
    }
}
