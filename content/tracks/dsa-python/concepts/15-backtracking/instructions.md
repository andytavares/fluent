# Backtracking

## What you'll learn

Building on the DFS recursion you used for trees and graphs, this concept covers backtracking: exhaustive search over a decision tree where you **choose** an option, **explore** its consequences, and **unchoose** before trying the next option. You'll learn the four shapes almost every backtracking problem reduces to — one choice per slot, permutation over unused elements, combination via a start index, and constraint-counter generation — plus the pruning tricks that keep exponential search spaces small enough to run.

## Key concepts

Backtracking is DFS on the tree of partial solutions. Every problem instantiates the same skeleton; what changes is the *choice set* at each node, the *base case* that records a result, and the *pruning* that abandons doomed branches early.

```python
def backtrack(path, choices_state):
    if is_complete(path):
        result.append(list(path))  # record a COPY
        return
    for choice in current_choices(choices_state):
        if doomed(choice):
            continue                # prune
        path.append(choice)         # choose
        backtrack(path, updated(choices_state, choice))  # explore
        path.pop()                  # unchoose — this is the "backtrack"
```

The `pop()` is what distinguishes backtracking from plain DFS: the same `path` list is shared by every frame, so each frame must undo its own mutation before returning.

### Shape 1 — one choice per slot (letter combinations)

The candidate has a fixed length; position `i` picks from a fixed menu (the letters of digit `i`). The tree's depth equals the input length; branching equals menu size.

```python
def bt(i, current):
    if i == len(digits):
        result.append(current)
        return
    for ch in keypad[digits[i]]:
        bt(i + 1, current + ch)
```

Strings are immutable in Python too, so passing `current + ch` needs no undo step — the "unchoose" is implicit.

### Shape 2 — permutations (order matters, each element once)

Each level picks any *unused* element. Track usage with a boolean list parallel to `nums`:

```python
def bt():
    if len(path) == len(nums):
        result.append(list(path))
        return
    for i in range(len(nums)):
        if used[i]:
            continue
        used[i] = True
        path.append(nums[i])
        bt()
        path.pop()
        used[i] = False
```

### Shape 3 — combinations (order doesn't matter): the start index

To generate each subset/combination exactly once, force choices to be taken in increasing index order — each frame only considers indexes `>= start`:

```python
def bt(start, path):
    if done(path):
        result.append(list(path))
        return
    for i in range(start, len(candidates)):
        path.append(candidates[i])
        bt(i + 1, path)  # i + 1: each element used at most once
        path.pop()
```

For Combination Sum, recurse with `bt(i, ...)` instead of `bt(i + 1, ...)`: staying at `i` allows the same candidate to be reused, while never going *below* `i` still prevents duplicate combinations in different orders.

### Shape 4 — constraint counters (generate parentheses)

Instead of a menu of elements, each level chooses between a few moves guarded by counters. Well-formed parentheses: you may add `(` while `open < n`, and `)` while `close < open`. The guards *are* the pruning — no invalid string is ever partially built.

### Pruning

Sort-then-break is the workhorse: with `candidates` sorted ascending, the loop in Combination Sum can `break` (not just `continue`) the moment `candidates[i] > remaining` — every later candidate is bigger. In N-Queens, three `set`s (columns, `r - c` diagonals, `r + c` anti-diagonals) reject a square in O(1). Good pruning doesn't change worst-case complexity but routinely cuts real search trees by orders of magnitude.

### Complexity of the flagship problems

| Problem | Result count | Time | Space (recursion) |
|---------|-------------|------|-------------------|
| Letter Combinations | up to 4^n | O(n · 4^n) | O(n) |
| Permutations | n! | O(n · n!) | O(n) |
| Combination Sum | input-dependent | O(k · b^(t/m)) worst case | O(t/m) |
| Generate Parentheses | Catalan C(n) ≈ 4^n / n^1.5 | O(4^n / √n) | O(n) |

