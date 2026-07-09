# Matrix

## What you'll learn

The 2D-grid toolkit: mapping a cell to its row, column, and sub-box; walking a matrix in shrinking boundary layers; rotating a square matrix in place with transpose + reverse; and the in-place state-encoding trick (store the *next* state inside the current one) that solves Set Matrix Zeroes and Game of Life without a second grid. These moves reappear later in the graph concepts — islands and regions are just matrices with neighbors.

## Key concepts

A matrix here is an array of row arrays: `matrix[r][c]` is row `r`, column `c`. Rows are the outer index — the opposite of x/y screen coordinates, and the source of most matrix bugs.

### Cell → group mappings

Row and column membership are the indexes themselves. The 3×3 sub-box of a Sudoku cell is one formula:

```java
int box = (r / 3) * 3 + (c / 3); // 0..8, row-major boxes (integer division truncates)
```

Validity problems then become bookkeeping: one `Set` per row, per column, per box, and a single pass that asks "has this group seen this value?" before recording it.

```java
// One Set per group — a loop that allocates each Set, NOT an array filled with one shared Set
@SuppressWarnings("unchecked")
Set<String>[] rows = new HashSet[9];
for (int i = 0; i < 9; i++) rows[i] = new HashSet<>();
```

Java has no generic array literal that avoids `@SuppressWarnings("unchecked")` here — that warning is expected and safe for this idiom. The point is that each slot gets its **own** `HashSet` instance; sharing one instance across all nine slots (e.g. by copying a reference in a loop instead of calling `new HashSet<>()` each time) makes every row look like it has duplicates.

### Boundary-layer traversal

Spiral order is four boundary variables, not coordinate arithmetic:

```java
int top = 0, bottom = rows - 1, left = 0, right = cols - 1;
while (top <= bottom && left <= right) {
    // → along row `top`, then ↓ along column `right`
    // ← along row `bottom` (only if top <= bottom still)
    // ↑ along column `left`  (only if left <= right still)
}
```

Each side consumed moves its boundary inward. The two re-checks in the middle are load-bearing: after consuming the top row and right column, a single-row or single-column remainder would otherwise be walked *twice*, once in each direction.

### Rotation = transpose + reverse

Rotating an n×n matrix 90° clockwise sends `(r, c)` to `(c, n-1-r)`. Doing that directly in place means juggling four-way cycles; the composition of two trivial in-place steps is far easier to get right:

```java
// transpose: swap across the main diagonal (c > r only — else you swap back!)
for (int r = 0; r < n; r++) {
    for (int c = r + 1; c < n; c++) {
        int tmp = matrix[r][c];
        matrix[r][c] = matrix[c][r];
        matrix[c][r] = tmp;
    }
}
// then reverse each row
for (int[] row : matrix) {
    for (int i = 0, j = row.length - 1; i < j; i++, j--) {
        int tmp = row[i]; row[i] = row[j]; row[j] = tmp;
    }
}
```

Transpose maps `(r, c) → (c, r)`; row-reverse maps `(c, r) → (c, n-1-r)`. Composed: exactly the clockwise rotation. (Counter-clockwise = transpose + reverse each *column*, or reverse rows first.)

### In-place state encoding

When every cell's new value depends on the *old* values of its neighbors (Game of Life) or a full-grid condition (Set Matrix Zeroes), a naive in-place update corrupts the input other cells still need to read. Instead of an O(mn) copy, encode both states in each cell:

- **Game of Life**: cells are 0/1. Use bit 0 for the current state and bit 1 for the next state (`cell |= 2` to mark "alive next"). Neighbor counts read bit 0 (`cell & 1`) and stay correct all pass; a final sweep shifts every cell down (`cell >>= 1`).
- **Set Matrix Zeroes**: use row 0 and column 0 *as* the marker arrays for "this row/column must be zeroed," with two booleans remembering whether row 0 / column 0 themselves started with a zero.

The shared idea: pick an encoding where the old value is still readable after you've written the new one.

