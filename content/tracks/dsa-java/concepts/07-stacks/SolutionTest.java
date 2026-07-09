public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // isValid
        check("isValid: single pair", Solution.isValid("()"));
        check("isValid: all three types in sequence", Solution.isValid("()[]{}"));
        check("isValid: wrong closer type", !Solution.isValid("(]"));
        check("isValid: interleaved (not nested)", !Solution.isValid("([)]"));
        check("isValid: proper nesting", Solution.isValid("{[]}"));
        check("isValid: lone opener", !Solution.isValid("("));
        check("isValid: lone closer", !Solution.isValid(")"));
        check("isValid: empty string", Solution.isValid(""));
        check("isValid: leftover openers", !Solution.isValid("(()"));
        check("isValid: closer arrives with empty stack mid-string", !Solution.isValid("()]"));
        check("isValid: deep nesting", Solution.isValid("({[({[]})]})"));

        // MinStack
        Solution.MinStack st1 = new Solution.MinStack();
        st1.push(-2);
        st1.push(0);
        st1.push(-3);
        check("MinStack: getMin after three pushes", st1.getMin() == -3);
        st1.pop();
        check("MinStack: top after pop", st1.top() == 0);
        check("MinStack: getMin after pop restores previous min", st1.getMin() == -2);

        Solution.MinStack st2 = new Solution.MinStack();
        st2.push(5);
        st2.push(1);
        check("MinStack: getMin is the smaller pushed value", st2.getMin() == 1);
        st2.pop();
        check("MinStack: popping the minimum restores the previous one", st2.getMin() == 5);

        Solution.MinStack st3 = new Solution.MinStack();
        st3.push(2);
        st3.push(2);
        st3.push(7);
        st3.pop();
        st3.pop();
        check("MinStack: duplicate minimums survive one pop (getMin)", st3.getMin() == 2);
        check("MinStack: duplicate minimums survive one pop (top)", st3.top() == 2);

        Solution.MinStack st4 = new Solution.MinStack();
        st4.push(42);
        check("MinStack: single element - top and min agree (top)", st4.top() == 42);
        check("MinStack: single element - top and min agree (min)", st4.getMin() == 42);

        Solution.MinStack st5 = new Solution.MinStack();
        st5.push(1);
        st5.push(2);
        st5.push(3);
        check("MinStack: ascending pushes keep the first min", st5.getMin() == 1);
        check("MinStack: ascending pushes - top is the last pushed", st5.top() == 3);

        Solution.MinStack st6 = new Solution.MinStack();
        st6.push(3);
        st6.push(1);
        st6.pop();
        st6.push(2);
        check("MinStack: interleaved push/pop step 1", st6.getMin() == 2);
        st6.push(0);
        check("MinStack: interleaved push/pop step 2", st6.getMin() == 0);
        st6.pop();
        check("MinStack: interleaved push/pop step 3 (min)", st6.getMin() == 2);
        check("MinStack: interleaved push/pop step 3 (top)", st6.top() == 2);

        Solution.MinStack stA = new Solution.MinStack();
        Solution.MinStack stB = new Solution.MinStack();
        stA.push(1);
        stB.push(9);
        check("MinStack: two independent instances don't share state (a)", stA.getMin() == 1);
        check("MinStack: two independent instances don't share state (b)", stB.getMin() == 9);

        // evalRPN
        check("evalRPN: classic example", Solution.evalRPN(new String[]{"2", "1", "+", "3", "*"}) == 9);
        check("evalRPN: division truncates", Solution.evalRPN(new String[]{"4", "13", "5", "/", "+"}) == 6);
        check("evalRPN: single token", Solution.evalRPN(new String[]{"18"}) == 18);
        check("evalRPN: subtraction operand order", Solution.evalRPN(new String[]{"7", "3", "-"}) == 4);
        check("evalRPN: division operand order", Solution.evalRPN(new String[]{"8", "2", "/"}) == 4);
        check("evalRPN: negative operand token", Solution.evalRPN(new String[]{"-11", "5", "+"}) == -6);
        check("evalRPN: truncation toward zero on negative quotient", Solution.evalRPN(new String[]{"-7", "3", "/"}) == -2);
        check("evalRPN: long mixed expression",
              Solution.evalRPN(new String[]{"10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"}) == 22);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
