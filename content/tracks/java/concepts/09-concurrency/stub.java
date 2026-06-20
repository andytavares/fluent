import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.Function;

public class Solution {

    // AtomicCounter is a thread-safe counter backed by AtomicInteger.
    public static class AtomicCounter {
        private final AtomicInteger value = new AtomicInteger(0);

        public void increment() {
            // TODO
        }

        public void decrement() {
            // TODO
        }

        public int value() {
            // TODO
            return 0;
        }
    }

    // parallelMap applies fn to each element of items using a fixed thread pool.
    // Returns results in the original order.
    public static List<Integer> parallelMap(List<Integer> items,
                                            Function<Integer, Integer> fn,
                                            int threads) {
        // TODO
        return new ArrayList<>();
    }

    // asyncSquare returns a CompletableFuture that resolves to n * n.
    public static CompletableFuture<Integer> asyncSquare(int n) {
        // TODO
        return CompletableFuture.completedFuture(0);
    }

    public static void main(String[] args) throws Exception {
        AtomicCounter c = new AtomicCounter();
        c.increment(); c.increment(); c.decrement();
        System.out.println("counter = " + c.value()); // 1
        System.out.println("square = " + asyncSquare(5).get());
    }
}
