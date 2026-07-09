# Run: python3 exemplar.py


def is_valid_sudoku(board: list[list[str]]) -> bool:
    """Returns True if no row, column, or 3x3 box contains a repeated digit.
    One pass with a set per row, column, and box; "." cells impose nothing.
    O(81) time / O(81) entries — constant for the fixed board."""
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]

    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == ".":
                continue
            b = (r // 3) * 3 + (c // 3)
            if v in rows[r] or v in cols[c] or v in boxes[b]:
                return False
            rows[r].add(v)
            cols[c].add(v)
            boxes[b].add(v)
    return True


def spiral_order(matrix: list[list[int]]) -> list[int]:
    """Returns all elements of an m x n matrix in clockwise spiral order.
    Four shrinking boundaries; the mid-loop re-checks stop a degenerate
    single-row/column inner layer from being emitted twice.
    O(mn) time, O(1) space beyond the output."""
    result: list[int] = []
    if not matrix:
        return result

    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1

    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            result.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            result.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                result.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                result.append(matrix[r][left])
            left += 1
    return result


def rotate_image(matrix: list[list[int]]) -> None:
    """Rotates an n x n matrix 90 degrees clockwise, in place.
    Transpose (swap across the diagonal, upper triangle only) then reverse
    each row: (r,c) -> (c,r) -> (c,n-1-r), exactly the clockwise rotation.
    O(n^2) time, O(1) space."""
    n = len(matrix)
    for r in range(n):
        for c in range(r + 1, n):
            matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
    for row in matrix:
        row.reverse()


def main() -> None:
    board = [
        list("53..7...."),
        list("6..195..."),
        list(".98....6."),
        list("8...6...3"),
        list("4..8.3..1"),
        list("7...2...6"),
        list(".6....28."),
        list("...419..5"),
        list("....8..79"),
    ]
    print(is_valid_sudoku(board))  # True

    print(spiral_order([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))
    # [1, 2, 3, 6, 9, 8, 7, 4, 5]

    m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    rotate_image(m)
    print(m)  # [[7, 4, 1], [8, 5, 2], [9, 6, 3]]


if __name__ == "__main__":
    main()
