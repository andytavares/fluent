import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class Solution {

    public static List<String> filterAndTransform(List<String> items,
                                                   Predicate<String> keep,
                                                   Function<String, String> transform) {
        return items.stream()
                    .filter(keep)
                    .map(transform)
                    .collect(Collectors.toList());
    }

    public static <T> List<T> applyToAll(List<T> items, UnaryOperator<T> op) {
        return items.stream().map(op).collect(Collectors.toList());
    }

    public static Comparator<String> byLengthThenAlpha() {
        return Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder());
    }

    public static Predicate<String> longerThan(int n) {
        return s -> s.length() > n;
    }

    public static Function<String, String> pipeline(List<Function<String, String>> fns) {
        return fns.stream()
                  .reduce(Function.identity(), Function::andThen);
    }

    public static void main(String[] args) {
        List<String> words = List.of("apple", "hi", "banana", "ok");
        System.out.println(filterAndTransform(words, longerThan(3), String::toUpperCase));
        List<String> sorted = new ArrayList<>(words);
        sorted.sort(byLengthThenAlpha());
        System.out.println(sorted);
    }
}
