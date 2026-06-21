class ParseError(ValueError):
    # TODO: add __init__(self, raw: str) that sets self.raw and calls super()
    # with message f"cannot parse: '{raw}'"
    pass


def safe_divide(a: float, b: float) -> float:
    # TODO: return a / b; raise ValueError("division by zero") from None if b == 0
    return 0.0


class Accumulator:
    """Context manager that suppresses specified exception types and records them."""

    def __init__(self, *suppress_types) -> None:
        # TODO: store suppress_types; initialize self.errors = []
        self.errors: list[type] = []

    def __enter__(self) -> "Accumulator":
        # TODO: return self
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> bool:
        # TODO: if exc_type is in suppress_types, append exc_type to self.errors
        # and return True (suppress). Otherwise return False (propagate).
        return False


if __name__ == "__main__":
    try:
        raise ParseError("abc123")
    except ParseError as e:
        print(e)        # cannot parse: 'abc123'
        print(e.raw)    # abc123

    print(safe_divide(10, 2))   # 5.0
    try:
        safe_divide(1, 0)
    except ValueError as e:
        print(e)        # division by zero

    with Accumulator(ValueError, TypeError) as acc:
        raise ValueError("oops")
    print(acc.errors)   # [<class 'ValueError'>]
