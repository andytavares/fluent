## What you build

You write four generators: `letter_combinations`, `permute`, `combination_sum` and `generate_parenthesis`. Each one searches a tree of choices: choose an option, explore it, then undo it before the next option. This lesson builds on **Graphs**, and uses the recursion from **Binary Tree**.

## Key concepts

### Backtracking is DFS on the tree of partial solutions

Every problem fills in the same skeleton. Three parts change: the choice set at each node, the base case that records a result, and the pruning that abandons doomed branches early.

```python
def backtrack(path, state):
    if is_complete(path):
        # Record a COPY
        result.append(list(path))
        return
    for choice in choices(state):
        # Prune
        if doomed(choice):
            continue
        # Choose
        path.append(choice)
        # Explore
        backtrack(path, nxt(state, choice))
        # Unchoose: the "backtrack"
        path.pop()
```

The `pop()` separates backtracking from plain DFS. Every frame shares the same `path` list, so each frame must undo its own change before it returns.

### Shape 1: one choice per slot

The candidate has a fixed length. Position `i` picks from a fixed menu, such as the letters of digit `i`. The tree depth equals the input length, and the branching equals the menu size.

```python
def bt(i, current):
    if i == len(digits):
        result.append(current)
        return
    for ch in KEYPAD[digits[i]]:
        bt(i + 1, current + ch)
```

Strings are immutable, so `current + ch` needs no undo step. The "unchoose" is implicit.

### Shape 2: permutations pick any unused element

In a permutation, order matters and each element appears once. Each level picks any unused element. A boolean list parallel to `nums` tracks usage.

```python
def bt(path, used):
    if len(path) == len(nums):
        result.append(list(path))
        return
    for i in range(len(nums)):
        if used[i]:
            continue
        used[i] = True
        path.append(nums[i])
        bt(path, used)
        path.pop()
        used[i] = False
```

### Shape 3: combinations use a start index

In a combination, order does not matter. To generate each subset once, take choices in increasing index order. Each frame considers only indexes `>= start`.

```python
def bt(start, path):
    if done(path):
        result.append(list(path))
        return
    for i in range(start, len(cands)):
        path.append(cands[i])
        # i + 1: each element at most once
        bt(i + 1, path)
        path.pop()
```

For Combination Sum, recurse with `bt(i, ...)` in place of `bt(i + 1, ...)`. Staying at `i` lets the same candidate repeat. Never going below `i` still prevents the same combination in a different order.

### Shape 4: constraint counters guard each move

Some problems have no menu of elements. Each level chooses between a few moves, and counters guard each move. For well-formed parentheses, you can add `(` while `open < n`, and `)` while `close < open`. The guards are the pruning: the search never builds an invalid prefix.

### Pruning cuts the search tree

Sort, then break. With `candidates` sorted ascending, the Combination Sum loop can `break`, not only `continue`, when `candidates[i] > remaining`. Every later candidate is bigger. In N-Queens, three sets (columns, `r - c` diagonals, `r + c` anti-diagonals) reject a square in O(1). Good pruning does not change the worst-case complexity, but it often cuts real search trees by orders of magnitude.

### Complexity of the flagship problems

| Problem | Result count | Time | Space (recursion) |
|---------|-------------|------|-------------------|
| Letter Combinations | up to 4^n | O(n · 4^n) | O(n) |
| Permutations | n! | O(n · n!) | O(n) |
| Combination Sum | input-dependent | O(k · b^(t/m)) worst case | O(t/m) |
| Generate Parentheses | Catalan C(n) ≈ 4^n / n^1.5 | O(4^n / √n) | O(n) |

`t` is the target, `m` the smallest candidate, `b` the branching factor and `k` the average combination length.

## Watch out

