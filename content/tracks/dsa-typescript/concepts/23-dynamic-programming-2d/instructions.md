## What you build

You solve five multidimensional dynamic programming problems: grid paths, string alignment, palindromic substrings and squares in a matrix. You apply the same five steps as in 1D, but iteration order and rolling-row space optimization now need deliberate design. This lesson builds on **Dynamic Programming: 1D**.

## Key concepts

### A 2D state has four common shapes

A 2D state is a 1D state with a second question attached. The discipline stays the same: define `dp[i][j]` in one sentence before you write code. Learn to recognize four shapes of 2D state:

1. **Grid position.** `dp[i][j]` is the answer for reaching, or ending at, cell `(i, j)`. Dependencies point up and left. Examples: Minimum Path Sum, Unique Paths II, Triangle, Maximal Square.
2. **Prefix pair.** `dp[i][j]` is the answer for the first `i` characters of one string and the first `j` of another. The table is `(m+1) × (n+1)`. Row 0 and column 0 encode empty prefixes. Examples: Edit Distance, Interleaving String.
3. **Substring or interval.** `dp[i][j]` is an answer about `s[i..j]`. Dependencies point inward (`dp[i+1][j-1]`), so plain row order is wrong. Iterate by interval length. Example: Longest Palindromic Substring.
4. **Sequence × budget.** `dp[t][i]` is the answer for the first `i` items with `t` units of budget spent. In the stock problems, the budget is transactions. Examples: Best Time to Buy and Sell Stock III and IV.

### A grid needs only one rolling row

`dp[i][j]` reads only the cell above and the cell to the left, so one row is enough. In the middle of a row, `dp[j]` still holds the value from the row above ("up"). `dp[j-1]` holds the new value for this row ("left").

```ts
function minPathSum(
  grid: number[][],
): number {
  const cols = grid[0].length;
  // base: prefix sums of the first row
  const dp = grid[0].slice();
  for (let j = 1; j < cols; j++)
    dp[j] += dp[j - 1];
  for (let i = 1; i < grid.length; i++) {
    // first column: only "up"
    dp[0] += grid[i][0];
    for (let j = 1; j < cols; j++) {
      // min(up, left) + cell
      dp[j] = Math.min(dp[j], dp[j - 1])
        + grid[i][j];
    }
  }
  return dp[cols - 1];
}
```

### A prefix-pair table offsets indexes by one

`dp[i][j]` refers to `word1[i - 1]` and `word2[j - 1]`. The +1 offset lets row 0 and column 0 encode the empty prefix. Then empty-string inputs need no special cases.

```ts
// edit distance core
const a = word1[i - 1];
const b = word2[j - 1];
if (a === b) {
  dp[i][j] = dp[i - 1][j - 1];
} else {
  dp[i][j] = 1 + Math.min(
    // delete word1[i-1]
    dp[i - 1][j],
    // insert word2[j-1]
    dp[i][j - 1],
    // replace one with the other
    dp[i - 1][j - 1]
  );
}
```

### Substring tables iterate by length

`isPal[i][j]` tells whether `s[i..j]` is a palindrome. It depends on `isPal[i+1][j-1]`, a shorter substring. Iterate substrings by increasing length, or with `i` descending, so the inner cell exists when you read it. Row-major ascending order reads values that do not exist yet.

### Build each table row as a new array

```ts
const dp = Array.from(
  { length: m + 1 },
  () => new Array<number>(n + 1).fill(0)
);
```

Never write `new Array(m).fill(new Array(n).fill(0))`. `fill` reuses one row object, so a write to one row changes all rows.

### Complexity of the main problems

| Problem | Time | Space (table) | Space (optimized) |
|---------|------|---------------|-------------------|
| Minimum Path Sum | O(m·n) | O(m·n) | O(n) rolling row |
| Unique Paths II | O(m·n) | O(m·n) | O(n) rolling row |
| Longest Palindromic Substring | O(n²) | O(n²) | O(1) expand-around-center |
| Edit Distance | O(m·n) | O(m·n) | O(n) two rows |
| Maximal Square | O(m·n) | O(m·n) | O(n) rolling row |

## Watch out