### Complexity of the catalog problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Valid Sudoku | O(81) = O(1) | O(1) | row/col/box Sets |
| Spiral Matrix | O(mn) | O(1) beyond output | boundary layers |
| Rotate Image | O(n²) | O(1) | transpose + reverse |
| Set Matrix Zeroes | O(mn) | O(1) | first row/col as markers |
| Game of Life | O(mn) | O(1) | two states per cell (bit trick) |

## Watch out

- **A `HashSet[]` array must be populated in a loop that calls `new HashSet<>()` for every slot** — copying one instance's reference into all nine slots aliases them, and every row silently shares one bag. The same trap applies to building an empty grid of `ArrayList`s.
- **`matrix[r][c]`, not `matrix[x][y]`** — the first index picks the row (vertical position). Spiral and rotation bugs are overwhelmingly r/c swaps.
- **Spiral single-row/column guards**: re-check `top <= bottom` before the bottom row and `left <= right` before the left column. Without them, a 1×n or n×1 remainder is emitted twice.
- **Transpose only above the diagonal** (`c > r`). Sweeping all pairs swaps everything twice — a very expensive no-op.
- **In-place means mutate the argument.** For Rotate Image the tests inspect the array you were given; building and returning a new array fails even if the values are right. Reassigning the local parameter variable (`matrix = rotated;`) does nothing for the caller — Java passes the array reference by value, so you must mutate the object it points to, not rebind the variable.
- **Sudoku validity ≠ solvability.** Only placed digits may not conflict; `"."` cells are skipped entirely and an empty board is valid.
- **Game of Life neighbor counts must read old state.** If you flip cells to plain 0/1 mid-pass, later cells count already-updated neighbors — the bit encoding (or a copy) exists precisely to prevent that.

## Problem walkthroughs

### Valid Sudoku ★

**Problem.** `board` is a 9×9 grid of strings: digits `"1"`–`"9"` or `"."` for empty. Return `true` if no row, no column, and none of the nine 3×3 sub-boxes contains a repeated digit. Empty cells impose no constraint; the board does not need to be solvable.

**Example.**

    a standard puzzle board            → true
    the same board with a second "6"
    placed in the top-left 3×3 box     → false

**Steps.**
1. Create three arrays of nine `HashSet`s each — `rows`, `cols`, `boxes` — populating each slot with its own `new HashSet<>()` in a loop.
2. Double loop over `r` and `c`; skip `"."` cells.
3. Compute `box = (r / 3) * 3 + (c / 3)`.
4. If `rows[r]`, `cols[c]`, or `boxes[box]` already has the digit, return `false`; otherwise add it to all three.
5. Return `true` after the sweep. One pass suffices because a duplicate is a duplicate no matter which of the pair you meet second.

**Complexity.** O(81) time / O(81) set entries — constant for the fixed board, one visit per cell.

### Spiral Matrix ★

**Problem.** Given an `m × n` matrix, return all its elements in clockwise spiral order: across the top row, down the right column, back across the bottom row, up the left column, then inward to the next layer.

**Example.**

    [[1,2,3],
     [4,5,6],      → [1,2,3,6,9,8,7,4,5]
     [7,8,9]]

**Steps.**
1. Track four boundaries: `top = 0`, `bottom = m - 1`, `left = 0`, `right = n - 1`.
2. While `top <= bottom && left <= right`, emit one full ring: left→right along row `top` (then `top++`), top→bottom along column `right` (then `right--`).
3. Before the return legs, re-check: only if `top <= bottom` emit right→left along row `bottom` (then `bottom--`); only if `left <= right` emit bottom→top along column `left` (then `left++`).
4. The re-checks handle degenerate inner layers — a single leftover row must not be emitted right-to-left after it was already emitted left-to-right, and likewise for a single column.
5. Termination: every iteration strictly shrinks the boundary rectangle, and each element is emitted exactly once.

**Complexity.** O(mn) time / O(1) space beyond the output — each cell is visited once.