- Record a copy: `result.append(list(path))`, not `result.append(path)`. Without the copy, every entry is the same list.
- That shared list is empty when the search finishes, so every recorded entry ends up empty.
- Every append needs a pop. An early `return` between `append` and `pop` corrupts the path for all later branches.
- Keep the choose, explore and unchoose lines next to each other.
- In the start-index shape, `bt(i, ...)` allows unlimited reuse, as in Combination Sum.
- `bt(i + 1, ...)` uses each element once, as in Combinations.
- If you mix up `i` and `i + 1`, you get duplicate or missing results, not a crash. Tests catch it; reading rarely does.
- `break` on `candidates[i] > remaining` is correct only for sorted candidates. Unsorted input needs `continue`, or a sort first.
- `letter_combinations("")` returns `[]`, not `[""]`. Check for empty input before the recursion starts.
- Recursion depth here equals the input length, so Python's limit of about 1000 frames is not a concern.
- Result order does not matter in these problems. The tests sort before they compare, so do not chase one order.

## Problem walkthroughs

### Letter Combinations of a Phone Number ★

**Problem.** Given a string `digits` of characters `'2'`–`'9'`, return every string that picks one letter for each digit. Use the phone keypad mapping: 2→abc, 3→def, 4→ghi, 5→jkl, 6→mno, 7→pqrs, 8→tuv, 9→wxyz. Empty input gives an empty list.

**Example.**

```text
"23" → ["ad","ae","af","bd","be",
        "bf","cd","ce","cf"]
""   → []
```

**Steps.**
1. Return `[]` at once for empty input.
2. Build the digit-to-letters lookup table.
3. Recurse on position `i` with the string built so far. The base case `i == len(digits)` records the string.
4. At position `i`, loop over the letters of `digits[i]`. Append each one and recurse with `i + 1`. Concatenation creates a new string per call, so no undo is necessary.
5. The tree has depth `len(digits)` and branching 3–4. Every leaf is a valid combination, so there is nothing to prune.

**Complexity.** O(n · 4^n) time (up to 4^n results, each of length n) / O(n) recursion depth.

### Combinations

**Problem.** Given `n` and `k`, return all combinations of `k` distinct numbers from `1..n`. Order inside a combination and between combinations does not matter.

**Example.**

```text
n = 4, k = 2 →
[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
```

**Steps.**
1. Use start-index recursion: `bt(start, path)` considers the numbers `start..n` in increasing order. This generates each combination exactly once.
2. Base case: `len(path) == k`. Record a copy.
3. Loop `i` from `start` to `n`: append `i`, recurse `bt(i + 1, path)`, pop.
4. Prune when too few numbers remain. You still need `k - len(path)` numbers, so `i` runs at most to `n - (k - len(path)) + 1`. This replaces exponential dead ends at the tail with an immediate cutoff.

**Complexity.** O(k · C(n, k)) time / O(k) recursion depth.

### Permutations ★

**Problem.** Given a list `nums` of distinct integers, return all its permutations, in any order.

**Example.**

```text
[1,2,3] → [[1,2,3],[1,3,2],[2,1,3],
           [2,3,1],[3,1,2],[3,2,1]]
[1]     → [[1]]
```

**Steps.**
1. Keep a shared `path` and a `used` boolean list.
2. Base case: `len(path) == len(nums)`. Record `list(path)`.
3. Loop over all indexes and skip the used ones. For each unused `i`: mark `used[i]`, append `nums[i]`, recurse, pop, unmark.
4. The `used` list is the "remaining elements" set with an O(1) check. That is cheaper than a new filtered list per frame.
5. Know the swap method for the follow-up. Swap `nums[depth]` with each `i >= depth`, recurse on `depth + 1`, then swap back. It needs no extra lists.

**Complexity.** O(n · n!) time (n! results, O(n) to copy each) / O(n) recursion depth.

### Combination Sum ★

**Problem.** Given distinct positive integers `candidates` and a positive `target`, return all unique combinations of candidates that sum to `target`. A combination can use the same candidate any number of times. Order does not matter, so return no duplicate combinations.

