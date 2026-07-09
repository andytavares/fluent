# Dynamic Programming: Multidimensional

## What you'll learn

The five-step DP method from the 1D concept — state, recurrence, base cases, iteration order, space optimization — extended to two and more dimensions: grid-path problems, string-pair alignment (edit distance), substring tables (palindromes), and state machines with an extra "transactions" axis (the stock problems). The step that changes most is iteration order: in 2D, computing cells before their dependencies is the dominant bug class, and rolling-row space optimization becomes a deliberate design move instead of a mechanical one.

## Key concepts

A 2D state is just a 1D state with a second question attached. The discipline is identical — define `dp[i][j]` in one sentence before writing anything — but there are four recurring *shapes* of 2D state worth recognizing on sight:

1. **Grid position.** `dp[i][j]` = answer for reaching (or ending at) cell `(i, j)`. Dependencies point up and left. *Minimum Path Sum, Unique Paths II, Triangle, Maximal Square.*
2. **Prefix pair.** `dp[i][j]` = answer for the first `i` characters of one string vs the first `j` of another. The table is `(m+1) × (n+1)`; row/column 0 encode empty prefixes. *Edit Distance, Interleaving String.*
3. **Substring / interval.** `dp[i][j]` = answer about `s[i..j]`. Dependencies point *inward* (`dp[i+1][j-1]`), so plain row order is wrong — iterate by interval length. *Longest Palindromic Substring.*
4. **Sequence × budget.** `dp[t][i]` = answer for the first `i` items with `t` units of budget spent (transactions, in the stock problems). *Best Time to Buy and Sell Stock III / IV.*

### Grid template — with the rolling row built in

`dp[i][j]` reads only the cell above and the cell to the left, so one row suffices. Mid-row, `dp[j]` still holds the value from the row above ("up") while `dp[j-1]` was just overwritten ("left"):

```ts
function minPathSum(grid: number[][]): number {
  const cols = grid[0].length;
  const dp = grid[0].slice();                       // base: first row prefix sums
  for (let j = 1; j < cols; j++) dp[j] += dp[j - 1];
  for (let i = 1; i < grid.length; i++) {
    dp[0] += grid[i][0];                            // first column: only "up"
    for (let j = 1; j < cols; j++) {
      dp[j] = Math.min(dp[j], dp[j - 1]) + grid[i][j]; // min(up, left) + cell
    }
  }
  return dp[cols - 1];
}
```

### Prefix-pair template — the alignment table

`dp[i][j]` refers to `word1[i - 1]` and `word2[j - 1]` — the +1 offset exists so that row 0 and column 0 can encode the empty prefix, which is what makes empty-string inputs fall out with no special cases:

```ts
// edit distance core
if (word1[i - 1] === word2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
else dp[i][j] = 1 + Math.min(
  dp[i - 1][j],     // delete word1[i-1]
  dp[i][j - 1],     // insert word2[j-1]
  dp[i - 1][j - 1]  // replace one with the other
);
```

### Substring tables iterate by length

`isPal[i][j]` (is `s[i..j]` a palindrome?) depends on `isPal[i+1][j-1]` — a *shorter* substring. Iterate substrings in increasing length (or `i` descending) so the inner cell exists when you read it. Row-major ascending order reads garbage.

### Building tables in TypeScript

```ts
const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
```

Never `new Array(m).fill(new Array(n).fill(0))` — `fill` reuses **one** row object, and every row write hits all rows. Typing the table as `number[][]` doesn't protect against this; the aliasing bug happens at the array level, not the type level.

### Complexity of the flagship problems

| Problem | Time | Space (table) | Space (optimized) |
|---------|------|---------------|-------------------|
| Minimum Path Sum | O(m·n) | O(m·n) | O(n) rolling row |
| Unique Paths II | O(m·n) | O(m·n) | O(n) rolling row |
| Longest Palindromic Substring | O(n²) | O(n²) | O(1) expand-around-center |
| Edit Distance | O(m·n) | O(m·n) | O(n) two rows |
| Maximal Square | O(m·n) | O(m·n) | O(n) rolling row |

## Watch out

