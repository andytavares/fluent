def is_valid_parentheses(s: str) -> bool:
    """Return True if every open bracket has a matching close bracket
    in the correct order. Valid pairs: (), [], {}."""
    stack: list[str] = []
    matching = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        else:
            if not stack or stack[-1] != matching[ch]:
                return False
            stack.pop()
    return len(stack) == 0


def daily_temperatures(temps: list[int]) -> list[int]:
    """For each day i, return days to wait until a warmer temperature."""
    result = [0] * len(temps)
    stack: list[int] = []  # indices; temps[stack[-1]] is smallest unsatisfied
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            result[j] = i - j
        stack.append(i)
    return result


def largest_rectangle_in_histogram(heights: list[int]) -> int:
    """Given bar heights, return the area of the largest fitting rectangle."""
    stack: list[int] = []  # indices of monotonically increasing heights
    max_area = 0
    for i, h in enumerate(heights + [0]):   # sentinel 0 flushes remaining bars
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            width = i if not stack else i - stack[-1] - 1
            max_area = max(max_area, height * width)
        stack.append(i)
    return max_area
