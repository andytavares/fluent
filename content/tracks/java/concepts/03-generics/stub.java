import java.util.ArrayList;
import java.util.List;

public class Solution {

    public static class Pair<A, B> {
        private final A first;
        private final B second;

        public Pair(A first, B second) {
            this.first = first;
            this.second = second;
        }

        public A getFirst()  { return first; }
        public B getSecond() { return second; }

        // swap returns a new Pair with first and second exchanged.
        public Pair<B, A> swap() {
            // TODO
            return new Pair<>(second, first);
        }
    }

    // min returns the smaller of a and b.
    public static <T extends Comparable<T>> T min(T a, T b) {
        // TODO
        return a;
    }

    // repeat returns a List containing value repeated times times.
    public static <T> List<T> repeat(T value, int times) {
        // TODO
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Pair<String, Integer> p = new Pair<>("hello", 42);
        System.out.println(p.getFirst() + ", " + p.getSecond());
        Pair<Integer, String> s = p.swap();
        System.out.println(s.getFirst() + ", " + s.getSecond());
        System.out.println(min(3, 7));
        System.out.println(repeat("x", 3));
    }
}
