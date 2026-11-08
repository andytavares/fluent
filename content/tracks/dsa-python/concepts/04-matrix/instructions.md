## What you build

You write three grid functions: `is_valid_sudoku`, `spiral_order` and `rotate_image`. They cover cell-to-group mapping, boundary-layer walks and in-place transforms. The graph concepts later reuse these moves, because islands and regions are matrices with neighbors. This lesson builds on **Sliding Window**.

## Key concepts

### The first index picks the row

A matrix here is a list of row lists. `matrix[r][c]` is row `r`, column `c`. The row is the outer index, which is the opposite of x/y screen coordinates. This swap causes most matrix bugs.

### One formula maps a cell to its group

Row and column membership are the indexes themselves. One formula gives the 3×3 sub-box of a Sudoku cell.

```python
# 0..8, boxes in row-major order
box = (r // 3) * 3 + (c // 3)
```

Validity problems then become bookkeeping. Keep one `set` per row, per column and per box. In one pass, ask "did this group see this value?" before you record it.

```python
# One set per group: a comprehension,
# NOT [set()] * 9
rows = [set() for _ in range(9)]
```

`[set()] * 9` puts the same set in all nine slots. Every row then shares one bag, and every value looks like a duplicate. The comprehension creates nine distinct sets.

### Four boundaries walk a spiral

Spiral order uses four boundary variables, not coordinate arithmetic.

```python
top, bottom = 0, rows - 1
left, right = 0, cols - 1
while top <= bottom and left <= right:
    # -> along row top,
    #    then down along column right
    # <- along row bottom
    #    (only if top <= bottom still)
    # up along column left
    #    (only if left <= right still)
    ...
```

Each side you consume moves its boundary inward. The two checks in the middle are necessary. After the top row and right column, one remaining row or column is otherwise walked twice, once in each direction.

### Rotation is transpose plus reverse

A 90° clockwise rotation of an n×n matrix sends `(r, c)` to `(c, n-1-r)`. A direct in-place version juggles four-way cycles. Two simple in-place steps are much easier to get right.

```python
# m is an n x n matrix.
# Transpose: swap across the main
# diagonal. Use c > r only, or you
# swap back.
for r in range(n):
    for c in range(r + 1, n):
        m[r][c], m[c][r] = m[c][r], m[r][c]
# Then reverse each row.
for row in m:
    row.reverse()
```

The transpose maps `(r, c)` to `(c, r)`. The row reversal maps `(c, r)` to `(c, n-1-r)`. Together they give the clockwise rotation. For counter-clockwise, transpose and reverse each column, or reverse the rows first.

### Encode two states in each cell

Sometimes each new cell value depends on the old values of its neighbors (Game of Life), or on a full-grid condition (Set Matrix Zeroes). A naive in-place update corrupts input that other cells still need. Instead of an O(mn) copy, encode both states in each cell:

- **Game of Life**: cells are 0 or 1. Bit 0 holds the current state and bit 1 holds the next state. `cell |= 2` marks "alive next". Neighbor counts read bit 0 with `cell & 1` and stay correct for the whole pass. A final sweep shifts every cell down with `cell >>= 1`.
- **Set Matrix Zeroes**: use row 0 and column 0 as the marker lists for "zero this row or column". Two booleans remember whether row 0 or column 0 started with a zero.

The shared idea: choose an encoding where you can still read the old value after you write the new one.

### Complexity of the catalog problems

| Problem | Time | Space | Technique |
|---------|------|-------|-----------|
| Valid Sudoku | O(81) = O(1) | O(1) | row/col/box sets |
| Spiral Matrix | O(mn) | O(1) beyond output | boundary layers |
| Rotate Image | O(n²) | O(1) | transpose + reverse |
| Set Matrix Zeroes | O(mn) | O(1) | first row/col as markers |
| Game of Life | O(mn) | O(1) | two states per cell (bit trick) |

## Watch out

- `[set()] * n` and `[[]] * n` share one object across all slots. Use `[set() for _ in range(n)]`.
- The same trap hits an empty grid. `[[0] * cols] * rows` gives m references to one row.
- Write `matrix[r][c]`, not `matrix[x][y]`. Most spiral and rotation bugs swap `r` and `c`.
- In a spiral, check `top <= bottom` before the bottom row and `left <= right` before the left column. Otherwise a 1×n or n×1 remainder appears twice.
- Transpose only above the diagonal (`c > r`). A sweep of all pairs swaps everything twice, which changes nothing.
- In place means you mutate the argument. Rotate Image tests read the matrix you received. A new returned matrix fails.
- `matrix = rotated` inside the function does nothing for the caller. Change the cell contents, not the parameter.
- Sudoku validity is not solvability. Only placed digits can conflict. Skip `"."` cells; an empty board is valid.
- Game of Life neighbor counts must read the old state. Plain 0/1 writes mid-pass corrupt the counts of later cells.

## Problem walkthroughs

### Valid Sudoku ★

**Problem.** `board` is a 9×9 grid of strings: digits `"1"`–`"9"`, or `"."` for an empty cell. Return `True` if no row, column or 3×3 sub-box holds a repeated digit. Empty cells add no constraint. The board does not need a solution.