### Rotate Image ★

**Problem.** Rotate an `n × n` matrix of numbers 90° clockwise, **in place**: mutate the given matrix and return nothing. Allocating a second matrix is not allowed.

**Example.**

    [[1,2,3],        [[7,4,1],
     [4,5,6],    →    [8,5,2],
     [7,8,9]]         [9,6,3]]

**Steps.**
1. Transpose in place: for every pair with `c > r`, swap `matrix[r][c]` with `matrix[c][r]`. The strict upper-triangle bound prevents double swaps.
2. Reverse each row in place.
3. Why this is the rotation: clockwise rotation sends `(r, c) → (c, n-1-r)`; transpose contributes `(r, c) → (c, r)` and the row reversal contributes `(c, r) → (c, n-1-r)`.
4. For counter-clockwise, reverse each row *first*, then transpose (or transpose then reverse columns).

**Complexity.** O(n²) time / O(1) space — each cell moves a constant number of times.

### Set Matrix Zeroes

**Problem.** Given an `m × n` matrix of numbers, if any cell is `0`, set that cell's entire row and entire column to `0` — in place, using O(1) extra space.

**Example.**

    [[1,1,1],        [[1,0,1],
     [1,0,1],    →    [0,0,0],
     [1,1,1]]         [1,0,1]]

**Steps.**
1. The naive approach zeroes eagerly and floods the grid (new zeros spawn more zeros). You must first *record* which rows/columns are doomed, then zero them — the trick is storing that record inside the matrix itself.
2. First, note in two booleans whether row 0 or column 0 contains any zero of its own.
3. Sweep the rest of the grid: when `matrix[r][c] == 0`, set `matrix[r][0] = 0` and `matrix[0][c] = 0` — the first row and column become the marker arrays.
4. Second sweep (rows 1+, cols 1+): zero `matrix[r][c]` when its row marker `matrix[r][0]` or column marker `matrix[0][c]` is zero. This is safe because markers only ever *become* zero, never unbecome.
5. Finally, zero out row 0 and/or column 0 if their booleans were set. Order matters: doing this earlier would destroy the markers.

**Complexity.** O(mn) time / O(1) space — two grid sweeps plus two line sweeps.

### Game of Life

**Problem.** Given an `m × n` grid of `0` (dead) and `1` (live) cells, compute the next generation **in place** under Conway's rules, where every cell updates *simultaneously* based on its up-to-eight neighbors: a live cell survives with 2 or 3 live neighbors (else dies); a dead cell becomes live with exactly 3 live neighbors.

**Example.**

    [[0,1,0],        [[0,0,0],
     [0,0,1],    →    [1,0,1],
     [1,1,1],         [0,1,1],
     [0,0,0]]         [0,1,0]]

**Steps.**
1. Simultaneity is the whole problem: updating a cell to its next state before its neighbors have read it corrupts their counts. Instead of copying the grid, store both generations per cell: bit 0 = current, bit 1 = next.
2. For each cell, count live neighbors with `grid[nr][nc] & 1` over the eight offsets, clamping `nr`/`nc` to the grid — `& 1` reads the *old* state even after a neighbor has been marked.
3. Apply the rules: if the cell is live (`& 1`) and the count is 2 or 3, set bit 1 (`grid[r][c] |= 2`); if dead and the count is exactly 3, set bit 1. Otherwise leave bit 1 clear — the cell is dead next generation.
4. Final sweep: `grid[r][c] >>= 1` shifts the next state into place and discards the old one.
5. The encoding works because writing bit 1 never disturbs bit 0 — old values stay readable until every cell has decided.

**Complexity.** O(mn) time (8 neighbor reads per cell) / O(1) space.

## Interview follow-ups

After Valid Sudoku:
- "Do it in one pass with less memory?" — three 9-entry bitmask arrays (`rows[r] & (1 << d)`) replace the Sets; same logic, integer ops.
- "Validate solvability, not just placement?" — that's a backtracking search (Sudoku Solver), exponentially harder than validation.

