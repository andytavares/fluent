import java.util.*;
import java.util.function.*;

public class Solution {

    // filterAndTransform returns transform(item) for each item where keep.test(item) is true.
    public static List<String> filterAndTransform(List<String> items,
                                                   Predicate<String> keep,
                                                   Function<String, String> transform) {
        // TODO
        return new ArrayList<>();
    }

    // applyToAll returns a new list with op applied to each element.
    public static <T> List<T> applyToAll(List<T> items, UnaryOperator<T> op) {
        // TODO
        return new ArrayList<>();
    }

    // byLengthThenAlpha returns a Comparator that sorts by length, then alphabetically.
    public static Comparator<String> byLengthThenAlpha() {
        // TODO
        return Comparator.naturalOrder();
    }

    // longerThan returns a Predicate that is true when s.length() > n.
    public static Predicate<String> longerThan(int n) {
        // TODO
        return s -> false;
    }

    // pipeline composes all functions left-to-right. Empty list → identity.
    public static Function<String, String> pipeline(List<Function<String, String>> fns) {
        // TODO
        return Function.identity();
    }

    public static void main(String[] args) {
        List<String> words = List.of("apple", "hi", "banana", "ok");
        System.out.println(filterAndTransform(words, longerThan(3), String::toUpperCase));
        List<String> sorted = new ArrayList<>(words);
        sorted.sort(byLengthThenAlpha());
        System.out.println(sorted);
    }
}