`t` = target, `m` = smallest candidate, `b` = branching factor, `k` = average combination length.

## Watch out

- **Snapshot on record**: `result.append(list(path))` (or `path[:]` / `path.copy()`), never `result.append(path)`. Without the copy every recorded entry aliases the same list — which is empty by the time the search finishes.
- **Every append needs a pop.** An early `return` between `append` and `pop` corrupts the path for all remaining branches. Keep the choose/explore/unchoose lines adjacent.
- **`i` vs `i + 1`** in the start-index shape decides reuse semantics: `bt(i, ...)` = unlimited reuse (Combination Sum), `bt(i + 1, ...)` = each element once (Combinations). Mixing them up produces duplicate or missing results, not a crash — easy to miss without tests.
- **`break` vs `continue` when pruning**: `break` on `candidates[i] > remaining` is only correct if the candidates are sorted. Unsorted input needs `continue` — or a sort up front.
- **`letter_combinations("")` returns `[]`**, not `[""]`. Guard the empty input before starting the recursion.
- **Result order doesn't matter** in these problems — but *your tests* might compare sorted; don't burn time chasing a specific ordering.
- **Recursion depth here is small** (bounded by input length, not input size), so Python's ~1000-frame default limit is rarely a concern in this concept — unlike the grid/tree problems elsewhere in the track.

## Problem walkthroughs

### Letter Combinations of a Phone Number ★

**Problem.** Given a string `digits` of characters `'2'`–`'9'`, return every string you can form by picking one letter for each digit, using the phone keypad mapping (2→abc, 3→def, 4→ghi, 5→jkl, 6→mno, 7→pqrs, 8→tuv, 9→wxyz). Empty input produces an empty list.

**Example.**

    "23" -> ["ad","ae","af","bd","be","bf","cd","ce","cf"]
    ""   -> []

**Steps.**
1. Return `[]` immediately for empty input.
2. Build the digit → letters lookup table.
3. Recurse on position `i` with the string built so far: base case `i == len(digits)` records the string.
4. At position `i`, loop over the letters of `digits[i]`, appending each and recursing with `i + 1`. String concatenation creates a new string per call, so no undo is needed.
5. The tree has depth `len(digits)` and branching 3–4; every leaf is a valid combination, so there is nothing to prune.

**Complexity.** O(n · 4^n) time (up to 4^n results, each of length n) / O(n) recursion depth.

### Combinations

**Problem.** Given `n` and `k`, return all combinations of `k` distinct numbers chosen from `1..n`. Order within a combination and between combinations doesn't matter.

**Example.**

    n = 4, k = 2 -> [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]

**Steps.**
1. Start-index recursion: `bt(start, path)` considers numbers `start..n` in increasing order, which generates each combination exactly once.
2. Base case: `len(path) == k` — record a copy.
3. Loop `i` from `start` to `n`: append `i`, recurse `bt(i + 1, path)`, pop.
4. Prune with the "not enough numbers left" check: you still need `k - len(path)` numbers, so `i` can run at most to `n - (k - len(path)) + 1`. This turns the tail of the search from exponential dead ends into an immediate cutoff.

**Complexity.** O(k · C(n, k)) time / O(k) recursion depth.

### Permutations ★

**Problem.** Given a list `nums` of distinct integers, return all its permutations, in any order.

