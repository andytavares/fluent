from collections import defaultdict, deque


def num_islands(grid: list[list[str]]) -> int:
    """Count the number of islands ('1' groups) in the grid.
    '0' is water. You may modify the grid in place."""
    # TODO: for each unvisited '1', DFS to mark connected '1's as visited, then increment count
    return 0


def can_finish(num_courses: int, prerequisites: list[list[int]]) -> bool:
    """Return True if all courses can be finished (no circular dependency).
    prerequisites[i] = [a, b] means b must be taken before a."""
    # TODO: build adjacency list; three-color DFS (0=unvisited,1=visiting,2=done);
    #       return False if a visiting node is encountered (back edge = cycle)
    return False


def word_ladder_length(begin_word: str, end_word: str, word_list: list[str]) -> int:
    """Return the length of the shortest transformation sequence from begin_word to
    end_word. Each step changes exactly one letter; every word must be in word_list.
    Return 0 if no sequence exists."""
    # TODO: BFS from begin_word; for each word, try all single-character substitutions;
    #       if new_word is in word_set and unvisited, enqueue it; return length+1 on end_word
    return 0


if __name__ == "__main__":
    grid = [["1","1","0"],["1","1","0"],["0","0","1"]]
    print(num_islands(grid))                                              # 2
    print(can_finish(2, [[1, 0]]))                                        # True
    print(can_finish(2, [[1, 0], [0, 1]]))                               # False
    print(word_ladder_length("hit", "cog", ["hot","dot","dog","lot","log","cog"]))  # 5
    print(word_ladder_length("hit", "cog", ["hot","dot","dog","lot","log"]))        # 0