- Iteration order is the main 2D bug. Substring tables filled row by row read `dp[i+1][j-1]` too early.
- Such a table returns wrong lengths on strings longer than 2. Iterate by length, or `i` from `n-1` down.
- A rolling row loses the diagonal. In-place reuse works when you need only "up" and "left", as in Min Path Sum.
- Edit Distance and Maximal Square also need "up-left", which the in-place write overwrote.
- Keep two rows (`prev` and `curr`), or save the diagonal in a variable before you overwrite it.
- The prefix-pair table is `(m+1) × (n+1)`, and `dp[i][j]` reads `word1[i-1]` and `word2[j-1]`.
- Indexing the strings with `i` and `j` compares the wrong characters. It often still passes one test.
- In Maximal Square, the cells are the strings `"0"` and `"1"`. `matrix[i][j] === 1` is never true.
- Type the matrix as `string[][]`. Then TypeScript rejects the comparison with `1` at compile time.
- In Maximal Square, the table value is the side. Return `side * side`.
- In Maximal Square, take the `min` of the three neighbors, not the `max`.
- In Unique Paths II, an obstacle sets its cell to 0. An obstacle at `(0,0)` or at the goal means 0 paths.
- In the rolling-row form, set `dp[j] = 0` on an obstacle, before any addition.
- `new Array(m).fill(row)` makes every row the same object. Use `Array.from` with a new array per row.
- For Triangle, bottom-up beats top-down. Top-down needs edge cases at both ends of each row.
- Bottom-up, `dp[j] = tri[i][j] + min(dp[j], dp[j+1])`, needs no edge cases.

## Problem walkthroughs

### Triangle

**Problem.** `triangle[i]` is a row of `i + 1` numbers. Start at the apex. Each step moves to an adjacent cell in the row below, index `j` or `j + 1`. Return the minimum path sum from top to bottom.

**Example.**

```
[[2],[3,4],[6,5,7],[4,1,8,3]]
  → 11  (2 + 3 + 5 + 1)
```

**Steps.**

1. **State.** Work bottom-up. `dp[j]` is the minimum sum from cell `j` of the current row down to the bottom.
2. **Recurrence.** `dp[j] = triangle[i][j] + min(dp[j], dp[j+1])`, over the two adjacent cells below.
3. **Base cases.** Start `dp` as a copy of the last row.
4. **Iteration order.** Rows from the second-to-last up to the apex. `j` ascending within a row is safe, because `dp[j]` and `dp[j+1]` still hold the values of the row below.
5. **Space optimization.** It is already O(n): one array, updated in place. The answer ends up in `dp[0]`. Bottom-up keeps it clean; top-down forces special cases at both edges of every row.

**Complexity.** O(n²) time for n rows, O(n) space.

### Minimum Path Sum ★

**Problem.** `grid` is an `m × n` matrix of non-negative numbers. Start at the top-left, and move only right or down. Return the minimum sum of visited cells that ends at the bottom-right.

**Example.**

```
[[1,3,1],
 [1,5,1],
 [4,2,1]] → 7  (1→3→1→1→1)
```

**Steps.**

1. **State.** `dp[i][j]` is the minimum path sum from `(0,0)` to `(i,j)`.
2. **Recurrence.** You arrived from above or from the left: `dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])`.
3. **Base cases.** `dp[0][0] = grid[0][0]`. The first row and the first column are prefix sums, because each cell there has only one way in.
4. **Iteration order.** Row-major, from top-left to bottom-right. Both dependencies come before every cell.
5. **Space optimization.** Use one rolling row. Before the write, `dp[j]` is "up" and `dp[j-1]` is already "left". See the template in Key concepts.

**Complexity.** O(m·n) time, O(n) space.

### Unique Paths II ★

**Problem.** An `m × n` grid has `0` (open) and `1` (obstacle) cells. Count the paths from top-left to bottom-right that move only right or down and avoid every obstacle.

**Example.**

```
[[0,0,0],
 [0,1,0],
 [0,0,0]] → 2
```

**Steps.**

1. **State.** `dp[i][j]` is the number of valid paths from the start to `(i,j)`.
2. **Recurrence.** On an obstacle, `dp[i][j] = 0`, because no path goes through it. On an open cell, `dp[i][j] = dp[i-1][j] + dp[i][j-1]`.
3. **Base cases.** `dp[0][0] = 1` if the start is open, else 0. The first row and column copy their single neighbor. An obstacle zeroes everything past it.
4. **Iteration order.** Row-major.
5. **Space optimization.** Use a rolling row, and apply the obstacle rule first: `if (obstacle) dp[j] = 0; else if (j > 0) dp[j] += dp[j-1]`.

Seed `dp[0]` from the start cell. Then the same two lines handle the first row and column, with no separate base-case loops.