**Example.**

```text
[2,3,6,7], target 7 → [[2,2,3],[7]]
[2,3,5], target 8 →
  [[2,2,2,2],[2,3,3],[3,5]]
```

**Steps.**
1. Sort the candidates ascending. This enables `break` pruning.
2. Recurse `bt(start, remaining, path)`. The base case `remaining == 0` records a copy.
3. Loop `i` from `start`. If `candidates[i] > remaining`, `break`: every later candidate is at least as large.
4. Push `candidates[i]` and recurse with `bt(i, remaining - candidates[i], path)`. Use `i`, not `i + 1`, so the same candidate can repeat.
5. Never going below `i` keeps each combination non-decreasing. That prevents duplicates such as `[2,3,3]` and `[3,2,3]`.
6. Pop after the recursive call returns.

**Complexity.** O(b^(t/m)) nodes in the worst case (`t` is the target, `m` the smallest candidate) / O(t/m) recursion depth.

### N-Queens II

**Problem.** Count the distinct ways to place `n` queens on an `n × n` board so that no two share a row, column or diagonal.

**Example.**

```text
n = 4 → 2
n = 1 → 1
```

**Steps.**
1. Place one queen per row, top to bottom. The construction handles rows, so you check only columns and diagonals.
2. Keep three sets: `cols`, `diag` keyed by `r - c`, and `anti` keyed by `r + c`. A square `(r, c)` is safe if and only if no set contains its key.
3. `bt(row)`: the base case `row == n` increments the count. Otherwise try every column. If it is safe, add the three keys, recurse `bt(row + 1)`, then remove the three keys.
4. The diagonal keys work because all squares on a ↘ diagonal share `r - c`, and all squares on a ↙ diagonal share `r + c`.
5. Only a count is necessary, so there is no path list. The three sets are the whole state.

**Complexity.** O(n!) time in practice, because each row has fewer safe columns than the last / O(n) space for the sets and recursion.

### Generate Parentheses ★

**Problem.** Given `n`, return all well-formed strings of `n` pairs of parentheses. In a well-formed string, every prefix has at least as many `(` as `)`.

**Example.**

```text
n = 3 → ["((()))","(()())","(())()",
         "()(())","()()()"]
n = 1 → ["()"]
```

**Steps.**
1. Recurse with the string so far and two counters: `open` and `close`.
2. Base case: the string has length `2n`. It is complete and, by construction, valid.
3. Add `(` if `open < n`: opens remain. Add `)` if `close < open`: an unmatched `(` waits for its close.
4. Those two guards make invalid strings unreachable. This prunes by construction, not by generate-and-filter. It is why the output size is the Catalan number, not 2^(2n).

**Complexity.** O(4^n / √n) time (Catalan-number results, O(n) each) / O(n) recursion depth.

### Word Search

**Problem.** Given an `m × n` grid of letters and a string `word`, return `True` if a path traces `word` through adjacent cells. Cells are adjacent horizontally or vertically, and the path uses each cell at most once.

**Example.**

```text
board = [["A","B","C","E"],
         ["S","F","C","S"],
         ["A","D","E","E"]]
word = "ABCCED" → True
word = "ABCB"   → False
```

**Steps.**
1. Start a DFS from every cell whose letter matches `word[0]`.
2. `dfs(r, c, i)`: if `board[r][c] != word[i]`, fail. If `i` is the last index, succeed.
3. Mark the cell as visited in place (`board[r][c] = "#"`). Recurse into the four neighbors with `i + 1`, then restore the letter. In-place marking is the O(1)-space form of a visited set.
4. Return `True` if the DFS of any neighbor succeeds. The restore must run before you return, in both cases.
5. Optional pruning: stop early if the letter counts of the grid cannot cover the letter counts of the word.

