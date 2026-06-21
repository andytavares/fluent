from collections import defaultdict


def group_by_first_char(words: list[str]) -> dict[str, list[str]]:
    # TODO: group words by first character using defaultdict; skip empty strings
    return {}


def zip_to_dict(keys: list[str], values: list) -> dict:
    # TODO: zip keys and values into a dict
    return {}


def top_n(scores: dict[str, int], n: int) -> list[str]:
    # TODO: return names of top n scorers, desc by score, ties broken alphabetically
    return []


if __name__ == "__main__":
    print(group_by_first_char(["cat", "car", "dog", "door", "ant"]))
    # {'c': ['cat', 'car'], 'd': ['dog', 'door'], 'a': ['ant']}

    print(zip_to_dict(["a", "b", "c"], [1, 2, 3]))
    # {'a': 1, 'b': 2, 'c': 3}

    print(top_n({"alice": 95, "bob": 87, "carol": 92}, 2))
    # ['alice', 'carol']
