# Collections Framework

## What you'll learn

Building on generics and streams (concepts 3–4): Java's collections framework provides type-safe, resizable data structures under a unified interface hierarchy. The key interfaces are `List`, `Set`, `Map`, and `Queue`. Common implementations are `ArrayList`, `LinkedList`, `HashMap`, `HashSet`, and `ArrayDeque`. The `Collections` utility class adds sorting, searching, and immutable wrapping.

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

**vs other languages:** Go has only built-in maps and slices — no Set, no Queue. Python has `list`, `dict`, `set` as built-ins. JavaScript has `Array`, `Map`, `Set`. Java's type erasure means `List<String>` is just `List` at runtime, which surprises engineers from C++ (where generics are reified).

## Watch out

- **`HashMap`/`HashSet` have no defined iteration order.** Two runs of the same program can iterate a `HashMap` in different orders. If order matters, use `LinkedHashMap`/`LinkedHashSet` (insertion order) or `TreeMap`/`TreeSet` (sorted order).
- **`ArrayDeque` used as a stack: `push`/`peek`/`pop` operate on the head.** `push` inserts at the front, so the *most recently pushed* element is what `peek()`/`pop()` see — not the first one you pushed.
- **`List.of(...)` and other factory collections are immutable** — calling `add`/`remove` on them throws `UnsupportedOperationException`. Wrap in `new ArrayList<>(...)` first if you need a mutable copy.

## The task

You're implementing small utilities over Java's core collection types. Implement the following static methods in `Solution.java`:

**`static List<Integer> uniqueSorted(List<Integer> nums)`** — returns a sorted list of `nums` with duplicates removed.

**`static Map<String, Integer> wordCount(List<String> words)`** — returns a map from each distinct word to how many times it appears in `words`.

**`static List<String> topN(Map<String, Integer> counts, int n)`** — returns the `n` keys with the highest values, sorted descending by value; ties are broken alphabetically by key.

**`static boolean isAnagram(String a, String b)`** — returns `true` if `a` and `b` are anagrams of each other (same characters with the same frequencies, ignoring case); strings of different lengths are never anagrams.

**`static Deque<Integer> toStack(List<Integer> items)`** — returns an `ArrayDeque` with `items` pushed onto it in list order, so the *last* item in the list ends up on top.

```java
uniqueSorted(List.of(3, 1, 2, 1, 3));  // [1, 2, 3]
uniqueSorted(List.of());               // []
uniqueSorted(List.of(5, 5, 5));        // [5]

wordCount(List.of("a", "b", "a", "c", "b", "a"));
// { "a": 3, "b": 2, "c": 1 }

Map<String, Integer> counts = Map.of("apple", 5, "banana", 3, "cherry", 5, "date", 1);
topN(counts, 2);  // ["apple", "cherry"] — both have count 5, "apple" < "cherry" alphabetically
topN(counts, 1);  // ["apple"]

isAnagram("listen", "silent");  // true
isAnagram("Listen", "Silent");  // true — case-insensitive
isAnagram("hello", "world");    // false
isAnagram("ab", "abc");         // false — different lengths
isAnagram("", "");              // true — two empty strings are trivially anagrams

Deque<Integer> stack = toStack(List.of(1, 2, 3));
stack.peek();  // 3 — the last item pushed is on top
stack.pop();   // removes 3
stack.peek();  // 2
```
