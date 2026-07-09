import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;

class Solution {

    /**
     * Returns true if the bracket string is valid: matching types, properly
     * nested. Openers defer an obligation; a closer must discharge the most
     * recent one — LIFO, i.e. a stack.
     * O(n) time, O(n) space.
     */
    public static boolean isValid(String s) {
        Map<Character, Character> openerFor = Map.of(')', '(', ']', '[', '}', '{');
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c);
            } else if (stack.isEmpty() || stack.pop() != openerFor.get(c)) {
                return false; // wrong opener, or empty stack
            }
        }
        return stack.isEmpty(); // leftover openers are the second failure mode
    }

    /**
     * A stack of numbers with O(1) getMin. Each entry stores [value, minSoFar]:
     * the min is snapshotted at push time, so popping restores the previous
     * minimum with no recomputation.
     * All operations O(1), O(n) space.
     */
    static class MinStack {
        private final Deque<int[]> entries = new ArrayDeque<>();

        MinStack() {
        }

        void push(int val) {
            int min = entries.isEmpty() ? val : Math.min(val, getMin());
            entries.push(new int[]{val, min});
        }

        void pop() {
            entries.pop();
        }

        int top() {
            return entries.peek()[0];
        }

        int getMin() {
            return entries.peek()[1];
        }
    }

    /**
     * Evaluates a Reverse Polish Notation expression. Operands wait on the
     * stack; an operator pops b (right) then a (left) and pushes a op b.
     * Java's int division already truncates toward zero.
     * O(n) time, O(n) space.
     */
    public static int evalRPN(String[] tokens) {
        Deque<Integer> stack = new ArrayDeque<>();
        for (String token : tokens) {
            switch (token) {
                case "+" -> {
                    int b = stack.pop(), a = stack.pop();
                    stack.push(a + b);
                }
                case "-" -> {
                    int b = stack.pop(), a = stack.pop();
                    stack.push(a - b);
                }
                case "*" -> {
                    int b = stack.pop(), a = stack.pop();
                    stack.push(a * b);
                }
                case "/" -> {
                    int b = stack.pop(), a = stack.pop();
                    stack.push(a / b);
                }
                default -> stack.push(Integer.parseInt(token));
            }
        }
        return stack.pop();
    }

    public static void main(String[] args) {
        System.out.println(isValid("()[]{}")); // true
        System.out.println(isValid("([)]"));   // false

        MinStack st = new MinStack();
        st.push(-2);
        st.push(0);
        st.push(-3);
        System.out.println(st.getMin()); // -3
        st.pop();
        System.out.println(st.top() + " " + st.getMin()); // 0 -2

        System.out.println(evalRPN(new String[]{"2", "1", "+", "3", "*"})); // 9
    }
}