After Spiral Matrix:
- "Generate the spiral instead" (Spiral Matrix II): same boundary walk, writing `1..n²` instead of reading.
- "Why not the direction-vector + visited-set approach?" — it works, but costs O(mn) extra space for the visited marks; boundaries are O(1).

After Rotate Image:
- "Rotate 180°?" — reverse rows *and* columns, or rotate twice; "counter-clockwise?" — reverse rows then transpose.
- "Non-square matrix?" — impossible strictly in place (shape changes); requires a new m×n → n×m allocation.

After Set Matrix Zeroes / Game of Life:
- "Infinite board (Game of Life)?" — store only live-cell coordinates in a `Set`; count neighbors via a `Map` of candidate cells.
- "Why can markers be trusted (Set Matrix Zeroes)?" — a marker cell only ever transitions 1→0, and originals that were already 0 mark themselves; no information is lost.

## The task

Three flagship grid problems: one validity sweep, one boundary walk, one in-place transform. `rotateImage` must mutate its argument — the tests read the matrix you were handed, not your return value.

### `isValidSudoku(char[][] board)`

`board` is a 9×9 array of arrays of `char`: `'1'`–`'9'` for placed digits or `'.'` for empty cells. Return `true` if no row, no column, and no 3×3 sub-box (the nine non-overlapping boxes anchored at rows 0/3/6 × columns 0/3/6) contains the same digit twice; `false` otherwise. Empty cells are ignored; the board does not have to be solvable. O(1) time and space (the board is fixed-size).

```java
Solution.isValidSudoku(validPuzzle);       // true  (a legal, partially filled board)
Solution.isValidSudoku(twoFivesInRowOne);  // false (row conflict)
Solution.isValidSudoku(allDots);           // true  (empty board — no constraints)
```

Edge cases: a completely empty board (`true`), the same digit in different rows/columns/boxes (`true` — only same-group repeats conflict), a conflict appearing only in a box (rows and columns all clean), a conflict in the last cell scanned.

### `spiralOrder(int[][] matrix)`

`matrix` is an `m × n` array of int rows (`m, n >= 1`; not necessarily square). Return a `List<Integer>` of all `m * n` elements in clockwise spiral order, starting from `matrix[0][0]`: top row left→right, right column top→bottom, bottom row right→left, left column bottom→top, then the next layer inward. O(mn) time.

```java
Solution.spiralOrder(new int[][]{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}});
// [1, 2, 3, 6, 9, 8, 7, 4, 5]

Solution.spiralOrder(new int[][]{{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}});
// [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]

Solution.spiralOrder(new int[][]{{7}});          // [7]
Solution.spiralOrder(new int[][]{{1, 2, 3}});    // [1, 2, 3]      (single row)
Solution.spiralOrder(new int[][]{{1}, {2}, {3}}); // [1, 2, 3]     (single column)
```

Edge cases: single row, single column, single cell, a 2×2 matrix, non-square shapes where the innermost layer degenerates to one row or one column (must not emit those cells twice).

### `rotateImage(int[][] matrix)`

`matrix` is an `n × n` array of int rows (`n >= 1`). Rotate it 90° clockwise **in place**: after the call, the matrix you were passed holds the rotated values (`matrix[c][n-1-r]` receives the old `matrix[r][c]`). The return type is `void` — do not allocate a second matrix. O(n²) time, O(1) extra space.

```java
int[][] m = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
Solution.rotateImage(m);
// m is now {{7, 4, 1}, {8, 5, 2}, {9, 6, 3}}

int[][] one = {{42}};
Solution.rotateImage(one);  // one is still {{42}}

int[][] two = {{1, 2}, {3, 4}};
Solution.rotateImage(two);  // two is now {{3, 1}, {4, 2}}
```

Edge cases: 1×1 matrix (unchanged), 2×2 matrix, larger even and odd sizes, duplicate values (the rotation must move *positions*, not match values), callers that discard the return value entirely.
