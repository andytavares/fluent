## What you build

You write five methods over Java's core collection types: a list, a map, a set and a stack. This lesson builds on **Streams API**.

## Key concepts

### One hierarchy of interfaces

The collections framework gives type-safe data structures that grow as you add elements. The main interfaces are `List`, `Set`, `Map` and `Queue`. Common implementations are `ArrayList`, `LinkedList`, `HashMap`, `HashSet` and `ArrayDeque`.

```java
List<String> names = new ArrayList<>();
Map<String, Integer> ages =
    new HashMap<>();
```

### `List` keeps order and allows duplicates

An array backs `ArrayList`: random access is O(1), and an insert or remove in the middle is O(n). `LinkedList` is O(1) at the head and tail but O(n) for random access.

```java
import java.util.*;

List<String> list = new ArrayList<>();
list.add("a");
list.add("b");
list.get(0);       // "a"
list.remove("a");
Collections.sort(list);
```

### `Map` stores key-value pairs

`getOrDefault` returns a fallback value for a missing key. `entrySet()` gives each key and value together.

```java
Map<String, Integer> map =
    new HashMap<>();
map.put("one", 1);
map.getOrDefault("missing", 0);  // 0
map.containsKey("one");          // true
for (var e : map.entrySet()) {
    System.out.println(
        e.getKey() + "=" + e.getValue());
}
```

### `Set` holds each element once

Adding an element that is already in the set does nothing.

```java
Set<String> set =
    new HashSet<>(List.of("a", "b", "c"));
set.contains("a");  // true
// No change: "a" is already present
set.add("a");
```

### `Deque` works at both ends

`ArrayDeque` is a double-ended queue. It works as a queue or as a stack.

```java
Deque<Integer> deque = new ArrayDeque<>();
// Add at the front
deque.offerFirst(1);
// Add at the back
deque.offerLast(2);
// Remove and return the front
deque.pollFirst();
```

### The `Collections` class has helpers

`Collections` adds sorting, searching and read-only views.

```java
Collections.sort(list);
Collections.reverse(list);
// Read-only view
Collections.unmodifiableList(list);
// Count occurrences
Collections.frequency(list, "a");
```

### Other languages have fewer built-in types

Go has only maps and slices, Python has `list`, `dict` and `set`, and JavaScript has `Array`, `Map` and `Set`. Because of type erasure, `List<String>` is a plain `List` at runtime.

```java
List<String> a = new ArrayList<>();
List<Integer> b = new ArrayList<>();
a.getClass() == b.getClass();  // true
```

## Watch out

- `HashMap` and `HashSet` have no defined iteration order. Two runs can give different orders.
- For insertion order, use `LinkedHashMap` or `LinkedHashSet`. For sorted order, use `TreeMap` or `TreeSet`.
- On an `ArrayDeque` stack, `push`, `peek` and `pop` work on the head.
- `push` adds at the front, so `peek()` and `pop()` see the most recent element, not the first.
- `List.of(...)` and other factory collections are immutable. `add` and `remove` throw `UnsupportedOperationException`.
- For a mutable copy, wrap the collection in `new ArrayList<>(...)`.

## The task

Write five static methods over the core collection types in the class `Solution`.

1. `static List<Integer> uniqueSorted(List<Integer> nums)` returns `nums` sorted, with duplicates removed.
2. `static Map<String, Integer> wordCount(List<String> words)` maps each distinct word to its count.
3. `static List<String> topN(Map<String, Integer> counts, int n)` returns the `n` keys with the highest values.
4. `topN` sorts by value, highest first. Equal values sort alphabetically by key.
5. `static boolean isAnagram(String a, String b)` returns `true` when `a` and `b` are anagrams.
6. Anagrams have the same characters with the same counts. Case does not matter.
7. `static Deque<Integer> toStack(List<Integer> items)` returns an `ArrayDeque`.
8. `toStack` pushes `items` in list order, so the last item is on top.

An empty list gives an empty result from `uniqueSorted` and `wordCount`. Strings of different lengths are never anagrams. Two empty strings are anagrams.

```java
// [1, 2, 3]
uniqueSorted(List.of(3, 1, 2, 1, 3));
uniqueSorted(List.of());         // []
uniqueSorted(List.of(5, 5, 5));  // [5]

// {"a": 3, "b": 2, "c": 1}
wordCount(List.of("a", "b", "a", "c",
    "b", "a"));
wordCount(List.of());            // {}

Map<String, Integer> counts = Map.of(
    "apple", 5, "banana", 3,
    "cherry", 5, "date", 1);
// ["apple", "cherry"]: tie, alphabetical
topN(counts, 2);
topN(counts, 1);  // ["apple"]

isAnagram("listen", "silent");  // true
isAnagram("Listen", "Silent");  // true
isAnagram("hello", "world");    // false
isAnagram("ab", "abc");         // false
isAnagram("", "");              // true

Deque<Integer> stack =
    toStack(List.of(1, 2, 3));
stack.peek();  // 3
stack.pop();   // removes 3
stack.peek();  // 2
```