**Example.**

    [1,2,3] -> [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
    [1]     -> [[1]]

**Steps.**
1. Keep a shared `path` and a `used` boolean list.
2. Base case: `len(path) == len(nums)` — record `list(path)`.
3. Loop over all indexes; skip used ones. For each unused `i`: mark `used[i]`, append `nums[i]`, recurse, pop, unmark.
4. The `used` list is the "remaining elements" set in O(1) per check — cheaper than rebuilding a filtered list per frame.
5. Alternative worth knowing for the follow-up: the swap method — swap `nums[depth]` with each `i >= depth`, recurse on `depth + 1`, swap back. No extra lists at all.

**Complexity.** O(n · n!) time (n! results, O(n) to copy each) / O(n) recursion depth.

### Combination Sum ★

**Problem.** Given distinct positive integers `candidates` and a positive `target`, return all unique combinations of candidates summing to `target`. The same candidate may appear in a combination any number of times. Order doesn't matter — no duplicate combinations.

**Example.**

    candidates = [2,3,6,7], target = 7 -> [[2,2,3],[7]]
    candidates = [2,3,5],   target = 8 -> [[2,2,2,2],[2,3,3],[3,5]]

**Steps.**
1. Sort candidates ascending — this enables `break`-style pruning.
2. Recurse `bt(start, remaining, path)`; base case `remaining == 0` records a copy.
3. Loop `i` from `start`: if `candidates[i] > remaining`, `break` — every later candidate is at least as large.
4. Append `candidates[i]` and recurse with `bt(i, remaining - candidates[i], path)` — **`i`, not `i + 1`**, so the same candidate may be picked again; never going below `i` keeps combinations canonical (non-decreasing), which is what prevents duplicates like `[2,3,3]` vs `[3,2,3]`.
5. Pop after the recursive call returns.

**Complexity.** O(b^(t/m)) nodes worst case (`t` = target, `m` = smallest candidate) / O(t/m) recursion depth.

### N-Queens II

**Problem.** Count the distinct ways to place `n` queens on an `n × n` board so that no two share a row, column, or diagonal.

**Example.**

    n = 4 -> 2
    n = 1 -> 1

**Steps.**
1. Place one queen per row, top to bottom — rows are handled by construction, so only columns and diagonals need checking.
2. Keep three sets: `cols`, `diag` keyed by `r - c`, `anti` keyed by `r + c`. A square `(r, c)` is safe iff none of the three sets contains its key.
3. `bt(row)`: base case `row == n` increments the count. Otherwise try every column: if safe, add the three keys, recurse `bt(row + 1)`, then remove the three keys.
4. The two diagonal keys work because all squares on a ↘ diagonal share `r - c` and all squares on a ↙ diagonal share `r + c`.
5. Because only a count is needed, there's no path list at all — the three sets are the entire state.

**Complexity.** O(n!) time in practice (each row has fewer safe columns than the last) / O(n) space for the sets and recursion.

### Generate Parentheses ★

**Problem.** Given `n`, return all strings of `n` pairs of parentheses that are well-formed (every prefix has at least as many `(` as `)`).

**Example.**

    n = 3 -> ["((()))","(()())","(())()","()(())","()()()"]
    n = 1 -> ["()"]

**Steps.**
1. Recurse with the string so far plus two counters: `open_count` and `close_count` used.
2. Base case: string length `2n` — it's complete and, by construction, valid.
3. Add `(` if `open_count < n` (still have opens left). Add `)` if `close_count < open_count` (there's an unmatched `(` to close).
4. Those two guards make invalid strings unreachable — this is pruning by construction rather than generate-and-filter, and it's why the output size is the Catalan number rather than 2^(2n).

**Complexity.** O(4^n / √n) time (Catalan-number results, O(n) each) / O(n) recursion depth.

### Word Search

**Problem.** Given an `m × n` grid of letters and a string `word`, return `True` if `word` can be traced through horizontally or vertically adjacent cells, using each cell at most once.

**Example.**

    board = [["A","B","C","E"],
             ["S","F","C","S"],
             ["A","D","E","E"]]
    word = "ABCCED" -> True;  word = "ABCB" -> False

**Steps.**
1. Try a DFS from every cell whose letter matches `word[0]`.
2. `dfs(r, c, i)`: if `board[r][c] != word[i]`, fail. If `i` is the last index, succeed.
3. Mark the cell visited by overwriting it in place (`board[r][c] = "#"`), recurse into the four neighbors with `i + 1`, then restore the letter. In-place marking is the O(1)-space version of a visited set.
4. Return `True` if any neighbor's DFS succeeds; the restore must run before returning either way.
5. Optional pruning: bail out early if the grid's letter counts can't cover the word's letter counts.

**Complexity.** O(m · n · 3^L) time (`L` = word length; 3 because you never return to the cell you came from) / O(L) recursion depth.

## Interview follow-ups

After Permutations:
- "Input contains duplicates?" — Permutations II: sort, then at each level skip `nums[i]` when it equals `nums[i-1]` and `used[i-1]` is false (the duplicate's twin was skipped at this same level).
- "Without the `used` list?" — the swap method: permute in place, O(1) auxiliary state.

After Combination Sum:
- "Each candidate at most once, input has duplicates?" — Combination Sum II: sort, recurse `bt(i + 1, ...)`, and skip `candidates[i] == candidates[i-1]` when `i > start`.
- "Only the *count* of combinations?" — switch to DP (coin change counting): O(target · candidates) beats exponential enumeration.

After Generate Parentheses:
- "Why is the count the Catalan number?" — bijection with balanced sequences / Dyck paths; derive C(n) = (2n choose n) / (n + 1).

After N-Queens II:
- "Return the boards, not the count?" — same search, carry a `path` of column choices and render on the base case (N-Queens I).

## The task

Four generators over exponential search spaces. **The order of the returned results never matters** — the tests sort before comparing (and for the list-of-list results, order *within* a combination doesn't matter either, except for `permute`, where the whole point is the ordering).

### `letter_combinations(digits)`

`digits` is a string of characters `'2'`–`'9'` (possibly empty). Return every string formed by choosing exactly one letter for each digit, using the phone keypad mapping: 2→`abc`, 3→`def`, 4→`ghi`, 5→`jkl`, 6→`mno`, 7→`pqrs`, 8→`tuv`, 9→`wxyz`. Return them in any order. `""` → `[]` (not `[""]`).

```python
letter_combinations("23")  # ["ad","ae","af","bd","be","bf","cd","ce","cf"]
letter_combinations("")    # []
letter_combinations("2")   # ["a","b","c"]
```

Edge cases: empty input, a single digit, digits `7` and `9` (four letters each — `"79"` yields 16 combinations).

### `permute(nums)`

`nums` is a list of **distinct** integers (1 ≤ length ≤ 6). Return all permutations of `nums`, in any order. Each permutation is a new list; there are exactly `n!` of them.

```python
permute([1, 2, 3])  # [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
permute([0, 1])     # [[0,1],[1,0]]
permute([1])        # [[1]]
```

Edge cases: single element (one permutation), two elements, negative values.

### `combination_sum(candidates, target)`

`candidates` is a list of **distinct positive** integers; `target` is a positive integer. Return all unique combinations of candidates that sum exactly to `target`; the same candidate may be used any number of times. Two combinations are the same if they use the same multiset of values, regardless of order — return each exactly once, in any order.

```python
combination_sum([2, 3, 6, 7], 7)  # [[2,2,3],[7]]
combination_sum([2, 3, 5], 8)     # [[2,2,2,2],[2,3,3],[3,5]]
combination_sum([2], 1)           # []
```

Edge cases: no solution (`[]`), a candidate equal to `target`, deep reuse of a single small candidate (`[2]` with target `8` → `[[2,2,2,2]]`), unsorted input.

### `generate_parenthesis(n)`

`n` is a positive integer (1 ≤ n ≤ 8). Return all distinct well-formed strings of exactly `n` pairs of parentheses, in any order. A string is well-formed if every prefix contains at least as many `(` as `)` and the total counts are equal.

```python
generate_parenthesis(3)  # ["((()))","(()())","(())()","()(())","()()()"]
generate_parenthesis(1)  # ["()"]
generate_parenthesis(2)  # ["(())","()()"]
```

Edge cases: `n = 1`, no duplicates in the output, every returned string has length `2n`.