**Complexity.** O(m·n) time, O(n) space.

### Longest Palindromic Substring ★

**Problem.** Return the longest contiguous substring of `s` that is a palindrome. When several tie, any one of them is correct.

**Example.**

```
"babad" → "bab" (or "aba")
"cbbd"  → "bb"
```

**Steps.**

1. **State.** `isPal[i][j]` is `true` if and only if `s[i..j]`, inclusive, is a palindrome.
2. **Recurrence.** `isPal[i][j] = s[i] === s[j] && (j - i < 3 || isPal[i+1][j-1])`. Matching ends surround a palindromic or very short interior.
3. **Base cases.** Length 1 is `true`. Length 2 is `true` when the two characters match. The `j - i < 3` shortcut covers both.
4. **Iteration order.** By increasing substring length, or with `i` descending and `j` ascending. `isPal[i+1][j-1]` is a shorter substring and must already exist. Track the best `(start, length)` as `true` cells appear.
5. **Space optimization.** The table costs O(n²). Expand-around-center needs only O(1) space.

Every palindrome has a center: one of `n` characters or one of `n - 1` gaps. Expand each of the `2n - 1` centers outward while the ends match, and keep the longest. The worst case is the same O(n²), with no allocation and usually far less work.

**Complexity.** O(n²) time. O(n²) space for the table, or O(1) with expansion.

### Interleaving String

**Problem.** Return `true` if you can form `s3` by interleaving `s1` and `s2`. An interleaving merges them left to right, and each string keeps its own character order.

**Example.**

```
s1 = "aabcc", s2 = "dbbca"
s3 = "aadbbcbcac" → true
s3 = "aadbbbaccc" → false
```

**Steps.**

1. **State.** `dp[i][j]` is `true` if and only if the first `i + j` characters of `s3` interleave the first `i` of `s1` and the first `j` of `s2`. The `s3` index is always `i + j`, so the state is 2D, not 3D.
2. **Recurrence.** The last character of the prefix came from one of the two sources: `dp[i][j] = (dp[i-1][j] && s1[i-1] === s3[i+j-1]) || (dp[i][j-1] && s2[j-1] === s3[i+j-1])`.
3. **Base cases.** `dp[0][0] = true`. First check `s1.length + s2.length === s3.length`, and return `false` if it fails.
4. **Iteration order.** `i` and `j` ascending. Row 0 and column 0 are chains of matches from one source.
5. **Space optimization.** Use a rolling 1D array over `j`. Each cell reads only "up" (the previous row) and "left" (the current row).

**Complexity.** O(m·n) time, O(n) space.

### Edit Distance ★

**Problem.** Return the minimum number of single-character operations that transform `word1` into `word2`. The operations are insert, delete and replace. This is the Levenshtein distance.

**Example.**

```
"horse" → "ros" = 3
  (replace h→r, delete r, delete e)
"intention" → "execution" = 5
```

**Steps.**

1. **State.** `dp[i][j]` is the minimum number of operations that convert the first `i` characters of `word1` into the first `j` of `word2`.
2. **Recurrence.** If `word1[i-1] === word2[j-1]`, you need no operation: `dp[i-1][j-1]`. Otherwise, take 1 plus the best of three choices.
3. The three choices: delete the last character of `word1` (`dp[i-1][j]`), insert the last character of `word2` (`dp[i][j-1]`), or replace (`dp[i-1][j-1]`).
4. **Base cases.** `dp[i][0] = i`: delete everything. `dp[0][j] = j`: insert everything. That is why empty strings need no special code.
5. **Iteration order.** Row-major ascending.
6. **Space optimization.** Use two rows, `prev` and `curr`. The recurrence reads the previous row twice and the current row once. One row also works if you save the up-left value in a variable before you overwrite it. The two-row form is easier to read.

**Complexity.** O(m·n) time, O(n) space.

### Best Time to Buy and Sell Stock III

**Problem.** `prices[i]` is a stock price on day `i`. You can make at most two buy-sell transactions, and you cannot hold two at once. Return the maximum total profit.

**Example.**

```
[3,3,5,0,0,3,1,4] → 6
  (buy 0 sell 3, buy 1 sell 4)
```

**Steps.**

