# Run: python3 stub.py


def is_valid_sudoku(board: list[list[str]]) -> bool:
    """Returns True if no row, column, or 3x3 box contains a repeated digit.
    board is 9x9; cells are "1".."9" or "." (ignored)."""
    # TODO: nine sets each for rows/cols/boxes — [set() for _ in range(9)],
    # NOT [set()] * 9; box index is (r // 3) * 3 + (c // 3)
    return False


def spiral_order(matrix: list[list[int]]) -> list[int]:
    """Returns all elements of an m x n matrix in clockwise spiral order."""
    # TODO: four boundaries (top/bottom/left/right) shrinking inward;
    # re-check top <= bottom and left <= right before the return legs
    return []


def rotate_image(matrix: list[list[int]]) -> None:
    """Rotates an n x n matrix 90 degrees clockwise, in place.
    Mutates matrix — the return value is ignored."""
    # TODO: transpose in place (swap only where c > r), then reverse each row


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
