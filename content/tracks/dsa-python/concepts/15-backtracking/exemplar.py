# Run: python3 exemplar.py

KEYPAD = {
    "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
    "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",
}


def letter_combinations(digits):
    """One choice per slot: position i picks one letter of digits[i].
    Strings are immutable, so passing current + ch needs no undo step.
    O(n * 4^n) time, O(n) recursion depth.
    """
    if len(digits) == 0:
        return []
    result = []

    def bt(i, current):
        if i == len(digits):
            result.append(current)
            return
        for ch in KEYPAD[digits[i]]:
            bt(i + 1, current + ch)

    bt(0, "")
    return result


def permute(nums):
    """Permutations via a shared path and a used[] list: each level picks any
    element not yet on the path. O(n * n!) time, O(n) recursion depth.
    """
    result = []
    path = []
    used = [False] * len(nums)

    def bt():
        if len(path) == len(nums):
            result.append(list(path))  # snapshot -- path is shared and mutated
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            bt()
            path.pop()
            used[i] = False

    bt()
    return result


def combination_sum(candidates, target):
    """Start-index recursion with reuse: recursing with i (not i + 1) lets the
    same candidate repeat, while never going below i keeps every combination
    non-decreasing -- that canonical form is what prevents duplicates.
    Sorting enables the break-style prune. O(b^(t/m)) worst case.
    """
    sorted_candidates = sorted(candidates)
    result = []
    path = []

    def bt(start, remaining):
        if remaining == 0:
            result.append(list(path))
            return
        for i in range(start, len(sorted_candidates)):
            if sorted_candidates[i] > remaining:
                break  # sorted -> every later candidate is bigger
            path.append(sorted_candidates[i])
            bt(i, remaining - sorted_candidates[i])  # i, not i + 1: reuse allowed
            path.pop()

    bt(0, target)
    return result


def generate_parenthesis(n):
    """Constraint counters: "(" is legal while open_count < n, ")" while
    close_count < open_count. The guards make invalid strings unreachable,
    so every leaf is well-formed.
    O(4^n / sqrt(n)) time (Catalan count), O(n) recursion depth.
    """
    result = []

    def bt(current, open_count, close_count):
        if len(current) == 2 * n:
            result.append(current)
            return
        if open_count < n:
            bt(current + "(", open_count + 1, close_count)
        if close_count < open_count:
            bt(current + ")", open_count, close_count + 1)

    bt("", 0, 0)
    return result


def main():
    print(letter_combinations("23"))
    # ["ad","ae","af","bd","be","bf","cd","ce","cf"]

    print(permute([1, 2, 3]))
    # [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

    print(combination_sum([2, 3, 6, 7], 7))
    # [[2,2,3],[7]]

    print(generate_parenthesis(3))
    # ["((()))","(()())","(())()","()(())","()()()"]


if __name__ == "__main__":
    main()