- **Iteration-order violations are the 2D bug.** Substring DP filled row-by-row reads `dp[i+1][j-1]` before it's computed and silently returns wrong lengths on strings longer than 2. Iterate by substring length, or `i` from `n-1` down.
- **Rolling rows destroy the diagonal.** In-place row reuse works when you only need "up" and "left" (Min Path Sum). Edit Distance and Maximal Square also need "up-left", which the in-place write just clobbered — either keep two rows (`prev`/`curr`) or stash the diagonal in a variable before overwriting.
- **Prefix-pair off-by-one.** The table is `(m+1) × (n+1)` and `dp[i][j]` reads `word1[i-1]` / `word2[j-1]`. Indexing the strings with `i`/`j` directly compares the wrong characters and usually still "works" on one test.
- **Maximal Square: cells are the strings `"0"`/`"1"`,** so `matrix[i][j] === 1` is never true (and TypeScript will flag comparing a `string` to a `number` if the array is typed `string[][]`, which is the correct type here). The dp value is the square's *side* — return `side * side`, and take `min` of the three neighbors, not `max`.
- **Unique Paths II: obstacles kill cells, including the start.** An obstacle at `(0,0)` or at the goal means 0 paths; in the rolling-row form the rule is just `dp[j] = 0` on an obstacle, *before* any addition.
- **The shared-row trap** (`new Array(m).fill(row)`) makes every row the same object. Use `Array.from` with a fresh array per row.
- **Triangle bottom-up beats top-down.** Top-down needs edge cases at both ends of each row; bottom-up (`dp[j] = tri[i][j] + min(dp[j], dp[j+1])`) needs none.

## Problem walkthroughs

### Triangle

**Problem.** `triangle[i]` is a row of `i + 1` numbers. Starting at the apex, each step moves to an adjacent cell in the row below (index `j` or `j + 1`). Return the minimum path sum from top to bottom.

**Example.**

    [[2],[3,4],[6,5,7],[4,1,8,3]] → 11    (2 + 3 + 5 + 1)

**Steps.**
1. **State.** `dp[j]` = minimum sum from cell `j` of the current row down to the bottom (work bottom-up).
2. **Recurrence.** `dp[j] = triangle[i][j] + min(dp[j], dp[j+1])` — the two adjacent cells below.
3. **Base cases.** `dp` initialized to the last row itself.
4. **Iteration order.** Rows from second-to-last up to the apex; `j` ascending within a row is safe because `dp[j]` and `dp[j+1]` still hold the row below's values when read.
5. **Space optimization.** Already O(n): one array, updated in place; the answer collects at `dp[0]`. Bottom-up is what makes this clean — top-down forces special cases at both edges of every row.

**Complexity.** O(n²) time for n rows / O(n) space.

### Minimum Path Sum ★

**Problem.** `grid` is an `m × n` matrix of non-negative numbers. Starting at the top-left and moving only right or down, return the minimum possible sum of visited cells ending at the bottom-right.

**Example.**

    [[1,3,1],
     [1,5,1],
     [4,2,1]] → 7    (1→3→1→1→1)

**Steps.**
1. **State.** `dp[i][j]` = minimum path sum from `(0,0)` to `(i,j)`.
2. **Recurrence.** You arrived from above or from the left: `dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])`.
3. **Base cases.** `dp[0][0] = grid[0][0]`; first row and first column are prefix sums (only one way in).
4. **Iteration order.** Row-major, top-left to bottom-right — both dependencies precede every cell.
5. **Space optimization.** One rolling row: before the write, `dp[j]` is "up"; `dp[j-1]` is already "left". See the template in Key concepts.

**Complexity.** O(m·n) time / O(n) space.

### Unique Paths II ★

**Problem.** An `m × n` grid contains `0` (open) and `1` (obstacle) cells. Count the paths from top-left to bottom-right moving only right or down that avoid every obstacle.

**Example.**

    [[0,0,0],
     [0,1,0],
     [0,0,0]] → 2

**Steps.**
1. **State.** `dp[i][j]` = number of valid paths from the start to `(i,j)`.
2. **Recurrence.** Obstacle → `dp[i][j] = 0` (nothing routes through it); open → `dp[i-1][j] + dp[i][j-1]`.
3. **Base cases.** `dp[0][0] = 1` if the start is open, else 0. First row/column inherit from their single neighbor — an obstacle zeroes everything past it.
4. **Iteration order.** Row-major.
5. **Space optimization.** Rolling row with the obstacle rule applied first: `if (obstacle) dp[j] = 0; else if (j > 0) dp[j] += dp[j-1]`. Seeding `dp[0]` from the start cell makes the first row and column fall out of the same two lines — no separate base-case loops.