1. **State.** Keep four running values: the best profit so far in each stage of the state machine. They are `buy1` (after the first buy; the profit is the negative cost), `sell1`, `buy2` and `sell2`.
2. **Recurrence.** For each price `p`: `buy1 = max(buy1, -p)`, `sell1 = max(sell1, buy1 + p)`, `buy2 = max(buy2, sell1 - p)`, `sell2 = max(sell2, buy2 + p)`. Each stage keeps its best, or moves from the previous stage today.
3. **Base cases.** `buy1 = buy2 = -Infinity` and `sell1 = sell2 = 0`: no transaction yet.
4. **Iteration order.** One left-to-right pass. Updating the four values in this order within a day is fine. At worst, it allows a buy and a sell on the same day, which adds 0.
5. **Space optimization.** This is the optimized form. It collapses the table `dp[t][i]`: the best profit with at most `t` transactions over the first `i + 1` days. That is the Stock IV recurrence with `k = 2`.

**Complexity.** O(n) time, O(1) space.

### Best Time to Buy and Sell Stock IV

**Problem.** The same setup, with at most `k` transactions. Return the maximum profit.

**Example.**

```
k = 2, prices = [2,4,1] → 2
k = 2, prices = [3,2,6,5,0,3] → 7
```

**Steps.**

1. **State.** `dp[t][i]` is the maximum profit with at most `t` transactions over the first `i + 1` days.
2. **Recurrence.** Day `i` either does nothing (`dp[t][i-1]`) or sells. A sale gives `prices[i] + max over buy days j ≤ i of (dp[t-1][j] - prices[j])`.
3. Keep that inner `max` as a running `bestBuy` while you scan the days. That drops the plain O(k·n²) to O(k·n).
4. **Base cases.** `dp[0][*] = 0`, with no transactions. `dp[*][0] = 0`, with one day. `bestBuy` starts at `-prices[0]`.
5. **Iteration order.** `t` in the outer loop, from 1 to `k`. Days in the inner loop, left to right. Update `bestBuy = max(bestBuy, dp[t-1][i] - prices[i])` as you go.
6. **Space optimization.** Keep two rows, `t - 1` and `t`.

Cap `k` first. A transaction needs a buy day and a sell day, so `k >= n / 2` means "unlimited". Then sum the positive day-over-day changes, as in Arrays & Strings, and skip the table.

**Complexity.** O(min(k, n/2) · n) time, O(n) space.

### Maximal Square ★

**Problem.** `matrix` is an `m × n` grid whose cells are the strings `"0"` and `"1"`. Return the area of the largest square of `"1"` cells.

**Example.**

```
[["1","0","1","0","0"],
 ["1","0","1","1","1"],
 ["1","1","1","1","1"],
 ["1","0","0","1","0"]]
  → 4  (a 2×2 square)
```

**Steps.**

1. **State.** `side[i][j]` is the side length of the largest all-ones square whose bottom-right corner is `(i,j)`.
2. **Recurrence.** A `"0"` cell gives 0. A `"1"` cell gives `1 + min(side[i-1][j], side[i][j-1], side[i-1][j-1])`.
3. The square extends exactly as far as the weakest of the squares above, left and diagonal allows. The `min` is the whole insight.
4. **Base cases.** In the first row and column, `"1"` gives 1. Pad the table with a zero row and column, and the recurrence is the same everywhere.
5. **Iteration order.** Row-major. Track the best side seen.
6. **Space optimization.** Use a rolling row, and solve the diagonal problem with `prev` (last row) and `curr` (this row). Then `prev[j-1]`, the up-left value, is still intact.

Return `best * best`. The state is a side; the answer is an area.

**Complexity.** O(m·n) time, O(n) space.

## Interview follow-ups

After Minimum Path Sum and Unique Paths II:

- "Reconstruct the actual path." Keep the full table. Walk backward from the goal, and step to the neighbor that produced each cell's value.
- "Unique Paths with no obstacles?" Use the closed form. The path is `m-1` downs and `n-1` rights, so the count is `C(m+n-2, m-1)`. Obstacles break the formula and force dynamic programming.

After Longest Palindromic Substring:

- "Can you do it in O(n)?" Use Manacher's algorithm. Know the name, and that it reuses palindrome radii already computed under mirrors.
- "Find the longest palindromic subsequence." That is a different problem. Use interval dynamic programming, or the LCS of `s` with its reverse.

After Edit Distance:

- "Allow only insert and delete." The distance is `m + n − 2·LCS(word1, word2)`. Diff tools compute this.
- "Give the operations weights." Replace the three `1 +` costs with per-operation weights. The structure stays the same.

