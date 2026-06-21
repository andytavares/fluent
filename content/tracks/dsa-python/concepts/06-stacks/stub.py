def is_valid_parentheses(s: str) -> bool:
    """Return True if every open bracket has a matching close bracket
    in the correct order. Valid pairs: (), [], {}."""
    # TODO: push open brackets; on close, check top matches and pop
    return False


def daily_temperatures(temps: list[int]) -> list[int]:
    """For each day i, return days to wait until a warmer temperature.
    Return 0 if no warmer future day exists."""
    # TODO: monotonic decreasing stack of indices; pop when current temp is warmer
    return []


def largest_rectangle_in_histogram(heights: list[int]) -> int:
    """Given bar heights, return the area of the largest fitting rectangle."""
    # TODO: monotonic increasing stack of indices; pop when current height is smaller;
    #       append a sentinel 0 to flush all remaining bars
    return 0


if __name__ == "__main__":
    print(is_valid_parentheses("()"))              # True
    print(is_valid_parentheses("()[]{}")  )        # True
    print(is_valid_parentheses("(]"))              # False
    print(is_valid_parentheses("{[]}"))            # True
    print(daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]))  # [1,1,4,2,1,1,0,0]
    print(daily_temperatures([30, 60, 90]))                        # [1,1,0]
    print(largest_rectangle_in_histogram([2, 1, 5, 6, 2, 3]))    # 10
    print(largest_rectangle_in_histogram([2, 4]))                  # 4
