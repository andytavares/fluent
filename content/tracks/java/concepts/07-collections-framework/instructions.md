# Collections Framework

## What you'll learn

Java's collections framework provides type-safe, resizable data structures under a unified interface hierarchy. The key interfaces are `List`, `Set`, `Map`, and `Queue`. Common implementations are `ArrayList`, `LinkedList`, `HashMap`, `HashSet`, and `ArrayDeque`. The `Collections` utility class adds sorting, searching, and immutable wrapping.

## Key concepts

**List:**
```java
import java.util.*;

List<String> list = new ArrayList<>();
list.add("a");
list.add("b");
list.get(0);                // "a"
list.remove("a");
Collections.sort(list);
```
`ArrayList` is backed by an array — O(1) random access, O(n) insert/remove in the middle. `LinkedList` is O(1) at head/tail but O(n) random access.

**Map:**
```java
Map<String, Integer> map = new HashMap<>();
map.put("one", 1);
map.getOrDefault("missing", 0);   // 0
map.containsKey("one");           // true
for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey() + "=" + e.getValue());
}
```

**Set:**
```java
Set<String> set = new HashSet<>(List.of("a", "b", "c"));
set.contains("a");   // true
set.add("a");        // no-op, already present
```

**Queue / Deque:**
```java
Deque<Integer> deque = new ArrayDeque<>();
deque.offerFirst(1);  // push to front
deque.offerLast(2);   // push to back
deque.pollFirst();    // remove and return front
```

**`Collections` utility:**
```java
Collections.sort(list);
Collections.reverse(list);
Collections.unmodifiableList(list);  // immutable view
Collections.frequency(list, "a");    // count occurrences
```

**vs other languages:** Go has only built-in maps and slices — no Set, no Queue. Python has `list`, `dict`, `set` as built-ins. JavaScript has `Array`, `Map`, `Set`. Java's type-erasure means `List<String>` is just `List` at runtime, which surprises engineers from C++ (where generics are reified).

## The task

Implement the following static methods in `Solution.java`:

- `List<Integer> uniqueSorted(List<Integer> nums)` — return a sorted list with duplicates removed
- `Map<String, Integer> wordCount(List<String> words)` — return a map from each word to how many times it appears
- `List<String> topN(Map<String, Integer> counts, int n)` — return the `n` keys with the highest values, sorted descending by value; break ties alphabetically
- `boolean isAnagram(String a, String b)` — return true if `a` and `b` are anagrams (same chars, same frequencies, ignoring case)
- `Deque<Integer> toStack(List<Integer> items)` — return an `ArrayDeque` with items pushed in order (last item on top)
