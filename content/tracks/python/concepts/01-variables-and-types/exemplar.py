import re


def type_label(value: object) -> str:
    return type(value).__name__


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(value, high))


def first_number(text: str) -> "int | None":
    if m := re.search(r"-?\d+", text):
        return int(m.group())
    return None
