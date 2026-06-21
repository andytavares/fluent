def unique_paths(m: int, n: int) -> int:
    """Count paths from top-left to bottom-right of an m×n grid.
    You can only move right or down."""
    # TODO: dp[i][j] = dp[i-1][j] + dp[i][j-1]; base: first row/col all 1s
    return 0


def longest_common_subsequence(s1: str, s2: str) -> int:
    """Return the length of the longest common subsequence of s1 and s2."""
    # TODO: if s1[i-1]==s2[j-1]: dp[i-1][j-1]+1; else max(dp[i-1][j], dp[i][j-1])
    return 0


def edit_distance(s1: str, s2: str) -> int:
    """Return the minimum edits (insert, delete, replace) to transform s1 to s2."""
    # TODO: base: dp[i][0]=i, dp[0][j]=j;
    #       if equal: dp[i-1][j-1]; else 1+min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    return 0


if __name__ == "__main__":
    print(unique_paths(3, 7))   # 28
    print(unique_paths(3, 2))   # 3
    print(longest_common_subsequence("abcde", "ace"))     # 3
    print(longest_common_subsequence("abc", "def"))       # 0
    print(edit_distance("horse", "ros"))                   # 3
    print(edit_distance("intention", "execution"))         # 5
    print(edit_distance("", "abc"))                        # 3
    print(edit_distance("abc", "abc"))                     # 0
