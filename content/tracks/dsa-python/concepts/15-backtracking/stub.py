# Run: python3 stub.py


def letter_combinations(digits):
    """Return every letter string spelled by the digits (phone keypad).
    2->abc 3->def 4->ghi 5->jkl 6->mno 7->pqrs 8->tuv 9->wxyz
    digits: characters '2'-'9', possibly empty. Any order; "" -> []"""
    # TODO: guard the empty input first (return []);
    # recurse on position i, appending each letter of digits[i] --
    # strings are immutable, so no undo step is needed
    return []


def permute(nums):
    """Return all permutations of nums (distinct integers), any order."""
    # TODO: shared path + used[] boolean list;
    # record list(path) when len(path) == len(nums);
    # choose -> recurse -> pop AND unmark used[i]
    return []


def combination_sum(candidates, target):
    """Return all unique combinations of candidates summing to target.
    Each candidate may be reused unlimited times."""
    # TODO: sort ascending; bt(start, remaining, path);
    # break when candidates[i] > remaining;
    # recurse with i (NOT i + 1) so the same candidate can repeat
    return []


def generate_parenthesis(n):
    """Return all well-formed strings of n pairs of parentheses."""
    # TODO: recurse with (current, open_count, close_count);
    # add "(" while open_count < n, add ")" while close_count < open_count;
    # record when len(current) == 2 * n
    return []


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
