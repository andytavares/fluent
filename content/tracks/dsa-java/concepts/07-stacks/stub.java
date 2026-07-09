import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;

class Solution {

    /**
     * Returns true if the bracket string is valid: matching types, properly
     * nested. s contains only ()[]{}.
     */
    public static boolean isValid(String s) {
        // TODO: push openers; on a closer, check isEmpty() then pop and
        // compare against a closer -> opener map; finish by checking the
        // stack is empty
        return false;
    }

    /**
     * A stack of numbers with O(1) getMin.
     * All four methods must be O(1); pop/top/getMin are only called when
     * the stack is non-empty.
     */
    static class MinStack {
        MinStack() {
            // TODO: one Deque<int[]> of [value, minSoFar] pairs
        }

        void push(int val) {
            // TODO: snapshot the min alongside the value -
            // min = empty ? val : Math.min(val, this.getMin())
        }

        void pop() {
            // TODO: remove the top entry; the previous entry's snapshot
            // restores the minimum automatically
        }

        int top() {
            // TODO
            return 0;
        }

        int getMin() {
            // TODO: read it off the top entry - no scanning
            return 0;
        }
    }

    /**
     * Evaluates a Reverse Polish Notation expression.
     * Division truncates toward zero.
     */
    public static int evalRPN(String[] tokens) {
        // TODO: number stack; on an operator pop b (right) then a (left),
        // push a op b - plain int division already truncates toward zero
        return 0;
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
