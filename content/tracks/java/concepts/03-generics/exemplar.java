import java.util.ArrayList;
import java.util.List;

public class Solution {

    public static class Pair<A, B> {
        private final A first;
        private final B second;

        public Pair(A first, B second) {
            this.first  = first;
            this.second = second;
        }

        public A getFirst()  { return first; }
        public B getSecond() { return second; }

        public Pair<B, A> swap() {
            return new Pair<>(second, first);
        }
    }

    public static <T extends Comparable<T>> T min(T a, T b) {
        return a.compareTo(b) <= 0 ? a : b;
    }

    public static <T> List<T> repeat(T value, int times) {
        List<T> list = new ArrayList<>(times);
        for (int i = 0; i < times; i++) list.add(value);
        return list;
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