**Example.**

```text
a standard puzzle board -> True
the same board with a second "6"
in the top-left 3×3 box -> False
```

**Steps.**
1. Create three lists of nine sets each, `rows`, `cols` and `boxes`, with `[set() for _ in range(9)]`.
2. Loop over `r` and `c`. Skip `"."` cells.
3. Compute `box = (r // 3) * 3 + (c // 3)`.
4. If `rows[r]`, `cols[c]` or `boxes[box]` already has the digit, return `False`. Otherwise add it to all three.
5. Return `True` after the sweep. One pass is enough, because a duplicate is a duplicate no matter which copy you meet second.

**Complexity.** O(81) time / O(81) set entries. Both are constant for the fixed board, with one visit per cell.

### Spiral Matrix ★

**Problem.** Given an `m × n` matrix, return all its elements in clockwise spiral order. Go across the top row, down the right column, back across the bottom row and up the left column. Then move inward to the next layer.

**Example.**

```text
[[1,2,3],
 [4,5,6],  -> [1,2,3,6,9,8,7,4,5]
 [7,8,9]]
```

**Steps.**
1. Track four boundaries: `top = 0`, `bottom = m - 1`, `left = 0` and `right = n - 1`.
2. While `top <= bottom and left <= right`, emit one ring. Go left to right along row `top`, then `top += 1`. Go top to bottom along column `right`, then `right -= 1`.
3. Check again before the return legs. Only if `top <= bottom`, go right to left along row `bottom`, then `bottom -= 1`. Only if `left <= right`, go bottom to top along column `left`, then `left += 1`.
4. The checks handle a degenerate inner layer. You must not emit one remaining row right to left after you emitted it left to right. The same applies to one remaining column.
5. Each iteration shrinks the boundary rectangle, so the loop ends. You emit each element exactly once.

**Complexity.** O(mn) time / O(1) space beyond the output. You visit each cell once.

### Rotate Image ★

**Problem.** Rotate an `n × n` matrix of numbers 90° clockwise, in place. Mutate the given matrix and return nothing. Do not allocate a second matrix.

**Example.**

```text
[[1,2,3],      [[7,4,1],
 [4,5,6],  ->   [8,5,2],
 [7,8,9]]       [9,6,3]]
```

**Steps.**
1. Transpose in place. For every pair with `c > r`, swap `matrix[r][c]` with `matrix[c][r]`. The strict upper-triangle bound prevents double swaps.
2. Reverse each row in place, with `row.reverse()` or a two-pointer swap.
3. Clockwise rotation sends `(r, c)` to `(c, n-1-r)`. The transpose gives `(r, c)` to `(c, r)`, and the row reversal gives `(c, r)` to `(c, n-1-r)`.
4. For counter-clockwise, reverse each row first, then transpose. You can also transpose, then reverse the columns.

**Complexity.** O(n²) time / O(1) space. Each cell moves a constant number of times.

### Set Matrix Zeroes

**Problem.** You get an `m × n` matrix of numbers. If a cell is `0`, set its whole row and whole column to `0`. Work in place, with O(1) extra space.

**Example.**

```text
[[1,1,1],      [[1,0,1],
 [1,0,1],  ->   [0,0,0],
 [1,1,1]]       [1,0,1]]
```

**Steps.**
1. The naive approach zeroes cells at once and floods the grid, because new zeros spawn more zeros. First record which rows and columns to zero, then zero them. The trick is to store that record inside the matrix.
2. Record in two booleans whether row 0 or column 0 holds a zero of its own.
3. Sweep the rest of the grid. When `matrix[r][c] == 0`, set `matrix[r][0] = 0` and `matrix[0][c] = 0`. The first row and column become the marker lists.
4. Second sweep, over rows 1+ and columns 1+: zero `matrix[r][c]` when its row marker `matrix[r][0]` or column marker `matrix[0][c]` is zero. This is safe, because a marker only ever changes to zero.
5. Last, zero row 0 or column 0 if its boolean is set. Order matters: an earlier zero destroys the markers.

**Complexity.** O(mn) time / O(1) space. Two grid sweeps plus two line sweeps.

### Game of Life

**Problem.** You get an `m × n` grid of `0` (dead) and `1` (live) cells. Compute the next generation in place under Conway's rules. Every cell updates at the same time, from its up to eight neighbors. A live cell with 2 or 3 live neighbors survives; any other live cell dies. A dead cell with exactly 3 live neighbors becomes live.

**Example.**

```text
[[0,1,0],      [[0,0,0],
 [0,0,1],  ->   [1,0,1],
 [1,1,1],       [0,1,1],
 [0,0,0]]       [0,1,0]]
```

