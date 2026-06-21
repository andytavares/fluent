from collections import defaultdict


def group_by_first_char(words: list[str]) -> dict[str, list[str]]:
    groups: dict[str, list[str]] = defaultdict(list)
    for word in words:
        if word:
            groups[word[0]].append(word)
    return dict(groups)


def zip_to_dict(keys: list[str], values: list) -> dict:
    return dict(zip(keys, values))


def top_n(scores: dict[str, int], n: int) -> list[str]:
    return [
        name
        for name, _ in sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))[:n]
    ]
