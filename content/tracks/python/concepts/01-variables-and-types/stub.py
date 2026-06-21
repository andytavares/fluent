import re


def type_label(value: object) -> str:
    # TODO: return the name of the type of value (e.g. "int", "str", "NoneType")
    return ""


def clamp(value: float, low: float, high: float) -> float:
    # TODO: return value clamped to [low, high]
    return 0.0


def first_number(text: str) -> "int | None":
    # TODO: return the first integer found in text, or None if there is none.
    # Use the walrus operator (:=) in your implementation.
    return None


if __name__ == "__main__":
    print(type_label(42))           # int
    print(type_label("hello"))      # str
    print(type_label(None))         # NoneType
    print(clamp(15, 0, 10))         # 10
    print(clamp(-5, 0, 10))         # 0
    print(clamp(5, 0, 10))          # 5
    print(first_number("foo 42 bar"))  # 42
    print(first_number("no digits"))   # None