**Steps.**
1. The simultaneous update is the whole problem. If a cell changes before its neighbors read it, their counts are wrong. Instead of a grid copy, store both generations in each cell: bit 0 is the current state, bit 1 is the next.
2. For each cell, count live neighbors with `grid[nr][nc] & 1` over the eight offsets. Keep `nr` and `nc` inside the grid. `& 1` reads the old state even after you mark a neighbor.
3. Apply the rules. If the cell is live (`& 1`) and the count is 2 or 3, set bit 1 with `grid[r][c] |= 2`. If it is dead and the count is exactly 3, set bit 1. Otherwise leave bit 1 clear, so the cell is dead next.
4. Final sweep: `grid[r][c] >>= 1` moves the next state into place and drops the old one.
5. The encoding works because a write to bit 1 never changes bit 0. Old values stay readable until every cell has its next state.

**Complexity.** O(mn) time (8 neighbor reads per cell) / O(1) space.

## Interview follow-ups

After Valid Sudoku:
- "One pass with less memory?" Three lists of 9 bitmasks (`rows[r] & (1 << d)`) replace the sets. The logic is the same, with integer operations.
- "Check solvability, not only placement?" That is a backtracking search (Sudoku Solver), exponentially harder than validation.

After Spiral Matrix:
- "Generate the spiral instead" (Spiral Matrix II). Use the same boundary walk, and write `1..n²` instead of reading.
- "Why not direction vectors and a visited set?" That works, but the visited marks cost O(mn) extra space. Boundaries cost O(1).

After Rotate Image:
- "Rotate 180°?" Reverse the rows and the columns, or rotate twice. "Counter-clockwise?" Reverse the rows, then transpose.
- "A matrix that is not square?" A strict in-place rotation is impossible, because the shape changes. You need a new n×m allocation.

After Set Matrix Zeroes and Game of Life:
- "An infinite board (Game of Life)?" Store only live-cell coordinates in a set. Count neighbors with a dict of candidate cells.
- "Why can you trust the markers (Set Matrix Zeroes)?" A marker cell only changes from nonzero to 0. Cells that were already 0 mark themselves, so no information is lost.

## The task

You write three grid functions: one validity sweep, one boundary walk and one in-place transform. `rotate_image` must mutate its argument. The tests read the matrix you received, not your return value.

1. `is_valid_sudoku(board: list[list[str]]) -> bool` takes a 9×9 list of lists of one-character strings. `"1"`–`"9"` is a digit and `"."` is an empty cell.
2. It returns `True` if no row, column or 3×3 sub-box holds the same digit twice. Otherwise it returns `False`.
3. The nine sub-boxes do not overlap. They start at rows 0, 3 and 6 and columns 0, 3 and 6.
4. Ignore empty cells. The board does not need a solution. Time and space are O(1), because the board size never changes.
5. `spiral_order(matrix: list[list[int]]) -> list[int]` takes an `m × n` list of number rows, with `m, n >= 1`. It is not always square.
6. It returns a flat list of all `m * n` elements in clockwise spiral order, from `matrix[0][0]`.
7. The order is: top row left to right, right column down, bottom row right to left, left column up. Then the next layer inward. Use O(mn) time.
8. `rotate_image(matrix: list[list[int]]) -> None` takes an `n × n` list of number rows, with `n >= 1`. It rotates the matrix 90° clockwise, in place.
9. After the call, `matrix[c][n-1-r]` holds the old `matrix[r][c]`. The caller ignores the return value.
10. Do not allocate a second matrix. Use O(n²) time and O(1) extra space.

Edge cases:

- `is_valid_sudoku`: an empty board is `True`. The same digit in different rows, columns and boxes is `True`.
- `is_valid_sudoku`: handle a conflict only inside a box, with clean rows and columns. Handle a conflict in the last cell you scan.
- `spiral_order`: handle a single row, a single column, a single cell and a 2×2 matrix.
- `spiral_order`: when the innermost layer is one row or one column, emit those cells once.
- `rotate_image`: a 1×1 matrix stays the same. Handle 2×2, larger even and odd sizes and callers that discard the return value.
- `rotate_image`: with duplicate values, move positions, not matching values.

```python
# A board is 9 rows of 9 one-char
# strings: board[r][c] is "5" or ".".
# Row 0 of a legal board:
# ["5","3",".",".","7",
#  ".",".",".","."]
is_valid_sudoku(legal_partial_board)
# True
# Row 0 becomes "53..7...5":
is_valid_sudoku(second_five_in_row_0)
# False
is_valid_sudoku(all_dots_board)
# True

spiral_order([[1, 2, 3], [4, 5, 6],
              [7, 8, 9]])
# [1, 2, 3, 6, 9, 8, 7, 4, 5]
spiral_order([[1, 2, 3, 4],
              [5, 6, 7, 8],
              [9, 10, 11, 12]])
# [1, 2, 3, 4, 8, 12, 11, 10,
#  9, 5, 6, 7]
spiral_order([[7]])  # [7]
spiral_order([[1, 2], [3, 4]])
# [1, 2, 4, 3]
spiral_order([[1], [2], [3], [4]])
# [1, 2, 3, 4]

m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
rotate_image(m)
# m is [[7, 4, 1], [8, 5, 2],
#       [9, 6, 3]]
one = [[42]]
rotate_image(one)  # one is [[42]]
two = [[1, 2], [3, 4]]
rotate_image(two)
# two is [[3, 1], [4, 2]]
```