**Complexity.** O(m·n) time / O(n) space.

### Longest Palindromic Substring ★

**Problem.** Return the longest contiguous substring of `s` that is a palindrome. Any one answer is acceptable when several tie.

**Example.**

    "babad" → "bab" (or "aba")
    "cbbd"  → "bb"

**Steps.**
1. **State.** `isPal[i][j]` = `true` iff `s[i..j]` (inclusive) is a palindrome.
2. **Recurrence.** `isPal[i][j] = s[i] === s[j] && (j - i < 3 || isPal[i+1][j-1])` — matching ends around a palindromic (or trivially short) interior.
3. **Base cases.** Length 1 → `true`; length 2 → the two characters match (both absorbed by the `j - i < 3` shortcut).
4. **Iteration order.** By increasing substring length (or `i` descending, `j` ascending) — `isPal[i+1][j-1]` is a shorter substring and must already exist. Track the best `(start, length)` as `true` cells appear.
5. **Space optimization.** The table costs O(n²). Expand-around-center replaces it with O(1) space: every palindrome has a center — one of `n` characters or `n - 1` gaps — so run each of the `2n - 1` centers outward while the ends match and keep the longest. Same O(n²) worst case, no allocation, and typically far less work.

**Complexity.** O(n²) time / O(n²) table or O(1) with expansion.

### Interleaving String

**Problem.** Return `true` if `s3` can be formed by interleaving `s1` and `s2` — merging them left to right so each keeps its own character order.

**Example.**

    s1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac" → true
    s1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc" → false

