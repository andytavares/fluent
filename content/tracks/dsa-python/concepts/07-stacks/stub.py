# Run: python3 stub.py


def is_valid(s: str) -> bool:
    """Returns True if the bracket string is valid: matching types, properly
    nested. s contains only ()[]{}."""
    # TODO: push openers; on a closer, pop and compare against a
    # closer -> opener dict; finish by checking the stack is empty
    return False


class MinStack:
    """A stack of numbers with O(1) get_min.
    All four methods must be O(1); pop/top/get_min are only called when
    the stack is non-empty."""

    def __init__(self) -> None:
        # TODO: one list of (value, min_so_far) tuples (or two parallel stacks)
        pass

    def push(self, val: int) -> None:
        # TODO: snapshot the min alongside the value —
        # m = val if empty else min(val, self.get_min())
        pass

    def pop(self) -> None:
        # TODO: remove the top entry; the previous entry's snapshot
        # restores the minimum automatically
        pass

    def top(self) -> int:
        # TODO
        return 0

    def get_min(self) -> int:
        # TODO: read it off the top entry — no scanning
        return 0


def eval_rpn(tokens: list[str]) -> int:
    """Evaluates a Reverse Polish Notation expression.
    Division truncates toward zero."""
    # TODO: number stack; on an operator pop b (right) then a (left),
    # push a op b — truncate division toward zero, not Python's floor //
    return 0


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
