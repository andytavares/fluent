# Run: python3 stub.py


def num_islands(grid):
    """Return the number of islands: maximal groups of "1" cells connected
    horizontally or vertically. The grid may be mutated."""
    # TODO: scan every cell; each fresh "1" is a new island -- flood fill from
    # it (explicit stack, 4 directions), sinking reached "1"s to "0".
    # Bounds-check neighbors, and compare against the STRING "1"
    return 0


def clone_graph(graph):
    """Return a deep copy of an undirected graph given as an adjacency dict.
    No reference may be shared with the input -- not the outer dict, not
    any neighbor list."""
    # TODO: one fresh container per level -- a new outer dict, and a new
    # list for every node's neighbors (a shallow copy still shares lists)
    return {}


def can_finish(num_courses, prerequisites):
    """Return True if all courses can be taken -- i.e. the prerequisite
    graph has no cycle."""
    # TODO: Kahn's algorithm -- adjacency b -> a plus indegree per course;
    # queue indegree-0 courses, peel and decrement dependents; finished
    # course count == num_courses means acyclic
    return False


def main():
    print(num_islands([
        ["1", "1", "0", "0", "0"],
        ["1", "1", "0", "0", "0"],
        ["0", "0", "1", "0", "0"],
        ["0", "0", "0", "1", "1"],
    ]))  # 3

    graph = {"1": ["2", "4"], "2": ["1", "3"], "3": ["2", "4"], "4": ["1", "3"]}
    clone = clone_graph(graph)
    print(clone, clone is not graph and clone["1"] is not graph["1"])

    print(can_finish(2, [(1, 0)]))  # True
    print(can_finish(2, [(1, 0), (0, 1)]))  # False


if __name__ == "__main__":
    main()