After the stock problems:

- "Why does `k ≥ n/2` collapse to greedy?" A transaction uses two distinct days, so you can never use more than `n/2`. Unlimited transactions equal the sum of positive changes.
- "Add a cooldown or a fee." Both are state-machine changes. A cooldown adds a "recently sold" state. A fee subtracts from each sell transition.

After Maximal Square:

- "Find the maximal rectangle." That needs a different technique: histogram heights per row, plus the stack-based largest rectangle in a histogram. See the **Stacks** concept.

## The task

Write five classic multidimensional dynamic programming functions. For each, walk the five steps before you code: state, recurrence, base cases, order and space. Every grid is a non-empty array of non-empty rows of equal length.

### `minPathSum(grid: number[][]): number`

`grid` is an `m × n` matrix of non-negative numbers.

1. Return the minimum sum of cells on any path from the top-left cell to the bottom-right cell.
2. The path moves only right or down.
3. Both endpoints count toward the sum.
4. Run in O(m·n) time.

```ts
// 7
minPathSum([[1,3,1],[1,5,1],[4,2,1]])
// 12
minPathSum([[1, 2, 3], [4, 5, 6]])
minPathSum([[3]]) // 3
```

Edge cases:

- A single cell.
- A single row or column: only one path exists, so return its sum.
- Zeros in the grid.

### `uniquePathsWithObstacles(obstacleGrid: number[][]): number`

`obstacleGrid` is an `m × n` matrix of numbers. `1` marks an obstacle, and `0` marks an open cell.

1. Return the number of distinct right/down paths from top-left to bottom-right that avoid all obstacles.
2. An obstacle on the start or the goal cell means 0 paths.
3. Run in O(m·n) time.

```ts
// 2
uniquePathsWithObstacles(
  [[0, 0, 0], [0, 1, 0], [0, 0, 0]])
// 1
uniquePathsWithObstacles([[0, 1], [0, 0]])
uniquePathsWithObstacles([[1]]) // 0
uniquePathsWithObstacles([[0]]) // 1
```

Edge cases:

- A blocked start or goal.
- A wall of obstacles that cuts the grid in two: 0 paths.
- A fully open grid: the plain Unique Paths count.
- A single row with an obstacle.

### `longestPalindrome(s: string): string`

`s.length >= 1`. `s` holds lowercase letters and digits.

1. Return the longest contiguous palindromic substring of `s`.
2. When several substrings tie, any one of them is correct.
3. Run in O(n²) time or better.

```ts
// "bab" or "aba": both correct
longestPalindrome("babad")
longestPalindrome("cbbd") // "bb"
longestPalindrome("a") // "a"
// "a" or "c"
longestPalindrome("ac")
```

Edge cases:

- A single character.
- No palindrome longer than 1.
- The whole string is a palindrome.
- Even-length palindromes such as `"bb"` need the case between characters.
- A long palindrome in the middle of the string.

### `minDistance(word1: string, word2: string): number`

1. Return the Levenshtein distance between `word1` and `word2`.
2. That is the minimum number of single-character insert, delete or replace operations that turn `word1` into `word2`.
3. Either string can be empty.
4. Run in O(m·n) time.

```ts
minDistance("horse", "ros") // 3
// 5
minDistance("intention", "execution")
minDistance("", "abc") // 3
minDistance("abc", "abc") // 0
```

Edge cases:

- One string empty: the answer is the length of the other.
- Both strings empty: 0.
- Equal strings: 0.
- Completely different letters: max(m, n).
- A swap such as `"ab"` → `"ba"` costs 2. There is no swap operation.

### `maximalSquare(matrix: string[][]): number`

`matrix` is an `m × n` grid whose cells are the strings `"0"` and `"1"`.

1. Return the area, not the side, of the largest square of `"1"` cells.
2. Return 0 if there are no `"1"` cells.
3. Run in O(m·n) time.

```ts
maximalSquare([
  ["1", "0", "1", "0", "0"],
  ["1", "0", "1", "1", "1"],
  ["1", "1", "1", "1", "1"],
  ["1", "0", "0", "1", "0"],
]) // 4
// 1
maximalSquare([["0", "1"], ["1", "0"]])
maximalSquare([["0"]]) // 0
```

Edge cases:

- All zeros: 0.
- A single `"1"`: 1.
- A matrix of all ones: the area is min(m, n)².
- A large rectangle of ones that is not square. The shorter dimension caps the square side.
