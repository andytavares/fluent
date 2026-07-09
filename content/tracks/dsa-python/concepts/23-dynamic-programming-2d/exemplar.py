def min_path_sum(grid: list[list[int]]) -> int:
    """Rolling row: before the write, dp[j] holds "up"; dp[j-1] is "left".
    O(m*n) time, O(n) space.
    """
    cols = len(grid[0])
    dp = grid[0][:]  # first row: prefix sums
    for j in range(1, cols):
        dp[j] += dp[j - 1]
    for i in range(1, len(grid)):
        dp[0] += grid[i][0]  # first column: only "up"
        for j in range(1, cols):
            dp[j] = min(dp[j], dp[j - 1]) + grid[i][j]
    return dp[cols - 1]


def unique_paths_with_obstacles(obstacle_grid: list[list[int]]) -> int:
    """Rolling row; applying the obstacle rule before the addition makes
    the first row, first column, and blocked start all fall out uniformly.
    O(m*n) time, O(n) space.
    """
    cols = len(obstacle_grid[0])
    dp = [0] * cols
    dp[0] = 0 if obstacle_grid[0][0] == 1 else 1
    for i in range(len(obstacle_grid)):
        for j in range(cols):
            if obstacle_grid[i][j] == 1:
                dp[j] = 0  # nothing routes through an obstacle
            elif j > 0:
                dp[j] += dp[j - 1]  # up (old dp[j]) + left (new dp[j-1])
    return dp[cols - 1]


def longest_palindrome(s: str) -> str:
    """Expand around center — the O(1)-space form of the is_pal[i][j] table:
    every palindrome has one of 2n-1 centers (a character or a gap).
    O(n^2) time worst case, O(1) space.
    """
    start, max_len = 0, 1

    def expand(left: int, right: int) -> None:
        nonlocal start, max_len
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        # the palindrome is s[left+1 .. right-1]
        length = right - left - 1
        if length > max_len:
            max_len = length
            start = left + 1

    for i in range(len(s)):
        expand(i, i)      # odd length, centered on a character
        expand(i, i + 1)  # even length, centered on a gap
    return s[start:start + max_len]


def min_distance(word1: str, word2: str) -> int:
    """Prefix-pair table kept as two rows; row/column 0 encode empty
    prefixes, so empty inputs need no special case.
    O(m*n) time, O(n) space.
    """
    m, n = len(word1), len(word2)
    prev = list(range(n + 1))  # dp[0][j] = j inserts
    for i in range(1, m + 1):
        curr = [0] * (n + 1)
        curr[0] = i  # dp[i][0] = i deletes
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                curr[j] = prev[j - 1]
            else:
                curr[j] = 1 + min(prev[j], curr[j - 1], prev[j - 1])
        prev = curr
    return prev[n]


def maximal_square(matrix: list[list[str]]) -> int:
    """side[i][j] = largest square ending at (i,j) = 1 + min(up, left, up-left).
    Two rows (not one) because the recurrence needs the diagonal; the extra
    leading zero column makes the edges uniform.
    O(m*n) time, O(n) space.
    """
    cols = len(matrix[0])
    prev = [0] * (cols + 1)
    best = 0
    for i in range(len(matrix)):
        curr = [0] * (cols + 1)
        for j in range(cols):
            if matrix[i][j] == "1":
                curr[j + 1] = 1 + min(prev[j], prev[j + 1], curr[j])
                if curr[j + 1] > best:
                    best = curr[j + 1]
        prev = curr
    return best * best


if __name__ == "__main__":
    print(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))  # 7
    print(unique_paths_with_obstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]))  # 2
    print(longest_palindrome("babad"))  # "bab" or "aba"
    print(min_distance("horse", "ros"))  # 3
    print(maximal_square([["1", "1"], ["1", "1"]]))  # 4
