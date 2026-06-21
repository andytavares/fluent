class ParseError(ValueError):
    def __init__(self, raw: str) -> None:
        super().__init__(f"cannot parse: '{raw}'")
        self.raw = raw


def safe_divide(a: float, b: float) -> float:
    if b == 0:
        raise ValueError("division by zero") from None
    return a / b


class Accumulator:
    def __init__(self, *suppress_types) -> None:
        self._suppress_types = suppress_types
        self.errors: list[type] = []

    def __enter__(self) -> "Accumulator":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> bool:
        if exc_type is not None and issubclass(exc_type, self._suppress_types):
            self.errors.append(exc_type)
            return True
        return False
