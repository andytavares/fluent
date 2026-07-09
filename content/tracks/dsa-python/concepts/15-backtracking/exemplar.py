def subsets(nums: list[int]) -> list[list[int]]:
    """Return all possible subsets (power set). Input has no duplicates."""
    result: list[list[int]] = []

    def backtrack(start: int, current: list[int]) -> None:
        result.append(current[:])
        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()

    backtrack(0, [])
    return result


def permutations(nums: list[int]) -> list[list[int]]:
    """Return all permutations of nums. Input has no duplicates."""
    result: list[list[int]] = []

    def backtrack(current: list[int], remaining: list[int]) -> None:
        if not remaining:
            result.append(current[:])
            return
        for i in range(len(remaining)):
            current.append(remaining[i])
            backtrack(current, remaining[:i] + remaining[i + 1:])
            current.pop()

    backtrack([], nums)
    return result


def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
    """Return all unique combinations summing to target. Reuse candidates."""
    result: list[list[int]] = []
    candidates.sort()

    def backtrack(start: int, current: list[int], remaining: int) -> None:
        if remaining == 0:
            result.append(current[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remaining:
                break
            current.append(candidates[i])
            backtrack(i, current, remaining - candidates[i])
            current.pop()

    backtrack(0, [], target)
    return result