**Steps.**
1. **State.** `dp[i][j]` = `true` iff the first `i + j` characters of `s3` are an interleaving of `s1`'s first `i` and `s2`'s first `j`. (The `s3` index is forced to `i + j` — that's why the state is 2D, not 3D.)
2. **Recurrence.** The last character of the prefix came from one of the two sources: `dp[i][j] = (dp[i-1][j] && s1[i-1] === s3[i+j-1]) || (dp[i][j-1] && s2[j-1] === s3[i+j-1])`.
3. **Base cases.** `dp[0][0] = true`; first check `s1.length + s2.length === s3.length` and return `false` outright otherwise.
4. **Iteration order.** `i` and `j` ascending; row 0 and column 0 are chains of single-source matches.
5. **Space optimization.** Rolling 1D array over `j` — each cell reads only "up" (previous row) and "left" (current row).

**Complexity.** O(m·n) time / O(n) space.

### Edit Distance ★

**Problem.** Return the minimum number of single-character operations — insert, delete, or replace — that transform `word1` into `word2` (Levenshtein distance).

**Example.**

    "horse" → "ros"           = 3    (replace h→r, delete r, delete e)
    "intention" → "execution" = 5

**Steps.**
1. **State.** `dp[i][j]` = minimum operations converting the first `i` characters of `word1` into the first `j` of `word2`.
2. **Recurrence.** If `word1[i-1] === word2[j-1]`, no operation: `dp[i-1][j-1]`. Otherwise 1 + the best of: delete `word1`'s last char (`dp[i-1][j]`), insert `word2`'s last char (`dp[i][j-1]`), or replace (`dp[i-1][j-1]`).
3. **Base cases.** `dp[i][0] = i` (delete everything), `dp[0][j] = j` (insert everything) — this is why empty strings need no special code.
4. **Iteration order.** Row-major ascending.
5. **Space optimization.** Two rows (`prev`, `curr`): the recurrence reads the previous row twice and the current row once. A single row is possible if you stash the up-left value in a variable before overwriting — the two-row form is the readable version.

**Complexity.** O(m·n) time / O(n) space.

### Best Time to Buy and Sell Stock III

**Problem.** `prices[i]` is a stock price on day `i`. With **at most two** buy-sell transactions (no overlapping holds), return the maximum total profit.

**Example.**

    [3,3,5,0,0,3,1,4] → 6    (buy 0 sell 3, buy 1 sell 4)

**Steps.**
1. **State.** Four running values — the best profit so far in each stage of the state machine: `buy1` (after first buy; profit is negative cost), `sell1`, `buy2`, `sell2`.
2. **Recurrence.** For each price `p`: `buy1 = max(buy1, -p)`, `sell1 = max(sell1, buy1 + p)`, `buy2 = max(buy2, sell1 - p)`, `sell2 = max(sell2, buy2 + p)` — each stage either keeps its best or transitions from the previous stage today.
3. **Base cases.** `buy1 = buy2 = -Infinity`, `sell1 = sell2 = 0` (no transaction yet).
4. **Iteration order.** One left-to-right pass; updating the four in this order within a day is fine — the worst it allows is a same-day buy-and-sell, which adds 0.
5. **Space optimization.** This *is* the optimized form. The table view it collapses is `dp[t][i]` = best profit with ≤ `t` transactions over the first `i + 1` days — the Stock IV recurrence with `k = 2`.

**Complexity.** O(n) time / O(1) space.

### Best Time to Buy and Sell Stock IV

**Problem.** Same setup with at most `k` transactions. Return the maximum profit.

**Example.**

    k = 2, prices = [2,4,1]     → 2
    k = 2, prices = [3,2,6,5,0,3] → 7

**Steps.**
1. **State.** `dp[t][i]` = maximum profit using at most `t` transactions over the first `i + 1` days.
2. **Recurrence.** Either day `i` does nothing (`dp[t][i-1]`) or it sells: `prices[i] + max over buy days j ≤ i of (dp[t-1][j] - prices[j])`. Maintain that inner `max` as a running `bestBuy` while scanning days — this is what drops the naive O(k·n²) to O(k·n).
3. **Base cases.** `dp[0][*] = 0` (no transactions), `dp[*][0] = 0` (one day); `bestBuy` starts at `-prices[0]`.
4. **Iteration order.** `t` outer from 1 to `k`; days inner, left to right, updating `bestBuy = max(bestBuy, dp[t-1][i] - prices[i])` as you go.
5. **Space optimization.** Keep two rows (`t - 1` and `t`). And cap `k` first: a transaction needs a buy day and a sell day, so `k >= n / 2` means "unlimited" — answer with the greedy sum of positive day-over-day deltas (Arrays & Strings) and skip the DP entirely.

**Complexity.** O(min(k, n/2) · n) time / O(n) space.

### Maximal Square ★

**Problem.** `matrix` is an `m × n` grid whose cells are the strings `"0"` and `"1"`. Return the **area** of the largest all-`"1"` square.

**Example.**

    [["1","0","1","0","0"],
     ["1","0","1","1","1"],
     ["1","1","1","1","1"],
     ["1","0","0","1","0"]] → 4    (a 2×2 square)

**Steps.**
1. **State.** `side[i][j]` = side length of the largest all-ones square whose **bottom-right corner** is `(i,j)`.
2. **Recurrence.** A `"0"` cell → 0. A `"1"` cell → `1 + min(side[i-1][j], side[i][j-1], side[i-1][j-1])`: the square extends exactly as far as the *weakest* of the squares above, left, and diagonal allow — the `min` is the whole insight.
3. **Base cases.** First row and column: `"1"` → 1. Padding the table with a zero row and column makes the recurrence uniform everywhere.
4. **Iteration order.** Row-major; track the best side seen.
5. **Space optimization.** Rolling row plus the diagonal problem: use `prev` (last row) and `curr` (this row) so `prev[j-1]` — the up-left value — is still intact. Return `best * best`: the state is a side, the answer is an area.

**Complexity.** O(m·n) time / O(n) space.

## Interview follow-ups

After Minimum Path Sum / Unique Paths II:
- "Reconstruct the actual path?" — keep the full table and walk backward from the goal, stepping to whichever neighbor produced each cell's value.
- "Unique Paths without obstacles?" — closed form: the path is a sequence of `m-1` downs and `n-1` rights, so `C(m+n-2, m-1)`. Obstacles are precisely what break the formula and force DP.

After Longest Palindromic Substring:
- "O(n)?" — Manacher's algorithm; know the name and that it reuses previously computed palindrome radii under mirrors.
- "Longest palindromic *subsequence*?" — different problem: interval DP or LCS of `s` with its reverse.

After Edit Distance:
- "Only insert and delete allowed?" — distance = `m + n − 2·LCS(word1, word2)`; this is what diff tools compute.
- "Weighted operations?" — replace the three `1 +` costs with per-operation weights; structure unchanged.

After the stock problems:
- "Why does `k ≥ n/2` collapse to greedy?" — a transaction consumes two distinct days, so more than `n/2` can never all be used; unlimited transactions = sum of positive deltas.
- "Add a cooldown or a fee?" — both are state-machine tweaks: cooldown inserts a "just sold" state; a fee subtracts from each sell transition.

After Maximal Square:
- "Maximal *rectangle*?" — different technique: per-row histogram heights + the stack-based largest-rectangle-in-histogram (Stacks concept).

## The task

Five multidimensional DP classics. For each, walk the five steps — state, recurrence, base cases, order, space — before coding. Grids are non-empty arrays of non-empty rows of equal length.

### `minPathSum(grid: number[][]): number`

`grid` is an `m × n` matrix of non-negative numbers. Return the minimum sum of cells on any path from the top-left to the bottom-right cell moving only right or down (both endpoints count toward the sum). O(m·n) time.

```ts
minPathSum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]);  // 7
minPathSum([[1, 2, 3], [4, 5, 6]]);             // 12
minPathSum([[3]]);                              // 3
```

Edge cases: a single cell, a single row or column (forced path — prefix sum), zeros in the grid.

### `uniquePathsWithObstacles(obstacleGrid: number[][]): number`

`obstacleGrid` is an `m × n` matrix of numbers where `1` marks an obstacle and `0` an open cell. Return the number of distinct right/down paths from top-left to bottom-right that avoid all obstacles. An obstacle on the start or goal cell means 0 paths. O(m·n) time.

```ts
uniquePathsWithObstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]);  // 2
uniquePathsWithObstacles([[0, 1], [0, 0]]);                   // 1
uniquePathsWithObstacles([[1]]);                              // 0
uniquePathsWithObstacles([[0]]);                              // 1
```

Edge cases: blocked start or goal, an obstacle wall cutting the grid in two (0 paths), a fully open grid (pure Unique Paths count), single row with an obstacle.

### `longestPalindrome(s: string): string`

Return the longest contiguous palindromic substring of `s` (`s.length >= 1`, lowercase letters and digits). When several substrings tie for longest, returning any one of them is correct. O(n²) time or better.

```ts
longestPalindrome("babad");  // "bab" (or "aba" — both accepted)
longestPalindrome("cbbd");   // "bb"
longestPalindrome("a");      // "a"
longestPalindrome("ac");     // "a" (or "c")
```

Edge cases: single character, no palindrome longer than 1, the whole string being a palindrome, even-length palindromes (`"bb"` — needs the between-characters case), a long palindrome sitting mid-string.

### `minDistance(word1: string, word2: string): number`

Return the Levenshtein distance between `word1` and `word2`: the minimum number of single-character **insert**, **delete**, or **replace** operations that turn `word1` into `word2`. Either string may be empty. O(m·n) time.

```ts
minDistance("horse", "ros");            // 3
minDistance("intention", "execution");  // 5
minDistance("", "abc");                 // 3
minDistance("abc", "abc");              // 0
```

Edge cases: one or both strings empty (answer is the other's length / 0), equal strings (0), completely disjoint alphabets (max(m, n)), a pure transposition like `"ab"` → `"ba"` (2 — there is no swap operation).

### `maximalSquare(matrix: string[][]): number`

`matrix` is an `m × n` grid whose cells are the **strings** `"0"` and `"1"`. Return the **area** (not the side) of the largest square consisting entirely of `"1"` cells; 0 if there are none. O(m·n) time.

```ts
maximalSquare([
  ["1", "0", "1", "0", "0"],
  ["1", "0", "1", "1", "1"],
  ["1", "1", "1", "1", "1"],
  ["1", "0", "0", "1", "0"],
]);                                     // 4
maximalSquare([["0", "1"], ["1", "0"]]);  // 1
maximalSquare([["0"]]);                   // 0
```

Edge cases: all zeros (0), a single `"1"` (1), the entire matrix being ones (area = min(m,n)²), a large rectangle of ones that is not square (the *square* side is capped by the shorter dimension).
