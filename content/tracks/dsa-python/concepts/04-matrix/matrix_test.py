from stub import is_valid_sudoku, spiral_order, rotate_image

passed = 0
failed = 0


def test(name: str, condition: bool, detail: str = "") -> None:
    global passed, failed
    if condition:
        print(f"  PASS: {name}")
        passed += 1
    else:
        msg = f" — {detail}" if detail else ""
        print(f"  FAIL: {name}{msg}")
        failed += 1


def board(rows: list[str]) -> list[list[str]]:
    """Builds a 9x9 board from nine 9-character strings ("." = empty)."""
    return [list(row) for row in rows]


VALID_PUZZLE = [
    "53..7....",
    "6..195...",
    ".98....6.",
    "8...6...3",
    "4..8.3..1",
    "7...2...6",
    ".6....28.",
    "...419..5",
    "....8..79",
]

# ── is_valid_sudoku ──
test("is_valid_sudoku: legal partially filled board", is_valid_sudoku(board(VALID_PUZZLE)) is True)

rows = list(VALID_PUZZLE)
rows[0] = "53..7...5"  # second 5 in row 0; column 8 and box 2 stay clean
test("is_valid_sudoku: row conflict", is_valid_sudoku(board(rows)) is False)

rows = list(VALID_PUZZLE)
rows[8] = "5...8..79"  # second 5 in column 0; row 8 and box 6 stay clean
test("is_valid_sudoku: column conflict", is_valid_sudoku(board(rows)) is False)

rows = list(VALID_PUZZLE)
rows[0] = "536.7...."  # 6 at (0,2) duplicates 6 at (1,0) in the top-left box
test("is_valid_sudoku: box-only conflict (rows and columns clean)", is_valid_sudoku(board(rows)) is False)

test("is_valid_sudoku: empty board is valid", is_valid_sudoku(board(["........."] * 9)) is True)

rows = [
    "1........",
    ".........",
    ".........",
    ".........",
    "....1....",
    ".........",
    ".........",
    ".........",
    "........1",
]
test("is_valid_sudoku: same digit in different rows, columns, and boxes", is_valid_sudoku(board(rows)) is True)

rows = list(VALID_PUZZLE)
rows[8] = "....8..78"  # (8,8) duplicates the 8 at (8,4) in row 8
test("is_valid_sudoku: conflict at the very last cell", is_valid_sudoku(board(rows)) is False)

# ── spiral_order ──
r = spiral_order([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
test("spiral_order: 3x3 square", r == [1, 2, 3, 6, 9, 8, 7, 4, 5], f"got {r}")

r = spiral_order([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])
test("spiral_order: 3x4 wide (inner layer is a single row)", r == [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7], f"got {r}")

r = spiral_order([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]])
test(
    "spiral_order: 4x3 tall (inner layer is a single column)",
    r == [1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 5, 8],
    f"got {r}",
)

test("spiral_order: single row", spiral_order([[1, 2, 3, 4, 5]]) == [1, 2, 3, 4, 5])
test("spiral_order: single column", spiral_order([[1], [2], [3], [4]]) == [1, 2, 3, 4])
test("spiral_order: single cell", spiral_order([[7]]) == [7])
test("spiral_order: 2x2", spiral_order([[1, 2], [3, 4]]) == [1, 2, 4, 3])
test("spiral_order: 2x3 (no inner layer)", spiral_order([[1, 2, 3], [4, 5, 6]]) == [1, 2, 3, 6, 5, 4])

# ── rotate_image — always assert on the mutated matrix, never on the return value ──
m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
rotate_image(m)
test("rotate_image: 3x3 mutates in place", m == [[7, 4, 1], [8, 5, 2], [9, 6, 3]], f"got {m}")

m = [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]
rotate_image(m)
test(
    "rotate_image: 4x4",
    m == [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]],
    f"got {m}",
)

m = [[42]]
rotate_image(m)
test("rotate_image: 1x1 unchanged", m == [[42]], f"got {m}")

m = [[1, 2], [3, 4]]
rotate_image(m)
test("rotate_image: 2x2", m == [[3, 1], [4, 2]], f"got {m}")

m = [[1, 1, 2], [1, 1, 2], [3, 3, 3]]
rotate_image(m)
test("rotate_image: duplicate values move by position", m == [[3, 1, 1], [3, 1, 1], [3, 2, 2]], f"got {m}")

m = [[1, 2], [3, 4]]
_ = rotate_image(m)
test("rotate_image: works even if the return value is discarded", m == [[3, 1], [4, 2]], f"got {m}")

print(f"\n{passed} passed, {failed} failed")
if failed > 0:
    raise SystemExit(1)
