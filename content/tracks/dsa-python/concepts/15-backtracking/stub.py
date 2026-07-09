def subsets(nums: list[int]) -> list[list[int]]:
    """Return all possible subsets (power set). Input has no duplicates."""
    # TODO: backtrack(start, current): append current[:] to result each call,
    #       then for i in range(start, len(nums)): add nums[i], recurse(i+1), pop
    return []


def permutations(nums: list[int]) -> list[list[int]]:
    """Return all permutations of nums. Input has no duplicates."""
    # TODO: backtrack(current, remaining): if not remaining append result;
    #       for each i, recurse with nums[i] chosen and remaining without it
    return []


def combination_sum(candidates: list[int], target: int) -> list[list[int]]:
    """Return all unique combinations summing to target. Reuse candidates."""
    # TODO: sort candidates; backtrack(start, current, remaining);
    #       break early if candidates[i] > remaining
    return []


if __name__ == "__main__":
    print(subsets([1, 2, 3]))         # 8 subsets
    print(permutations([1, 2, 3]))    # 6 permutations
    print(combination_sum([2, 3, 6, 7], 7))  # [[2,2,3],[7]]
    print(combination_sum([2, 3, 5], 8))     # [[2,2,2,2],[2,3,3],[3,5]]