**Complexity.** O(m · n · 3^L) time / O(L) recursion depth. `L` is the word length; the base is 3 because the path never returns to the cell it came from.

## Interview follow-ups

After Permutations:
- "The input contains duplicates?" This is Permutations II. Sort, then at each level skip `nums[i]` when it equals `nums[i-1]` and `used[i-1]` is `False`. That means the search skipped its twin at this same level.
- "Without the `used` list?" Use the swap method: permute in place with O(1) auxiliary state.

After Combination Sum:
- "Each candidate at most once, and the input has duplicates?" This is Combination Sum II. Sort, recurse `bt(i + 1, ...)`, and skip `candidates[i] == candidates[i-1]` when `i > start`.
- "Only the count of combinations?" Switch to DP (coin change counting). O(target · candidates) beats exponential enumeration.

After Generate Parentheses:
- "Why is the count the Catalan number?" There is a bijection with balanced sequences, or Dyck paths. Derive C(n) = (2n choose n) / (n + 1).

After N-Queens II:
- "Return the boards, not the count?" Use the same search. Carry a `path` of column choices and render it in the base case (N-Queens I).

## The task

Write four generators over exponential search spaces. The order of the returned results never matters: the tests sort before they compare.

For list-of-list results, the order inside a combination does not matter either. `permute` is the exception, because each ordering is a separate answer.

1. `letter_combinations(digits)` takes a string of characters `'2'`–`'9'`. It returns every string that picks exactly one letter for each digit.
2. Use the phone keypad mapping: 2→`abc`, 3→`def`, 4→`ghi`, 5→`jkl`, 6→`mno`, 7→`pqrs`, 8→`tuv`, 9→`wxyz`.
3. `permute(nums)` takes a list of distinct integers, with length 1 to 6. It returns all permutations of `nums`.
4. Each permutation is a new list. There are exactly `n!` of them.
5. `combination_sum(candidates, target)` returns all unique combinations of candidates that sum exactly to `target`.
6. `candidates` holds distinct positive integers, and `target` is a positive integer. A combination can use a candidate any number of times.
7. Two combinations are the same if they use the same multiset of values, in any order. Return each combination exactly once.
8. `generate_parenthesis(n)` takes `n` from 1 to 8. It returns all distinct well-formed strings of exactly `n` pairs of parentheses.
9. A string is well-formed if every prefix has at least as many `(` as `)`, and the totals are equal.

Edge cases:

- `letter_combinations("")` returns `[]`, not `[""]`. A single digit gives its letters.
- Digits `7` and `9` have four letters each, so `"79"` gives 16 combinations.
- `permute` with one element gives one permutation. Values can be negative.
- `combination_sum` returns `[]` when no combination exists. A candidate equal to `target` is a valid combination.
- `combination_sum` can reuse one small candidate many times: `[2]` with target `8` gives `[[2,2,2,2]]`.
- The `candidates` list can arrive unsorted.
- `generate_parenthesis` returns no duplicates. Every string has length `2n`.

```python
letter_combinations("23")
# ["ad","ae","af","bd","be",
#  "bf","cd","ce","cf"]
letter_combinations("")   # []
letter_combinations("2")  # ["a","b","c"]

permute([1, 2, 3])
# [[1,2,3],[1,3,2],[2,1,3],
#  [2,3,1],[3,1,2],[3,2,1]]
permute([0, 1])  # [[0,1],[1,0]]
permute([1])     # [[1]]

combination_sum([2, 3, 6, 7], 7)
# [[2,2,3],[7]]
combination_sum([2, 3, 5], 8)
# [[2,2,2,2],[2,3,3],[3,5]]
combination_sum([2], 1)  # []
combination_sum([2], 8)  # [[2,2,2,2]]

generate_parenthesis(3)
# ["((()))","(()())","(())()",
#  "()(())","()()()"]
generate_parenthesis(1)  # ["()"]
generate_parenthesis(2)
# ["(())","()()"]
```
