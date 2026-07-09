# Run: python3 exemplar.py


def is_valid(s: str) -> bool:
    """Returns True if the bracket string is valid: matching types, properly
    nested. Openers defer an obligation; a closer must discharge the most
    recent one — LIFO, i.e. a stack.
    O(n) time, O(n) space."""
    opener_for = {")": "(", "]": "[", "}": "{"}
    stack: list[str] = []
    for c in s:
        if c in "([{":
            stack.append(c)
        elif not stack or stack.pop() != opener_for[c]:
            return False  # wrong opener, or empty stack
    return not stack  # leftover openers are the second failure mode


class MinStack:
    """A stack of numbers with O(1) get_min. Each entry stores
    (value, min_so_far): the min is snapshotted at push time, so popping
    restores the previous minimum with no recomputation.
    All operations O(1), O(n) space."""

    def __init__(self) -> None:
        self.entries: list[tuple[int, int]] = []

    def push(self, val: int) -> None:
        m = val if not self.entries else min(val, self.get_min())
        self.entries.append((val, m))

    def pop(self) -> None:
        self.entries.pop()

    def top(self) -> int:
        return self.entries[-1][0]

    def get_min(self) -> int:
        return self.entries[-1][1]


def eval_rpn(tokens: list[str]) -> int:
    """Evaluates a Reverse Polish Notation expression. Operands wait on the
    stack; an operator pops b (right) then a (left) and pushes a op b.
    Division truncates toward zero (never Python's floor-dividing //).
    O(n) time, O(n) space."""
    ops = {
        "+": lambda a, b: a + b,
        "-": lambda a, b: a - b,
        "*": lambda a, b: a * b,
        "/": lambda a, b: int(a / b),  # truncates toward zero
    }
    stack: list[int] = []
    for token in tokens:
        if token in ops:
            b = stack.pop()  # right operand (pushed last)
            a = stack.pop()  # left operand
            stack.append(ops[token](a, b))
        else:
            stack.append(int(token))
    return stack[0]


def main() -> None:
    print(is_valid("()[]{}"))  # True
    print(is_valid("([)]"))  # False

    st = MinStack()
    st.push(-2)
    st.push(0)
    st.push(-3)
    print(st.get_min())  # -3
    st.pop()
    print(st.top(), st.get_min())  # 0 -2

    print(eval_rpn(["2", "1", "+", "3", "*"]))  # 9


if __name__ == "__main__":
    main()
